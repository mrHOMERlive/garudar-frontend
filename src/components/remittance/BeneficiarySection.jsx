import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserCheck, CreditCard, Building, Globe, Hash, MapPin } from 'lucide-react';

export default function BeneficiarySection({ formData, onChange }) {
  return (
    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <UserCheck className="w-5 h-5 text-blue-900" />
          Beneficiary Details
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="beneficiary_name" className="text-slate-700 font-medium">
            Recipient Name *
          </Label>
          <div className="relative">
            <UserCheck className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <Input
              id="beneficiary_name"
              value={formData.beneficiary_name || ''}
              onChange={(e) => onChange({ beneficiary_name: e.target.value })}
              placeholder="Full name of recipient"
              className="pl-10 border-slate-200 focus:border-blue-900 focus:ring-blue-900"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="beneficiary_address" className="text-slate-700 font-medium">
            Beneficiary Address
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <Textarea
              id="beneficiary_address"
              value={formData.beneficiary_address || ''}
              onChange={(e) => onChange({ beneficiary_address: e.target.value })}
              placeholder="Full address"
              className="pl-10 border-slate-200 focus:border-blue-900 focus:ring-blue-900 min-h-[60px]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label htmlFor="beneficiary_country" className="text-slate-700 font-medium">
              Country
            </Label>
            <div className="relative">
              <Globe className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                id="beneficiary_country"
                value={formData.beneficiary_country || ''}
                onChange={(e) => onChange({ beneficiary_country: e.target.value })}
                placeholder="Beneficiary country"
                className="pl-10 border-slate-200 focus:border-blue-900 focus:ring-blue-900"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="beneficiary_registration_number" className="text-slate-700 font-medium">
              Registration Number
            </Label>
            <div className="relative">
              <Hash className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                id="beneficiary_registration_number"
                value={formData.beneficiary_registration_number || ''}
                onChange={(e) => onChange({ beneficiary_registration_number: e.target.value })}
                placeholder="Tax ID or registration number"
                className="pl-10 border-slate-200 focus:border-blue-900 focus:ring-blue-900"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="account_number" className="text-slate-700 font-medium">
            Account Number / IBAN
          </Label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <Input
              id="account_number"
              value={formData.account_number || ''}
              onChange={(e) => onChange({ account_number: e.target.value })}
              placeholder="Bank account number or IBAN"
              className="pl-10 border-slate-200 focus:border-blue-900 focus:ring-blue-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label htmlFor="beneficiary_bank" className="text-slate-700 font-medium">
              Beneficiary Bank
            </Label>
            <div className="relative">
              <Building className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                id="beneficiary_bank"
                value={formData.beneficiary_bank || ''}
                onChange={(e) => onChange({ beneficiary_bank: e.target.value })}
                placeholder="Bank name"
                className="pl-10 border-slate-200 focus:border-blue-900 focus:ring-blue-900"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bic" className="text-slate-700 font-medium">
              BIC/SWIFT Code
            </Label>
            <div className="relative">
              <Hash className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                id="bic"
                value={formData.bic || ''}
                onChange={(e) => onChange({ bic: e.target.value })}
                placeholder="Bank Identifier Code"
                className="pl-10 border-slate-200 focus:border-blue-900 focus:ring-blue-900"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bank_address" className="text-slate-700 font-medium">
            Bank Address
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <Textarea
              id="bank_address"
              value={formData.bank_address || ''}
              onChange={(e) => onChange({ bank_address: e.target.value })}
              placeholder="Full bank address"
              className="pl-10 border-slate-200 focus:border-blue-900 focus:ring-blue-900 min-h-[60px]"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}