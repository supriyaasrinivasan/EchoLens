const LOCAL_SERVER = 'http://localhost:5000';
let serverProcess = null;
let isServerRunning = false;

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
        const isWindows = navigator.userAgent.indexOf('Windows') !== -1;
        const scriptPath = isWindows ? 'start-backend.bat' : 'start-backend.sh';
        
        console.log('SupriAI: Attempting to start backend server...');
        console.log('Please run start-backend.bat manually if auto-start fails');
        
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: 'SupriAI Backend',
            message: 'Starting backend server... Please wait.',
            priority: 1
        });

        await new Promise(resolve => setTimeout(resolve, 3000));
        
        for (let i = 0; i < 10; i++) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const running = await checkServer();
            if (running) {
                isServerRunning = true;
                console.log('SupriAI: Backend server started successfully');
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'icons/icon128.png',
                    title: 'SupriAI Backend',
                    message: 'Backend server is ready!',
                    priority: 1
                });
                return true;
            }
        }

        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: 'SupriAI Backend',
            message: 'Please run start-backend.bat manually to start the server.',
            priority: 2
        });
        
        return false;
    } catch (error) {
        console.error('SupriAI: Failed to start backend:', error);
        return false;
    }
}

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

export { checkServer, startLocalServer, LOCAL_SERVER };
