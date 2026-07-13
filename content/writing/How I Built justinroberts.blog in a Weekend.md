---
title: "How I Built justinroberts.blog in a Weekend"
date: 2026-07-12
tags:
  - ai
description: How I went from buying a domain to a live Quartz blog in a weekend, with a book library, RSS feed, and custom comments, using AI as a build partner.
---

I've wanted to start a blog for four or five years. It was always one of those ideas I liked but never made time for. Work was busy. Life was busy. Setting up an entire website felt like a project for some undefined weekend in the future.

Then, on Thursday night, I randomly started thinking about domains.

I wondered whether I could find one with a naming convention I actually liked. I started searching, found that `justinroberts.blog` was available, and the vague idea suddenly felt much more concrete.

I've helped set up customer servers and configure DNS at previous jobs, but I had never built and hosted a site completely from scratch for myself. That made the blog more interesting than simply signing up for a traditional publishing platform. It became a chance to learn how all the pieces fit together when I was responsible for the entire thing.

By Friday, the site was live. I spent the rest of the weekend turning that first working version into the site I actually wanted, with the final iteration wrapped up on Sunday.

## Starting with Markdown and Obsidian

My original idea was to create an Obsidian vault and connect it to something that could publish the files directly. I already write most things in Markdown, so I wanted the website to work with that existing system instead of introducing another editor or content management platform.

While researching options, I found Quartz.

Quartz takes a folder of Markdown files and turns them into a static website. It is built for publishing digital gardens and Obsidian vaults, which made it a strong fit for what I was trying to do. I could keep writing in Markdown, store everything in Git, and generate a normal website from those files.

Once I understood the basic workflow, I ran with it.

The finished site is built with Quartz, stored on GitHub, and hosted through Cloudflare. When I push a change to the main branch, Cloudflare builds the site and deploys it. It is a relatively simple setup now, but getting there gave me a much better understanding of how domains, DNS, static-site generation, source control, and deployment all connect.

I had touched most of those pieces before. This was the first time I owned the whole path from a Markdown file on my computer to a page loading on a public domain.

## The book library became the starting point

I already had a large digital library in Obsidian with the books I've read, cover images, ratings, and the year I read each one.

That gave me the first real content for the site.

I had originally built the library entirely for myself, but once I started working on the blog, I realized there was no reason it had to stay private. I could publish the collection, share the books I liked, and eventually add full reviews.

Because the information was already stored as Markdown and metadata, I did not have to rebuild it in a separate database or manually enter everything into a blogging platform. I could take the system I was already using and build the public page around it.

The book library ended up shaping more of the site than I expected. It became the first major section, influenced the homepage design, and gave me a reason to figure out custom cards, cover images, ratings, sorting, and reading-status labels before I had written many traditional blog posts.

It was a good example of why I wanted to build the site this way. The website could adapt to the information I already had instead of forcing everything into a standard blog template.

## Turning it into an actual blog

Once the book library worked, I started adding the other pieces I had originally imagined when I bought the domain.

I created a Writing section, added an About page, set up an RSS feed, built a homepage that highlights both books and posts, and added a footer with contact and subscription links.

I also started publishing actual posts. The first few covered BJJ, recipes, AI-assisted training, and fixes for problems I had run into with Garmin devices.

That mix is exactly why I wanted a personal site instead of something built around one narrow topic. I wanted somewhere I could write about the things I was already working on or thinking about without deciding whether each one fit a particular brand.

The goal is not to turn it into a polished content machine. I want it to be useful, personal, and broad enough to follow whatever I am interested in at the time.

## Building comments for people outside of tech

Comments caused the biggest change to the original architecture.

I initially used Giscus, which connects blog comments to GitHub Discussions. It was easy to add and worked well, but there was one major limitation: readers needed a GitHub account to leave a comment.

That might be fine for a developer blog, but I do not expect everyone reading my posts to be a developer. Someone may find the site through a BJJ post, a recipe, a book recommendation, or a Garmin troubleshooting guide. Requiring that person to create a GitHub account just to respond did not make sense.

I replaced it with Waline, which allows someone to comment with a name and email address instead.

That decision meant the site could no longer be entirely static. Waline needed a server and a database, so I set up a separate backend on Vercel with a Postgres database hosted by Neon. I also configured email notifications so I would know when someone left a new comment instead of checking an admin page manually.

It was more infrastructure than I expected to build for a weekend blog project, but it matched the kind of site I wanted. The easiest technical option was not the best option for the people I hoped would use it.

## What AI helped with

I used AI heavily throughout the build.

It helped me explore Quartz, write and revise components, troubleshoot deployment problems, organize documentation, and move through unfamiliar parts of the stack faster than I would have on my own.

That did not make the project automatic.

Some of the hardest problems looked like one thing at first and turned out to have a completely different cause. Fixing them still required reading logs, inspecting what the browser was doing, testing assumptions, and understanding enough of the system to know when an answer did not fit the evidence.

AI was most useful as a collaborator that could help me move between ideas and implementation quickly. I could describe what I wanted, inspect what it produced, test it, and keep narrowing the problem.

The better I understood the system, the more useful the tools became.

## Documenting the decisions

One habit I tried to maintain throughout the project was documenting decisions shortly after I made them.

I added a `CLAUDE.md` file early in the build to explain how the repository worked, how deployment was configured, and what conventions future changes should follow. As I ran into less obvious problems, I added separate notes for bug history and writing best practices.

That documentation already paid off during the three-day build. When I returned to a part of the project later, I did not have to reconstruct why it had been set up a certain way. The answer was usually already written down next to the code.

It also made working with AI more consistent. Instead of reexplaining the entire project every time, I could give the tool a set of rules and decisions that reflected how the site actually worked.

For a personal project, that may sound excessive. After 43 commits in three days, it did not feel excessive.

## Where it ended up

What started as a Thursday-night domain search became a live site by Friday, then grew into a book library, a Writing section, an RSS feed, a custom comment backend, email notifications, automated deployment, and six published posts by Sunday.

More importantly, I finally built the thing I had been thinking about for years.

I could have launched a blog faster by using an existing hosted platform. That would have solved the publishing problem, but it would have skipped the part I found most interesting. I wanted to understand the system, make my own decisions, and see how far I could get by building it myself.

The site will keep changing as I use it. There are still pages to improve, posts to write, and probably several bugs I have not found yet.

But it exists now, which is more progress than the idea made during the previous four or five years.
