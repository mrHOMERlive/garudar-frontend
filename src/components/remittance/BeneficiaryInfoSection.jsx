import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { UserCheck, AlertCircle, Search } from 'lucide-react';
import { validateLatinText } from './utils/validators';
import { apiClient } from '@/api/apiClient';

export default function BeneficiaryInfoSection({ formData, onChange, errors, setErrors }) {
  const [countries, setCountries] = useState([]);
  const [countrySearchOpen, setCountrySearchOpen] = useState(false);


  useEffect(() => {
    const fetchCountries = async () => {

      try {
        const countriesData = await apiClient.getCountries();
        setCountries(Array.isArray(countriesData) ? countriesData : []);
      } catch (error) {
        console.error('Failed to load countries:', error);
        setCountries([]);
      }
    };
    fetchCountries();
  }, []);



  const selectedCountry = countries.find(c => c.code === formData.beneficiary_country);

  const handleCountryChange = (countryCode) => {
    onChange({ beneficiary_country: countryCode });
  };

  const handleNameChange = (value) => {
    onChange({ beneficiary_name: value });

    const validation = validateLatinText(value, 70);
    setErrors(prev => ({
      ...prev,
      beneficiary_name: validation.valid ? null : validation.error
    }));
  };

  const handleAddressChange = (value) => {
    onChange({ beneficiary_address: value });

    const validation = validateLatinText(value, 105);
    setErrors(prev => ({
      ...prev,
      beneficiary_address: validation.valid ? null : validation.error
    }));
  };

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <UserCheck className="w-5 h-5 text-teal-700" />
          Beneficiary Information
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="beneficiary_name" className="text-slate-700 font-medium">
            Beneficiary Name *
            <span className="text-xs text-slate-500 ml-2">
              (Max 70 chars, Latin letters, digits, and /-?:().,'+&)
            </span>
          </Label>
          <div className="relative">
            <UserCheck className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <Input
              id="beneficiary_name"
              value={formData.beneficiary_name || ''}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Full name of beneficiary"
              className={`pl-10 border-slate-200 focus:border-teal-600 focus:ring-teal-600 ${errors.beneficiary_name ? 'border-red-500' : ''}`}
              maxLength={70}
              required
            />
          </div>
          {errors.beneficiary_name && (
            <div className="flex items-center gap-1 text-sm text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.beneficiary_name}</span>
            </div>
          )}
          <div className="text-xs text-slate-500">
            {formData.beneficiary_name?.length || 0} / 70 characters
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="beneficiary_address" className="text-slate-700 font-medium">
            Beneficiary Address *
            <span className="text-xs text-slate-500 ml-2">
              (Max 105 chars, same rules as name)
            </span>
          </Label>
          <Textarea
            id="beneficiary_address"
            value={formData.beneficiary_address || ''}
            onChange={(e) => handleAddressChange(e.target.value)}
            placeholder="Full address"
            className={`border-slate-200 focus:border-teal-600 focus:ring-teal-600 min-h-[80px] ${errors.beneficiary_address ? 'border-red-500' : ''}`}
            maxLength={105}
            required
          />
          {errors.beneficiary_address && (
            <div className="flex items-center gap-1 text-sm text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.beneficiary_address}</span>
            </div>
          )}
          <div className="text-xs text-slate-500">
            {formData.beneficiary_address?.length || 0} / 105 characters
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-slate-700 font-medium">Beneficiary Country *</Label>
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
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search country..." />
                <CommandEmpty>No country found.</CommandEmpty>
                <CommandGroup className="max-h-64 overflow-auto">
                  {countries.map((country) => (
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
          {errors.beneficiary_country && (
            <div className="flex items-center gap-1 text-sm text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.beneficiary_country}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}