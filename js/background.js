(function(localStorage){

var cversion = "3.0.0";

localStorage.sessions = localStorage.sessions || '{}';
localStorage.open = localStorage.open || '{"add":"click", "replace":"shift+click", "new":"ctrl/cmd+click", "incognito":"alt+click"}';

if (localStorage.version === cversion) {
	if ("temp" in localStorage) {
		JSON.parse(localStorage.temp).forEach(function(v){
			chrome.tabs.create({ url: v });
		});
	
		delete localStorage.temp;
	}
} else {
	localStorage.readchanges = false;
	
	if (localStorage.version === "2.7.1") {
		localStorage.v3backup = localStorage.sessions;

		var combos = ["click", "shift+click", "ctrl/cmd+click", "alt+click"], open = JSON.parse(localStorage.open);
		for (var k in open) {
			var i = combos.indexOf(open[k]);
			i !== -1 && combos.splice(i, 1);
		}
		open.incognito = combos[0] || "";
		localStorage.open = JSON.stringify(open);
	}
	
	localStorage.version = cversion;
}

})(localStorage);

function openSession(cwinId, urls, e) {
	var open = JSON.parse(localStorage.open),
		action = typeof e === "string" ? e : (((e.ctrlKey || e.metaKey) && "ctrl/cmd+click") || (e.shiftKey && "shift+click") || (e.altKey && "alt+click") || "click");
	
	if (action === open["add"]) {
		urls.forEach(function(v){
			chrome.tabs.create({ windowId: cwinId, url: v });
		});
	} else if (action === open["replace"]) {
		chrome.tabs.getAllInWindow(cwinId, function(tabs){
			openSession(cwinId, urls, open.add);
			tabs.forEach(function(tab){
				chrome.tabs.remove(tab.id);
			});
		});
	} else if (action === open["new"] || action === open["incognito"]) {
		chrome.windows.create({ url: urls.shift(), incognito: action === open["incognito"] }, function(win){
			openSession(win.id, urls, open.add);
		});
	}
}