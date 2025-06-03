(function() {
    'use strict';
    window.hasPremium = false;
    const scriptName = 'Pocket Waifu Coin Script';
    window.unloggedMessages = window.unloggedMessages || [];
    let log = function(data, ...rest) {
        console.log('[' + scriptName + '] ' + data, rest);
        unloggedMessages.push([data, ...rest]);
    };
    if (window.zenLogger) log = window.zenLogger;
    // --- Helper Functions ---
    const isJSON = (string) => {
        try {
            JSON.parse(string)
            return true;
        } catch (e) {
            return false;
        }
    }

    // --- XHR Overrides ---
    const xhrOverrides = [
        {
            filter: function(url, data) {
                return url.hostname.endsWith('playfabapi.com')
                    && url.pathname.includes('/Client/ExecuteCloudScript')
                    && data && data.FunctionName === 'FinishMinigame';
            },
            request: function() {
                this.decodedData.FunctionParameter.Score = 3470;
                this.decodedData.FunctionParameter.Coins = 347;
                log('Modified FinishMinigame request:', this.decodedData);

                const encoder = new TextEncoder();
                this.newBody = encoder.encode(JSON.stringify(this.decodedData));
            },
            response: function(responseData) {
                log('FinishMinigame response:', responseData);
            }
        },
        {
            filter: function(url, data) {
                return url.hostname.endsWith('playfabapi.com')
                    && url.pathname.includes('/Client/LoginWithCustomID');
            },
            request: function() {
                log('Intercepted LoginWithCustomID:', this.decodedData);
            },
            response: function(responseData) {
                try {
                    window.hasPremium = !!JSON.parse(responseData.InfoResultPayload.UserReadOnlyData.Premium.Value).Data.length;
                    log('Checked for Premium:', window.hasPremium);
                } catch (err) {
                    log('Error parsing premium:', err);
                }
            }
        }
    ];

    // --- XHR Default Override ---
    const xhrDefaultOverride = {
        request: function() {
            log('[XHR Default] Request:', this._interceptedUrl, this.decodedData);
        },
        response: function(responseData) {
            log('[XHR Default] Response:', this._interceptedUrl, responseData);
        }
    };

    // --- Interceptor implementation ---
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype._skipIntercept = false;
    XMLHttpRequest.prototype.open = function(method, urlStr, ...rest) {
        if (this._skipIntercept) return originalOpen.call(this, ...arguments); // skip override
        this._interceptedUrl = urlStr;
        return originalOpen.call(this, method, urlStr, ...rest);
    };

    const originalSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function(body) {
        if (this._skipIntercept) return originalSend.call(this, ...arguments); // skip override
        this.newBody = body;

        try {
            const url = new URL(this._interceptedUrl);
            const isUint8Array = body instanceof Uint8Array;
            let decodedData = null;

            if (isUint8Array) {
                const decoder = new TextDecoder('utf-8');
                const decoded = decoder.decode(body);
                this.isJSON = isJSON(decoded)
                decodedData = this.isJSON ? JSON.parse(decoded) : decoded;
            }

            this.decodedData = decodedData;

            // --- Request hooks ---
            let requestMatched = false;
            xhrOverrides.forEach((override) => {
                try {
                    if (override.filter(url, decodedData)) {
                        override.request.call(this);
                        requestMatched = true;
                    }
                } catch (err) {
                    log('[XHR Interceptor] Error in request hook:', err);
                }
            });

            if (!requestMatched && xhrDefaultOverride && typeof xhrDefaultOverride.request === 'function') {
                try {
                    xhrDefaultOverride.request.call(this);
                } catch (err) {
                    log('[XHR Interceptor] Error in default request hook:', err);
                }
            }

            // --- Response hook ---
            this.addEventListener('readystatechange', function() {
                if (this.readyState === 4) {
                    try {
                        if (this.responseType === 'arraybuffer' && this.response instanceof ArrayBuffer) {
                            const uint8Array = new Uint8Array(this.response);
                            const decoder = new TextDecoder('utf-8');
                            const decodedText = decoder.decode(uint8Array);
                            const parsed = isJSON(decodedText) ? JSON.parse(decodedText) : decodedText;
                            const responseData = parsed.data?.FunctionResult || parsed.data || parsed;

                            let responseMatched = false;
                            xhrOverrides.forEach((override) => {
                                try {
                                    if (override.filter(url, this.decodedData)) {
                                        override.response.call(this, responseData);
                                        responseMatched = true;
                                    }
                                } catch (err) {
                                    log('[XHR Interceptor] Error in response hook:', err);
                                }
                            });

                            if (!responseMatched && xhrDefaultOverride && typeof xhrDefaultOverride.response === 'function') {
                                try {
                                    xhrDefaultOverride.response.call(this, responseData);
                                } catch (err) {
                                    log('[XHR Interceptor] Error in default response hook:', err);
                                }
                            }
                        }
                    } catch (err) {
                        log('[XHR Interceptor] Error reading response:', err);
                    }
                }
            });
        } catch (err) {
            log('[XHR Interceptor] Error in interceptor:', err);
        }

        return originalSend.call(this, this.newBody);
    };

    log('[Pocket Waifu XHR Interceptor] Script loaded');

    // --- Optional: fullscreen override ---
    const waitForGameInstanceFullscreen = function() {
        if (typeof gameInstance !== 'undefined' && typeof gameInstance.SetFullscreen === 'function') {
            log('Rewriting gameInstance.SetFullscreen');
            gameInstance.SetFullscreen = function(fullscreenFlag = 1) {
                log('My custom gameInstance.SetFullscreen:', fullscreenFlag);
                const canvasContainer = document.getElementById('gameContainer');
                if (fullscreenFlag) {
                    canvasContainer?.requestFullscreen().then(function() {
                        log('Entered fullscreen');
                    }).catch(function(err) {
                        log('Fullscreen request failed:', err);
                    });
                } else {
                    if (document.fullscreenElement) {
                        document.exitFullscreen().then(function() {
                            log('Exited fullscreen');
                        });
                    }
                }
            };
        } else {
            setTimeout(waitForGameInstanceFullscreen, 100);
        }
    };

    waitForGameInstanceFullscreen();
})();