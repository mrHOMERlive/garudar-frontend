import React, { useState } from 'react';
import { apiClient } from '@/api/apiClient';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CheckCircle, XCircle, AlertCircle, Download } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { t } from '@/components/utils/language';

export default function StaffKYCDrawer({ open, onClose, kycProfile, client, ubos = [], isLoading }) {
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');

  // Access nested data from the new API structure
  // kycProfile structure: { status, data: { corporate: {}, banking: {}, declaration: {} } }
  const corporate = kycProfile?.data?.corporate || {};
  const banking = kycProfile?.data?.banking || {};
  const status = kycProfile?.status || 'UNKNOWN';
  const clientId = client?.client_id || client?.user_id; // Check both potential ID fields

  // Fetch documents list
  const { data: documents = [] } = useQuery({
    queryKey: ['kycDocuments', clientId],
    queryFn: () => apiClient.listKycDocuments(clientId),
    enabled: !!clientId && open,
  });

  const decisionMutation = useMutation({
    mutationFn: async ({ status, comment }) => {
      await apiClient.makeKycDecision(clientId, { status, comment });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['kycQueue']);
      queryClient.invalidateQueries(['kycProfile', clientId]);
      toast.success(t('drKycDecisionRecorded'));
      onClose();
    },
    onError: (error) => {
      toast.error(`${t('drFailedRecordDecision')}: ${error.message}`);
    },
  });

  const handleApprove = () => {
    decisionMutation.mutate({ status: 'approved', comment });
  };

  const handleReject = () => {
    if (!comment) {
      toast.error(t('drFailedRecordDecision'));
      return;
    }
    decisionMutation.mutate({ status: 'rejected', comment });
  };

  const handleNeedsFix = () => {
    if (!comment) {
      toast.error(t('drFailedRecordDecision'));
      return;
    }
    decisionMutation.mutate({ status: 'needs_fix', comment });
  };

  const handleDownload = async (doc) => {
    try {
      const blob = await apiClient.downloadKycDocument(clientId, doc.doc_id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.file_name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(`Failed to download document: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-2xl flex flex-col">
          <SheetHeader>
            <SheetTitle>Loading KYC Profile</SheetTitle>
            <SheetDescription>Please wait while the data is being fetched...</SheetDescription>
          </SheetHeader>
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#1e3a5f]" />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  if (!kycProfile || !client) return null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>KYC Review - {corporate.company_name || 'Unknown Company'}</SheetTitle>
          <SheetDescription>Review and process the KYC application below.</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div>
            <h4 className="font-semibold mb-2 text-[#1e3a5f]">Client Information</h4>
            <CardBox>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-slate-600">
                <div>
                  <span className="font-medium text-slate-800">Client Name:</span>{' '}
                  {client.client_name || client.username}
                </div>
                <div>
                  <span className="font-medium text-slate-800">Email:</span> {client.client_mail || client.email}
                </div>
                <div>
                  <span className="font-medium text-slate-800">Status:</span>{' '}
                  <Badge variant={status === 'approved' ? 'success' : 'secondary'}>{status.toUpperCase()}</Badge>
                </div>
                {kycProfile.submitted_at && (
                  <div className="col-span-2">
                    <span className="font-medium text-slate-800">Submitted:</span>{' '}
                    {new Date(kycProfile.submitted_at).toLocaleString()}
                  </div>
                )}
              </div>
            </CardBox>
          </div>

          <div>
            <h4 className="font-semibold mb-2 text-[#1e3a5f]">Corporate Details</h4>
            <CardBox>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-slate-600">
                <div className="col-span-2">
                  <span className="font-medium text-slate-800">Company Name:</span> {corporate.company_name}
                </div>
                <div className="col-span-2">
                  <span className="font-medium text-slate-800">Trading Name:</span> {corporate.trading_name || '-'}
                </div>
                <div>
                  <span className="font-medium text-slate-800">Country:</span> {corporate.incorporation_country}
                </div>
                <div>
                  <span className="font-medium text-slate-800">Date:</span> {corporate.incorporation_date}
                </div>
                <div>
                  <span className="font-medium text-slate-800">Tax ID:</span> {corporate.tax_id}
                </div>
                <div>
                  <span className="font-medium text-slate-800">Reg. Num:</span> {corporate.registration_number}
                </div>
                <div className="col-span-2">
                  <span className="font-medium text-slate-800">Address:</span> {corporate.registered_address}
                </div>
              </div>
            </CardBox>
          </div>

          <div>
            <h4 className="font-semibold mb-2 text-[#1e3a5f]">Banking Details</h4>
            <CardBox>
              <div className="grid grid-cols-1 gap-y-2 text-sm text-slate-600">
                <div>
                  <span className="font-medium text-slate-800">Bank Name:</span> {banking.principal_bankers}
                </div>
                <div>
                  <span className="font-medium text-slate-800">SWIFT/BIC:</span> {banking.swift_bic}
                </div>
                <div>
                  <span className="font-medium text-slate-800">Account Number:</span> {banking.bank_account_number}
                </div>
                <div>
                  <span className="font-medium text-slate-800">Account Currency:</span> {banking.bank_account_currency}
                </div>
                <div>
                  <span className="font-medium text-slate-800">Bank Address:</span> {banking.bank_branch_address},{' '}
                  {banking.bank_city_country}
                </div>
              </div>
            </CardBox>
          </div>

          <div>
            <h4 className="font-semibold mb-2 text-[#1e3a5f]">Ownership / UBO</h4>
            <CardBox>
              {ubos.length === 0 ? (
                <div className="text-sm text-slate-500 italic">No shareholders/UBOs provided.</div>
              ) : (
                <div className="space-y-3">
                  {ubos.map((ubo, idx) => (
                    <div key={ubo.id} className="p-3 bg-slate-50 rounded border border-slate-100">
                      <div className="font-medium text-slate-800 mb-1">Shareholder {idx + 1}</div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-slate-600">
                        <div>
                          <span className="font-medium text-slate-800">Name:</span> {ubo.ubo_name || '-'}
                        </div>
                        <div>
                          <span className="font-medium text-slate-800">Shareholding:</span>{' '}
                          {ubo.shareholding_percent != null ? `${ubo.shareholding_percent}%` : '-'}
                        </div>
                        <div>
                          <span className="font-medium text-slate-800">Nationality:</span> {ubo.nationality || '-'}
                        </div>
                        <div>
                          <span className="font-medium text-slate-800">Residence:</span> {ubo.residence_country || '-'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBox>
          </div>

          <div>
            <h4 className="font-semibold mb-2 text-[#1e3a5f]">Uploaded Documents</h4>
            <CardBox>
              {documents.length === 0 ? (
                <div className="text-sm text-slate-500 italic">No documents uploaded.</div>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.doc_id}
                      className="flex items-center justify-between text-sm p-2 bg-slate-50 rounded border border-slate-100"
                    >
                      <span className="font-medium capitalize text-slate-700">{doc.doc_type.replace(/_/g, ' ')}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(doc)}
                        className="h-8 text-blue-600 hover:text-blue-800"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {doc.file_name}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardBox>
          </div>

          <div>
            <Label className="mb-2 block font-semibold text-[#1e3a5f]">Decision Comment</Label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t('drAddCommentsAboutDecision')}
              className="min-h-[100px]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex gap-3">
              <Button
                onClick={handleApprove}
                disabled={decisionMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </Button>

              <Button
                onClick={handleNeedsFix}
                disabled={decisionMutation.isPending}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                Request Changes
              </Button>
            </div>
            <Button
              onClick={handleReject}
              disabled={decisionMutation.isPending}
              variant="destructive"
              className="w-full"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject Application
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function CardBox({ children }) {
  return <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">{children}</div>;
}
