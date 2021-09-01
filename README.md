# CGEspLondresBot

This code serves as core for a simple Twitter bot that checks for the availability of appointment slots for renewing your passport at the [Spanish Consulate General in London](https://twitter.com/cgesplondres). Said bot is currently live in the Twitter handle [@CGEspLondresBot](https://mobile.twitter.com/CGEspLondresBot).

This bot exists due to the difficulties the Spanish community has been having while finding and booking these slots. There is a big deal of anxiety around these slots, not only because how difficult they are to get, but also because the uncertainty of when do they actually become available. Also, the consulate currently doesn't have the resources to publicize the slots when they make them available, or to send any kind of notification when anything changes in their website. They have used twitter in the past, but not consistenly enough to regard that channel as reliable. Plus, some spare slots become available at random times, and the consulate never notifies about those. For all this, it seemed like a good idea to try to surface the availability though Twitter, a more accessible channel.

The code uses [Puppeteer](https://developers.google.com/web/tools/puppeteer) to scrap the booking system's website and look for slots, and [Twit](https://www.npmjs.com/package/twit) to use the Twitter API and post the results.

The bot is deployed as a [GCP Cloud function](https://cloud.google.com/functions) and scheduled to run every hour with [Cloud Scheduler](https://cloud.google.com/scheduler). I think this is a respectful approach that should not mean any negative impact to the consulate nor their booking vendor.

The bot will tweet a message when slots become available and when they run out. The bot is aware of the result of the last check as that value is stored in firestore.

Having this information in a public Twitter account hopefully will increase discoverability of the slots. There is currently an IFTTT job set up to replicate the tweets from this bot to a [Telegram channel](http://t.me/CGEspLondresBot) and to a [Facebook page](http://fb.me/CGEspLondresBot).

The Twitter handle also publishes notifications when the consulate updates some pages in their website, but this is handles by a Wachete+Zapier setup, and it is out of the scope of the code in this repo.

# Contributing
Not sure how much I'm going to extend this, or how much I'm going to maintain it, but feel free to open issues and/or submit a PR if you think you can add cool functionality!

# Support
If the bot was useful to you and you want to show support, you can [buy me a coffee](https://www.buymeacoffee.com/mcmd)!
<p align="center"><a href="https://www.buymeacoffee.com/mcmd" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" height="41" width="174"></a></p>

