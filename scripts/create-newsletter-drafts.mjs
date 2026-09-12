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
  const { data } = matter(source)

  if (data.draft === true) return

  const title = String(data.title ?? path.basename(file, ".md"))
  const url = postUrl(file)
  const safeTitle = escapeHtml(title)

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
      html: `<p>I published something new:</p><p><a href="${url}"><strong>${safeTitle} →</strong></a></p><p>—Justin</p><p style="font-size:12px;color:#666">You’re getting this because you signed up for new posts. <a href="{{{RESEND_UNSUBSCRIBE_URL}}}">Unsubscribe</a>.</p>`,
      text: `I published something new:\n\n${title} →\n${url}\n\n—Justin\n\nYou’re getting this because you signed up for new posts.\nUnsubscribe: {{{RESEND_UNSUBSCRIBE_URL}}}`,
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
