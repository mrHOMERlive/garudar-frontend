import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { isAboveThreshold, formatThreshold } from './thresholdUtils';

export default function ThresholdBanner({ amount, currency }) {
  if (!amount || !currency) return null;

  const above = isAboveThreshold(amount, currency);

  if (!above) {
    return (
      <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
        <Info className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-emerald-800">Below Reporting Threshold</p>
          <p className="text-xs text-emerald-700 mt-0.5">
            This order is below the {formatThreshold(currency)} regulatory reporting threshold. Standard processing applies.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 bg-red-50 border-2 border-red-300 rounded-xl p-4">
      <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-bold text-red-800">⚠ Regulatory Threshold Reached</p>
        <p className="text-sm text-red-700 mt-1">
          This transaction of <strong>{currency} {parseFloat(amount).toLocaleString('en-US')}</strong> meets or exceeds
          the <strong>{formatThreshold(currency)}</strong> remittance reporting threshold.
        </p>
        <div className="mt-2 space-y-1">
          <p className="text-xs font-semibold text-red-800">Required documents you must provide:</p>
          <ul className="text-xs text-red-700 list-disc list-inside space-y-0.5">
            <li>Invoice / Proforma Invoice</li>
            <li>Sales Contract / Purchase Order</li>
            <li>Supporting documents proving the purpose of transfer</li>
            <li>Beneficial Ownership declaration (if applicable)</li>
          </ul>
        </div>
        <p className="text-xs text-red-600 mt-2 italic">
          Per OJK/BI regulations, transactions at or above this threshold require enhanced due diligence documentation.
        </p>
      </div>
    </div>
  );
}
