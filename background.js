// Show page action on Facebook.

// From 'https://chromium.googlesource.com/chromium/src/+/master/chrome/common/extensions/docs/examples/api/pageAction/pageaction_by_url/background.js'

// When the extension is installed or upgraded ...
chrome.runtime.onInstalled.addListener(function() {
	// Replace all rules ...
	chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
		// ... with a new rule ...
		chrome.declarativeContent.onPageChanged.addRules([
			{
				conditions: [
					new chrome.declarativeContent.PageStateMatcher({
						pageUrl: { hostContains: 'facebook.com' },
					})
				],
				// ... and show the extension's page action.
				actions: [
					new chrome.declarativeContent.ShowPageAction(),
					new chrome.declarativeContent.RequestContentScript({
						"css": [
							"faceblock.css"
						],
						"js": [
							"faceblock.js"
						]
					})
				]
			}
		]);
	});
});

// TODO Replace page action with browser action since this allows us to set a badge with a
//      count of how many ads were removed. Besides, the action icons look the same anyway.
// TODO Persist disabled state.
var disabled = false;
chrome.pageAction.onClicked.addListener(function (tab) {
	// Chrome appears to be buggy here; `chrome.pageAction.show/hide` don't work.
	// Seems to be linked with the use of declarative content.
	// Replacing with "disabled" icon instead.

	if (disabled) {
		chrome.pageAction.setIcon({
			tabId: tab.id,
			path: 'faceblock.png'
		});
		disabled = false;
		chrome.tabs.sendMessage(tab.id, 'enable');
	} else {
		chrome.pageAction.setIcon({
			tabId: tab.id,
			path: 'faceblock-disabled.png'
		});
		disabled = true;
		chrome.tabs.sendMessage(tab.id, 'disable');
	}
});
