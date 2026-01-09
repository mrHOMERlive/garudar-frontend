import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CheckCircle, XCircle } from 'lucide-react';

export default function StaffKYCDrawer({ open, onClose, kycProfile, client }) {
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');

  const updateKYCMutation = useMutation({
    mutationFn: async ({ status, comment }) => {
      const user = await base44.auth.me();
      await base44.entities.OnboardingKYC.update(kycProfile.id, {
        status,
        decision_comment: comment,
        decided_at: new Date().toISOString(),
        decided_by: user.email
      });
      await base44.entities.Client.update(client.id, {
        kyc_status: status,
        kyc_decided_at: new Date().toISOString(),
        kyc_decided_by: user.email
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['kycQueue']);
      toast.success('KYC decision recorded');
      onClose();
    }
  });

  const handleApprove = () => {
    updateKYCMutation.mutate({ status: 'approved', comment });
  };

  const handleReject = () => {
    if (!comment) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    updateKYCMutation.mutate({ status: 'rejected', comment });
  };

  if (!kycProfile || !client) return null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>KYC Review - {kycProfile.company_name}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div>
            <h4 className="font-semibold mb-2">Client Information</h4>
            <div className="text-sm space-y-1 text-slate-600">
              <div>Client: {client.name}</div>
              <div>Email: {client.email}</div>
              <div>Status: <Badge>{kycProfile.status}</Badge></div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Corporate Details</h4>
            <div className="text-sm space-y-1 text-slate-600">
              <div>Company: {kycProfile.company_name}</div>
              <div>Trading Name: {kycProfile.trading_name}</div>
              <div>Incorporation: {kycProfile.incorporation_country}, {kycProfile.incorporation_date}</div>
              <div>Tax ID: {kycProfile.tax_id}</div>
              <div>Registration: {kycProfile.registration_number}</div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Banking Details</h4>
            <div className="text-sm space-y-1 text-slate-600">
              <div>Bank: {kycProfile.principal_bankers}</div>
              <div>SWIFT: {kycProfile.swift_bic}</div>
              <div>Account: {kycProfile.bank_account_number}</div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Documents</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                { field: 'cert_incorporation', label: 'Certificate' },
                { field: 'register_of_commerce', label: 'Register' },
                { field: 'memorandum_articles', label: 'Memorandum' },
                { field: 'shareholders_list', label: 'Shareholders' }
              ].map(doc => (
                <div key={doc.field}>
                  {kycProfile[doc.field] ? (
                    <a href={kycProfile[doc.field]} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {doc.label} ✓
                    </a>
                  ) : (
                    <span className="text-slate-400">{doc.label} -</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Decision Comment</Label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add comments about your decision..."
              className="min-h-[100px] mt-2"
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleApprove}
              disabled={updateKYCMutation.isPending}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </Button>
            <Button
              onClick={handleReject}
              disabled={updateKYCMutation.isPending}
              variant="destructive"
              className="flex-1"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}