import * as XLSX from 'xlsx';

export const exportResultsToExcel = (presentation, selections) => {
  const data = selections.map((item) => ({
    'Student Name': item.studentName,
    'Student ID': item.studentId,
    'Subject Code': presentation.subjectCode || '',
    'Subject Name': presentation.subjectName || '',
    'Presentation Date': presentation.presentationDate || '',
    'Selected Topic': item.topicTitle,
    'Selection Time': item.selectedAt
      ? new Date(item.selectedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
      : ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Presentation Results');

  // Auto-size columns
  const columnWidths = [
    { wch: 22 }, // Student Name
    { wch: 15 }, // Student ID
    { wch: 15 }, // Subject Code
    { wch: 25 }, // Subject Name
    { wch: 18 }, // Presentation Date
    { wch: 30 }, // Selected Topic
    { wch: 22 }  // Selection Time
  ];
  worksheet['!cols'] = columnWidths;

  XLSX.writeFile(workbook, 'presentation-results.xlsx');
};
