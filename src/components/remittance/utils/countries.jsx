export const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'AT', name: 'Austria' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
  { code: 'PL', name: 'Poland' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'HU', name: 'Hungary' },
  { code: 'RO', name: 'Romania' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'GR', name: 'Greece' },
  { code: 'PT', name: 'Portugal' },
  { code: 'IE', name: 'Ireland' },
  { code: 'HR', name: 'Croatia' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'EE', name: 'Estonia' },
  { code: 'LV', name: 'Latvia' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'SG', name: 'Singapore' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'TH', name: 'Thailand' },
  { code: 'PH', name: 'Philippines' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'IN', name: 'India' },
  { code: 'CN', name: 'China' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'AU', name: 'Australia' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'CA', name: 'Canada' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'TR', name: 'Turkey' },
  { code: 'IL', name: 'Israel' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'RU', name: 'Russia' }
];

// Mock BIC database (in real app, this would be an API call)
export const BIC_DATABASE = {
  'DEUTDEFF': { name: 'Deutsche Bank AG', address: 'Taunusanlage 12, 60325 Frankfurt am Main, Germany', country: 'DE' },
  'COBADEFF': { name: 'Commerzbank AG', address: 'Kaiserplatz, 60311 Frankfurt am Main, Germany', country: 'DE' },
  'BNPAFRPP': { name: 'BNP Paribas', address: '16 Boulevard des Italiens, 75009 Paris, France', country: 'FR' },
  'CRLYFRPP': { name: 'Crédit Lyonnais', address: '18 Rue de la République, 69002 Lyon, France', country: 'FR' },
  'HSBCGB2L': { name: 'HSBC Bank PLC', address: '8 Canada Square, London E14 5HQ, United Kingdom', country: 'GB' },
  'BARCGB22': { name: 'Barclays Bank PLC', address: '1 Churchill Place, London E14 5HP, United Kingdom', country: 'GB' },
  'ABNAIDJA': { name: 'ABN AMRO Bank', address: 'Menara BCA, Jl. MH Thamrin No.1, Jakarta, Indonesia', country: 'ID' },
  'CENAIDJA': { name: 'Bank Central Asia', address: 'Menara BCA, Jl. MH Thamrin No.1, Jakarta, Indonesia', country: 'ID' },
  'CHASUS33': { name: 'JPMorgan Chase Bank', address: '270 Park Avenue, New York, NY 10017, USA', country: 'US' },
  'CITIUS33': { name: 'Citibank N.A.', address: '388 Greenwich Street, New York, NY 10013, USA', country: 'US' },
  'UBSWCHZH': { name: 'UBS Switzerland AG', address: 'Bahnhofstrasse 45, 8001 Zürich, Switzerland', country: 'CH' },
  'CRESCHZZ': { name: 'Credit Suisse AG', address: 'Paradeplatz 8, 8001 Zürich, Switzerland', country: 'CH' },
  'INGBNL2A': { name: 'ING Bank N.V.', address: 'Bijlmerplein 888, 1102 MG Amsterdam, Netherlands', country: 'NL' },
  'RABONL2U': { name: 'Rabobank', address: 'Croeselaan 18, 3521 CB Utrecht, Netherlands', country: 'NL' },
  'DBSSSGSG': { name: 'DBS Bank Ltd', address: '12 Marina Boulevard, Singapore 018982', country: 'SG' },
  'OCBCSGSG': { name: 'Oversea-Chinese Banking Corp', address: '65 Chulia Street, Singapore 049513', country: 'SG' }
};

export function searchBIC(query, country = null) {
  const lowerQuery = query.toLowerCase();
  return Object.entries(BIC_DATABASE)
    .filter(([bic, data]) => {
      const matchesQuery = bic.toLowerCase().includes(lowerQuery) || 
                          data.name.toLowerCase().includes(lowerQuery);
      const matchesCountry = !country || data.country === country;
      return matchesQuery && matchesCountry;
    })
    .map(([bic, data]) => ({ bic, ...data }));
}

export function getBICData(bic) {
  return BIC_DATABASE[bic] || null;
}