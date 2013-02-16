/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Speak Words Preferences.
 *
 * The Initial Developer of the Original Code is The Mozilla Foundation.
 * Portions created by the Initial Developer are Copyright (C) 2011
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Edward Lee <edilee@mozilla.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

"use strict";

var branch;

/**
 * Get the preference for the preference named 'key'
 */
function prefValue(key) {
	if (PREF_ROOT == null || PREF_DEFAULTS == null) {
		return null;
	}

	// Cache the preference branch after first use
	if (branch == null) {
		branch = Services.prefs.getBranch(PREF_ROOT);
	}

	// Figure out what type of preference to fetch
	switch (typeof PREF_DEFAULTS[key]) {
	case "boolean":
		return branch.getBoolPref(key);
	case "number":
		return branch.getIntPref(key);
	case "string":
		return branch.getCharPref(key);
	default:
		return null;
	}
}

/**
 * Initialize default values of preferences
 */
function initDefaultPrefs(prefRoot, prefValues, allowSyncing) {
	if (prefRoot == null) {
		if (PREF_ROOT == null)
			return;
		prefRoot = PREF_ROOT;
	}

	if (prefValues == null) {
		if (PREF_DEFAULTS == null)
			return;
		prefValues = PREF_DEFAULTS;
	}

	allowSyncing = allowSyncing || false;

	var defaultBranch = Services.prefs.getDefaultBranch(prefRoot);
	var syncBranch = Services.prefs
			.getDefaultBranch("services.sync.prefs.sync." + prefRoot);
	for (let[key, val] in Iterator(prefValues)) {
		switch (typeof val) {
		case "boolean":
			defaultBranch.setBoolPref(key, val);
			break;
		case "number":
			defaultBranch.setIntPref(key, val);
			break;
		case "string":
			defaultBranch.setCharPref(key, val);
			break;
		}

		if (allowSyncing == true && key.indexOf("loggingEnabled") == -1) {
			syncBranch.setBoolPref(key, true);
		}
	}
}

/**
 * Add a callback to watch for certain preferences changing
 */
function prefObserve(prefs, callback) {
	if (PREF_ROOT == null) {
		return null;
	}

	function observe(subject, topic, data) {
		// Sanity check that we have the right notification
		if (topic !== "nsPref:changed")
			return;

		// Only care about the preferences provided
		var pref = data.slice(PREF_ROOT.length);
		if (prefs.indexOf(pref) === -1)
			return;

		// Trigger the callback with the changed key
		callback(pref);
	}

	// Watch for preference changes under the root and clean up when necessary
	Services.prefs.addObserver(PREF_ROOT, observe, false);
	unload(function() {
		Services.prefs.removeObserver(PREF_ROOT, observe);
	});
};
