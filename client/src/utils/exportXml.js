export const exportResultsToXml = (presentation, selections) => {
  const escapeXml = (str) => {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const headers = [
    'Format',
    'Student(s) & Roll No',
    'Student Name',
    'Student ID',
    'Subject Code',
    'Subject Name',
    'Presentation Date',
    'Selected Topic',
    'Selection Time'
  ];

  let rowsXml = `
    <Row ss:StyleID="HeaderStyle">
      ${headers.map(h => `<Cell><Data ss:Type="String">${escapeXml(h)}</Data></Cell>`).join('')}
    </Row>
  `;

  selections.forEach(item => {
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

    const formattedTime = item.selectedAt
      ? new Date(item.selectedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
      : '';

    rowsXml += `
    <Row>
      <Cell><Data ss:Type="String">${escapeXml(groupTypeLabel)}</Data></Cell>
      <Cell><Data ss:Type="String">${escapeXml(formattedStudents)}</Data></Cell>
      <Cell><Data ss:Type="String">${escapeXml(item.studentName)}</Data></Cell>
      <Cell><Data ss:Type="String">${escapeXml(item.studentId)}</Data></Cell>
      <Cell><Data ss:Type="String">${escapeXml(presentation.subjectCode || '')}</Data></Cell>
      <Cell><Data ss:Type="String">${escapeXml(presentation.subjectName || '')}</Data></Cell>
      <Cell><Data ss:Type="String">${escapeXml(presentation.presentationDate || '')}</Data></Cell>
      <Cell><Data ss:Type="String">${escapeXml(item.topicTitle)}</Data></Cell>
      <Cell><Data ss:Type="String">${escapeXml(formattedTime)}</Data></Cell>
    </Row>`;
  });

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Bottom"/>
   <Borders/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#000000"/>
   <Interior/>
   <NumberFormat/>
   <Protection/>
  </Style>
  <Style ss:ID="HeaderStyle">
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#FFFFFF" ss:Bold="1"/>
   <Interior ss:Color="#4F46E5" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Presentation Results">
  <Table>
   <Column ss:Width="80"/>
   <Column ss:Width="200"/>
   <Column ss:Width="140"/>
   <Column ss:Width="100"/>
   <Column ss:Width="100"/>
   <Column ss:Width="160"/>
   <Column ss:Width="120"/>
   <Column ss:Width="200"/>
   <Column ss:Width="140"/>
   ${rowsXml}
  </Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([xmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'presentation-results.xml');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
