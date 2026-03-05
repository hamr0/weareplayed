# weareplayed — Product Reference

## Overview
Dark pattern scorecard for every page you visit.

Every day you're nudged, rushed, shamed, and tricked into decisions you didn't plan to make. Countdown timers that reset when you refresh. Checkboxes pre-ticked to sign you up for things you never asked for. Buttons that say "No thanks, I'd rather pay full price" to guilt you into clicking yes. Fake scarcity warnings about items that have been "almost sold out" for six months.

weareplayed scores every page you visit from 0 to 100 based on how many manipulation tactics it finds. No AI, no cloud lookups — just structural pattern matching against the DOM. All processing is local. No data leaves your browser.

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
