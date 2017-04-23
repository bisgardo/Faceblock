/* FACEBOOK ELEMENTS LOOKUP */
function findFeed() {
	return document.getElementById('stream_pagelet');
}

function findElementPosts(element) {
	return element.querySelectorAll('[data-testid=fbfeed_story]');
}

/* DETECT IF POST IS AD */
function isAd(post) {
	var as = post.getElementsByTagName('a');
	var result = Array.prototype.some.call(as, function (a) {
		return a.textContent === 'Sponsored';
	});
	console.debug('Post', post, 'is an ad:', result);
	return result;
}

/* IMPLEMENTATION */
var CSS_ENABLED = '__faceblock-enabled';
var CSS_AD = '__faceblock-ad';

var feed = findFeed();
console.debug('Resolved feed element:', feed);

// Remove initially loaded sponsored posts.
removeAds(feed);

function setFaceblockEnabled(enabled) {
	if (enabled) {
		console.debug('enabling');
		feed.classList.add(CSS_ENABLED);
	} else {
		console.debug('disabling');
		feed.classList.remove(CSS_ENABLED);
	}
}

// Enable ad removal.
setFaceblockEnabled(true);

chrome.runtime.onMessage.addListener(function (msg) {
	switch (msg) {
		case 'enable':
			return setFaceblockEnabled(true);
		case 'disable':
			return setFaceblockEnabled(false);
	}

	console.debug('Ignoring unkown message:', msg);
});

// Observe mutations to news feed to clean injected posts.
var observer = new MutationObserver(function (mutations) {
	console.debug('Received mutations:', mutations);
	mutations.forEach(function (mutation) {
		removeAds(mutation.target.parentElement);
	});
});
observer.observe(feed, {
	childList: true,
	subtree: true
});

// TODO Might be more robust to listen to when links with the text "Sponsored" are being added to,
//      some target and then remove any ancestor element that represents a post.

// TODO Generalize to post type resolution, where sponsored content is only one type.
//      The script tags posts with their types.
//      The extension then allows the user to determine how posts of different tags are rendered.
//      It works by registering a (composite) handler function that is called for every mutation.
//      The function is then responsible of performing any tagging.
//      After tagging, it should probably invoke a callback with the tagged element to ensure that
//      it's rendered correctly.
//      But if the rendering is defined using CSS rules on the tag, this isn't necessary.

function removeAds(element) {
	console.debug('Removing ads on element:', element);
	var posts = findElementPosts(element);
	console.debug('Resolving ads for posts:', posts);
	
	// Filter out posts that are ads, but not previously handled.
	var ads = Array.prototype.filter.call(posts, function (post) {
		if (post.classList.contains(CSS_AD)) {
			console.debug('Skipping already ad-marked post:', post);
			return false;
		}
		// Cannot "remember" that post was acquitted (i.e. wasn't CSS tagged) because we may
		// call it before it's fully rendered, and therefore correctly needs several runs.
		return isAd(post);
	});
	ads.forEach(handleAd);
}

function handleAd(ad) {
	console.debug('Ad-marking post:', ad);
	ad.classList.add(CSS_AD);
}
