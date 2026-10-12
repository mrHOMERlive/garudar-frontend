import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { findHighRiskCountry, useHighRiskCountries } from './highRiskCountries';

// Страны высокого риска ЕС по ПОД/ФТ (Delegated Regulation 2016/1675).
// Только информационная пометка в AML Screening: риск и алерты не меняются.

export default function HighRiskCountryNote({ code, compact = false }) {
  const country = findHighRiskCountry(useHighRiskCountries(), code);
  if (!country) return null;
  if (compact) {
    return (
      <span
        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 text-xs"
        title={country.description}
        data-testid="high-risk-country-badge"
      >
        <AlertTriangle className="w-3 h-3" /> EU high-risk country
      </span>
    );
  }
  return (
    <div className="flex items-start gap-1.5 text-xs text-amber-800" data-testid="high-risk-country-note">
      <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
      <span>
        {country.name} is an EU high-risk third country (Delegated Regulation 2016/1675, section {country.section}).
      </span>
    </div>
  );
}
