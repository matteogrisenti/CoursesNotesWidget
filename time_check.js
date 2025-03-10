const { ipcMain } = require('electron');

const dayMap = {
    "Sunday": 0,
    "Monday": 1,
    "Tuesday": 2,
    "Wednesday": 3,
    "Thursday": 4,
    "Friday": 5,
    "Saturday": 6
};

function updateCourseFlags(courses) {
    //console.log("TC: Updating course flags");

    // Get the current day and time
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.toTimeString().substring(0, 5);

    courses.forEach(course => {
      course.lessons.forEach(lesson => {
        //console.log("TC: Checking lesson: " + lesson.day + " " + lesson.time);
        if(dayMap[lesson.day] === currentDay && lesson.time === currentTime && course.flag === 'true'){
          course.flag = 'false';      // Set the flag to false
             
          console.log("TC: " + course.name + " updating flags course: " + course.flag);
          ipcMain.emit('update-status', {}, course.name); // Send the update to the renderer
        }
      });
    });
}

module.exports = { updateCourseFlags };
