////////////////////////////////////////////////////////////////////////////////
// Analytics
////////////////////////////////////////////////////////////////////////////////
(function(i,s,o,g,r,a,m){i["GoogleAnalyticsObject"]=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,"script","https://www.google-analytics.com/analytics.js","ga");

var version = chrome.runtime.getManifest().version;

ga("create", "##GAID##", "auto");
ga("set", "checkProtocolTask", null);
ga("set", "transport", "beacon");
ga("set", "dimension1", version);
ga("send", "pageview", "/");


////////////////////////////////////////////////////////////////////////////////
// Setup
////////////////////////////////////////////////////////////////////////////////
localStorage.sessions = localStorage.sessions || '{}';
localStorage.pinned = localStorage.pinned || "skip";
localStorage.open = localStorage.open || JSON.stringify({
	add: "click",
	replace: "shift+click",
	new: "ctrl/cmd+click",
	incognito: "alt+click",
});

if (localStorage.version === version) {
	if (localStorage.temp) {
		JSON.parse(localStorage.temp).forEach(function (v) {
			chrome.tabs.create({ url: v });
		});
		
		delete localStorage.temp;
		
		ga("send", "event", "Temp", "Restore");
	}
} else {
	localStorage.readchanges = false;
	localStorage.version = version;
}


////////////////////////////////////////////////////////////////////////////////
// Omnibox
////////////////////////////////////////////////////////////////////////////////
chrome.omnibox.onInputChanged.addListener(function (text, suggest) {
	var sessions = JSON.parse(localStorage.sessions);
	text = text.trim();
	var ltext = text.toLowerCase();
	var suggestions = [];
	var indexes = {};
	
	if (text.length) {
		chrome.omnibox.setDefaultSuggestion({
			description: "Open <match>" + text + "</match>" + (sessions[text] ? "" : " ...") + " in this window"
		});
		
		Object.keys(sessions).forEach(function (name) {
			var index = name.toLowerCase().indexOf(ltext);
			
			if (index !== -1) {
				var match = "<match>" + name.slice(index, index + text.length) + "</match>";
				
				suggestions.push({
					content: name,
					description: name.slice(0, index) + match + name.slice(index + text.length)
				});
				
				indexes[name] = index;
			}
		});
		
		suggestions.sort(function (a, b) {
			return indexes[a.content] === indexes[b.content]
				? (a.content.length === b.content.length ? 0 : a.content.length - b.content.length)
				: indexes[a.content] - indexes[b.content];
		});
		
		suggest(suggestions);
	} else {
		chrome.omnibox.setDefaultSuggestion({ description: "Open a session in this window" });
	}
});

chrome.omnibox.onInputEntered.addListener(function (name) {
	var sessions = JSON.parse(localStorage.sessions);
	
	if (sessions[name]) {
		openSession(undefined, sessions[name]);
		
		ga("send", "event", "Session", "Omnibox");
	}
});

chrome.omnibox.setDefaultSuggestion({ description: "Open a session in this window" });


////////////////////////////////////////////////////////////////////////////////
// Opening
////////////////////////////////////////////////////////////////////////////////
window.openSession = function (cwinId, urls, e, isTemp) {
	var open = JSON.parse(localStorage.open);
	var action = e ? (((e.ctrlKey || e.metaKey) && "ctrl/cmd+click") || (e.shiftKey && "shift+click") || (e.altKey && "alt+click") || "click") : open.add;
	
	for (var k in open) {
		if (action === open[k]) {
			action = k;
			break;
		}
	}
	
	if (action === "add") {
		urls.forEach(function (v) {
			chrome.tabs.create({ windowId: cwinId, url: v });
		});
	} else if (action === "replace") {
		chrome.tabs.getAllInWindow(cwinId, function (tabs) {
			openSession(cwinId, urls);
			
			if (localStorage.noreplacingpinned) {
				tabs = tabs.filter(function (t) { return !t.pinned; });
			}
			
			tabs.forEach(function (tab) {
				chrome.tabs.remove(tab.id);
			});
		});
	} else if (action === "new" || action === "incognito") {
		chrome.windows.create({ url: urls.shift(), incognito: action === "incognito" }, function (win) {
			openSession(win.id, urls);
		});
	} else {
		return false;
	}
	
	e && ga("send", "event", isTemp ? "Temp" : "Session", "Open", action);
};
