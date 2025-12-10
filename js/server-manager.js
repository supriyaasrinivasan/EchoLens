const LOCAL_SERVER = 'http://localhost:5000';
let serverProcess = null;
let isServerRunning = false;

// Safe notification helper - notifications may not be available in all contexts
function safeNotify(title, message, priority = 1) {
    try {
        if (typeof chrome !== 'undefined' && chrome.notifications && chrome.notifications.create) {
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon128.png',
                title: title,
                message: message,
                priority: priority
            });
        }
    } catch (e) {
        // Silent fail - notifications not available
    }
}

async function checkServer() {
    try {
        const response = await fetch(`${LOCAL_SERVER}/api/health`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        return response.ok;
    } catch {
        return false;
    }
}

async function startLocalServer() {
    if (isServerRunning) return true;

    const isRunning = await checkServer();
    if (isRunning) {
        isServerRunning = true;
        console.log('SupriAI: Backend server already running');
        return true;
    }

    try {
        console.log('SupriAI: Attempting to start backend server...');
        console.log('Please run start-backend.bat manually if auto-start fails');
        
        safeNotify('SupriAI Backend', 'Starting backend server... Please wait.');

        await new Promise(resolve => setTimeout(resolve, 3000));
        
        for (let i = 0; i < 10; i++) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const running = await checkServer();
            if (running) {
                isServerRunning = true;
                console.log('SupriAI: Backend server started successfully');
                safeNotify('SupriAI Backend', 'Backend server is ready!');
                return true;
            }
        }

        safeNotify('SupriAI Backend', 'Please run start-backend.bat manually to start the server.', 2);
        
        return false;
    } catch (error) {
        console.error('SupriAI: Failed to start backend:', error);
        return false;
    }
}

function checkRuntimeAvailable() {
    return typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onInstalled;
}

if (checkRuntimeAvailable()) {
    chrome.runtime.onInstalled.addListener(async () => {
        console.log('SupriAI: Extension installed/updated');
        await startLocalServer();
    });

    chrome.runtime.onStartup.addListener(async () => {
        console.log('SupriAI: Browser started');
        await startLocalServer();
    });

    setInterval(async () => {
        const running = await checkServer();
        if (!running && isServerRunning) {
            isServerRunning = false;
            console.log('SupriAI: Backend server stopped');
        } else if (running && !isServerRunning) {
            isServerRunning = true;
            console.log('SupriAI: Backend server detected');
        }
    }, 30000);
}

export { checkServer, startLocalServer, LOCAL_SERVER };
