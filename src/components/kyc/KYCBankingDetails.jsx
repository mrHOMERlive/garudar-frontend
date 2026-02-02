import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function KYCBankingDetails({ formData = {}, onChange, language = 'en' }) {
  const handleChange = (field, value) => {
    onChange({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-[#1e3a5f] mb-2">
          {language === 'en' ? '3. Banking Details' : '3. Detail Perbankan'}
        </h3>
        <p className="text-sm text-slate-600">
          {language === 'en' ? 'Please provide the full banking details' : 'Harap sediakan detail perbankan lengkap'}
        </p>
      </div>
      
      <div className="grid gap-4">
        <div>
          <Label>3.1 {language === 'en' ? 'Principal Bankers (Name of the Bank)' : 'Bank Utama (Nama Bank)'} *</Label>
          <Input
            value={formData.principal_bankers || ''}
            onChange={(e) => handleChange('principal_bankers', e.target.value)}
          />
        </div>
        <div>
          <Label>3.2 {language === 'en' ? 'Swift BIC' : 'Swift BIC'}</Label>
          <Input
            value={formData.swift_bic || ''}
            onChange={(e) => handleChange('swift_bic', e.target.value)}
          />
        </div>
        <div>
          <Label>3.3 {language === 'en' ? 'Bank Branch Address Details' : 'Detail Alamat Cabang Bank'}</Label>
          <Textarea
            value={formData.bank_branch_address || ''}
            onChange={(e) => handleChange('bank_branch_address', e.target.value)}
            className="min-h-[60px]"
          />
        </div>
        <div>
          <Label>3.4 {language === 'en' ? 'Bank City & Country' : 'Kota & Negara Bank'}</Label>
          <Input
            value={formData.bank_city_country || ''}
            onChange={(e) => handleChange('bank_city_country', e.target.value)}
          />
        </div>
        <div>
          <Label>3.5 {language === 'en' ? 'Bank Account Name (Beneficiary Name)' : 'Nama Rekening Bank (Nama Penerima)'}</Label>
          <Input
            value={formData.bank_account_name || ''}
            onChange={(e) => handleChange('bank_account_name', e.target.value)}
          />
        </div>
        <div>
          <Label>3.6 {language === 'en' ? 'Currency of Bank Account' : 'Mata Uang Rekening Bank'}</Label>
          <Input
            value={formData.bank_account_currency || ''}
            onChange={(e) => handleChange('bank_account_currency', e.target.value)}
          />
        </div>
        <div>
          <Label>3.7 {language === 'en' ? 'Bank Account Number/IBAN number' : 'Nomor Rekening Bank/Nomor IBAN'}</Label>
          <Input
            value={formData.bank_account_number || ''}
            onChange={(e) => handleChange('bank_account_number', e.target.value)}
          />
        </div>
        <div>
          <Label>3.8 {language === 'en' ? 'Name of Bank Account Manager & Contact Details' : 'Nama Manajer Rekening Bank & Detail Kontak'}</Label>
          <Input
            value={formData.bank_manager_contact || ''}
            onChange={(e) => handleChange('bank_manager_contact', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}