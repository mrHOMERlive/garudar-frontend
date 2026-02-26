import * as XLSX from 'xlsx';

export function exportToXLS(data, columns, filename) {
  const header = columns.map(col => col.label);
  const rows = data.map(row =>
    columns.map(col => {
      const val = row[col.key] ?? '';
      if (typeof val === 'boolean') return val ? 'Yes' : 'No';
      return val;
    })
  );

  const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, `${filename}.xlsx`);
}
