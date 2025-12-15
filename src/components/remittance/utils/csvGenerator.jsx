// Split text into chunks of specified length
export function splitText(text, maxLength) {
  const result = [];
  let remaining = text || '';
  
  while (remaining.length > 0 || result.length < 1) {
    result.push(remaining.substring(0, maxLength));
    remaining = remaining.substring(maxLength);
    if (result.length >= 4 && remaining.length === 0) break;
  }
  
  // Pad with empty strings if needed
  while (result.length < 4) {
    result.push('');
  }
  
  return result;
}

// Split address into 3 parts of 35 chars each
export function splitAddress(address) {
  const parts = splitText(address || '', 35);
  return {
    addr1: parts[0] || '',
    addr2: parts[1] || '',
    addr3: parts[2] || ''
  };
}

// Split remark into 4 parts of 30 chars each
export function splitRemark(remark) {
  const parts = splitText(remark || '', 30);
  return {
    rem_info1: parts[0] || '',
    rem_info2: parts[1] || '',
    rem_info3: parts[2] || '',
    rem_info4: parts[3] || ''
  };
}

// Generate CSV row data from order
export function generateCSVData(order) {
  const addressParts = splitAddress(order.beneficiary_address);
  const remarkParts = splitRemark(order.transaction_remark);
  
  return {
    'Debit Account No.': order.debit_account_no || '',
    'Destination Acc No.': order.destination_account || '',
    'Remittance Currency': order.currency || '',
    'Transfer Amount': order.amount || '',
    'Beneficiary Name': order.beneficiary_name || '',
    'Beneficiary Addr1': addressParts.addr1,
    'Beneficiary Addr2': addressParts.addr2,
    'Beneficiary Addr3': addressParts.addr3,
    'Bank Code (SWIFT)': order.bic || '',
    'Bank Name': order.bank_name || '',
    'Country': order.country_bank || '',
    'Remark': order.transaction_remark || '',
    'rem_info1': remarkParts.rem_info1,
    'rem_info2': remarkParts.rem_info2,
    'rem_info3': remarkParts.rem_info3,
    'rem_info4': remarkParts.rem_info4
  };
}

// Convert data to CSV string
export function toCSVString(data) {
  const headers = Object.keys(data);
  const values = Object.values(data).map(v => {
    // Escape quotes and wrap in quotes if contains comma or quote
    const str = String(v);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  });
  
  return headers.join(',') + '\n' + values.join(',');
}

// Download CSV file
export function downloadCSV(data, filename) {
  const csvString = toCSVString(data);
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export multiple orders to CSV
export function exportOrdersToCSV(orders, filename = 'orders.csv') {
  if (!orders || orders.length === 0) return;
  
  const rows = orders.map(order => generateCSVData(order));
  const headers = Object.keys(rows[0]);
  
  const csvRows = [
    headers.join(','),
    ...rows.map(row => 
      headers.map(h => {
        const str = String(row[h]);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(',')
    )
  ];
  
  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}