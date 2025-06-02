//This is the path to check if user has premium probably
//data.InfoResultPayload.UserReadOnlyData.Premium.Value
(function() {
    'use strict';
    window.hasPremium = false;
    const scriptName = "Pocket Waifu Coin Script"
    const log = (data) => {
        console.log('[' + scriptName + '] ' + data, ...[...arguments].slice(1))
    }
    log('[Pocket Waifu XHR Interceptor] Script loaded');

    // Intercept open to log URL + method
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, ...rest) {
        this._interceptedUrl = url;  // Save URL for use in send
        return originalOpen.call(this, method, url, ...rest);
    };
    
    // Intercept send to log/modify body
    const originalSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function(body) {
        let newBody = body
        try {
            const url = new URL(this._interceptedUrl);
    
            // Check domain contains "playfabapi.com"
            const isPlayFabApi = url.hostname.endsWith('playfabapi.com');
    
            // Check path contains "Client/ExecuteCloudScript"
            const isExecutePath = url.pathname.includes('/Client/ExecuteCloudScript');
    
            const isLoginPath = url.pathname.includes('/Client/LoginWithCustomID')
    
            // Check body is Uint8Array
            const isUint8Array = body instanceof Uint8Array;
    
            if (isPlayFabApi && (isExecutePath || isLoginPath) && isUint8Array) {
                const decoder = new TextDecoder('utf-8');
                const decoded = decoder.decode(body);
                const data = JSON.parse(decoded)
                if (data.FunctionName === 'CompleteTutorial') {
                    window.hasPremium = true;
                }
                //log(`Data Intercepted!`, data);
                if (data.FunctionName === 'FinishMinigame') {
                    data.FunctionParameter.Score = 3470//window.hasPremium ? 3470 : 4300
                    data.FunctionParameter.Coins = 347//window.hasPremium ? 347 : 430
                    const encoder = new TextEncoder()
    
                    newBody = encoder.encode(JSON.stringify(data))
                }
                this.addEventListener('readystatechange', function() {
                    if (this.readyState === 4) {
                        log('[PlayFab Interceptor] Intecepted data:', data)
                        try {
                            const contentType = this.getResponseHeader('Content-Type') || '';
    
                            if (this.responseType === 'arraybuffer' && this.response instanceof ArrayBuffer) {
                                const uint8Array = new Uint8Array(this.response);
                                const decoder = new TextDecoder('utf-8');
                                const decodedText = decoder.decode(uint8Array);
                                const responseData = isLoginPath ? JSON.parse(decodedText).data : JSON.parse(decodedText).data.FunctionResult;
                                if (isLoginPath) {
                                    window.hasPremium = !!JSON.parse(responseData.InfoResultPayload.UserReadOnlyData.Premium.Value).Data.length
                                    log('Checked for Premium')
                                    if (window.hasPremium) log('Has Premium!!!')
                                }
                                log('[PlayFab Interceptor] Response Intercepted', responseData);
                            }
    
                        } catch (err) {
                            console.error('[PlayFab Interceptor] Error reading response:', err);
                        }
                    }
                });
            }
    
        } catch (err) {
            console.error('[PlayFab Interceptor] Error in interceptor:', err);
        }
    
        return originalSend.call(this, newBody);
    };
    
})();