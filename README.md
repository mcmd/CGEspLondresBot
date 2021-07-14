# CGEspLondresBot

This is a simple Twitter bot that checks for the availability of appointment slot for renewing your passport at the [Spanish Consulate General in London](https://twitter.com/cgesplondres) in the Twitter handle [@CGEspLondresBot](https://mobile.twitter.com/CGEspLondresBot).

This bot exists due to the difficulties the Spanish community has been having while finding and booking these slots. Also, the consulkate currentkly doesn't have the resources to publicize the slots when they make them available, or to send any kind of notification when anything changes in their website.

The code uses [Puppeteer](https://developers.google.com/web/tools/puppeteer) to scrap the booking system's website and look for slots, and [Twit](https://www.npmjs.com/package/twit) to use the Twitter API and post the results.

The bot is deployed a a [GCP Cloud function](https://cloud.google.com/functions) and scheduled to run every hour with [Cloud Scheduler](https://cloud.google.com/scheduler). I think this is a respectful approach that should not mean any negative impact to the consulate nor their booking vendor.

The bot currently tweet a single sentence indicating the availability, as well as a screenshot of the booking tool.

Having this information in a public Twitter account hopefully will increase discoverability of the slots. It should also make much easier to propagate this info to other places where the Spanish community interacts, like Facebook groups. Using something like IFTTT or Zapier should be straight forward.

# What's next
There are some ideas of other things this bot could do:
  *  Check only at 9h, 12h, and 15h to avoid noise
  *  Only Tweet when there is a change (When slots first become available or when they run out). This would reduce noise, but I'm not sure if it would give people the impression that the bot is not being updated. The consulate can go for long periods without publishing new slots.
  *  Tweet when key pages of the consulate's website are updated
  *  Publish a summary of how many accounts are interacting with the consulate's Twitter account (to highlight that there is a need so they reconsider prioritizing actively managing their Twitter account.
  *  Use IFTTT or Zapier to publish this information in relevant facebook groups too.

# Contributing
Not sure how much I'm going to extend this, or how much I'm going to maintain it, but feel free to open issues and/or submit a PR if you think you can add cool functionality!

# Support
If the bot was useful to you and you want to show support, you can [buy me a coffee](https://www.buymeacoffee.com/mcmd)!
<p align="center"><a href="https://www.buymeacoffee.com/mcmd" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" height="41" width="174"></a></p>

