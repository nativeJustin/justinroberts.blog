import { execFileSync } from "node:child_process"
import { readFile } from "node:fs/promises"
import path from "node:path"
import matter from "gray-matter"

const [before, after] = process.argv.slice(2)
const apiKey = process.env.RESEND_API_KEY
const segmentId = process.env.RESEND_SEGMENT_ID
const from = process.env.RESEND_FROM_EMAIL
const siteUrl = process.env.SITE_URL ?? "https://justinroberts.blog"

if (!before || !after) {
  throw new Error("Expected before and after commit SHAs.")
}
if (!apiKey || !segmentId || !from) {
  throw new Error("Missing Resend newsletter environment variables.")
}

function addedWritingFiles() {
  const base = /^0+$/.test(before) ? `${after}^` : before
  const output = execFileSync(
    "git",
    ["diff", "--diff-filter=A", "--name-only", base, after, "--", "content/writing/*.md"],
    { encoding: "utf8" },
  )

  return output
    .split("\n")
    .map((file) => file.trim())
    .filter(Boolean)
    .filter((file) => path.basename(file).toLowerCase() !== "index.md")
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

function excerpt(markdown) {
  const cleaned = markdown
    .replace(/!\[\[[^\]]+\]\]/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[\[([^\]|]+\|)?([^\]]+)\]\]/g, "$2")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/[*_~`]/g, "")
    .replace(/\s+/g, " ")
    .trim()

  const words = cleaned.split(" ")
  return words.length > 65 ? `${words.slice(0, 65).join(" ")}…` : cleaned
}

function postUrl(file) {
  const name = path.basename(file, ".md")
  const slug = name
    .replace(/\s/g, "-")
    .replace(/&/g, "-and-")
    .replace(/%/g, "-percent")
    .replace(/[?#]/g, "")
  return new URL(`/writing/${slug}`, siteUrl).toString()
}

async function createDraft(file) {
  const source = await readFile(file, "utf8")
  const { data, content } = matter(source)

  if (data.draft === true) return

  const title = String(data.title ?? path.basename(file, ".md"))
  const summary = String(data.description ?? excerpt(content))
  const url = postUrl(file)
  const safeTitle = escapeHtml(title)
  const safeSummary = escapeHtml(summary)

  const response = await fetch("https://api.resend.com/broadcasts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      segment_id: segmentId,
      from,
      subject: title,
      name: `New post: ${title}`,
      html: `<h1>${safeTitle}</h1><p>${safeSummary}</p><p><a href="${url}">Read the full post</a></p><p style="font-size:12px;color:#666">You’re receiving this because you subscribed to new posts from Justin Roberts. <a href="{{{RESEND_UNSUBSCRIBE_URL}}}">Unsubscribe</a>.</p>`,
      text: `${title}\n\n${summary}\n\nRead the full post: ${url}\n\nUnsubscribe: {{{RESEND_UNSUBSCRIBE_URL}}}`,
    }),
  })

  if (!response.ok) {
    throw new Error(
      `Could not create draft for ${file}: ${response.status} ${await response.text()}`,
    )
  }

  const result = await response.json()
  console.log(`Created Resend draft ${result.id} for ${file}`)
}

for (const file of addedWritingFiles()) {
  await createDraft(file)
}
