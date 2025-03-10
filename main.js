const { app, BrowserWindow, screen, ipcMain } = require('electron');
const menagerCourses = require('./courses_database/coursesMenager.js');
const timeCheckCourseFlags = require('./time_check.js');


// WINDOWS
let mainWindow;
let settingsWindow;
let addCourseWindow;


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

  // When the window is opened, load the courses
  mainWindow.webContents.on('did-finish-load', () => {
    courses = menagerCourses.loadCourses()
    if(courses){ 
      courses.forEach(course => {
        mainWindow.webContents.send('add-course', course.name, course.flag);
      });
    }
  }); 
}

function createSettingsWindow() {
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

  settingsWindow.on('closed', () => {
    settingsWindow = null;  
  });

  // When the window is opened, load the courses
  settingsWindow.webContents.on('did-finish-load', () => {
    courses = menagerCourses.loadCourses()
    if(courses){ 
      courses.forEach(course => {
        settingsWindow.webContents.send('add-course', course);
      });
    }
  }); 
}

function createAddCourseWindow() {
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
  const courses = menagerCourses.loadCourses();
  timeCheckCourseFlags.updateCourseFlags(courses, mainWindow);
}
setInterval(updateCourseFlags, 30000);



// IPC LISTENERS
ipcMain.on('open-settings', () => {
  if (!settingsWindow) {
    createSettingsWindow();
  }
});

ipcMain.on('open-add-course', () => {
  if (!addCourseWindow) {
    createAddCourseWindow();
  }
});

ipcMain.on('add-course', (event, course) => {
  menagerCourses.saveCourse(course);
  mainWindow.webContents.send('add-course', course.name, course.flag);
  settingsWindow.webContents.send('add-course', course);
  addCourseWindow.close();
});

ipcMain.on('update-status', async (event, courseName) => {
  try {
    let updatedCourse = await menagerCourses.updateCourse(courseName);
    mainWindow.webContents.send('update-status-conf', updatedCourse.name, updatedCourse.flag);
  } catch (error) {
    console.error('Error updating course:', error);
  }
});

ipcMain.on('remove-course', (event, courseName) => {
  mainWindow.webContents.send('remove-course', courseName);
  menagerCourses.removeCourse(courseName);
});


app.whenReady().then(createMainWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
