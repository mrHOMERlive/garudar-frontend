import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Building, AlertCircle, Search } from 'lucide-react';
import { validateAccountNumber, validateBIC, IBAN_COUNTRIES } from './utils/validators';
import { COUNTRIES, searchBIC, getBICData } from './utils/countries';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export default function BankDetailsSection({ formData, onChange, errors, setErrors }) {
  const [bicSearchOpen, setBicSearchOpen] = useState(false);
  const [bicSearchResults, setBicSearchResults] = useState([]);
  const [countrySearchOpen, setCountrySearchOpen] = useState(false);

  const handleAccountChange = (value) => {
    onChange({ destination_account: value });
    
    if (formData.country_bank) {
      const validation = validateAccountNumber(value, formData.country_bank);
      setErrors(prev => ({
        ...prev,
        destination_account: validation.valid ? null : validation.error
      }));
    }
  };

  const handleCountryChange = (countryCode) => {
    onChange({ country_bank: countryCode });
    
    // Revalidate account if exists
    if (formData.destination_account) {
      const validation = validateAccountNumber(formData.destination_account, countryCode);
      setErrors(prev => ({
        ...prev,
        destination_account: validation.valid ? null : validation.error
      }));
    }
    
    // Revalidate BIC if exists
    if (formData.bic) {
      const validation = validateBIC(formData.bic, countryCode);
      setErrors(prev => ({
        ...prev,
        bic: validation.valid ? null : validation.error
      }));
    }
  };

  const handleBICSearch = (query) => {
    if (query.length >= 2) {
      const results = searchBIC(query, formData.country_bank);
      setBicSearchResults(results);
    } else {
      setBicSearchResults([]);
    }
  };

  const handleBICSelect = (bic) => {
    const bicData = getBICData(bic);
    
    if (bicData) {
      onChange({
        bic,
        bank_name: bicData.name,
        bank_address: bicData.address,
        bank_manual_override: false
      });
      
      // Validate BIC
      const validation = validateBIC(bic, formData.country_bank);
      setErrors(prev => ({
        ...prev,
        bic: validation.valid ? null : validation.error
      }));
    }
    
    setBicSearchOpen(false);
  };

  const handleBICManualEntry = (value) => {
    onChange({ bic: value });
    
    if (value.length >= 8) {
      const validation = validateBIC(value, formData.country_bank);
      setErrors(prev => ({
        ...prev,
        bic: validation.valid ? null : validation.error
      }));
      
      // Try to auto-fill bank details
      const bicData = getBICData(value.toUpperCase());
      if (bicData) {
        onChange({
          bic: value,
          bank_name: bicData.name,
          bank_address: bicData.address,
          bank_manual_override: false
        });
      }
    }
  };

  const handleManualOverride = (checked) => {
    onChange({ bank_manual_override: checked });
    if (!checked && formData.bic) {
      const bicData = getBICData(formData.bic);
      if (bicData) {
        onChange({
          bank_name: bicData.name,
          bank_address: bicData.address
        });
      }
    }
  };

  const isIBANCountry = IBAN_COUNTRIES.includes(formData.country_bank);
  const selectedCountry = COUNTRIES.find(c => c.code === formData.country_bank);

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <Building className="w-5 h-5 text-teal-700" />
          Bank Details
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-5">
        {/* Account Number */}
        <div className="space-y-2">
          <Label htmlFor="destination_account" className="text-slate-700 font-medium">
            Destination Account Number *
            <span className="text-xs text-slate-500 ml-2">
              {isIBANCountry ? '(IBAN format required)' : '(5-35 chars, A-Z 0-9)'}
            </span>
          </Label>
          <Input
            id="destination_account"
            value={formData.destination_account || ''}
            onChange={(e) => handleAccountChange(e.target.value)}
            placeholder={isIBANCountry ? 'DE89370400440532013000' : 'Account number'}
            className={`border-slate-200 focus:border-teal-600 focus:ring-teal-600 ${errors.destination_account ? 'border-red-500' : ''}`}
            required
          />
          {errors.destination_account && (
            <div className="flex items-center gap-1 text-sm text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.destination_account}</span>
            </div>
          )}
        </div>

        {/* Country Selection */}
        <div className="space-y-2">
          <Label className="text-slate-700 font-medium">Country (Bank) *</Label>
          <Popover open={countrySearchOpen} onOpenChange={setCountrySearchOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full justify-between border-slate-200"
              >
                {selectedCountry ? (
                  <span>{selectedCountry.name} ({selectedCountry.code})</span>
                ) : (
                  <span className="text-slate-400">Select country...</span>
                )}
                <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search country..." />
                <CommandEmpty>No country found.</CommandEmpty>
                <CommandGroup className="max-h-64 overflow-auto">
                  {COUNTRIES.map((country) => (
                    <CommandItem
                      key={country.code}
                      value={country.name}
                      onSelect={() => {
                        handleCountryChange(country.code);
                        setCountrySearchOpen(false);
                      }}
                    >
                      {country.name} ({country.code})
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* BIC */}
        <div className="space-y-2">
          <Label className="text-slate-700 font-medium">
            BIC (Bank) *
            <span className="text-xs text-slate-500 ml-2">(8 or 11 characters)</span>
          </Label>
          <Popover open={bicSearchOpen} onOpenChange={setBicSearchOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full justify-between border-slate-200"
              >
                {formData.bic ? (
                  <span className="font-mono">{formData.bic}</span>
                ) : (
                  <span className="text-slate-400">Search or enter BIC...</span>
                )}
                <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput 
                  placeholder="Search BIC..." 
                  onValueChange={handleBICSearch}
                />
                <CommandEmpty>
                  <div className="p-4 text-sm">
                    <p>No BIC found. You can enter manually:</p>
                    <Input
                      value={formData.bic || ''}
                      onChange={(e) => handleBICManualEntry(e.target.value)}
                      placeholder="Enter BIC manually"
                      className="mt-2"
                      maxLength={11}
                    />
                  </div>
                </CommandEmpty>
                <CommandGroup className="max-h-64 overflow-auto">
                  {bicSearchResults.map((result) => (
                    <CommandItem
                      key={result.bic}
                      value={result.bic}
                      onSelect={() => handleBICSelect(result.bic)}
                    >
                      <div>
                        <div className="font-mono font-semibold">{result.bic}</div>
                        <div className="text-xs text-slate-500">{result.name}</div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          {errors.bic && (
            <div className="flex items-center gap-1 text-sm text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.bic}</span>
            </div>
          )}
        </div>

        {/* Bank Name */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-slate-700 font-medium">Bank Name *</Label>
            {!formData.bank_name && formData.bic && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="manual_override"
                  checked={formData.bank_manual_override}
                  onCheckedChange={handleManualOverride}
                />
                <label
                  htmlFor="manual_override"
                  className="text-sm text-slate-600 cursor-pointer"
                >
                  Enter manually
                </label>
              </div>
            )}
          </div>
          <Input
            value={formData.bank_name || ''}
            onChange={(e) => onChange({ bank_name: e.target.value })}
            placeholder="Bank name"
            className="border-slate-200 focus:border-teal-600 focus:ring-teal-600"
            readOnly={!formData.bank_manual_override}
            disabled={!formData.bank_manual_override && !formData.bank_name}
            required
          />
        </div>

        {/* Bank Address */}
        <div className="space-y-2">
          <Label className="text-slate-700 font-medium">Bank Address *</Label>
          <Textarea
            value={formData.bank_address || ''}
            onChange={(e) => onChange({ bank_address: e.target.value })}
            placeholder="Full bank address"
            className="border-slate-200 focus:border-teal-600 focus:ring-teal-600 min-h-[60px]"
            readOnly={!formData.bank_manual_override}
            disabled={!formData.bank_manual_override && !formData.bank_address}
            required
          />
        </div>

        {formData.bank_manual_override && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
            ⚠️ Manual override enabled. Bank details will be logged for review.
          </div>
        )}
      </CardContent>
    </Card>
  );
}