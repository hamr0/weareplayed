# weareplayed

> Dark pattern scorecard for every page you visit.

**Spot the tricks websites use to manipulate you.**

Every day you're nudged, rushed, shamed, and tricked into decisions you didn't plan to make. Countdown timers that reset when you refresh. Checkboxes pre-ticked to sign you up for things you never asked for. Buttons that say "No thanks, I'd rather pay full price" to guilt you into clicking yes. Fake scarcity warnings about items that have been "almost sold out" for six months.

These are dark patterns — deceptive design choices that exploit psychology to benefit the site at your expense. They're everywhere, and they work because you don't notice them.

weareplayed scores every page you visit from 0 to 100 based on how many manipulation tactics it finds. No AI, no cloud lookups — just structural pattern matching against the DOM. All processing is local. No data leaves your browser.

Part of the **weare____** privacy tool series.

## What it detects

### Countdown timers
Urgency clocks ticking down to nothing: "Offer expires in 02:14:33". Often these reset on page reload, proving they're fabricated. Real deadlines don't need theatrics.

### Discount pressure
Percentage badges, strikethrough prices, and sale classes designed to make you feel like you're missing out. Detected structurally via CSS `text-decoration: line-through` and `X% off` patterns.

### Scarcity & social proof
Text designed to make you panic: "Only 2 left in stock", "12 people viewing this right now", "4,382 sold". These numbers are often fabricated or meaningless. Works across EN/NL/FR/DE.

### Pre-checked opt-ins
Checkboxes already ticked when you land on the page: newsletter signups, marketing consent, add-on services, protection plans. The site is betting you won't notice.

### Confirm-shaming
Decline buttons written to make you feel bad: "No thanks, I don't want to save money", "I'll pass on this exclusive offer". Detected across EN/NL/FR/DE phrases.

### Hidden unsubscribe
Unsubscribe or opt-out links deliberately styled to be nearly invisible: tiny font sizes, low contrast against the background, buried in walls of text. If they wanted you to find it, it wouldn't be 8px gray-on-gray.

## How scoring works

Each pattern type detected adds 20 points. Maximum score is 100.

| Score | Badge | Meaning |
|---|---|---|
| 0 | (none) | No tricks here. |
| 1–20 | Green | Mild pressure tactics. |
| 21–60 | Orange | This site is nudging you. |
| 61–100 | Red | This site is playing you. |

## How it works

1. **content.js** runs after page load and scans the DOM using 6 detection modules:
   - TreeWalker for text-based patterns (urgency, countdowns, scarcity)
   - CSS computed style analysis for strikethrough prices and hidden links
   - Checkbox state inspection for pre-checked opt-ins
   - Button/link text matching for confirm-shaming phrases (EN/NL/FR/DE)
   - Contrast ratio calculation for hidden unsubscribe links
2. A MutationObserver re-scans when the page adds dynamic content (3s debounce)
3. Results are sent to **background.js** which stores them per tab and updates the badge
4. **popup.js** renders the score, verdict, and breakdown by section

All processing is local. No data leaves your browser.

## Install

### Chrome
1. Clone or download this repo
2. Open `chrome://extensions/`
3. Enable **Developer mode**
4. Click **Load unpacked** → select the `chrome-extension/` folder

### Firefox
1. Clone or download this repo
2. Open `about:debugging#/runtime/this-firefox`
3. Click **Load Temporary Add-on** → select any file inside the `firefox-extension/` folder

Browse to any shopping site — the badge shows the manipulation score.

## Project structure

```
chrome-extension/
  manifest.json       # Chrome MV3 manifest
  content.js          # 6 dark pattern scanners + MutationObserver
  background.js       # chrome.storage.session + badge scoring
  popup.html/js/css   # Score + evidence rendering
  icon48/128.png      # Extension icons (placeholder)
firefox-extension/
  manifest.json       # Firefox MV2 manifest
  content.js          # Same scanners, browser.runtime API
  background.js       # In-memory tabData + browser.browserAction badge
  popup.html/js/css   # Same UI, promise-based messaging
  icon48/128.png      # Extension icons (placeholder)
store-assets/
  weareplayed-chrome.zip
```
