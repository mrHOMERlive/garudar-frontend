// Generate TXT instruction for bank upload (73 fields format with ; separator)
export function generateTxtInstruction(order) {
  // Placeholder for 73-field format - to be customized based on bank requirements
  const fields = new Array(73).fill('');
  
  // Map order fields to instruction format
  fields[0] = order.debit_account_no || '';
  fields[1] = order.destination_account || '';
  fields[2] = order.currency || '';
  fields[3] = order.amount?.toString() || '';
  fields[4] = order.beneficiary_name || '';
  fields[5] = (order.beneficiary_address || '').substring(0, 35);
  fields[6] = (order.beneficiary_address || '').substring(35, 70);
  fields[7] = (order.beneficiary_address || '').substring(70, 105);
  fields[8] = order.bic || '';
  fields[9] = order.bank_name || '';
  fields[10] = order.country_bank || '';
  fields[11] = order.transaction_remark || '';
  fields[12] = order.transaction_reference || '';
  fields[13] = order.order_number || '';
  fields[14] = order.client_id || '';
  
  // Add more field mappings as needed based on bank specification
  
  return fields.join(';') + ';';
}

// Export multiple orders to single TXT file
export function generateBatchInstruction(orders) {
  return orders.map(o => generateTxtInstruction(o)).join('\n');
}

// Download instruction file
export function downloadInstruction(content, filename) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}