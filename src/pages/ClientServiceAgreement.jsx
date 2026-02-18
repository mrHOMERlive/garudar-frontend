import React, { useState } from 'react';
import { apiClient } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Download, Upload, CheckCircle, AlertCircle, FileText, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const SERVICE_AGREEMENT_URL = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69233f5a9a123941f81322f5/3d1a5e4fc_ServiceAgreement-GAN02022026.docx';

export default function ClientServiceAgreement() {
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data: client } = useQuery({
    queryKey: ['currentClient'],
    queryFn: () => apiClient.getMyClient()
  });

  const { data: badges = [] } = useQuery({
    queryKey: ['client-badges', client?.client_id],
    queryFn: async () => {
      if (!client?.client_id) return [];
      const allBadges = await apiClient.getClientBadges(client.client_id);
      return allBadges.filter(b => b.badge_type === 'service_agreement');
    },
    enabled: !!client?.client_id
  });

  const badge = badges[0];

  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      const { file_url } = await apiClient.uploadFile(file);

      if (badge) {
        await apiClient.updateBadge(badge.id, {
          submitted_document_url: file_url,
          status: 'submitted'
        });
      }

      return file_url;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-badges'] });
      toast.success('Signed Service Agreement uploaded successfully');
    },
    onError: () => {
      toast.error('Failed to upload document');
    }
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await uploadMutation.mutateAsync(file);
    } finally {
      setUploading(false);
    }
  };

  if (!client) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  const isSubmitted = badge?.status === 'submitted';
  const isCompleted = badge?.status === 'completed';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-[#1e3a5f] shadow-lg border-b border-[#1e3a5f]/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to={createPageUrl('UserDashboard')} className="inline-flex items-center text-white hover:text-slate-200 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center p-3 shadow-lg">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69233f5a9a123941f81322f5/b1a1be267_gan.png"
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Service Agreement</h1>
              <p className="text-slate-300 text-sm">Download, sign, and upload the agreement</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Banner */}
        {isCompleted && (
          <div className="mb-6 bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
              <div>
                <h3 className="font-semibold text-emerald-900">Agreement Accepted</h3>
                <p className="text-sm text-emerald-700">Your Service Agreement has been reviewed and accepted by GTrans.</p>
              </div>
            </div>
          </div>
        )}

        {isSubmitted && !isCompleted && (
          <div className="mb-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-900">Under Review</h3>
                <p className="text-sm text-blue-700">Your signed Service Agreement is being reviewed by our team.</p>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <Card className="mb-6 border-slate-200">
          <CardHeader>
            <CardTitle className="text-[#1e3a5f]">Instructions</CardTitle>
            <CardDescription>Follow these steps to complete the Service Agreement</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">Download the Agreement</h4>
                <p className="text-sm text-slate-600">Click the download button below to get the Service Agreement document.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">Review and Sign</h4>
                <p className="text-sm text-slate-600">Read the agreement carefully and sign it with authorized signatory.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">Upload Signed Copy</h4>
                <p className="text-sm text-slate-600">Upload the signed agreement using the upload button below.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Download Section */}
        <Card className="mb-6 border-slate-200">
          <CardHeader>
            <CardTitle className="text-[#1e3a5f]">Step 1: Download Agreement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-[#1e3a5f]" />
                <div>
                  <div className="font-medium text-slate-900">Service Agreement</div>
                  <div className="text-sm text-slate-600">DOCX Document</div>
                </div>
              </div>
              <a href={SERVICE_AGREEMENT_URL} download>
                <Button className="bg-[#1e3a5f] hover:bg-[#152a45]">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </a>
            </div>
            {badge?.document_url && badge.document_url !== SERVICE_AGREEMENT_URL && (
              <div className="mt-4">
                <p className="text-sm text-slate-600 mb-2">Alternative document provided by staff:</p>
                <a href={badge.document_url} download>
                  <Button variant="outline" size="sm">
                    <Download className="w-3 h-3 mr-2" />
                    Download Staff Document
                  </Button>
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upload Section */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-[#1e3a5f]">Step 2: Upload Signed Agreement</CardTitle>
            {badge?.staff_comment && (
              <CardDescription className="text-amber-700 font-medium">
                Note from GTrans: {badge.staff_comment}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {badge?.submitted_document_url ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                    <div>
                      <div className="font-medium text-emerald-900">Signed Agreement Uploaded</div>
                      <div className="text-sm text-emerald-700">Your signed document has been submitted</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <a href={badge.submitted_document_url} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline">
                        <Download className="w-3 h-3 mr-2" />
                        View
                      </Button>
                    </a>
                    <label>
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        disabled={uploading || isCompleted}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={uploading || isCompleted}
                        onClick={(e) => e.currentTarget.previousElementSibling?.click()}
                      >
                        <Upload className="w-3 h-3 mr-2" />
                        Replace
                      </Button>
                    </label>
                  </div>
                </div>
              </div>
            ) : (
              <label className="block">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  disabled={uploading}
                />
                <Button
                  className="w-full bg-[#f5a623] hover:bg-[#e09000] py-6"
                  disabled={uploading}
                  onClick={(e) => e.currentTarget.previousElementSibling?.click()}
                >
                  <Upload className="w-5 h-5 mr-2" />
                  {uploading ? 'Uploading...' : 'Upload Signed Agreement'}
                </Button>
              </label>
            )}
            <p className="text-xs text-slate-600 text-center">
              Accepted formats: PDF, DOC, DOCX
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}