// IBAN country lengths (ISO 13616)
const IBAN_LENGTHS = {
  'AD': 24, 'AE': 23, 'AL': 28, 'AT': 20, 'AZ': 28, 'BA': 20, 'BE': 16,
  'BG': 22, 'BH': 22, 'BR': 29, 'BY': 28, 'CH': 21, 'CR': 22, 'CY': 28,
  'CZ': 24, 'DE': 22, 'DK': 18, 'DO': 28, 'EE': 20, 'EG': 29, 'ES': 24,
  'FI': 18, 'FO': 18, 'FR': 27, 'GB': 22, 'GE': 22, 'GI': 23, 'GL': 18,
  'GR': 27, 'GT': 28, 'HR': 21, 'HU': 28, 'IE': 22, 'IL': 23, 'IS': 26,
  'IT': 27, 'JO': 30, 'KW': 30, 'KZ': 20, 'LB': 28, 'LC': 32, 'LI': 21,
  'LT': 20, 'LU': 20, 'LV': 21, 'MC': 27, 'MD': 24, 'ME': 22, 'MK': 19,
  'MR': 27, 'MT': 31, 'MU': 30, 'NL': 18, 'NO': 15, 'PK': 24, 'PL': 28,
  'PS': 29, 'PT': 25, 'QA': 29, 'RO': 24, 'RS': 22, 'SA': 24, 'SE': 24,
  'SI': 19, 'SK': 24, 'SM': 27, 'TN': 24, 'TR': 26, 'UA': 29, 'VA': 22,
  'VG': 24, 'XK': 20
};

// IBAN countries
export const IBAN_COUNTRIES = Object.keys(IBAN_LENGTHS);

// Validate Latin characters and allowed special chars
export function validateLatinText(text, maxLength) {
  const allowedPattern = /^[A-Za-z0-9 /\-?:().,'+]*$/;
  
  if (!text) return { valid: false, error: 'Field is required' };
  if (!allowedPattern.test(text)) {
    return { valid: false, error: 'Only Latin letters, digits, and symbols /-?:().,\'+ are allowed' };
  }
  
  // Check for leading/trailing spaces
  if (text !== text.trim()) {
    return { valid: false, error: 'No leading or trailing spaces allowed' };
  }
  
  // Check for double spaces
  if (/  /.test(text)) {
    return { valid: false, error: 'No double spaces allowed' };
  }
  
  if (text.length > maxLength) {
    return { valid: false, error: `Maximum ${maxLength} characters allowed` };
  }
  
  return { valid: true };
}

// Validate IBAN
export function validateIBAN(iban, country) {
  if (!iban) return { valid: false, error: 'IBAN is required' };
  
  // Remove spaces and convert to uppercase
  const cleanIBAN = iban.replace(/\s/g, '').toUpperCase();
  
  // Extract country code
  const ibanCountry = cleanIBAN.substring(0, 2);
  
  // Check if country uses IBAN
  if (!IBAN_LENGTHS[ibanCountry]) {
    return { valid: false, error: 'Invalid IBAN country code' };
  }
  
  // Check length
  const expectedLength = IBAN_LENGTHS[ibanCountry];
  if (cleanIBAN.length !== expectedLength) {
    return { 
      valid: false, 
      error: `Invalid IBAN length for ${ibanCountry}. Expected ${expectedLength} characters` 
    };
  }
  
  // MOD-97 check
  const rearranged = cleanIBAN.slice(4) + cleanIBAN.slice(0, 4);
  const numericString = rearranged.replace(/[A-Z]/g, char => char.charCodeAt(0) - 55);
  
  // Calculate mod 97 for large numbers
  let remainder = 0;
  for (let i = 0; i < numericString.length; i++) {
    remainder = (remainder * 10 + parseInt(numericString[i])) % 97;
  }
  
  if (remainder !== 1) {
    return { valid: false, error: 'Invalid IBAN checksum' };
  }
  
  return { valid: true, cleanIBAN };
}

// Validate account number
export function validateAccountNumber(account, country) {
  if (!account) return { valid: false, error: 'Account number is required' };
  
  const cleanAccount = account.replace(/\s/g, '');
  
  // Check if country uses IBAN
  if (IBAN_COUNTRIES.includes(country)) {
    return validateIBAN(account, country);
  }
  
  // For non-IBAN countries
  const accountPattern = /^[A-Z0-9]+$/;
  if (!accountPattern.test(cleanAccount)) {
    return { valid: false, error: 'Only letters A-Z and digits 0-9 allowed' };
  }
  
  if (cleanAccount.length < 5 || cleanAccount.length > 35) {
    return { valid: false, error: 'Account number must be 5-35 characters' };
  }
  
  return { valid: true };
}

// Validate BIC
export function validateBIC(bic, country) {
  if (!bic) return { valid: false, error: 'BIC is required' };
  
  const cleanBIC = bic.replace(/\s/g, '').toUpperCase();
  
  if (cleanBIC.length !== 8 && cleanBIC.length !== 11) {
    return { valid: false, error: 'BIC must be 8 or 11 characters' };
  }
  
  const bicPattern = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
  if (!bicPattern.test(cleanBIC)) {
    return { valid: false, error: 'Invalid BIC format' };
  }
  
  // Extract country code from BIC (positions 5-6)
  const bicCountry = cleanBIC.substring(4, 6);
  
  if (country && bicCountry !== country) {
    return { 
      valid: false, 
      error: `BIC country (${bicCountry}) does not match selected country (${country})` 
    };
  }
  
  return { valid: true, bicCountry, cleanBIC };
}

// Validate amount based on currency
export function validateAmount(amount, currency) {
  if (!amount || amount <= 0) {
    return { valid: false, error: 'Amount must be greater than 0' };
  }
  
  const decimalPlaces = currency === 'IDR' ? 0 : 2;
  const amountStr = amount.toString();
  
  if (amountStr.includes('.')) {
    const decimals = amountStr.split('.')[1];
    if (decimals && decimals.length > decimalPlaces) {
      return { 
        valid: false, 
        error: `Please enter an amount with ${decimalPlaces} decimal places.` 
      };
    }
  }
  
  return { valid: true };
}

// Parse and validate date for transaction remark
export function parseDate(dateStr) {
  if (!dateStr) return null;
  
  // Try DD/MM/YYYY
  let match = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (match) {
    return { day: match[1], month: match[2], year: match[3], formatted: dateStr };
  }
  
  // Try YYYY-MM-DD
  match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    return { day: match[3], month: match[2], year: match[1], formatted: `${match[3]}/${match[2]}/${match[1]}` };
  }
  
  // Try DD.MM.YYYY
  match = dateStr.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (match) {
    return { day: match[1], month: match[2], year: match[3], formatted: `${match[1]}/${match[2]}/${match[3]}` };
  }
  
  return null;
}

// Normalize token value
export function normalizeToken(value, tokenType) {
  if (!value) return '';
  
  let normalized = value.trim().replace(/\s+/g, ' ');
  
  if (tokenType === 'INV_NO') {
    // Only A-Z a-z 0-9 - /
    normalized = normalized.replace(/[^A-Za-z0-9\-/ ]/g, '');
  } else if (tokenType === 'TYPE') {
    normalized = normalized.toLowerCase();
  } else if (tokenType === 'PAYMENT') {
    // Title Case
    normalized = normalized.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }
  
  return normalized;
}

// Build transaction remark from template
export function buildRemarkFromTemplate(template, tokens) {
  const defaults = {
    GOODS: 'goods',
    TYPE: 'inv',
    PAYMENT: 'Payment'
  };
  
  let remark = template;
  const requiredTokens = ['INV_NO', 'DATE'];
  const errors = [];
  
  // Replace tokens
  for (const [key, value] of Object.entries({ ...defaults, ...tokens })) {
    const placeholder = `{${key}}`;
    
    if (remark.includes(placeholder)) {
      if (key === 'DATE') {
        const parsed = parseDate(value);
        if (!parsed) {
          errors.push(`Invalid date format for {DATE}. Use DD/MM/YYYY, YYYY-MM-DD, or DD.MM.YYYY`);
          continue;
        }
        remark = remark.replace(placeholder, parsed.formatted);
      } else {
        const normalized = normalizeToken(value, key);
        remark = remark.replace(placeholder, normalized);
      }
    }
  }
  
  // Check for missing required tokens
  requiredTokens.forEach(token => {
    if (remark.includes(`{${token}}`)) {
      errors.push(`Missing required token {${token}}`);
    }
  });
  
  // Check length
  if (remark.length > 500) {
    errors.push('Transaction remark exceeds 500 characters after template substitution');
  }
  
  return { remark, errors };
}