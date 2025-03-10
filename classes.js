// Class to represent a lesson
class Lesson {
  constructor(day, time) {
    this.day = day;
    this.time = time;
  }

}

// Class to represent a course
class Course {
  constructor(name, flag, lessons = []) {
    this.name = name;
    this.lessons = lessons;
    this.flag = flag;
  }

}

module.exports = { Lesson, Course };
