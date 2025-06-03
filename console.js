// Create the log box container
window.unloggedMessages = window.unloggedMessages || [];
window.zenLogger = (...args) => {
    unloggedMessages.push([...args])
};
const createLogger = () => {
    let logContainer = document.getElementById('zen-log-container') || document.createElement('div');
    
    logContainer.id = 'zen-log-container';
    const updateLoggerPosition = () => {
        const viewport = window.visualViewport;
        logContainer.style.top = `${viewport.offsetTop + 10}px`;
        logContainer.style.left = `${viewport.offsetLeft + viewport.width - logContainer.offsetWidth - 10}px`;
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
    toggleButton.style.top = '25px';
    toggleButton.style.right = '0px';
    toggleButton.style.textAlign = 'center'
    toggleButton.style.transform = 'translate(-50%, -50%)';
    toggleButton.style.cursor = 'pointer';
    toggleButton.style.fontSize = '48px';
    toggleButton.style.color = '#ffffff';
    toggleButton.style.userSelect = 'none';
    toggleButton.textContent = '-';
    logContainer.appendChild(toggleButton);

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
            logContainer.style.width = '50px';
            logContainer.style.height = '50px';
            logContainer.style.opacity = '0.7';
            toggleButton.textContent = '+';
        } else {
            // Show content and restore box
            logContent.style.display = 'block';
            logContainer.style.width = '300px';
            logContainer.style.height = 'auto';
            logContainer.style.opacity = '1';
            toggleButton.textContent = '-';
        }
    });

    // Global log function
    window.zenLogger = function(message) {
        const line = document.createElement('div');
        line.textContent = '[ZenLog] ' + message;
        logContent.appendChild(line);
        // Auto-scroll to bottom if not minimized
        if (!window.zenLogIsMinimized) {
            logContent.scrollTop = logContent.scrollHeight;
        }
        console.log('[ZenLog]', message);
    };
    for (let message of window.unloggedMessages) {
        window.zenLogger(...message)
    }
    window.unloggedMessage = []
}
window.zenLogger('ZenLog initialized.');
createLogger();
// Example usage (you can delete these)