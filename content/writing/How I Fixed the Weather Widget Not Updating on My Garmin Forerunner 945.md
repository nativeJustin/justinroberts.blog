---
title: "How I Fixed the Weather Widget Not Updating on My Garmin Forerunner 945"
tags:
  - garmin
  - fitness
date: 2026-07-12
description: How I fixed the GPS question mark and weather widget not updating on my Garmin Forerunner 945 after a device replacement.
---

I recently had to replace my Garmin Forerunner 945 after moisture developed underneath the display. The watch was about three years old, so it was outside the standard warranty period. I reached out to Garmin support anyway, and they offered me a replacement for $140. It wasn't free, but it was a lot cheaper than buying another watch.

During setup I ran into two issues that weren't immediately obvious.

## Two Forerunner 945s look identical

Once I paired the replacement watch, Garmin Connect showed two devices named Forerunner 945, with no obvious way to tell which one was which. My first instinct was to remove the old watch right away, but Garmin syncs data between devices during setup, so it's worth waiting until you're done before removing anything. Open each device in Garmin Connect and compare the device information to tell them apart instead.

## The GPS question mark

After setting up my replacement watch, I noticed that the weather and sunset fields on my watch face wouldn't load. Instead, they displayed a GPS question mark. This isn't a replacement-only issue. Any Forerunner 945 can run into it.

At first I assumed it was a problem with the watch face, so I tried several different ones. Every single one had the same issue.

Before doing anything else, check that Garmin Connect has location services enabled on your phone. If that's already on and you're still stuck, here's what worked for me.

The fix turned out to be simple, but there's one important detail.

You have to do this outside. The watch needs to acquire its first GPS signal. If you try it indoors, it won't work.

1. Go outside.
2. Start any GPS activity, such as a Run or Walk.
3. Wait until the watch acquires a GPS signal.
4. Cancel the activity. You don't need to save it.

As soon as my watch locked onto GPS, the weather, sunset time, and every other GPS-dependent widget immediately started working.

If your Garmin Forerunner 945 is showing a GPS question mark instead of weather information, don't waste time changing watch faces like I did. Make sure Garmin Connect has location access, then take the watch outside and let it acquire GPS once. Everything should begin syncing normally after that.
