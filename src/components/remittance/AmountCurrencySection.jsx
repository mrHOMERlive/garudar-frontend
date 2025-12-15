import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, AlertCircle } from 'lucide-react';
import { validateAmount } from './utils/validators';

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' }
];

export default function AmountCurrencySection({ formData, onChange, errors, setErrors }) {
  const handleAmountChange = (value) => {
    const amount = parseFloat(value) || 0;
    onChange({ amount });
    
    if (formData.currency) {
      const validation = validateAmount(amount, formData.currency);
      setErrors(prev => ({
        ...prev,
        amount: validation.valid ? null : validation.error
      }));
    }
  };

  const handleCurrencyChange = (currency) => {
    onChange({ currency });
    
    if (formData.amount) {
      const validation = validateAmount(formData.amount, currency);
      setErrors(prev => ({
        ...prev,
        amount: validation.valid ? null : validation.error
      }));
    }
  };

  const getCurrencyStep = () => {
    return formData.currency === 'IDR' ? '1' : '0.01';
  };

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <DollarSign className="w-5 h-5 text-teal-700" />
          Payment Amount
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-slate-700 font-medium">
              Amount *
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                id="amount"
                type="number"
                min="0"
                step={getCurrencyStep()}
                value={formData.amount || ''}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="0.00"
                className={`pl-10 border-slate-200 focus:border-teal-600 focus:ring-teal-600 ${errors.amount ? 'border-red-500' : ''}`}
                required
              />
            </div>
            {errors.amount && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.amount}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency" className="text-slate-700 font-medium">
              Currency *
            </Label>
            <Select
              value={formData.currency || ''}
              onValueChange={handleCurrencyChange}
            >
              <SelectTrigger className="border-slate-200 focus:border-teal-600 focus:ring-teal-600">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.symbol} {currency.code} - {currency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}