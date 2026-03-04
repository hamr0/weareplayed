"use strict";

var PATTERN_LABELS = {
  countdown: "Countdown timers",
  prechecked: "Pre-checked opt-ins",
  shaming: "Confirm-shaming",
  urgency: "Urgency & sales pressure",
  "hidden-unsub": "Hidden unsubscribe"
};

var PATTERN_ORDER = ["urgency", "prechecked", "shaming", "countdown", "hidden-unsub"];

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
    verdictEl.appendChild(buildVerdict(domain, 0, 0));
    emptyEl.classList.remove("hidden");
    return;
  }

  verdictEl.appendChild(buildVerdict(stripDomain(data.domain), data.score, data.total));
  buildBreakdown(breakdownEl, data.items);
  breakdownEl.classList.remove("hidden");
}

function stripDomain(hostname) {
  return hostname.replace(/^www\./, "");
}

function buildVerdict(domain, score, total) {
  var level;
  var message;
  if (score === 0) {
    level = "clean";
    message = "No tricks here.";
  } else if (score <= 30) {
    level = "warn";
    message = "tricks to manipulate you.";
  } else if (score <= 60) {
    level = "moderate";
    message = "tricks to manipulate you.";
  } else {
    level = "bad";
    message = "tricks playing you hard.";
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
  msgEl.textContent = total > 0 ? total + " " + message : message;
  wrap.appendChild(msgEl);

  return wrap;
}

function buildBreakdown(container, items) {
  // Sort by pattern order
  var itemMap = {};
  for (var i = 0; i < items.length; i++) {
    itemMap[items[i].pattern] = items[i];
  }

  for (var c = 0; c < PATTERN_ORDER.length; c++) {
    var pattern = PATTERN_ORDER[c];
    var item = itemMap[pattern];
    if (!item) continue;

    var section = el("div", "breakdown-section");

    var heading = el("div", "breakdown-heading");
    var label = PATTERN_LABELS[pattern] || pattern;
    heading.textContent = label + " (" + item.evidence.length + ")";
    section.appendChild(heading);

    for (var j = 0; j < item.evidence.length && j < 5; j++) {
      var row = el("div", "breakdown-row");
      var text = el("span", "row-evidence");
      text.textContent = item.evidence[j];
      row.appendChild(text);
      section.appendChild(row);
    }

    if (item.evidence.length > 5) {
      var more = el("div", "breakdown-more");
      more.textContent = "+" + (item.evidence.length - 5) + " more";
      section.appendChild(more);
    }

    container.appendChild(section);
  }
}

function el(tag, className) {
  var node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}
