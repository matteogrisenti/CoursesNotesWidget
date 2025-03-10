const { ipcRenderer } = require('electron');


// INITIALIZATION PAGE //
document.addEventListener('DOMContentLoaded', () => {

    // SETTINGS TOGGLE
    const table_headers = Array.from(document.getElementsByTagName('th')); // Convert to array
    table_headers.forEach(header => {
        console.log(header);
        header.addEventListener('click', () => {
            ipcRenderer.send('open-settings');      // Open settings window
        });
    });
    
    // BOTTONS TOGGLE
    const squares = document.querySelectorAll('.square');   // Select all squares
    squares.forEach(square => {
      square.addEventListener('click',  () => { ipcRenderer.send('update-status', square.getAttribute('course')) } );
    });
    
    const courseNames = document.querySelectorAll('.course-name');  // Select all course names
    courseNames.forEach(cell => {
      cell.addEventListener('click', () => {
        const square = cell.parentElement.querySelector('.square');
        ipcRenderer.send('update-status', square.getAttribute('course'))
      });
    });
});
  


// ADD COURSE LISTENERS //
ipcRenderer.on('add-course', (event, courseName, courseFlag) => {
  addCourse(courseName, courseFlag) 
});

ipcRenderer.on('remove-course', (event, courseName) => {
  removeCourse(courseName)
});

ipcRenderer.on('update-status-conf', (event, courseName, courseFlag) => {
  const squares = document.querySelectorAll('.square');
  squares.forEach(square => {
    if(square.getAttribute('course') === courseName) {
      square.setAttribute('data-status', courseFlag);
    }
  });
});


// WIDGET FUNCTIONS //
function addCourse(courseName, courseFlag) {  
  const tbody = document.getElementById('coursesTable');
  const row = document.createElement('tr');

  row.innerHTML = `
    <td class="course-name">${courseName}</td>
    <td class="notes-status">
      <div class="square" data-status="${courseFlag}" course="${courseName}"></div>
    </td>
  `;

  const square = row.querySelector('.square');
  square.addEventListener('click', () => { ipcRenderer.send('update-status', square.getAttribute('course')) });

  const courseNameEl = row.querySelector('.course-name');
  courseNameEl.addEventListener('click', () => {
    ipcRenderer.send('update-status', square.getAttribute('course'))
  });

  tbody.appendChild(row);

}

function removeCourse(courseName) {
  const courseNames = document.querySelectorAll('.course-name');
  courseNames.forEach(courseNameEl => {
    if(courseNameEl.textContent === courseName) {
      const row = courseNameEl.parentElement;
      row.remove();
    }
  });
}