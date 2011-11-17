"use strict";
(function(chrome, localStorage){

/*** setup ***/
var cversion = "3.3.0";

localStorage.sessions = localStorage.sessions || '{}';
localStorage.open = localStorage.open || '{"add":"click", "replace":"shift+click", "new":"ctrl/cmd+click", "incognito":"alt+click"}';
localStorage.pinned = "skip";

if (localStorage.version === cversion) {
	if ("temp" in localStorage) {
		JSON.parse(localStorage.temp).forEach(function(v){
			chrome.tabs.create({ url: v });
		});
	
		delete localStorage.temp;
	}
} else {
	localStorage.readchanges = false;
	localStorage.version = cversion;
}


/*** omnibox ***/
function defaultSuggestion() {
	chrome.omnibox.setDefaultSuggestion({ description: "Open a session in this window" });
}

defaultSuggestion();

chrome.omnibox.onInputChanged.addListener(function(text, suggest){
	var sessions = JSON.parse(localStorage.sessions), text = text.trim(), ltext = text.toLowerCase(), suggestions = [];
	
	if (text.length) {
		chrome.omnibox.setDefaultSuggestion({
			description: "Open <match>" + text + "</match>" + (sessions[text] ? "" : " ...") + " in this window"
		});
		
		Object.keys(sessions).forEach(function(name){
			var index = name.toLowerCase().indexOf(ltext);
			
			index !== -1 && suggestions.push({
				content: name,
				description: name.substring(0, index) + "<match>" + name.substr(index, text.length) + "</match>" + name.substr(index + text.length),
				index: index
			});
		});
		
		suggest(suggestions.sort(function(a, b){
			return a.index === b.index ? (a.content.length === b.content.length ? 0 : a.content.length - b.content.length) : a.index - b.index;
		}));
	} else {
		defaultSuggestion();
	}
});

chrome.omnibox.onInputEntered.addListener(function(name){
	var sessions = JSON.parse(localStorage.sessions);
	
	sessions[name] && chrome.windows.getCurrent(function(win){
		chrome.tabs.getSelected(win.id, function(tab){
			openSession(win.id, sessions[name]);
			
			chrome.tabs.remove(tab.id);
		});
	});
});


/*** open ***/
window.openSession = function(cwinId, urls, e, isTemp){
	var open = JSON.parse(localStorage.open),
		action = e == null ? open["add"] : (((e.ctrlKey || e.metaKey) && "ctrl/cmd+click") || (e.shiftKey && "shift+click") || (e.altKey && "alt+click") || "click");
	
	for (var k in open) {
		if (action === open[k]) {
			action = k;
			break;
		}
	}
	
	if (action === "add") {
		urls.forEach(function(v){
			chrome.tabs.create({ windowId: cwinId, url: v });
		});
	} else if (action === "replace") {
		chrome.tabs.getAllInWindow(cwinId, function(tabs){
			openSession(cwinId, urls);
			
			if (localStorage.noreplacingpinned) {
				tabs = tabs.filter(function(t){ return !t.pinned; });
			}
			
			tabs.forEach(function(tab){
				chrome.tabs.remove(tab.id);
			});
		});
	} else if (action === "new" || action === "incognito") {
		chrome.windows.create({ url: urls.shift(), incognito: action === "incognito" }, function(win){
			openSession(win.id, urls);
		});
	}
	
	e && _gaq.push(["_trackEvent", isTemp ? "Temp" : "Session", "Open", action]);
};

})(chrome, localStorage);