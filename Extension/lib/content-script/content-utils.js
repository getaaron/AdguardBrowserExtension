/**
 * This file is part of Adguard Browser Extension (https://github.com/AdguardTeam/AdguardBrowserExtension).
 *
 * Adguard Browser Extension is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Adguard Browser Extension is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Adguard Browser Extension.  If not, see <http://www.gnu.org/licenses/>.
 */

/* global contentPage, HTMLDocument */

(function () {

    if (window !== window.top) {
        return;
    }

    if (!(document instanceof HTMLDocument)) {
        return;
    }

    /**
     * On extension startup contentPage is undefined
     */
    if (typeof contentPage === 'undefined') {
        return;
    }

    function htmlToElement(html) {
        var template = document.createElement('template');
        template.innerHTML = html;
        return template.content.firstChild;
    }

    /**
     * Shows alert popup.
     * Popup content is added right to the page content.
     *
     * @param message Message text
     */
    function showAlertPopup(message) {

        var messages = [];
        if (Array.isArray(message.text)) {
            messages = message.text;
        } else {
            messages = [message.text];
        }

        var text = '';
        for (var i = 0; i < messages.length; i++) {
            if (i > 0) {
                text += ', ';
            }
            text += messages[i];
        }

        var title = message.title;

        var alertDivHtml = '<div class="alert alert--active">' +
                                //'<div class="alert__close"></div>' +
                                '<div class="alert__in">' +
                                    '<div class="alert__ico"></div>' +
                                '<div>' +
                                    '<div class="subtitle-2">' +
                                        title +
                                    '</div>' +
                                    '<div class="alert__desc">' +
                                        text +
                                    '</div>' +
                                    '</div>' +
                                '</div>' +
                            '</div>';

        var triesCount = 10;

        var alertDiv = htmlToElement(alertDivHtml);

        function appendPopup(count) {
            if (count >= triesCount) {
                return;
            }
            if (document.body) {
                document.body.appendChild(alertDiv);
                setTimeout(function () {
                    if (alertDiv && alertDiv.parentNode) {
                        alertDiv.parentNode.removeChild(alertDiv);
                    }
                }, 4000);
            } else {
                setTimeout(function () {
                    appendPopup(count + 1);
                }, 500);
            }
        }

        appendPopup(0);
    }

    /**
     * Reload page without cache
     */
    function noCacheReload() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', document.location.href);
        xhr.setRequestHeader('Pragma', 'no-cache');
        xhr.setRequestHeader('Expires', '-1');
        xhr.setRequestHeader('Expires', 'no-cache');
        xhr.onload = xhr.onerror = xhr.onabort = xhr.ontimeout = function () {
            document.location.reload(true);
        };
        xhr.send(null);
    }

    contentPage.onMessage.addListener(function (message) {
        if (message.type === 'show-alert-popup') {
            showAlertPopup(message);
        } else if (message.type === 'no-cache-reload') {
            noCacheReload();
        } else if (message.type === 'update-tab-url') {
            window.location = message.url;
        }
    });

})();
