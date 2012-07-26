/* ***** BEGIN LICENSE BLOCK *****
 * Version: MIT/X11 License
 *
 * Copyright (c) 2012 Siddhartha Dugar
 *
 * Permission is hereby granted, free of charge, to any person obtaining copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * This code was originally written for the addon "Better URL Bar"
 *
 * Contributor:
 *   Siddhartha Dugar <dugar.siddhartha@gmail.com> (Creator)
 *
 * ***** END LICENSE BLOCK ***** */

"use strict";
Cu.import("resource://gre/modules/AddonManager.jsm");

var sss = Cc['@mozilla.org/content/style-sheet-service;1']
		.getService(Ci.nsIStyleSheetService);
var ios = Cc['@mozilla.org/network/io-service;1'].getService(Ci.nsIIOService);

var ADDON_NAME = "default"; // Use default as name if name was not initialized

function initAddonNameAsync(data) {
	AddonManager.getAddonByID(data.id, function(addon) {
		ADDON_NAME = addon.name;
		printToLog("ADDON_NAME initialized.");
	});
}

/*
 * Prints message in the Error Console if logging is enabled for this Add-on or
 * forced otherwise.
 */
function printToLog(message, forceEnable) {
	if (forceEnable || pref("loggingEnabled")) {
		Services.console.logStringMessage(ADDON_NAME + ": " + message);
	}
}

function getURIForFile(filepath) {
	return ios.newURI(__SCRIPT_URI_SPEC__.replace("bootstrap.js", filepath),
			null, null);
}

function loadSheet(filepath) {
	var uri = getURIForFile(filepath);
	if (!sss.sheetRegistered(uri, sss.USER_SHEET)) {
		sss.loadAndRegisterSheet(uri, sss.USER_SHEET);
		printToLog("Loaded " + filepath);
	}
}

function unloadSheet(filepath) {
	var uri = getURIForFile(filepath);
	if (sss.sheetRegistered(uri, sss.USER_SHEET)) {
		sss.unregisterSheet(uri, sss.USER_SHEET);
		printToLog("Unloaded " + filepath);
	}
}

/*
 * Loads fileName if prefName is enabled and remembers to unload. Adds an
 * observer to load/unload fileName when prefName is changed.
 */
function loadAndObserve(prefName, fileName) {
	if (pref(prefName)) {
		loadSheet(fileName);
	}

	pref.observe([ prefName ], function() {
		pref(prefName) ? loadSheet(fileName) : unloadSheet(fileName);
	});

	unload(function() {
		unloadSheet(fileName);
	});
}
