"use strict";

(function () {
  var results = [];

  function addResult(pattern, evidence) {
    results.push({ pattern: pattern, text: evidence });
  }

  // --- 1. Countdown timers ---
  function scanCountdowns() {
    var timePattern = /\d{1,2}\s*[:.]\s*\d{2}\s*[:.]\s*\d{2}/;
    var urgencyWords = /\b(ends?\s+in|left|remaining|expires?|hurry|time\s*left|countdown)\b/i;
    var els = document.querySelectorAll("*");
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.children.length > 3) continue;
      var text = (el.textContent || "").trim();
      if (text.length > 200 || text.length < 3) continue;
      if (timePattern.test(text) && urgencyWords.test(text)) {
        addResult("countdown", text.slice(0, 120));
      }
    }
  }

  // --- 2. Pre-checked checkboxes ---
  function scanPrechecked() {
    var susWords = /newsletter|marketing|subscribe|promo|opt.?in|updates|offers|agree|consent|plan|protection|warranty/i;
    var checks = document.querySelectorAll("input[type='checkbox'][checked], input[type='checkbox']:checked");
    for (var i = 0; i < checks.length; i++) {
      var cb = checks[i];
      var label = findLabel(cb);
      if (label && susWords.test(label)) {
        addResult("prechecked", label.slice(0, 120));
      }
    }
  }

  function findLabel(input) {
    // Check for associated <label>
    if (input.id) {
      var label = document.querySelector("label[for='" + input.id + "']");
      if (label) return label.textContent.trim();
    }
    // Check parent label
    var parent = input.closest("label");
    if (parent) return parent.textContent.trim();
    // Check next sibling text
    var next = input.nextElementSibling || input.parentElement;
    if (next) return next.textContent.trim().slice(0, 150);
    return null;
  }

  // --- 3. Confirm-shaming ---
  function scanConfirmShaming() {
    var phrases = [
      /no\s*,?\s*thanks?\s*,?\s*i/i,
      /i\s+don'?t\s+want/i,
      /i'?ll\s+pass/i,
      /no\s*,?\s*i\s+prefer/i,
      /no\s*,?\s*i\s+don'?t/i,
      /i\s+don'?t\s+like\s+(saving|money|deals|discounts)/i,
      /i\s+don'?t\s+need/i,
      /no\s*,?\s*i'?m\s+(good|fine|ok)/i,
      /i\s+hate\s+(saving|money|deals)/i,
      /i'?d\s+rather\s+(pay|spend)\s+(full|more)/i
    ];
    var clickables = document.querySelectorAll("a, button, [role='button'], .btn, [class*='dismiss'], [class*='decline'], [class*='close']");
    for (var i = 0; i < clickables.length; i++) {
      var text = (clickables[i].textContent || "").trim();
      if (text.length > 150 || text.length < 5) continue;
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
      /\d+\s+people?\s+(viewing|watching|looking|bought)/i,
      /limited\s+time/i,
      /act\s+now/i,
      /selling\s+fast/i,
      /almost\s+(gone|sold\s*out)/i,
      /don'?t\s+miss\s+(out|this)/i,
      /last\s+chance/i,
      /offer\s+ends/i,
      /while\s+supplies?\s+last/i,
      /in\s+high\s+demand/i,
      /\d+\s+(items?\s+)?left\s+in\s+stock/i
    ];
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    var seen = {};
    while (walker.nextNode()) {
      var text = walker.currentNode.textContent.trim();
      if (text.length > 200 || text.length < 8) continue;
      for (var p = 0; p < phrases.length; p++) {
        if (phrases[p].test(text)) {
          var snippet = text.slice(0, 120);
          if (!seen[snippet]) {
            seen[snippet] = true;
            addResult("urgency", snippet);
          }
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
      if (!/unsubscribe|opt.?out/i.test(text)) continue;
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
    scanCountdowns();
    scanPrechecked();
    scanConfirmShaming();
    scanFakeUrgency();
    scanHiddenUnsubscribe();

    // Score: count unique pattern types, 20 pts each
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

  // Wait for page to settle, then scan
  setTimeout(scan, 1500);

  // Re-scan after dynamic content loads
  var rescanTimer = null;
  var observer = new MutationObserver(function () {
    if (rescanTimer) clearTimeout(rescanTimer);
    rescanTimer = setTimeout(scan, 3000);
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
