# weareplayed

**Spot the tricks websites use to manipulate you.**

Every day you're nudged, rushed, shamed, and tricked into decisions you didn't plan to make. Countdown timers that reset when you refresh. Checkboxes pre-ticked to sign you up for things you never asked for. Buttons that say "No thanks, I'd rather pay full price" to guilt you into clicking yes. Fake scarcity warnings about items that have been "almost sold out" for six months.

These are dark patterns — deceptive design choices that exploit psychology to benefit the site at your expense. They're everywhere, and they work because you don't notice them.

weareplayed scores every page you visit from 0 to 100 based on how many manipulation tactics it finds, and shows you the exact text from the page that triggered each detection. No AI, no cloud lookups — just pattern matching against the DOM.

Part of the **weare____** privacy tool series.

## What it detects

### Fake urgency
Text designed to make you panic: "Only 2 left in stock", "12 people viewing this right now", "Deal ends soon", "Selling fast". These numbers are often fabricated or meaningless.

### Pre-checked opt-ins
Checkboxes already ticked when you land on the page: newsletter signups, marketing consent, add-on services, protection plans. The site is betting you won't notice.

### Confirm-shaming
Decline buttons written to make you feel bad: "No thanks, I don't want to save money", "I'll pass on this exclusive offer", "No, I prefer paying full price". Designed to make the "no" option feel like a personal failing.

### Countdown timers
Urgency clocks ticking down to nothing: "Offer expires in 02:14:33". Often these reset on page reload, proving they're fabricated. Real deadlines don't need theatrics.

### Hidden unsubscribe
Unsubscribe or opt-out links deliberately styled to be nearly invisible: tiny font sizes, low contrast against the background, buried in walls of text. If they wanted you to find it, it wouldn't be 8px gray-on-gray.

## How scoring works

Each pattern type detected adds 20 points. Maximum score is 100.

| Score | Badge | Meaning |
|---|---|---|
| 0 | (none) | No tricks here. |
| 1–30 | Green | Mild manipulation. |
| 31–60 | Orange | Moderate — multiple tactics in play. |
| 61–100 | Red | Heavy manipulation. This site is playing you. |

The badge shows the score. The popup shows the score plus every piece of evidence — the actual text pulled from the page.

## How it works

1. **content.js** runs after page load and scans the DOM using 5 detection modules:
   - TreeWalker for text-based patterns (urgency, countdowns)
   - Checkbox state inspection for pre-checked opt-ins
   - Button/link text matching for confirm-shaming phrases
   - Computed style analysis for hidden unsubscribe links (font size, opacity, contrast ratio)
2. A MutationObserver re-scans when the page adds dynamic content (3s debounce)
3. Results are sent to **background.js** which stores them per tab and updates the badge
4. **popup.js** renders the score, verdict, and evidence list

All processing is local. No data leaves your browser.

## Install (Chrome)

1. Clone or download this repo
2. Open `chrome://extensions/`
3. Enable **Developer mode**
4. Click **Load unpacked** → select the `chrome-extension/` folder
5. Browse to any shopping site — the badge shows the manipulation score

## Testing checklist

- [ ] Load extension, visit amazon.com — expect urgency patterns and pre-checked boxes
- [ ] Visit a site with newsletter popups — expect confirm-shaming or pre-checked opt-ins
- [ ] Visit wikipedia.org — expect score 0, "No tricks here"
- [ ] Refresh a page with countdown timers — check if the timer resets (proving it's fake)
- [ ] Click badge → popup shows score, verdict, and exact evidence text from the page

## Project structure

```
chrome-extension/
  manifest.json       # Chrome MV3 manifest
  content.js          # 5 dark pattern scanners + MutationObserver
  background.js       # Storage + badge scoring
  popup.html          # Popup shell
  popup.js            # Score + evidence rendering
  popup.css           # Dark theme
  icon48.png          # Extension icon (48px, placeholder)
  icon128.png         # Extension icon (128px, placeholder)
store-assets/
  weareplayed-chrome.zip  # Packaged extension
```

## Status

POC — Chrome only. Validates that DOM heuristics catch real-world dark patterns.
