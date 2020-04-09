/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-var-requires */

const path = require('path');
const http = require('http');
const {app, BrowserWindow, screen, nativeImage} = require('electron');
const pm2 = require('pm2');

const host = 'localhost';

async function getPort() {
    return new Promise((resolve, reject) => {
        const server = http.createServer();
        server.listen(0);
        server.on('listening', () => {
            resolve(server.address().port);
            server.close();
        });
        server.on('error', reject);
    });
}

async function createWindow() {
    const {width, height} = screen.getPrimaryDisplay().workAreaSize;

    const win = new BrowserWindow({
        minWidth: 800,
        minHeight: 600,
        width,
        height,
        icon: nativeImage.createFromPath(path.join(__dirname, 'resources/icon.png')),
        webPreferences: {
            devTools: false,
            nodeIntegration: true
        },
        show: false
    });

    win.once('ready-to-show', () => {
        win.show();
    });

    return win;
}

function startServer({port, host}) {
    return new Promise((resolve, reject) => {
        pm2.connect(err => {
            if (err) {
                reject(err);
            }
            const app = require('@visualdl/server/ecosystem.config').apps[0];
            pm2.start(
                {
                    ...app,
                    instances: 1,
                    env: {
                        ...app.env,
                        HOST: host,
                        PORT: port,
                        BACKEND: 'http://127.0.0.1:8040'
                    }
                },
                err => {
                    pm2.disconnect();
                    if (err) {
                        reject(err);
                    } else {
                        console.log(`Server listening at http://${host}:${port}`);
                        resolve();
                    }
                }
            );
        });
    });
}

function stopServer() {
    return new Promise((resolve, reject) => {
        pm2.connect(err => {
            if (err) {
                reject(err);
            }
            pm2.killDaemon(err => {
                pm2.disconnect();
                if (err) {
                    reject(err);
                } else {
                    console.log('Server stopped');
                    resolve();
                }
            });
        });
    });
}

app.on('ready', async () => {
    let port = 0;
    try {
        port = await getPort();
        await startServer({port, host});
    } catch (e) {
        console.error(e);
        app.exit(1);
        return;
    }

    try {
        const win = await createWindow();
        win.loadURL(`http://${host}:${port}`);
    } catch (e) {
        console.error(e);
        app.exit(1);
    }
});

// app.on('activate', async () => {
//     if (BrowserWindow.getAllWindows().length === 0) {
//         try {
//             await createWindow();
//         } catch (e) {
//             console.error(e);
//             app.exit(1);
//         }
//     }
// });

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    app.quit();
    // if (process.platform !== 'darwin') {
    //     app.quit();
    // }
});

app.on('will-quit', async event => {
    event.preventDefault();
    try {
        await stopServer();
        app.exit(0);
    } catch (e) {
        console.error(e);
        app.exit(1);
    }
});
