window.hasPremium = false;
let {log} = getApi('logger')
let {addIntercept} = getApi('requestInterceptor')
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
let hasPremium = true;
const requestOverrides = [
    {
        filter: function(url, data) {
            return url.hostname.endsWith('playfabapi.com')
                && url.pathname.includes('/Client/ExecuteCloudScript')
                && data && data.FunctionName === 'FinishMinigame';
        },
        request: function(data) {
            data.FunctionParameter.Score = hasPremium ? 3470 : 430;
            data.FunctionParameter.Coins = hasPremium ? 347 : 430;
            log('Modified FinishMinigame request:', this.decodedData);

            const encoder = new TextEncoder();
            this.newBody = encoder.encode(JSON.stringify(this.decodedData));
        },
        response: function(responseData) {
            log('FinishMinigame response:', responseData);
            hasPremium = responseData.FunctionResult.HadPremium;
            log('Had Premium: ' + hasPremium)
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
                //hasPremium = !!JSON.parse(responseData.InfoResultPayload.UserReadOnlyData.Premium.Value).Data.length;
                log('Login Check for Premium: ' + !!JSON.parse(responseData.InfoResultPayload.UserReadOnlyData.Premium.Value).Data.length);
                log(responseData)
            } catch (err) {
                log('Error parsing premium:', err);
            }
        }
    }
];
addIntercept(...requestOverrides)

log('Script loaded');

// --- Fullscreen Override ---
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