import React, { useState } from 'react';
import apiClient from '@/api/apiClient';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { t } from '@/components/utils/language';

const EMPTY = {
  customer_type: '',
  registration_number: '',
  tax_number: '',
  legal_tax_number_type: '',
  legal_tax_number: '',
  name: '',
  birth_place_date: '',
  address: '',
  indonesian_citizenship: false,
  director_name: '',
  occupation: '',
  gender: '',
  phone_number: '',
  recipient_name: '',
  recipient_address: '',
  pep_indicator: false,
  code_type: '',
  business_area: '',
};

export default function CustomerFormModal({ record, onClose, onSaved }) {
  const [form, setForm] = useState(record ? { ...record } : { ...EMPTY });

  const saveMutation = useMutation({
    mutationFn: (data) =>
      record ? apiClient.updateCustomerReport(record.id, data) : apiClient.createCustomerReport(data),
    onSuccess: () => {
      toast.success(record ? t('recordUpdatedToast') : t('recordCreatedToast'));
      onSaved();
    },
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{record ? t('custEditTitle') : t('custAddTitle')}</DialogTitle>
          <DialogDescription className="sr-only">
            {record ? t('custEditDescription') : t('custAddDescription')}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate(form);
          }}
          className="grid grid-cols-2 gap-4 pt-2"
        >
          <div className="space-y-1">
            <Label>{t('custRegistrationNumberNib')}</Label>
            <Input
              value={form.registration_number || ''}
              onChange={(e) => set('registration_number', e.target.value)}
              placeholder="e.g. 1234567890123456789"
            />
          </div>
          <div className="space-y-1">
            <Label>{t('custTaxNumberNpwp')}</Label>
            <Input
              value={form.tax_number || ''}
              onChange={(e) => set('tax_number', e.target.value)}
              placeholder="e.g. 12.345.678.9-012.345"
            />
          </div>
          <div className="space-y-1">
            <Label>{t('custCustomerType')}</Label>
            <Select value={form.customer_type} onValueChange={(v) => set('customer_type', v)}>
              <SelectTrigger>
                <SelectValue placeholder={t('txnSelectType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="client">{t('custClient')}</SelectItem>
                <SelectItem value="counterparty">{t('custCounterparty')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>{t('custCodeType')}</Label>
            <Select value={form.code_type} onValueChange={(v) => set('code_type', v)}>
              <SelectTrigger>
                <SelectValue placeholder={t('custSelectCode')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MC">MC</SelectItem>
                <SelectItem value="Bank">Bank</SelectItem>
                <SelectItem value="Individual">{t('staffKycTypeIndividual')}</SelectItem>
                <SelectItem value="Corporate">{t('staffKycTypeCorporate')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>{t('custLegalTaxDocType')}</Label>
            <Select value={form.legal_tax_number_type} onValueChange={(v) => set('legal_tax_number_type', v)}>
              <SelectTrigger>
                <SelectValue placeholder={t('custSelectDocType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NID">NID</SelectItem>
                <SelectItem value="NPWP">NPWP</SelectItem>
                <SelectItem value="DL">DL</SelectItem>
                <SelectItem value="Passport">Passport</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>{t('custLegalTaxNumber')}</Label>
            <Input value={form.legal_tax_number || ''} onChange={(e) => set('legal_tax_number', e.target.value)} />
          </div>
          <div className="col-span-2 space-y-1">
            <Label>{t('custSenderNameRequired')}</Label>
            <Input value={form.name || ''} onChange={(e) => set('name', e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label>{t('custBirthPlaceDate')}</Label>
            <Input
              value={form.birth_place_date || ''}
              onChange={(e) => set('birth_place_date', e.target.value)}
              placeholder={t('custBirthPlaceDateHint')}
            />
          </div>
          <div className="space-y-1">
            <Label>{t('custOccupation')}</Label>
            <Input
              value={form.occupation || ''}
              onChange={(e) => set('occupation', e.target.value)}
              placeholder={t('custOccupationHint')}
            />
          </div>
          <div className="space-y-1">
            <Label>{t('custGender')}</Label>
            <Select value={form.gender || ''} onValueChange={(v) => set('gender', v)}>
              <SelectTrigger>
                <SelectValue placeholder={t('txnSelect')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="L">{t('custGenderMale')}</SelectItem>
                <SelectItem value="P">{t('custGenderFemale')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>{t('custPhoneNumber')}</Label>
            <Input
              value={form.phone_number || ''}
              onChange={(e) => set('phone_number', e.target.value)}
              placeholder={t('custPhoneHint')}
            />
          </div>
          <div className="col-span-2 space-y-1">
            <Label>{t('custAddress')}</Label>
            <Input value={form.address || ''} onChange={(e) => set('address', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>{t('custRecipientName')}</Label>
            <Input value={form.recipient_name || ''} onChange={(e) => set('recipient_name', e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>{t('custRecipientAddress')}</Label>
            <Input value={form.recipient_address || ''} onChange={(e) => set('recipient_address', e.target.value)} />
          </div>
          <div className="col-span-2 space-y-1">
            <Label>{t('custBusinessArea')}</Label>
            <Input
              value={form.business_area || ''}
              onChange={(e) => set('business_area', e.target.value)}
              placeholder={t('custBusinessAreaHint')}
            />
          </div>
          <div className="space-y-1">
            <Label>{t('custDirectorName')}</Label>
            <Input value={form.director_name || ''} onChange={(e) => set('director_name', e.target.value)} />
          </div>
          <div className="flex flex-col gap-3 justify-center">
            <div className="flex items-center gap-2">
              <Checkbox
                id="indo_cit"
                checked={!!form.indonesian_citizenship}
                onCheckedChange={(v) => set('indonesian_citizenship', v)}
              />
              <Label htmlFor="indo_cit">{t('custIndonesianCitizenship')}</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="pep" checked={!!form.pep_indicator} onCheckedChange={(v) => set('pep_indicator', v)} />
              <Label htmlFor="pep">{t('custPepIndicator')}</Label>
            </div>
          </div>
          <div className="col-span-2 flex justify-end gap-2 pt-2 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('formCancel')}
            </Button>
            <Button type="submit" className="bg-[#1e3a5f] text-white" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? t('formSavingDots') : record ? t('formUpdate') : t('formCreate')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
