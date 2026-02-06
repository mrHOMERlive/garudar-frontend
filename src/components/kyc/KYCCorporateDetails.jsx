import React, { useState, useEffect } from 'react';
import { apiClient } from '@/api/apiClient';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import CountrySelector from './CountrySelector';

export default function KYCCorporateDetails({ formData = {}, onChange, language }) {
  const [countries, setCountries] = useState([]);

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

  const handleChange = (field, value) => {
    onChange({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-[#1e3a5f]">
        {language === 'en' ? 'Corporate Details' : 'Detail Perusahaan'}
      </h3>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>Company Name *</Label>
          <Input
            value={formData.company_name || ''}
            onChange={(e) => handleChange('company_name', e.target.value)}
          />
        </div>
        <div>
          <Label>Trading Name</Label>
          <Input
            value={formData.trading_name || ''}
            onChange={(e) => handleChange('trading_name', e.target.value)}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>Incorporation Date</Label>
          <Input
            type="date"
            value={formData.incorporation_date || ''}
            onChange={(e) => handleChange('incorporation_date', e.target.value)}
          />
        </div>
        <div>
          <Label>Incorporation Country</Label>
          <CountrySelector
            value={formData.incorporation_country}
            onChange={(value) => handleChange('incorporation_country', value)}
            language={language}
            countries={countries}
            saveName={true}
          />
        </div>
      </div>

      <div>
        <Label>Registered Address *</Label>
        <Textarea
          value={formData.registered_address || ''}
          onChange={(e) => handleChange('registered_address', e.target.value)}
          className="min-h-[80px]"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <Label>Tax ID</Label>
          <Input
            value={formData.tax_id || ''}
            onChange={(e) => handleChange('tax_id', e.target.value)}
          />
        </div>
        <div>
          <Label>Registration Number</Label>
          <Input
            value={formData.registration_number || ''}
            onChange={(e) => handleChange('registration_number', e.target.value)}
          />
        </div>
        <div>
          <Label>Telephone</Label>
          <Input
            value={formData.telephone || ''}
            onChange={(e) => handleChange('telephone', e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label>Website</Label>
        <Input
          type="url"
          value={formData.website || ''}
          onChange={(e) => handleChange('website', e.target.value)}
        />
      </div>
    </div>
  );
}