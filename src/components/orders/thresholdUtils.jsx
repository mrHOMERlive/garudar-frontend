// Regulatory threshold: USD 25,000 equivalent
// Per OJK/BI remittance company regulations (PUJK)

const CURRENCY_THRESHOLDS = {
  USD: 25000,
  EUR: 23000,
  CNY: 182000,
  IDR: 395000000,
};

export const THRESHOLD_USD = 25000;

export const isAboveThreshold = (amount, currency) => {
  const threshold = CURRENCY_THRESHOLDS[currency];
  if (!threshold) return false;
  return parseFloat(amount) >= threshold;
};

export const getThresholdForCurrency = (currency) => {
  return CURRENCY_THRESHOLDS[currency] || THRESHOLD_USD;
};

export const formatThreshold = (currency) => {
  const t = getThresholdForCurrency(currency);
  return `${currency} ${t.toLocaleString('en-US')}`;
};
