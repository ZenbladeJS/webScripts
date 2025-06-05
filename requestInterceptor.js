let {log} = getApi('logger')
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
            
        },
        request: function(data) {
            
        },
        response: function(responseData) {
            
        }
    }
];

// --- XHR Default Override ---
const xhrDefaultOverride = {
    request: function() {
        log('[Default] Request:', this._interceptedUrl, this.decodedData);
    },
    response: function(responseData) {
        log('[Default] Response:', this._interceptedUrl, responseData);
    }
};

// --- Interceptor implementation ---
const originalOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method, urlStr, ...rest) {
    if (this[global.symbol]) {
        return originalOpen.call(this, ...arguments); // skip override
    }
    this._interceptedUrl = urlStr;
    return originalOpen.call(this, method, urlStr, ...rest);
};

const originalSend = XMLHttpRequest.prototype.send;
XMLHttpRequest.prototype.send = function(body) {
    if (this[global.symbol]) {
        return originalSend.call(this, ...arguments); // skip override
    }
    this.newBody = body;

    try {
        const url = new URL(this._interceptedUrl);
        const isUint8Array = body instanceof Uint8Array;
        let decodedData = null;

        if (isUint8Array) {
            const decoder = new TextDecoder('utf-8');
            const decoded = decoder.decode(body);
            decodedData = isJSON(decoded) ? JSON.parse(decoded) : decoded;
        }

        this.decodedData = decodedData;

        // --- Request hooks ---
        let requestMatched = false;
        const matchedOverrides = [];
        xhrOverrides.forEach((override) => {
            try {
                if (override.filter(url, decodedData)) {
                    matchedOverrides.push(override)
                    override.request.call(this, decodedData);
                    requestMatched = true;
                }
            } catch (err) {
                log('Error in request hook:', err);
            }
        });

        if (!requestMatched && xhrDefaultOverride && typeof xhrDefaultOverride.request === 'function') {
            try {
                xhrDefaultOverride.request.call(this);
            } catch (err) {
                log('Error in default request hook:', err);
            }
        }

        // --- Response hook ---
        this.addEventListener('readystatechange', function() {
            if (this.readyState === 4) {
                try {
                    const isArrayBuffer = this.response instanceof ArrayBuffer;
                    if (isArrayBuffer) {
                        let decodedData = null;

                        const decoder = new TextDecoder('utf-8');
                        const decoded = decoder.decode(this.response);
                        decodedData = isJSON(decoded) ? JSON.parse(decoded) : decoded;

                        this.decodedResponseData = decodedData?.data || decodedData || this.response;

                        matchedOverrides.forEach((override) => {
                            try {
                                override.response.call(this, this.decodedResponseData);
                            } catch (err) {
                                log('Error in response hook:', err);
                            }
                        });

                        if (!requestMatched && xhrDefaultOverride && typeof xhrDefaultOverride.response === 'function') {
                            try {
                                xhrDefaultOverride.response.call(this, this.decodedResponseData);
                            } catch (err) {
                                log('Error in default response hook:', err);
                            }
                        }
                    } else {
                        log('Reading this response may result in a catastrophic error, url: ' + this._interceptedUrl)
                    }
                } catch (err) {
                    log('Error reading response:', err);
                }
            }
        });
    } catch (err) {
        log('Error in interceptor:', err);
    }

    return originalSend.call(this, this.newBody);
};

global.createApi('requestInterceptor', _ => {
    return {
        addIntercept: (...intercepts) => {
            
            xhrOverrides.push(...intercepts)
        }
    }
})
log('Script loaded');