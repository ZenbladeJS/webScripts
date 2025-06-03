// ==UserScript==
// @name         Pocket Waifu Coin Hack
// @namespace    http://tampermonkey.net/
// @license      MIT
// @version      1.1.4
// @description  Please Enjoy! Also using this script may get you banned, I am working on mitigating that
// @author       ZenbladeJS
// @match        https://osapi.nutaku.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const developerMode = true;
    const useMutationObserver = true; // Switch between MutationObserver or setTimeout loop

    // Base URLs
    const DEV_BASE = 'http://127.0.0.1:5500/';
    const PROD_BASE = 'https://raw.githubusercontent.com/ZenbladeJS/webScripts/main/';
    
    // Global log
    let log = function(data, ...rest) {
        console.log('[Script Loader] ' + data, ...rest);
        unloggedMessages.push([data, ...rest]);
    };

    // Scripts to load
    const scriptsToLoad = [
        { name: 'ZenLog Script', file: 'console.js', onload: function() { log = window.zenLogger; } },
        { name: 'Pocket Waifu Coin Script', file: 'pocketWaifu.js' }
    ];

    // State
    let isBodyLoaded = !!document.body;
    window.unloggedMessages = window.unloggedMessages || [];
    let isScriptLoaded = {};

    // Eval one cached script
    const evalCachedScript = function(script) {
        const cachedScript = localStorage.getItem(script.name);
        if (isScriptLoaded[script.name]) return;
        if (!cachedScript) return log('[' + script.name + '] No cached script found to evaluate.');

        log('[' + script.name + '] Evaluating cached script...');
        try {
            eval(cachedScript);
            isScriptLoaded[script.name] = true;
            log('[' + script.name + '] Loaded!');
            if (typeof script.onload === 'function') {
                log('[' + script.name + '] Running onload callback...');
                script.onload();
            }
        } catch (e) {
            log('[' + script.name + '] Error evaluating cached script:', e);
        }
    };

    // Wait for body — MutationObserver version
    const waitForBodyWithObserver = function() {
        const observer = new MutationObserver(function(mutations, obs) {
            if (!document.body) return;
            isBodyLoaded = true;
            if (typeof createLogger === 'function') {
                createLogger();
            }
            obs.disconnect();
        });

        observer.observe(document.documentElement, { childList: true });
    };

    // Wait for body — setTimeout version
    const waitForBodyWithTimeout = function() {
        const checkBody = function() {
            if (document.body) {
                isBodyLoaded = true;
                if (typeof createLogger === 'function') {
                    createLogger();
                }
            } else {
                setTimeout(checkBody, 50);
            }
        };
        checkBody();
    };

    // Fetch one script
    const fetchScript = function(script) {
        const url = (developerMode ? DEV_BASE : PROD_BASE) + script.file;
        const xhr = new XMLHttpRequest();
        xhr._skipIntercept = true;
        xhr.open('GET', url, true);
        xhr.responseType = 'text';

        xhr.onload = function() {
            if (xhr.status !== 200) return log('[' + script.name + '] Failed to fetch script:', xhr.status, xhr.statusText);

            const newScript = xhr.responseText;
            const cachedScript = localStorage.getItem(script.name);

            if (cachedScript !== newScript) {
                localStorage.setItem(script.name, newScript);
                log('[' + script.name + '] Updated cached script.');

                // Reload page if body not yet loaded (forces fresh eval on next load)
                //if (!isBodyLoaded) {
                    log('[' + script.name + '] Reloading page to apply updated script.');
                    location.reload();
                //}
            }

            // If body is ready now, eval
            if (isBodyLoaded) {
                evalCachedScript(script);
            }
        };

        xhr.onerror = function() {
            log('[' + script.name + '] Error during script fetch.');
        };

        xhr.send();
    };

    // Kickoff
    log('Script Loader initializing...');
    scriptsToLoad.forEach(function(script) {
        evalCachedScript(script);
        fetchScript(script);
    });

    if (useMutationObserver) {
        log('Using MutationObserver to wait for body...');
        waitForBodyWithObserver();
    } else {
        log('Using setTimeout loop to wait for body...');
        waitForBodyWithTimeout();
    }

})();