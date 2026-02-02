import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Building, AlertCircle, Search } from 'lucide-react';
import { validateAccountNumber, validateBIC, IBAN_COUNTRIES } from './utils/validators';
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

export default function BankDetailsSection({ formData, onChange, errors, setErrors, countries = [] }) {
  const [bicSearchOpen, setBicSearchOpen] = useState(false);
  const [bicSearchQuery, setBicSearchQuery] = useState('');
  const [countrySearchOpen, setCountrySearchOpen] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState('');


  // Загрузка BIC по выбранной стране
  const { data: bicData = [], isLoading: bicLoading } = useQuery({
    queryKey: ['bic', formData.country_bank],
    queryFn: () => apiClient.getBicByCountry(formData.country_bank),
    enabled: !!formData.country_bank,
  });

  // Фильтрация активных BIC (isDelete=false, isInactive=false)
  const activeBics = useMemo(() =>
    bicData.filter(bic => !bic.isDelete && !bic.isInactive),
    [bicData]
  );

  // Поиск BIC по запросу
  const bicSearchResults = useMemo(() => {
    if (!bicSearchQuery) return [];
    const query = bicSearchQuery.toUpperCase();
    return activeBics.filter(bic =>
      bic.bicSwiftCd?.startsWith(query)
    ).slice(0, 20);
  }, [activeBics, bicSearchQuery]);



  // Поиск стран по началу названия или кода
  const countrySearchResults = useMemo(() => {
    if (!countrySearchQuery) return countries;
    const query = countrySearchQuery.toUpperCase();
    return countries.filter(country =>
      country.name.toUpperCase().startsWith(query) ||
      country.code.toUpperCase().startsWith(query)
    );
  }, [countries, countrySearchQuery]);

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

    // Revalidate BIC if exists (skip if manual override is enabled)
    if (formData.bic && !formData.bank_manual_override) {
      const validation = validateBIC(formData.bic, countryCode);
      setErrors(prev => ({
        ...prev,
        bic: validation.valid ? null : validation.error
      }));
    }
  };

  const handleBICSearch = (query) => {
    setBicSearchQuery(query);
  };

  const handleBICSelect = (bicItem) => {
    const address = [bicItem.addr1, bicItem.addr2, bicItem.addr3, bicItem.cityNm]
      .filter(Boolean)
      .join(', ');

    onChange({
      bic: bicItem.bicSwiftCd,
      bank_name: bicItem.nm,
      bank_address: address,
      bank_manual_override: false
    });

    // Validate BIC
    const validation = validateBIC(bicItem.bicSwiftCd, formData.country_bank);
    setErrors(prev => ({
      ...prev,
      bic: validation.valid ? null : validation.error
    }));

    setBicSearchOpen(false);
    setBicSearchQuery('');
  };

  const handleBICManualEntry = (value) => {
    onChange({ bic: value });

    if (value.length >= 8 && !formData.bank_manual_override) {
      const validation = validateBIC(value, formData.country_bank);
      setErrors(prev => ({
        ...prev,
        bic: validation.valid ? null : validation.error
      }));

      // Try to auto-fill bank details from API data
      const foundBic = activeBics.find(b => b.bicSwiftCd === value.toUpperCase());
      if (foundBic) {
        const address = [foundBic.addr1, foundBic.addr2, foundBic.addr3, foundBic.cityNm]
          .filter(Boolean)
          .join(', ');
        onChange({
          bic: value,
          bank_name: foundBic.nm,
          bank_address: address,
          bank_manual_override: false
        });
      }
    }
  };

  const handleManualOverride = (checked) => {
    onChange({ bank_manual_override: checked });
    if (!checked && formData.bic) {
      const foundBic = activeBics.find(b => b.bicSwiftCd === formData.bic.toUpperCase());
      if (foundBic) {
        const address = [foundBic.addr1, foundBic.addr2, foundBic.addr3, foundBic.cityNm]
          .filter(Boolean)
          .join(', ');
        onChange({
          bank_name: foundBic.nm,
          bank_address: address
        });
      }
    }
  };

  const isIBANCountry = IBAN_COUNTRIES.includes(formData.country_bank);
  const selectedCountry = countries.find(c => c.code === formData.country_bank);

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
          <Popover open={countrySearchOpen} onOpenChange={setCountrySearchOpen} modal={true}>
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
            <PopoverContent
              className="w-[var(--radix-popover-trigger-width)] p-0"
              align="start"
              side="bottom"
              avoidCollisions={false}
            >
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Search country..."
                  value={countrySearchQuery}
                  onValueChange={setCountrySearchQuery}
                />
                <CommandEmpty>No country found.</CommandEmpty>
                <CommandGroup className="max-h-64 overflow-auto">
                  {countrySearchResults.map((country) => (
                    <CommandItem
                      key={country.code}
                      value={country.name}
                      onSelect={() => {
                        handleCountryChange(country.code);
                        setCountrySearchOpen(false);
                        setCountrySearchQuery('');
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
          <Popover open={bicSearchOpen} onOpenChange={setBicSearchOpen} modal={true}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className={`w-full justify-between border-slate-200 ${formData.bic && formData.bank_manual_override ? 'ring-2 ring-amber-400 border-amber-400 bg-amber-50' : ''}`}
              >
                {formData.bic ? (
                  <span className="font-mono">{formData.bic}</span>
                ) : (
                  <span className="text-slate-400">Search or enter BIC...</span>
                )}
                <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[var(--radix-popover-trigger-width)] p-0"
              align="start"
              side="bottom"
              avoidCollisions={false}
            >
              <Command>
                <CommandInput
                  placeholder="Search BIC..."
                  onValueChange={handleBICSearch}
                />
                <CommandEmpty>
                  <div className="p-4 text-sm">
                    <p>No BIC found. You can enter manually:</p>
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={formData.bic || ''}
                        onChange={(e) => handleBICManualEntry(e.target.value)}
                        placeholder="Enter BIC manually"
                        maxLength={11}
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          if (formData.bic) {
                            onChange({ bank_manual_override: true });
                            setBicSearchOpen(false);
                          }
                        }}
                        className="bg-[#1e3a5f] hover:bg-[#152a45]"
                      >
                        Confirm
                      </Button>
                    </div>
                  </div>
                </CommandEmpty>
                <CommandGroup className="max-h-64 overflow-auto">
                  {bicSearchResults.map((result) => (
                    <CommandItem
                      key={result.bicSwiftCd}
                      value={`${result.bicSwiftCd} ${result.nm}`}
                      onSelect={() => handleBICSelect(result)}
                    >
                      <div>
                        <div className="font-mono font-semibold">{result.bicSwiftCd}</div>
                        <div className="text-xs text-slate-500">{result.nm}</div>
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
          {formData.bic && formData.bank_manual_override && (
            <div className="flex items-center gap-1 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
              <AlertCircle className="w-4 h-4" />
              <span>Manual entry - please fill Bank Name and Address below</span>
            </div>
          )}
        </div>

        {/* Bank Name */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-slate-700 font-medium">Bank Name *</Label>
            {formData.bic && (
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
            className={`border-slate-200 focus:border-teal-600 focus:ring-teal-600 ${formData.bank_manual_override ? 'ring-2 ring-amber-400 border-amber-400' : ''}`}
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
            className={`border-slate-200 focus:border-teal-600 focus:ring-teal-600 min-h-[60px] ${formData.bank_manual_override ? 'ring-2 ring-amber-400 border-amber-400' : ''}`}
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