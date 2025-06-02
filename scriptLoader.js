// ==UserScript==
// @name         Pocket Waifu Coin Hack
// @namespace    http://tampermonkey.net/
// @license      MIT
// @version      1.0.1
// @description  Please Enjoy!
// @author       ZenbladeJS
// @match        https://osapi.nutaku.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    const developerMode = true;
    const scriptUrl = developerMode ? 
        'http://127.0.0.1:5500/pocketWaifu.js' :
        'https://raw.githubusercontent.com/ZenbladeJS/webScripts/main/pocketWaifu.js';
    const scriptName = 'Pocket Waifu Coin Script'
    let isBodyLoaded = !!document.body;
    const log = (data) => {
        console.log('[' + scriptName + '] ' + data, ...[...arguments].slice(1))
    }
    let isScriptLoaded = false;
    
    const evalCachedScript = () => {
        const cachedScript = localStorage.getItem(scriptName);
        if (isScriptLoaded) return;
        if (!cachedScript) return log('No cached script found to evaluate.')
        
        log('Evaluating cached script...');
        try {
            
            eval(cachedScript);
            isScriptLoaded = true;
        } catch (e) {
            log('Error evaluating cached script:', e);
        }
    }
    const waitForBody = () => {
        const observer = new MutationObserver((mutations, obs) => {
            if (!document.body) return;
            isBodyLoaded = true;
            obs.disconnect();
        });
    
        observer.observe(document.documentElement, { childList: true });
    }
    const fetchScript = () => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', scriptUrl, true);
        xhr.responseType = 'text';

        xhr.onload = function() {
            if (xhr.status !== 200) return log('Failed to fetch script:', xhr.status, xhr.statusText);
        
            const newScript = xhr.responseText;
            const cachedScript = localStorage.getItem(scriptName);

            // If cached script is missing or different, update it
            if (cachedScript !== newScript) {
                localStorage.setItem(scriptName, newScript);

                // If body already loaded OR user had old script, reload page to run fresh
                if (!isBodyLoaded) return location.reload()
            }

            // If body is ready now, run it
            if (isScriptLoaded) evalCachedScript();
        };

        xhr.onerror = function() {
            log('Error during script fetch.');
        };

        xhr.send();
    }

    // Kickoff
    log('Script Loader initializing...');
    evalCachedScript();
    fetchScript();
    waitForBody();

})();