function escXML(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function exportToXLS(data, columns, filename) {
  let xml = '<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Sheet1"><Table>';
  xml += '<Row>';
  columns.forEach(col => {
    xml += `<Cell><Data ss:Type="String">${escXML(col.label)}</Data></Cell>`;
  });
  xml += '</Row>';
  data.forEach(row => {
    xml += '<Row>';
    columns.forEach(col => {
      let val = row[col.key] ?? '';
      if (typeof val === 'boolean') val = val ? 'Yes' : 'No';
      xml += `<Cell><Data ss:Type="String">${escXML(String(val))}</Data></Cell>`;
    });
    xml += '</Row>';
  });
  xml += '</Table></Worksheet></Workbook>';
  const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.xls`;
  a.click();
  URL.revokeObjectURL(url);
}