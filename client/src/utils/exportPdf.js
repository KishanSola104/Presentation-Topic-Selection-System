import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportResultsToPdf = (presentation, selections) => {
  const doc = new jsPDF();

  // Header Title
  doc.setFontSize(18);
  doc.setTextColor(30, 41, 59);
  doc.text('Presentation Results', 14, 20);

  // Presentation Metadata
  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  doc.text(`Subject Name: ${presentation.subjectName || 'N/A'}`, 14, 30);
  doc.text(`Subject Code: ${presentation.subjectCode || 'N/A'}`, 14, 37);
  doc.text(`Presentation Date: ${presentation.presentationDate || 'N/A'}`, 14, 44);

  // Summary Metrics
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(`Total Topics: ${presentation.totalTopics}`, 140, 30);
  doc.text(`Selected Topics: ${presentation.selectedTopics}`, 140, 37);
  doc.text(`Remaining Topics: ${presentation.remainingTopics}`, 140, 44);

  // Divider line
  doc.setDrawColor(203, 213, 225);
  doc.line(14, 49, 196, 49);

  // Table Data
  const tableData = selections.map((item, index) => {
    const studentList = item.students && item.students.length > 0
      ? item.students
      : [{ name: item.studentName, studentId: item.studentId }];
    
    const formattedStudents = studentList
      .map((s, sIdx) => studentList.length > 1 ? `${sIdx + 1}. ${s.name} (${s.studentId})` : `${s.name} (${s.studentId})`)
      .join('\n');

    const groupTypeLabel = item.groupType === 'trio' || studentList.length === 3
      ? 'Group of 3'
      : item.groupType === 'duo' || studentList.length === 2
      ? 'Duo (2)'
      : 'Solo';

    return [
      index + 1,
      groupTypeLabel,
      formattedStudents,
      item.topicTitle,
      item.selectedAt ? new Date(item.selectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A'
    ];
  });

  autoTable(doc, {
    startY: 55,
    head: [['#', 'Format', 'Student(s) & Roll No', 'Selected Topic', 'Selection Time']],
    body: tableData.length > 0 ? tableData : [['-', '-', 'No selections yet', '-', '-']],
    theme: 'grid',
    headStyles: {
      fillColor: [79, 70, 229], // Primary indigo
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
      textColor: [30, 41, 59]
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    }
  });

  const fileName = `presentation-results-${(presentation.subjectCode || 'export').replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
};
