// Create the log box container
window.unloggedMessages = window.unloggedMessages || [];
window.zenLogger = (...args) => {
    unloggedMessages.push([...args])
};
const createLogger = () => {
    const loggedMessages = []
    let logContainer = document.getElementById('zen-log-container') || document.createElement('div');
    
    logContainer.id = 'zen-log-container';
    const updateLoggerPosition = () => {
        const viewport = window.visualViewport;
        logContainer.style.top = `${viewport.offsetTop + 10}px`;
        logContainer.style.left = `${viewport.offsetLeft + viewport.width - logContainer.offsetWidth - 50}px`;
        requestAnimationFrame(updateLoggerPosition);
    };
    
    logContainer.style.position = 'fixed';
    logContainer.style.margin = '0';
    logContainer.style.padding = '5px 10px 25px 10px';
    logContainer.style.boxSizing = 'border-box';
    logContainer.style.transform = 'translateZ(0)';
    
    requestAnimationFrame(updateLoggerPosition);
    logContainer.style.transform = 'translateZ(0)';
    logContainer.style.width = '300px';
    logContainer.style.maxHeight = '400px';
    logContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    logContainer.style.color = '#00ff00';
    logContainer.style.fontFamily = 'monospace';
    logContainer.style.fontSize = '12px';
    logContainer.style.padding = '5px 10px 25px 10px';
    logContainer.style.borderRadius = '8px';
    logContainer.style.zIndex = '99999';
    logContainer.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
    logContainer.style.transition = 'height 0.2s, width 0.2s, opacity 0.2s';

    // Create the toggle button
    const toggleButton = document.getElementById('zen-log-toggle-button') || document.createElement('div');
    toggleButton.id = 'zen-log-toggle-button'
    toggleButton.style.position = 'absolute';
    toggleButton.style.top = '24px';
    toggleButton.style.right = '0px';
    toggleButton.style.textAlign = 'center'
    toggleButton.style.transform = 'translate(-50%, -50%)';
    toggleButton.style.cursor = 'pointer';
    toggleButton.style.fontSize = '48px';
    toggleButton.style.color = '#ffffff';
    toggleButton.style.userSelect = 'none';
    toggleButton.textContent = '-';
    logContainer.appendChild(toggleButton);

    // Create the download button
    const downloadButton = document.getElementById('zen-log-download-button') || document.createElement('div');
    downloadButton.id = 'zen-log-download-button';
    downloadButton.style.position = 'absolute';
    downloadButton.style.bottom = '24px';
    downloadButton.style.right = '0px';
    downloadButton.style.textAlign = 'center'
    downloadButton.style.transform = 'translate(-50%, -50%)';
    downloadButton.style.cursor = 'pointer';
    downloadButton.style.fontSize = '48px';
    downloadButton.style.color = '#ffffff';
    downloadButton.style.userSelect = 'none';
    downloadButton.textContent = '↓';
    logContainer.appendChild(downloadButton);

    // Create the inner log content
    const logContent = document.getElementById('zen-log-content') || document.createElement('div');
    logContent.id = 'zen-log-content';
    logContent.style.overflowY = 'auto';
    logContent.style.maxHeight = '350px';
    logContent.style.marginTop = '20px'; // leave space for toggle button
    logContainer.appendChild(logContent);

    // Append everything to body
    document.addEventListener('fullscreenchange', () => {
        if (document.fullscreenElement) {
            document.fullscreenElement.appendChild(logContainer);
        } else {
            document.body.appendChild(logContainer);
        }
    });

    // State for minimized/maximized
    window.zenLogIsMinimized = false;

    toggleButton.addEventListener('click', () => {
        window.zenLogIsMinimized = !window.zenLogIsMinimized;
        if (window.zenLogIsMinimized) {
            // Hide content and shrink box
            logContent.style.display = 'none';
            downloadButton.style.display = 'none'
            logContainer.style.width = '50px';
            logContainer.style.height = '50px';
            logContainer.style.opacity = '0.7';
            toggleButton.textContent = '+';
        } else {
            // Show content and restore box
            logContent.style.display = 'block';
            downloadButton.style.display = 'block'
            logContainer.style.width = '300px';
            logContainer.style.height = 'auto';
            logContainer.style.opacity = '1';
            toggleButton.textContent = '-';
        }
    });
    toggleButton.click()//start minimized
    downloadButton.addEventListener('click', () => {
        const logData = JSON.stringify(loggedMessages, null, 2);
        const blob = new Blob([logData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
    
        const a = document.createElement('a');
        a.href = url;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        a.download = 'log-' + timestamp + '.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        // URL.revokeObjectURL(url);
    });

    // Global log function
    window.zenLogger = function(message, ...rest) {
        const line = document.createElement('div');
        line.textContent = '[ZenLog] ' + message;
        logContent.appendChild(line);
        // Auto-scroll to bottom if not minimized
        if (!window.zenLogIsMinimized) {
            logContent.scrollTop = logContent.scrollHeight;
        }
        console.log('[ZenLog]', message, ...rest);
        loggedMessages.push([message, ...rest])
    };
    for (let message of window.unloggedMessages) {
        window.zenLogger(...message)
    }
    window.unloggedMessage = []
}
createLogger()
window.zenLogger('ZenLog initialized.');