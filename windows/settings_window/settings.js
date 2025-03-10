const { ipcRenderer } = require('electron');

document.getElementById('addCourseBtn').addEventListener('click', () => {
  ipcRenderer.send('open-add-course');
});

ipcRenderer.on('add-course', (event, course) => {
  const tbody = document.getElementById('settingsBody');
  const row = document.createElement('tr');

  const lessonsHTML = course.lessons
    .map(lesson => `<div>${lesson.day} - ${lesson.time}</div>`)
    .join('');

  row.innerHTML = `
    <td>${course.name}</td>
    <td>${lessonsHTML}</td>
    <td><button class="delete-btn">🗑️</button></td>
  `;

  row.querySelector('.delete-btn').addEventListener('click', () => {
    row.remove();
    ipcRenderer.send('remove-course', course.name);
  });

  tbody.appendChild(row);
});
