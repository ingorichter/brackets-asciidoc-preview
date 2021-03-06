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

/*global define */

define(function (require, exports) {
    "use strict";

    // Check if message contains a line number and convert
    // to special #goto_ fragment identifier
    function asUrl(message) {
        var matches = message.match(/\s[0-9]+:\s/);
        if (matches && matches.length > 0) {
            var linenum = matches[0].match(/[0-9]+/);
            return '<a href="#goto_' + linenum + '">' + message + '</a>';
        } else {
            return message;
        }
    }
    
    function mathJax() {   
        return '<script type="text/x-mathjax-config">' +
        'MathJax.Hub.Config({' +
            '  imageFont: null,' +
            '  tex2jax: {' +
            '    inlineMath: [["\\\\(", "\\\\)"]],' +
            '    displayMath: [["\\\\[", "\\\\]"]],' +
            '    ignoreClass: "nostem|nostem|nolatexmath"' +
            '  },' +
            '  asciimath2jax: {' +
            '    delimiters: [["\\\\$", "\\\\$"]],' +
            '    ignoreClass: "nostem|nostem|noasciimath"' +
            '  }' +
            '});' +
         '</script>' +
         '<script type="text/javascript" ' +
             'src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.4.0/MathJax.js?config=TeX-MML-AM_HTMLorMML">' +
         '</script>';
    }

    /*
    function formatOutline(sectionInfo, scrollPos, prefs) {
        for (var i = 0; i < sectionInfo.length; i++) {
            console.log(sectionInfo[i].id + " " + sectionInfo[i].level + " " + sectionInfo[i].title + " (" + sectionInfo[i].lineno + ") ");
            for (var j = 0; j < sectionInfo[i].blockInfo.length; j++) {
                console.log("    block at " + sectionInfo[i].blockInfo[j].lineno);
            }
        }
    }
    */

    /**
     * Create a HTML document from the data returned by the web worker.
     * @param   {Object}   data      converted data returned from web worker
     * @param   {[[Type]]} baseUrl   base URL to be used in HTML
     * @param   {String}   scrollPos offset from top of page
     * @param   {Object}   prefs     user preferences
     * @returns {String}   HTML document
     */
    exports.createPage = function (data, baseUrl, scrollPos, prefs) {         
        var messages = data.messages;
        // Show URL in link tooltip
        var bodyText = data.html.replace(/(href=\"([^\"]*)\")/g, "$1 title=\"$2\"");
        // Assemble the HTML source
        var htmlSource = '<html><head>';
        htmlSource += '<base href="' + baseUrl + '">';
        htmlSource += '<link href="' + require.toUrl("../themes/" + prefs.get("theme") + ".css") + '" rel="stylesheet"></link>';
        htmlSource += '<link href="' + require.toUrl("../styles/console.css") + '" rel="stylesheet"></link>';
        htmlSource += '<link href="' + require.toUrl("../styles/font-awesome/css/font-awesome.min.css") + '" rel="stylesheet"></link>';
        htmlSource += '<link href="' + require.toUrl("../styles/highlightjs/styles/default.min.css") + '" rel="stylesheet"></link>';
        htmlSource += '<style type="text/css">#header, #content, #footnotes { max-width: 100%; padding-left: 50px; padding-right: 50px; }</style>';
        
        htmlSource += '</head><body class="' + prefs.get("doctype") + '" onload="document.body.scrollTop=' + scrollPos + '"><div id="content">';
        htmlSource += bodyText + "</div>";

        if (messages.length) {
            htmlSource += '<div id="asciidoc-preview-console"><pre id="asciidoc-console-box">';
            messages.forEach(function (msg) {
                msg = asUrl(msg);
                htmlSource += msg + "<p/>";
            });
            htmlSource += "</pre></div>";
        }
        htmlSource += '<script src="' + require.toUrl("../styles/highlightjs/highlight.min.js") + '"></script>';
        htmlSource += '<script>hljs.initHighlighting();</script>';
        if (data.stem && prefs.get("mjax")) {
            htmlSource += mathJax();
        }
        htmlSource += "</body></html>";
        return htmlSource;
    };   
});
