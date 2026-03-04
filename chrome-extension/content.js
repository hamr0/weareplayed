"use strict";

(function () {
  var results = [];
  var seen = {};

  function addResult(pattern, evidence) {
    var key = pattern + ":" + evidence;
    if (seen[key]) return;
    seen[key] = true;
    results.push({ pattern: pattern, text: evidence });
  }

  // Gather visible text from an element and its children (max depth)
  function visibleText(el, maxLen) {
    var text = (el.innerText || el.textContent || "").trim();
    return text.slice(0, maxLen || 200);
  }

  // --- 1. Countdown timers ---
  function scanCountdowns() {
    // Strategy: find elements with timer-like classes/attributes, OR
    // elements containing multiple adjacent digit groups
    var timerSelectors = [
      "[class*='timer']", "[class*='countdown']", "[class*='clock']",
      "[class*='Timer']", "[class*='Countdown']", "[class*='Clock']",
      "[id*='timer']", "[id*='countdown']", "[id*='clock']",
      "[data-countdown]", "[data-timer]", "[data-end]", "[data-expire]"
    ];
    var timerEls = document.querySelectorAll(timerSelectors.join(","));
    for (var i = 0; i < timerEls.length; i++) {
      var text = visibleText(timerEls[i], 150);
      if (text.length > 1) {
        addResult("countdown", text);
      }
    }

    // Also scan for time-like text patterns in visible elements
    var allEls = document.querySelectorAll("span, div, p, li, td");
    var timePattern = /\d{1,2}\s*[:.hH]\s*\d{2}\s*[:.mM]\s*\d{2}/;
    var timeWords = /\b(hour|min|sec|hr|uur|min|dag|jour|heure|stunde|ora|tiempo)\b/i;
    for (var j = 0; j < allEls.length; j++) {
      var el = allEls[j];
      if (el.children.length > 10) continue;
      var t = visibleText(el, 200);
      if (t.length < 3 || t.length > 200) continue;
      if (timePattern.test(t) || (timeWords.test(t) && /\d/.test(t))) {
        // Check parent context for urgency
        var parentText = el.parentElement ? visibleText(el.parentElement, 200) : t;
        addResult("countdown", parentText.slice(0, 120));
      }
    }
  }

  // --- 2. Pre-checked checkboxes ---
  function scanPrechecked() {
    var susWords = /newsletter|marketing|subscribe|promo|opt.?in|updates|offers|agree|consent|plan|protection|warranty|verzeker|nieuwsbrief|abonner|souscrire|inscri/i;

    // Native checkboxes
    var checks = document.querySelectorAll("input[type='checkbox']");
    for (var i = 0; i < checks.length; i++) {
      var cb = checks[i];
      if (!cb.checked) continue;
      var label = findLabel(cb);
      if (label && susWords.test(label)) {
        addResult("prechecked", label.slice(0, 120));
      }
    }

    // Custom checkboxes (aria)
    var ariaChecked = document.querySelectorAll("[role='checkbox'][aria-checked='true'], [role='switch'][aria-checked='true']");
    for (var j = 0; j < ariaChecked.length; j++) {
      var text = visibleText(ariaChecked[j], 150);
      if (!text) {
        var parent = ariaChecked[j].closest("label, [class*='checkbox'], [class*='check']");
        if (parent) text = visibleText(parent, 150);
      }
      if (text && susWords.test(text)) {
        addResult("prechecked", text.slice(0, 120));
      }
    }
  }

  function findLabel(input) {
    if (input.id) {
      var label = document.querySelector("label[for='" + CSS.escape(input.id) + "']");
      if (label) return label.textContent.trim();
    }
    var parent = input.closest("label");
    if (parent) return parent.textContent.trim();
    // Nearby text
    var container = input.closest("div, li, td, span");
    if (container) return container.textContent.trim().slice(0, 150);
    return null;
  }

  // --- 3. Confirm-shaming ---
  function scanConfirmShaming() {
    var phrases = [
      /no\s*,?\s*thanks?\b/i,
      /no\s*,?\s*i\s/i,
      /i\s+don'?t\s+want/i,
      /i'?ll\s+pass/i,
      /i\s+prefer\s+not/i,
      /i\s+don'?t\s+(like|need|care)/i,
      /i'?d\s+rather\s+(pay|spend|not)/i,
      /maybe\s+later/i,
      /not?\s+interested/i,
      /nee\s*,?\s*bedankt/i,       // Dutch
      /non\s*,?\s*merci/i,         // French
      /nein\s*,?\s*danke/i         // German
    ];
    var clickables = document.querySelectorAll("a, button, [role='button'], [class*='btn'], [class*='dismiss'], [class*='decline'], [class*='close'], [class*='cancel'], [class*='reject'], [class*='skip']");
    for (var i = 0; i < clickables.length; i++) {
      var text = (clickables[i].textContent || "").trim();
      if (text.length > 100 || text.length < 4) continue;
      for (var p = 0; p < phrases.length; p++) {
        if (phrases[p].test(text)) {
          addResult("shaming", text.slice(0, 120));
          break;
        }
      }
    }
  }

  // --- 4. Fake urgency ---
  function scanFakeUrgency() {
    var phrases = [
      /only\s+\d+\s+left/i,
      /\d+\s+people?\s+(viewing|watching|looking|bought|checked)/i,
      /limited\s+(time|stock|offer|quantity|edition)/i,
      /act\s+now/i,
      /selling\s+fast/i,
      /almost\s+(gone|sold\s*out|over)/i,
      /don'?t\s+miss/i,
      /last\s+chance/i,
      /offer\s+ends/i,
      /while\s+(supplies?|stocks?)\s+last/i,
      /in\s+high\s+demand/i,
      /\d+\s+(items?\s+)?left\s+in\s+stock/i,
      /selling\s+out/i,
      /flash\s+sale/i,
      /ends?\s+in\s+\d/i,
      /\d+\s+sold\s+in/i,
      /\d+\s+sold\s+recently/i,
      /\d+%\s+claimed/i,
      /hot\s+sale/i,
      /mega\s+sale/i,
      // Dutch
      /nog\s+\d+\s+(over|beschikbaar|op\s+voorraad)/i,
      /bijna\s+(uitverkocht|op)/i,
      /beperkte?\s+(tijd|voorraad|aanbieding)/i,
      /\d+\s+mensen?\s+bekijken/i,
      // French
      /plus\s+que\s+\d+/i,
      /vente\s+flash/i,
      // Generic number + urgency
      /\b\d+\s*\+?\s*(bought|sold|orders?|verkocht|besteld)\b/i
    ];

    // Scan element innerText (catches text spread across child spans)
    var candidates = document.querySelectorAll("span, div, p, li, td, a, strong, em, b, small, [class*='stock'], [class*='sold'], [class*='urgency'], [class*='scarcity'], [class*='badge'], [class*='hot'], [class*='sale'], [class*='left']");
    var scanned = {};
    for (var i = 0; i < candidates.length; i++) {
      var el = candidates[i];
      var text = visibleText(el, 200);
      if (text.length > 200 || text.length < 3) continue;
      if (scanned[text]) continue;
      scanned[text] = true;
      for (var p = 0; p < phrases.length; p++) {
        if (phrases[p].test(text)) {
          addResult("urgency", text.slice(0, 120));
          break;
        }
      }
    }
  }

  // --- 5. Hidden unsubscribe ---
  function scanHiddenUnsubscribe() {
    var links = document.querySelectorAll("a");
    for (var i = 0; i < links.length; i++) {
      var text = (links[i].textContent || "").trim();
      if (!/unsubscribe|opt.?out|afmelden|uitschrijven|d[eé]sabonner/i.test(text)) continue;
      var style = window.getComputedStyle(links[i]);
      var size = parseFloat(style.fontSize);
      var opacity = parseFloat(style.opacity);
      var color = style.color;
      var bg = findBackground(links[i]);
      if (size < 10 || opacity < 0.5 || isLowContrast(color, bg)) {
        addResult("hidden-unsub", "\"" + text.slice(0, 80) + "\" — " + Math.round(size) + "px, opacity " + opacity.toFixed(1));
      }
    }
  }

  function findBackground(el) {
    var node = el;
    while (node && node !== document.body) {
      var bg = window.getComputedStyle(node).backgroundColor;
      if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") return bg;
      node = node.parentElement;
    }
    return "rgb(255, 255, 255)";
  }

  function isLowContrast(fg, bg) {
    var fgRgb = parseRgb(fg);
    var bgRgb = parseRgb(bg);
    if (!fgRgb || !bgRgb) return false;
    var fgLum = luminance(fgRgb);
    var bgLum = luminance(bgRgb);
    var ratio = (Math.max(fgLum, bgLum) + 0.05) / (Math.min(fgLum, bgLum) + 0.05);
    return ratio < 2.5;
  }

  function parseRgb(str) {
    var m = str.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (!m) return null;
    return [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])];
  }

  function luminance(rgb) {
    var vals = rgb.map(function (v) {
      v = v / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * vals[0] + 0.7152 * vals[1] + 0.0722 * vals[2];
  }

  // --- Run all scans ---
  function scan() {
    results = [];
    seen = {};
    scanCountdowns();
    scanPrechecked();
    scanConfirmShaming();
    scanFakeUrgency();
    scanHiddenUnsubscribe();

    var types = {};
    var items = [];
    for (var i = 0; i < results.length; i++) {
      var r = results[i];
      if (!types[r.pattern]) types[r.pattern] = [];
      types[r.pattern].push(r.text);
    }

    var patternNames = Object.keys(types);
    for (var j = 0; j < patternNames.length; j++) {
      items.push({
        pattern: patternNames[j],
        evidence: types[patternNames[j]]
      });
    }

    var score = Math.min(100, patternNames.length * 20);

    chrome.runtime.sendMessage({
      type: "scanResult",
      domain: location.hostname,
      items: items,
      score: score,
      total: results.length
    });
  }

  setTimeout(scan, 2000);

  var rescanTimer = null;
  var observer = new MutationObserver(function () {
    if (rescanTimer) clearTimeout(rescanTimer);
    rescanTimer = setTimeout(scan, 3000);
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
