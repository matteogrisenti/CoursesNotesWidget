const { ipcRenderer } = require('electron');
const { Lesson, Course } = require('../../classes.js');

// Handling the button to add a new lesson row
document.getElementById('addLessonBtn').addEventListener('click', () => {
  const lessonsContainer = document.getElementById('lessonsContainer');
  
  // Dynamically creating a new lesson row
  const lessonRow = document.createElement('div');
  lessonRow.classList.add('lessonRow');
  lessonRow.innerHTML = `
    <label>Day of the week:</label>
    <select class="courseDay">
      <option value="Monday">Monday</option>
      <option value="Tuesday">Tuesday</option>
      <option value="Wednesday">Wednesday</option>
      <option value="Thursday">Thursday</option>
      <option value="Friday">Friday</option>
      <option value="Saturday">Saturday</option>
      <option value="Sunday">Sunday</option>
    </select>

    <label>Lesson time:</label>
    <input type="time" class="courseTime">
  `;
  lessonsContainer.appendChild(lessonRow);
});

// Handling the button to confirm and submit the course
document.getElementById('confirmBtn').addEventListener('click', () => {
  const courseName = document.getElementById('courseName').value.trim();

  // Gather all created lessons
  const lessonRows = document.querySelectorAll('.lessonRow');
  let lessons = [];
  lessonRows.forEach(row => {
    const day = row.querySelector('.courseDay').value;
    const time = row.querySelector('.courseTime').value;
    // If both fields are filled, create the lesson
    if (day && time) {
      lessons.push(new Lesson(day, time));
    }
  });

  if (courseName) {
    let newCourse = new Course(courseName, 'false', lessons);
    ipcRenderer.send('add-course', newCourse);
  }
});




