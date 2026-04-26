import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { t } from '@/components/utils/language';

export default function KYCBankingDetails({ formData = {}, onChange }) {
  const handleChange = (field, value) => {
    onChange({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-[#1e3a5f] mb-2">{t('kycBankingTitle')}</h3>
        <p className="text-sm text-slate-600">{t('kycBankingInstruction')}</p>
      </div>

      <div className="grid gap-4">
        <div>
          <Label>3.1 {t('kycPrincipalBankers')} *</Label>
          <Input
            value={formData.principal_bankers || ''}
            onChange={(e) => handleChange('principal_bankers', e.target.value)}
          />
        </div>
        <div>
          <Label>3.2 {t('kycSwiftBicLabel')}</Label>
          <Input value={formData.swift_bic || ''} onChange={(e) => handleChange('swift_bic', e.target.value)} />
        </div>
        <div>
          <Label>3.3 {t('kycBankBranchAddress')}</Label>
          <Textarea
            value={formData.bank_branch_address || ''}
            onChange={(e) => handleChange('bank_branch_address', e.target.value)}
            className="min-h-[60px]"
          />
        </div>
        <div>
          <Label>3.4 {t('kycBankCityCountry')}</Label>
          <Input
            value={formData.bank_city_country || ''}
            onChange={(e) => handleChange('bank_city_country', e.target.value)}
          />
        </div>
        <div>
          <Label>3.5 {t('kycBankAccountName')}</Label>
          <Input
            value={formData.bank_account_name || ''}
            onChange={(e) => handleChange('bank_account_name', e.target.value)}
          />
        </div>
        <div>
          <Label>3.6 {t('kycBankAccountCurrency')}</Label>
          <Input
            value={formData.bank_account_currency || ''}
            onChange={(e) => handleChange('bank_account_currency', e.target.value)}
          />
        </div>
        <div>
          <Label>3.7 {t('kycBankAccountNumber')}</Label>
          <Input
            value={formData.bank_account_number || ''}
            onChange={(e) => handleChange('bank_account_number', e.target.value)}
          />
        </div>
        <div>
          <Label>3.8 {t('kycBankManagerContact')}</Label>
          <Input
            value={formData.bank_manager_contact || ''}
            onChange={(e) => handleChange('bank_manager_contact', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
