---
title: "My Kasa Smart Plugs Wouldn't Connect to Wi-Fi. Here's What Fixed It"
tags:
  - tech
date: 2026-11-03
description: How I got TP-Link Kasa HS103 smart plugs connected after the Kasa app couldn't find any Wi-Fi networks, by setting them up through Tapo.
---

*Just looking for the fix? [Skip straight to the solution](#how-to-connect-kasa-hs103-plugs-using-tapo).*

My wife and I recently moved back to Colorado, and I've been working on getting everything set up in our new house. One of those things was reconnecting all our smart plugs.

We have a bunch of TP-Link Kasa HS103 plugs that we've used for years. They're pretty simple devices. You plug them into an outlet, connect them to Wi-Fi, and control whatever is plugged into them from your phone.

I've set these things up plenty of times before, so I wasn't expecting much of a problem.

I opened the Kasa app, reset one of the plugs, and started going through the setup process. Everything worked normally until I got to the part where the app scans for available Wi-Fi networks.

Nothing showed up.

Not our network. Not the neighbors' networks. Nothing.

After about 40 to 60 seconds, the app would finally give me the option to manually enter a hidden network. I tried entering our Wi-Fi information, but that didn't work either.

My first thought was that something was wrong with our router.

We're renting our new place, and the router belongs to our landlord. I figured the issue was probably related to the Wi-Fi configuration since these older Kasa plugs only support 2.4 GHz Wi-Fi, and I knew WPA3 could potentially cause compatibility issues.

I started using AI to work through some possible causes, and one theory worth checking was whether the router was using WPA3 instead of WPA2.

The problem was that I couldn't log into the router to check. Our landlord didn't know the administrator password, and apparently it had been changed from the default at some point. We tried figuring out how to recover it, but nobody knew the answers to the security questions either.

So that was fun.

Eventually, I figured out how to run a Wi-Fi scan and check the security protocol without needing access to the router settings.

WPA2.

Well, there goes that theory.

I kept working through the usual troubleshooting steps. I moved the plug closer to the router, reset it multiple times, checked the app permissions, and manually entered the network information.

The weird thing was that the plug itself seemed to be working fine. It would enter pairing mode, and my phone could connect to its temporary Wi-Fi network. But once the Kasa app tried scanning for my actual home network, it couldn't find anything.

Another thing I wanted to rule out was whether the issue was specific to the home network. AI suggested using a mobile hotspot as a quick way to test that.

That seemed reasonable. If the plug connected to a hotspot but not our home Wi-Fi, that would at least point toward something with the router's configuration.

I tried that too.

Same exact issue.

Now I was getting annoyed.

At this point, I'd worked through most of the obvious possibilities and wasn't making much progress. The troubleshooting kept leading back to router configuration, but I was starting to question whether the router was even the problem.

I work in tech, and troubleshooting is a pretty big part of my job. Usually, I enjoy figuring out why something isn't working, but this was becoming one of those problems where I kept testing things without getting any closer to an answer.

While messing around in the Kasa app, I noticed something about TP-Link's Tapo app.

I knew Tapo was another line of TP-Link smart home products, but apparently the two apps have some integration now.

I thought, why not just try setting the plugs up through Tapo instead?

So I downloaded the Tapo app, started adding my HS103 plug, and went through the setup process.

It found my Wi-Fi network immediately.

I entered the password, and the plug connected.

That was it.

I had spent all this time trying to figure out whether the router was using the wrong security protocol, whether I needed access to the administrator settings, or whether something was wrong with the plugs themselves.

Turns out I just needed to use a different app.

I still don't know exactly why the Kasa app couldn't find a single Wi-Fi network while Tapo had no problem. Both apps are made by TP-Link, and they're connecting to the same hardware on the same network.

Whatever the reason, Tapo worked.

## How to connect Kasa HS103 plugs using Tapo

If you're having the same issue where the Kasa app won't discover any Wi-Fi networks, I'd try using Tapo before spending a bunch of time messing with your router.

Here's what worked for me:

1. Download the [TP-Link Tapo app](https://www.tapo.com/).
2. Reset your Kasa plug and put it into pairing mode.
3. Open Tapo and select the option to add a new device.
4. Select your compatible Kasa smart plug and follow the pairing instructions.
5. Choose your Wi-Fi network, enter the password, and finish setup.

TP-Link also has an [official guide for adding Kasa devices to Tapo](https://www.tp-link.com/in/support/faq/3762/) if you need more detailed instructions.

If that doesn't work, there are still a few things worth checking:

- **Wi-Fi frequency:** The Kasa HS103 requires a 2.4 GHz network.
- **Security protocol:** Check whether your network is using WPA2 or an incompatible security configuration.
- **Pairing mode:** Make sure the plug has been reset and is in pairing mode before trying to connect.
- **App permissions:** Make sure the app has the local network and other permissions it needs to discover devices.
- **Mobile hotspot:** If you have another phone available, try connecting through its hotspot to help determine whether the problem is specific to your home network.

For me, none of the usual troubleshooting steps worked. I didn't change anything on the router, and I never ended up needing the administrator password.

I just downloaded Tapo and connected the plugs.

I'm still a little annoyed that I spent so much time troubleshooting the router when switching apps ended up fixing everything.

But at least the plugs work now.
