const {app, BrowserWindow, dialog} = require("electron");
const path = require("path");
const psTree = require("ps-tree");
const childProcess = require("child_process")

const PY_DIST_FOLDER = "dist-python"; // python distributable folder
const PY_SRC_FOLDER = "../../src"; // path to the python source
const PY_MODULE = "../../src/viasp/electron_starter.py"; // the name of the main module
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;

const isRunningInBundle = () => {
    return require("fs").existsSync(path.join(__dirname, PY_DIST_FOLDER));
};

const getPythonScriptPath = () => {
    if (!isRunningInBundle()) {
        return path.join(__dirname, PY_SRC_FOLDER, PY_MODULE);
    }
    if (process.platform === "win32") {
        return path.join(
            __dirname,
            PY_DIST_FOLDER,
            PY_MODULE.slice(0, -3) + ".exe"
        );
    }
    return path.join(__dirname, PY_DIST_FOLDER, PY_MODULE);
};

const startPythonSubprocess = () => {
    let script = getPythonScriptPath();
    let subpy;
    subpy = childProcess.spawn("viasp-start");
    subpy.on('error', (error: string) => {
        dialog.showMessageBox({
            title: 'Title',
            type: 'warning',
            message: 'Error occured.\r\n' + error
        });
    });

    subpy.stdout.on('data', (data: any) => {
        //Here is the output
        data = data.toString();
        console.log(data);
    });


    console.log(`Started ${subpy}`)
};

const killPythonSubprocesses = (main_pid: any) => {
    const python_script_name = path.basename("viasp-start");
    let cleanup_completed = false;
    psTree(main_pid, function (err: any, children: any[]) {
        let python_pids = children
            .filter(function (el) {
                return el.COMMAND == python_script_name;

            })
            .map(function (p) {
                return p.PID;
            });
        // kill all the spawned python processes
        python_pids.forEach(function (pid) {
            console.log("KILLING " + pid)
            process.kill(pid);
        });
        let subpy = null;
        cleanup_completed = true;
    });
    return new Promise(function (resolve, reject) {
        (function waitForSubProcessCleanup() {
            if (cleanup_completed) resolve(null);
            setTimeout(waitForSubProcessCleanup, 30);
        })();
    });
};

const createWindow = () => {
    // Create the browser window.
    let mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false, // is default value after Electron v5
            contextIsolation: true, // protect against prototype pollution
            // preload: path.join(__dirname, "../src/preload.js") // use a preload script
        }
    });

    // and load the index.html of the app.
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    // Open the DevTools.
    mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
    console.log("Starting python subprocess..")
    startPythonSubprocess();
    console.log("Creating window")
    createWindow()
    console.log("Created window")


    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// Quit when all windows are closed.
app.on("window-all-closed", () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    let main_process_pid = process.pid;
    killPythonSubprocesses(main_process_pid).then(() => {
        app.quit();
    });

});
