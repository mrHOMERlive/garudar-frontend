import React, { useState, useEffect } from 'react';
import { apiClient } from '@/api/apiClient';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import CountrySelector from './CountrySelector';
import { t } from '@/components/utils/language';

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
      <h3 className="text-xl font-semibold text-[#1e3a5f]">{t('kycStepCorporate')}</h3>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>{t('kycCompanyNameLabel')}</Label>
          <Input value={formData.company_name || ''} onChange={(e) => handleChange('company_name', e.target.value)} />
        </div>
        <div>
          <Label>{t('kycTradingNameLabel')}</Label>
          <Input value={formData.trading_name || ''} onChange={(e) => handleChange('trading_name', e.target.value)} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>{t('kycIncorporationDateLabel')}</Label>
          <Input
            type="date"
            value={formData.incorporation_date || ''}
            onChange={(e) => handleChange('incorporation_date', e.target.value)}
          />
        </div>
        <div>
          <Label>{t('kycIncorporationCountryLabel')}</Label>
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
        <Label>{t('kycRegisteredAddressLabel')}</Label>
        <Textarea
          value={formData.registered_address || ''}
          onChange={(e) => handleChange('registered_address', e.target.value)}
          className="min-h-[80px]"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <Label>{t('kycTaxIdLabel')}</Label>
          <Input value={formData.tax_id || ''} onChange={(e) => handleChange('tax_id', e.target.value)} />
        </div>
        <div>
          <Label>{t('kycRegistrationNumberLabel')}</Label>
          <Input
            value={formData.registration_number || ''}
            onChange={(e) => handleChange('registration_number', e.target.value)}
          />
        </div>
        <div>
          <Label>{t('kycTelephoneLabel')}</Label>
          <Input value={formData.telephone || ''} onChange={(e) => handleChange('telephone', e.target.value)} />
        </div>
      </div>

      <div>
        <Label>{t('kycWebsiteLabel')}</Label>
        <Input type="url" value={formData.website || ''} onChange={(e) => handleChange('website', e.target.value)} />
      </div>
    </div>
  );
}
