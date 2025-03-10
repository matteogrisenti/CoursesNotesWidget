const { app } = require('electron');
const { Lesson, Course } = require('../classes.js');
const fs = require('fs');
const path = require('path');

//const coursesFilePath = path.join(__dirname, 'courses.txt');
const coursesFilePath = path.join(app.getPath('userData'), 'courses.txt');
if(!fs.existsSync(coursesFilePath)){
  console.log("DB: File course.txt found, creating a new one.");
  fs.writeFileSync(coursesFilePath, '', 'utf8');
}

// PARSE FUNCTIONS // 
// Function to parse a lesson string into a Lesson instance
function parseLessonFromText(lessonText) {
  const [day, time] = lessonText.split('-');
  return new Lesson(day, time);
}

// Function to parse a course string into a Course instance
function parseCourseFromText(courseText) {
  // Attendending format: "Course Name | flag | Lesson1, Lesson2, Lesson3"
  const parts = courseText.split(' | ');
 
  const name = parts[0].trim();
  const flag = parts[1].trim();
  const lessonsText = parts[2] ? parts[2].trim() : "";
  const lessons = lessonsText ? lessonsText.split(', ').map(parseLessonFromText) : [];
 
  let course = new Course(name, flag, lessons);
  return course;
}


// API FUNCTIONS //
// Funzione per caricare i corsi dal file di testo
function loadCourses() {
  let courses = [];
  try {
    if (fs.existsSync(coursesFilePath)) {
      const data = fs.readFileSync(coursesFilePath, 'utf8');
      courses = data
        .split('\n')
        .filter(line => line.trim() !== '')
        .map(parseCourseFromText);
      // console.log("Courses loaded:", courses);
    }
  } catch (err) {
    console.error("ERROR Courses Loading:", err);
  }
  return courses;
}

// Funzione per salvare o aggiornare un corso con le nuove lezioni
function saveCourse(newCourse) {
  let courses = loadCourses();
  // if the course don't have a flag, set it to "false"
  if (!newCourse.flag) newCourse.flag = "false";
  
  courses.push(newCourse);
  saveCoursesToFile(courses);
}

// function to update a course flag
function updateCourse(courseName) {
  return new Promise((resolve, reject) => {
    try {
      let courses = loadCourses();
      let course = courses.find(c => c.name === courseName);

      if (course) {
        course.flag = course.flag === 'true' ? 'false' : 'true';
        
        saveCoursesToFile(courses);
        console.log(`DB: Course "${courseName}" has been updated with flag "${course.flag}".`);

        resolve(course); // Risolve la promise con il corso aggiornato
      } else {
        console.log(`DB: Course "${courseName}" not found.`);
        reject(new Error(`Course "${courseName}" not found.`));
      }
    } catch (error) {
      reject(error); // In caso di errore, la promise viene rigettata
    }
  });
}

// Funzione per rimuovere un corso dal file
function removeCourse(courseName) {
  let courses = loadCourses().filter(course => course.name !== courseName);
  saveCoursesToFile(courses);
  console.log(`DB: Course "${courseName}" has been removed.`);
}

// Funzione per scrivere l'array dei corsi nel file
function saveCoursesToFile(courses) {
  try {
    let data = '';

    for (let course of courses) {
      const lessonsStr = course.lessons.map(l => `${l.day}-${l.time}`).join(', ');
      const dataCourse = `${course.name} | ${course.flag} | ${lessonsStr}`;
      data += dataCourse + '\n';
    }

    fs.writeFileSync(coursesFilePath, data + '\n', 'utf8');
  } catch (err) {
    console.error("Error saving courses:", err);
  }
}

// Creazione dell'oggetto coursesManager con le funzioni
const coursesManager = {
  loadCourses,
  saveCourse,
  updateCourse,
  removeCourse
};

// Esportazione dell'oggetto
module.exports = coursesManager;

