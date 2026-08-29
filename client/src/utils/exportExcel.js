import * as XLSX from 'xlsx';

export const exportResultsToExcel = (presentation, selections) => {
  const data = selections.map((item) => {
    const studentList = item.students && item.students.length > 0
      ? item.students
      : [{ name: item.studentName, studentId: item.studentId }];
    
    const formattedStudents = studentList
      .map((s, sIdx) => studentList.length > 1 ? `${sIdx + 1}. ${s.name} (${s.studentId})` : `${s.name} (${s.studentId})`)
      .join('; ');

    const groupTypeLabel = item.groupType === 'trio' || studentList.length === 3
      ? 'Group of 3'
      : item.groupType === 'duo' || studentList.length === 2
      ? 'Duo'
      : 'Solo';

    return {
      'Format': groupTypeLabel,
      'Student Name(s) & Roll No': formattedStudents,
      'Student Name': item.studentName,
      'Student ID / Roll No': item.studentId,
      'Subject Code': presentation.subjectCode || '',
      'Subject Name': presentation.subjectName || '',
      'Presentation Date': presentation.presentationDate || '',
      'Selected Topic': item.topicTitle,
      'Selection Time': item.selectedAt
        ? new Date(item.selectedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
        : ''
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Presentation Results');

  // Auto-size columns
  const columnWidths = [
    { wch: 12 }, // Format
    { wch: 35 }, // Student Name(s) & Roll No
    { wch: 22 }, // Student Name
    { wch: 18 }, // Student ID / Roll No
    { wch: 15 }, // Subject Code
    { wch: 25 }, // Subject Name
    { wch: 18 }, // Presentation Date
    { wch: 30 }, // Selected Topic
    { wch: 22 }  // Selection Time
  ];
  worksheet['!cols'] = columnWidths;

  XLSX.writeFile(workbook, 'presentation-results.xlsx');
};
