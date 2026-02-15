import React, { useState } from 'react';
import { apiClient } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Globe, Upload, FileText, CheckCircle, Download, Loader2 } from 'lucide-react';

export default function ClientSubmitNDA() {
  const [uploadingNDA, setUploadingNDA] = useState(false);

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => apiClient.getCurrentUser()
  });

  const { data: client } = useQuery({
    queryKey: ['currentClient', user?.email],
    queryFn: async () => {
      return await apiClient.getMyClient();
    },
    enabled: !!user
  });

  const { data: badge } = useQuery({
    queryKey: ['nda-badge', client?.client_id],
    queryFn: async () => {
      const response = await apiClient.getClientBadges(client.client_id);
      // Assuming response is array or object with items
      const badges = Array.isArray(response) ? response : (response.items || []);
      return badges.find(b => b.badge_type === 'other_submit');
    },
    enabled: !!client
  });

  const { data: ndaRequests } = useQuery({
    queryKey: ['nda-requests', client?.client_id],
    queryFn: () => apiClient.getNdaRequests({ client_id: client.client_id }),
    enabled: !!client?.client_id
  });

  const ndaRequest = ndaRequests?.[0];

  const updateBadgeMutation = useMutation({
    mutationFn: (data) => apiClient.updateBadge(badge.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nda-badge'] });
      toast.success('NDA submitted successfully');
    }
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingNDA(true);
    try {
      const response = await apiClient.uploadFile(file, client.client_id, ndaRequest?.id);
      const file_url = response.file_url || response.url || response.path;
      await updateBadgeMutation.mutateAsync({
        submitted_document_url: file_url,
        status: 'submitted'
      });
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploadingNDA(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-[#1e3a5f] border-b border-[#1e3a5f]/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={createPageUrl('UserDashboard')}>
                <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/10">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-2 shadow-lg">
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69233f5a9a123941f81322f5/b1a1be267_gan.png"
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-white">GTrans</h1>
                  <span className="text-xs bg-emerald-500 px-2 py-1 rounded text-white font-medium">CLIENT</span>
                </div>
                <p className="text-slate-300 text-sm">Submit NDA Document</p>
              </div>
            </div>
            <Link to={createPageUrl('GTrans')}>
              <Button className="bg-white text-[#1e3a5f] hover:bg-slate-100">
                <Globe className="w-4 h-4 mr-2" />
                Public Site
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="text-[#1e3a5f] flex items-center gap-2">
              <FileText className="w-6 h-6" />
              NDA Document Submission
            </CardTitle>
            <CardDescription>
              {badge?.staff_comment || 'Please download, sign, and upload the NDA document.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Document to Download */}
            {badge?.document_url && (
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-[#1e3a5f]">NDA Template</h3>
                      <p className="text-sm text-slate-500">Download this document, sign it, and upload below</p>
                    </div>
                  </div>
                  <a href={badge.document_url} target="_blank" rel="noopener noreferrer">
                    <Button className="bg-[#1e3a5f] hover:bg-[#152a45]">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </a>
                </div>
              </div>
            )}

            {/* Upload Section */}
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
              {badge?.status === 'submitted' && badge?.submitted_document_url ? (
                <div className="space-y-4">
                  <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold text-emerald-600">Document Submitted</h3>
                    <p className="text-sm text-slate-500 mt-1">Your NDA has been submitted and is under review</p>
                  </div>
                  <a href={badge.submitted_document_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="border-slate-300">
                      <Download className="w-4 h-4 mr-2" />
                      View Submitted Document
                    </Button>
                  </a>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="w-16 h-16 text-slate-400 mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold text-[#1e3a5f]">Upload Signed NDA</h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Upload the signed NDA document (PDF format)
                    </p>
                  </div>
                  <div>
                    <input
                      type="file"
                      id="nda-upload"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploadingNDA}
                    />
                    <label htmlFor="nda-upload">
                      <Button
                        className="bg-[#1e3a5f] hover:bg-[#152a45]"
                        disabled={uploadingNDA}
                        asChild
                      >
                        <span>
                          {uploadingNDA ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              Select File
                            </>
                          )}
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Status Badge */}
            {badge && (
              <div className="flex items-center justify-center gap-2 text-sm">
                <span className="text-slate-600">Status:</span>
                <span className={`font-medium ${badge.status === 'submitted' ? 'text-blue-600' :
                  badge.status === 'completed' ? 'text-emerald-600' :
                    badge.status === 'need_signing' ? 'text-red-600' :
                      'text-amber-600'
                  }`}>
                  {badge.status?.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}