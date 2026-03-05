# weareplayed

> Dark pattern scorecard for every page you visit.

Every day you're nudged, rushed, shamed, and tricked into decisions you didn't plan to make. Countdown timers that reset when you refresh. Pre-checked boxes signing you up for things you never asked for. Buttons designed to guilt you into clicking yes. weareplayed scores every page from 0 to 100 based on how many manipulation tactics it finds.

No AI, no cloud lookups — just structural pattern matching against the DOM. All processing is local.

## What it detects
- **Countdown timers** — urgency clocks ticking down to nothing, often resetting on reload
- **Discount pressure** — strikethrough prices and percentage badges designed to create FOMO
- **Scarcity & social proof** — "Only 2 left", "12 people viewing this" — often fabricated
- **Pre-checked opt-ins** — checkboxes already ticked: newsletters, marketing consent, add-ons
- **Confirm-shaming** — "No thanks, I don't want to save money" decline buttons
- **Hidden unsubscribe** — opt-out links deliberately styled to be nearly invisible

## How scoring works

Each pattern type detected adds 20 points. Maximum score is 100.

| Score | Badge | Meaning |
|---|---|---|
| 0 | (none) | No tricks here. |
| 1–20 | Green | Mild pressure tactics. |
| 21–60 | Orange | This site is nudging you. |
| 61–100 | Red | This site is playing you. |

## Try It Now

Store approval pending — install locally in under a minute:

### Chrome
1. Download this repo (Code → Download ZIP) and unzip
2. Go to `chrome://extensions` and turn on **Developer mode** (top right)
3. Click **Load unpacked** → select the `chrome-extension` folder
4. That's it — browse any site and click the extension icon

### Firefox
1. Download this repo (Code → Download ZIP) and unzip
2. Go to `about:debugging#/runtime/this-firefox`
3. Click **Load Temporary Add-on** → pick any file in the `firefox-extension` folder
4. That's it — browse any site and click the extension icon

> Firefox temporary add-ons reset when you close the browser — just re-load next session.

---

## The weare____ Suite

Privacy tools that show what's happening — no cloud, no accounts, nothing leaves your browser.

| Extension | What it exposes |
|-----------|----------------|
| [wearecooked](https://github.com/hamr0/wearecooked) | Cookies, tracking pixels, and beacons |
| [wearebaked](https://github.com/hamr0/wearebaked) | Network requests, third-party scripts, and data brokers |
| [weareleaking](https://github.com/hamr0/weareleaking) | localStorage and sessionStorage tracking data |
| [wearelinked](https://github.com/hamr0/wearelinked) | Redirect chains and tracking parameters in links |
| [wearewatched](https://github.com/hamr0/wearewatched) | Browser fingerprinting and silent permission access |
| **weareplayed** | Dark patterns: fake urgency, confirm-shaming, pre-checked boxes |
| [wearetosed](https://github.com/hamr0/wearetosed) | Toxic clauses in privacy policies and terms of service |
| [wearesilent](https://github.com/hamr0/wearesilent) | Form input exfiltration before you click submit |

All extensions run entirely on your device and work on Chrome and Firefox.
