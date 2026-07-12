---
title: "The Workout App I Could Finally Connect to AI"
date: 2026-07-11
tags:
  - ai
  - fitness
description: How I connected Claude to my workout tracking using the Hevy API, building an AI personal trainer that plans, logs, and reviews my training.
---

For the last week or so I've been experimenting with using AI to manage my strength training.

I didn't want to replace my own programming. I wanted to design an AI assistant that knew my training history, could review my workouts each week, notice trends I might miss, and help adjust my programming based on my performance. Think of it more like another coach I can bounce ideas off of. I'll write more about building that personal trainer in another post.

My first thought was to use Google Sheets as the bridge between AI and my workout data. I had ChatGPT, and later Claude, generate my workouts and update a spreadsheet after each session. It worked, but just barely. Using Google Sheets on a phone in the gym isn't a great experience when you're trying to quickly log sets, RPE, rest times, and weights between exercises.

I also ran into another limitation. Claude can't work directly with Google Sheets, so every change meant exporting a spreadsheet and uploading it myself. It wasn't a huge problem, but it added enough friction that I started looking for a better solution.

The funny thing is I already had a workout app I really liked.

I've logged over 400 workouts in Strong. It's been reliable, the UI is excellent, the timers never fail, it tracks one-rep maxes, and it keeps a complete history of every workout. The problem wasn't Strong. The problem was that I couldn't connect it to AI because it doesn't expose an API.

So I started looking around and found Hevy. About 85% of my day job involves integrating with third-party APIs, so reading API documentation and wiring systems together is familiar territory. Hevy has a [well documented API](https://api.hevyapp.com/docs/), and developer access is included with the Pro subscription.

That changed my workflow.

I built a Claude skill around the Hevy API documentation and created a repeatable workflow for planning, tracking, and reviewing my training. Here's the full process:

```text
                Plan Mode
                    │
                    ▼
        Claude AI Personal Trainer
                    │
        Creates / Revises Program
                    │
                    ▼
              Hevy REST API
                    │
        Creates Workout Routine
                    │
                    ▼
         Hevy App (Gym Session)
                    │
      Log Sets • Weight • RPE • Rest
                    │
                    ▼
          Workout History in Hevy
                    │
                    ▼
              Hevy REST API
                    │
        Pulls Workout History
                    │
                    ▼
      Claude Weekly Review & Analysis
                    │
                    ▼
        Recommends Adjustments
          (Weight, Sets, RPE)
                    │
                    └───────────────┐
                                    │
                     Loops back into next revision
```

I get the experience of using a polished workout app while still being able to interact with my training through natural language.

So far I've been impressed with how complete the API is. I can create workouts, update sets or RPE, modify rest timers, and add new exercises without opening the app to make those changes manually. The lock screen widget is also surprisingly useful for quickly logging completed sets. The only thing I'd like to see is the ability to log RPE directly from the widget instead of opening the workout.

API access costs about \$2.99 per month, or roughly \$24 per year. That's an easy purchase for me considering how much flexibility it adds.

This experiment reinforced something I've been thinking about for a while. As AI becomes more capable, I think software with open APIs is going to become more valuable. The best applications won't necessarily be the ones with the most AI features built in. They'll be the ones that let you own your data and make it easy for AI agents to work with it.

That's what sold me on Hevy: a great workout tracker, but the API is what makes it interesting. Instead of trying to build another workout app, I can build my own workflows on top of it.
