const { app, BrowserWindow, screen, ipcMain } = require('electron');
const menagerCourses = require('./courses_database/coursesMenager.js');
const timeCheckCourseFlags = require('./time_check.js');

// WINDOWS
let mainWindow;
let settingsWindow;
let addCourseWindow;

// Attiva l'avvio automatico dopo che l'app è pronta
app.whenReady().then(() => {
  app.setLoginItemSettings({ openAtLogin: false });
  createMainWindow();
});

// PAGE CREATION FUNCTIONS
function createMainWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width } = primaryDisplay.workAreaSize;

  mainWindow = new BrowserWindow({
    width: 200,
    height: 300,
    x: width - 220,
    y: 20,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: false,
    skipTaskbar: true,
    useContentSize: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile('windows/widget_window/index.html');

  mainWindow.webContents.on('did-finish-load', () => {
    let courses = menagerCourses.loadCourses();
    if (courses.length) {
      courses.forEach(course => {
        mainWindow.webContents.send('add-course', course.name, course.flag);
      });
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createSettingsWindow() {
  if (settingsWindow) return;
  
  settingsWindow = new BrowserWindow({
    width: 500,
    height: 400,
    title: "SETTINGS",
    resizable: false,
    modal: true,
    parent: mainWindow,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  settingsWindow.loadFile('windows/settings_window/settings.html');

  settingsWindow.webContents.on('did-finish-load', () => {
    let courses = menagerCourses.loadCourses();
    if (courses.length) {
      courses.forEach(course => {
        settingsWindow.webContents.send('add-course', course);
      });
    }
  });

  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
}

function createAddCourseWindow() {
  if (addCourseWindow) return;

  addCourseWindow = new BrowserWindow({
    width: 500,
    height: 400,
    title: "ADD COURSE",
    resizable: false,
    modal: true,
    parent: settingsWindow,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  addCourseWindow.loadFile('windows/add_course_window/add_course.html');

  addCourseWindow.on('closed', () => {
    addCourseWindow = null;
  });
}

// START TIME CHECK
function updateCourseFlags() {
  let courses = menagerCourses.loadCourses();
  timeCheckCourseFlags.updateCourseFlags(courses, mainWindow);
}
setInterval(updateCourseFlags, 30000);

// IPC LISTENERS
ipcMain.on('open-settings', () => {
  createSettingsWindow();
});

ipcMain.on('open-add-course', () => {
  createAddCourseWindow();
});

ipcMain.on('add-course', (event, course) => {
  menagerCourses.saveCourse(course);
  if (mainWindow) {
    mainWindow.webContents.send('add-course', course.name, course.flag);
  }
  if (settingsWindow) {
    settingsWindow.webContents.send('add-course', course);
  }
  if (addCourseWindow) {
    addCourseWindow.close();
  }
});

ipcMain.on('update-status', async (event, courseName) => {
  try {
    let updatedCourse = await menagerCourses.updateCourse(courseName);
    if (mainWindow) {
      mainWindow.webContents.send('update-status-conf', updatedCourse.name, updatedCourse.flag);
    }
  } catch (error) {
    console.error('Error updating course:', error);
  }
});

ipcMain.on('remove-course', (event, courseName) => {
  if (mainWindow) {
    mainWindow.webContents.send('remove-course', courseName);
  }
  menagerCourses.removeCourse(courseName);
});

// Chiude l'app quando tutte le finestre sono chiuse (eccetto MacOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
