// Номер IMO судна: 7 цифр, последняя — контрольная.

const IMO_RE = /^(?:IMO)?\s*(\d{7})$/i;

export function normalizeImo(raw) {
  const m = IMO_RE.exec((raw || '').trim());
  return m ? m[1] : null;
}

// Контрольная цифра IMO: сумма первых шести цифр с весами 7…2, mod 10.
export function imoIsValid(imo) {
  if (!/^\d{7}$/.test(imo || '')) return false;
  const sum = [...imo.slice(0, 6)].reduce((acc, d, i) => acc + Number(d) * (7 - i), 0);
  return sum % 10 === Number(imo[6]);
}
