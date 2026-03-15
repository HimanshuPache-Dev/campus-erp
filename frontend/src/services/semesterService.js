import { useSemester } from '../context/SemesterContext';

class SemesterService {
  constructor() {
    this.semester = null;
    this.academicYear = null;
  }

  initialize(semester, academicYear) {
    this.semester = semester;
    this.academicYear = academicYear;
  }

  // Filter students by semester
  filterStudentsBySemester(students) {
    const activeSemesters = this.semester === 'Winter' ? [1, 3, 5] : [2, 4, 6];
    return students.filter(student => activeSemesters.includes(student.currentSemester));
  }

  // Filter faculty by teaching semester
  filterFacultyBySemester(faculty) {
    return faculty.filter(f => 
      f.teachingSemesters?.includes(this.semester) &&
      f.academicYear === this.academicYear
    );
  }

  // Filter courses by semester
  filterCoursesBySemester(courses) {
    return courses.filter(course => 
      course.semesterType === this.semester && 
      course.academicYear === this.academicYear
    );
  }

  // Filter attendance by semester
  filterAttendanceBySemester(attendance) {
    return attendance.filter(record => 
      record.semester === this.semester && 
      record.academicYear === this.academicYear
    );
  }

  // Filter results by semester
  filterResultsBySemester(results) {
    return results.filter(result => 
      result.semester === this.semester && 
      result.academicYear === this.academicYear
    );
  }

  // Get academic year range
  getAcademicYearRange() {
    const year = parseInt(this.academicYear);
    if (this.semester === 'Winter') {
      return `${year}-${year + 1}`;
    } else {
      return `${year - 1}-${year}`;
    }
  }

  // Check if data belongs to current semester
  isCurrentSemester(item) {
    return item.semester === this.semester && item.academicYear === this.academicYear;
  }
}

export default new SemesterService();