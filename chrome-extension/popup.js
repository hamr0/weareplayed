"use strict";

var PATTERN_LABELS = {
  countdown: "Countdown timers",
  discount: "Discount pressure",
  scarcity: "Scarcity & social proof",
  prechecked: "Pre-checked opt-ins",
  shaming: "Confirm-shaming",
  "hidden-unsub": "Hidden unsubscribe"
};

var SECTIONS = {
  "Pressure tactics": ["countdown", "discount", "scarcity"],
  "Deceptive design": ["prechecked", "shaming", "hidden-unsub"]
};

var SECTION_ORDER = ["Pressure tactics", "Deceptive design"];

document.addEventListener("DOMContentLoaded", function () {
  chrome.runtime.sendMessage({ type: "getResults" }, function (data) {
    render(data);
  });
});

function render(data) {
  var verdictEl = document.getElementById("verdict");
  var breakdownEl = document.getElementById("breakdown");
  var emptyEl = document.getElementById("empty");

  if (!data || data.score === 0) {
    var domain = data ? stripDomain(data.domain) : "this site";
    verdictEl.appendChild(buildVerdict(domain, 0));
    emptyEl.classList.remove("hidden");
    return;
  }

  verdictEl.appendChild(buildVerdict(stripDomain(data.domain), data.score));
  buildBreakdown(breakdownEl, data.items);
  breakdownEl.classList.remove("hidden");
}

function stripDomain(hostname) {
  return hostname.replace(/^www\./, "");
}

function buildVerdict(domain, score) {
  var level, message;
  if (score === 0) {
    level = "clean";
    message = "No tricks here.";
  } else if (score <= 20) {
    level = "warn";
    message = "Mild pressure tactics.";
  } else if (score <= 60) {
    level = "moderate";
    message = "This site is nudging you.";
  } else {
    level = "bad";
    message = "This site is playing you.";
  }

  var wrap = el("div", "verdict verdict-" + level);

  var domainEl = el("div", "verdict-domain");
  domainEl.textContent = domain;
  wrap.appendChild(domainEl);

  var scoreEl = el("div", "verdict-score");
  scoreEl.textContent = score;
  wrap.appendChild(scoreEl);

  var labelEl = el("div", "verdict-label");
  labelEl.textContent = "manipulation score";
  wrap.appendChild(labelEl);

  var msgEl = el("div", "verdict-message");
  msgEl.textContent = message;
  wrap.appendChild(msgEl);

  return wrap;
}

function buildBreakdown(container, items) {
  var itemMap = {};
  for (var i = 0; i < items.length; i++) {
    itemMap[items[i].pattern] = items[i].count;
  }

  for (var s = 0; s < SECTION_ORDER.length; s++) {
    var sectionName = SECTION_ORDER[s];
    var patterns = SECTIONS[sectionName];
    var hasAny = false;

    for (var p = 0; p < patterns.length; p++) {
      if (itemMap[patterns[p]]) { hasAny = true; break; }
    }
    if (!hasAny) continue;

    var section = el("div", "breakdown-section");

    var heading = el("div", "breakdown-heading");
    heading.textContent = sectionName;
    section.appendChild(heading);

    for (var j = 0; j < patterns.length; j++) {
      var pattern = patterns[j];
      var count = itemMap[pattern];
      if (!count) continue;

      var row = el("div", "breakdown-row");

      var label = el("span", "row-label");
      label.textContent = PATTERN_LABELS[pattern];
      row.appendChild(label);

      var countEl = el("span", "row-count");
      countEl.textContent = count;
      row.appendChild(countEl);

      section.appendChild(row);
    }

    container.appendChild(section);
  }
}

function el(tag, className) {
  var node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}
