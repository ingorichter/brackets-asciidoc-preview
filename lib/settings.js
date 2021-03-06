/*
 * Copyright (c) 2014 Thomas Kern
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

/*global define, brackets, window, $ */

/** @Module settings */

define(function (require, exports) {
    "use strict";

    var PopUpManager = brackets.getModule("widgets/PopUpManager"),
        FileSystem = brackets.getModule("filesystem/FileSystem"),
        Strings = brackets.getModule("strings"),
        settingsHTML = require("text!templates/settings.html"),
        utils = require("lib/utils"),
        warningHTML = require("text!templates/warning.html"),
        $settings,
        $settingsToggle,
        $warning,
        preferences,
        updateCallback,
        docDir;


    /**********************************************
     * The settings panel
     */
    
    function documentClicked(e) {
        if (!$settings.is(e.target) &&
            !$settingsToggle.is(e.target) &&
            $settings.has(e.target).length === 0) {
            hideSettings();
        }
    }

    function setDocDir(dir) {
        docDir = utils.normalizePath(dir);
    }
    
    /**
     * Hide the settings panel
     */
    
    function hideSettings() {
        if ($settings) { 
            $settings.remove();
            $settings = null;
            $(window.document).off("mousedown", documentClicked);
        }
    }
    
    /**
     * Create the settings panel
     */
    
    function createSettings($panel, prefs, updateCb) {
        
        preferences = prefs;
        updateCallback = updateCb;
        
        function setImagesDir(path) {    
            var baseDirPrefs = prefs.get("basedir");
            var $input = $settings.find("#asciidoc-preview-imagesdir");
            if ((baseDirPrefs === '' && utils.pathEqual(path, docDir)) || utils.pathEqual(path, baseDirPrefs)) {
                $input.css({ color: "lightgrey"  });
                prefs.set("imagesdir", '');
            } else {
                $input.css({ color: "black"  });
                prefs.set("imagesdir", path);
            }
            $input.val(path);
        }
        
        function setBaseDir(path) {     
            var imagesDirPrefs = prefs.get("imagesdir");
            var $input = $settings.find("#asciidoc-preview-basedir");
            if (utils.pathEqual(path, docDir)) {
                $input.css({ color: "lightgrey"  });
                prefs.set("basedir", '');
            } else {
                $input.css({ color: "black"  });
                prefs.set("basedir", path);
            }
            $input.val(path);
            if (!imagesDirPrefs) {
                setImagesDir(path);
            }
        }
    
        
        function selectFolder(prefName) {          
            var startingFolder = prefs.get(prefName) || docDir;
            FileSystem.showOpenDialog(false, true, Strings.CHOOSE_FOLDER, startingFolder, null, function (err, files) {
                        if (!err) {
                            // If length == 0, user canceled the dialog; length should never be > 1
                            if (files.length > 0) {
                                var path = utils.normalizePath(files[0]);
                                if (prefName == "basedir") {
                                    setBaseDir(path);
                                } else {
                                    setImagesDir(path);
                                }
                                updateCallback();
                            } 
                        } 
                    });
        }

        function showSettings() {
                
            hideWarning();
            hideSettings();
            
            $settings = $(settingsHTML)
                .css({
                    right: 12,
                    top: $settingsToggle.position().top + $settingsToggle.outerHeight() + 12
                })
                .appendTo($panel);
            
            setBaseDir(prefs.get("basedir") || docDir);
            setImagesDir(prefs.get("imagesdir") || prefs.get("basedir") || docDir);
            
            var $imagesDirInput = $settings.find("#asciidoc-preview-imagesdir"),
                $baseDirInput = $settings.find("#asciidoc-preview-basedir");
            
            $settings.find("#asciidoc-preview-showtitle")
                .prop("checked", prefs.get("showtitle") || true)
                .change(function (e) {
                    prefs.set("showtitle", e.target.checked);
                    updateCallback();
                });

            $settings.find("#asciidoc-preview-numbered")
                .prop("checked", prefs.get("numbered"))
                .change(function (e) {
                    prefs.set("numbered", e.target.checked);
                    updateCallback();
                });

            $settings.find("#asciidoc-preview-mjax")
                .prop("checked", prefs.get("mjax"))
                .change(function (e) {
                    prefs.set("mjax", e.target.checked);
                    updateCallback();
                });

            $settings.find("#asciidoc-autosync")
                .prop("checked", prefs.get("autosync"))
                .change(function (e) {
                    prefs.set("autosync", e.target.checked);
                    updateCallback();
                });

            $settings.find("#asciidoc-update-save")
                .prop("checked", prefs.get("updatesave"))
                .change(function (e) {
                    prefs.set("updatesave", e.target.checked);
                    updateCallback();
                });

            $settings.find("#asciidoc-preview-theme")
                .val(prefs.get("theme"))
                .change(function (e) {
                    prefs.set("theme", e.target.value);
                    updateCallback();
                });

            $settings.find("#asciidoc-preview-safemode")
                .val(prefs.get("safemode"))
                .change(function (e) {
                    prefs.set("safemode", e.target.value);
                    updateCallback();
                });

            $settings.find("#asciidoc-preview-doctype")
                .val(prefs.get("doctype"))
                .change(function (e) {
                    prefs.set("doctype", e.target.value);
                    updateCallback();
                });

            $baseDirInput.change(function (e) {
                    var path = utils.normalizePath(e.target.value);
                    setBaseDir(path);
                    updateCallback();
                });
            
            $imagesDirInput.change(function (e) {
                    var path = utils.normalizePath(e.target.value);
                    setImagesDir(path);
                    updateCallback();
                });
            
            $settings.find("#asciidoc-browse-basedir-button")
                .click(function (e) {
                    e.preventDefault();
                    selectFolder("basedir");
                });
        
            $settings.find("#asciidoc-browse-imagesdir-button")
                .click(function (e) {
                   e.preventDefault();
                   selectFolder("imagesdir"); 
                });
            
            $settings.find("#asciidoc-clear-basedir-button")
                .click(function (e) {
                    e.preventDefault();
                    setBaseDir(docDir);
                    updateCallback();
                });
        
            $settings.find("#asciidoc-clear-imagesdir-button")
                .click(function (e) {
                   e.preventDefault();
                   setImagesDir(prefs.get("basedir") || docDir);
                   updateCallback();
                });
            
            PopUpManager.addPopUp($settings, hideSettings, true);
            $(window.document).on("mousedown", documentClicked);
        }

        if (!$settingsToggle) {
            $settingsToggle = $("#asciidoc-settings-toggle")
                .click(function (e) {
                    if ($settings) {
                        hideSettings();
                    } else {
                        showSettings(e);
                    }
                });
        }  
    }
    
    /**********************************************
     * The warning panel
     */
    
    /**
     * Hide the warning panel
     */
    
    function hideWarning() {
        if ($warning) {
            $warning.remove();
            $warning = null;
        }
    }
    
    /**
     * Show the warning panel
     */
    
    function showWarning($panel) {  
        
        // do not show warning if settings panel is open
        if ($settings) { 
            return;
        }
        
        hideWarning();
        $warning = $(warningHTML);
            $warning.css({
                    right: 12,
                    top: $settingsToggle.position().top + $settingsToggle.outerHeight() + 12
                }).appendTo($panel);
        
        $warning.find("#asciidoc-keep-button")
                .click(function (e) {
                   e.preventDefault();
                   hideWarning();
                });
            
        $warning.find("#asciidoc-reset-button")
                .click(function (e) {
                    e.preventDefault();
                    hideWarning();
                    preferences.set("basedir", '');
                    preferences.set("imagesdir", '');
                    updateCallback();
                });
        PopUpManager.addPopUp($warning, hideWarning, true);
    }
    
    /**********************************************
     * Exports
     */
    
    exports.hideWarning = hideWarning;
    exports.showWarning = showWarning;
    
    exports.hide = hideSettings;
    exports.setDocDir = setDocDir;
    exports.create = createSettings;
});
