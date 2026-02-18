import React, { useState } from 'react';
import { apiClient } from '@/api/apiClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, Upload, Download, CheckCircle, AlertCircle,
  Clock, FileText, Users, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';

const DEFAULT_MASTER_URL = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69233f5a9a123941f81322f5/3d1a5e4fc_ServiceAgreement-GAN02022026.docx';

export default function StaffServiceAgreement() {
  const [uploadingMaster, setUploadingMaster] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [editingComment, setEditingComment] = useState('');
  const queryClient = useQueryClient();

  const { data: badges = [] } = useQuery({
    queryKey: ['service-agreement-badges'],
    queryFn: () => apiClient.getBadgesByType('service_agreement')
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['all-clients'],
    queryFn: () => apiClient.getAllClients()
  });

  const updateBadgeMutation = useMutation({
    mutationFn: ({ id, data }) => apiClient.updateBadge(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-agreement-badges'] });
      toast.success('Updated successfully');
      setSelectedClient(null);
    },
    onError: () => {
      toast.error('Failed to update');
    }
  });

  const createBadgeMutation = useMutation({
    mutationFn: ({ client_id, ...data }) => apiClient.createServiceAgreementBadge(client_id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-agreement-badges'] });
      toast.success('Badge created successfully');
    }
  });

  const handleUploadMaster = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingMaster(true);
    try {
      const { file_url } = await apiClient.uploadFile(file);
      toast.success('Master document uploaded');

      // Update all active badges with new master document
      const activeBadges = badges.filter(b => b.is_active);
      for (const badge of activeBadges) {
        await apiClient.updateBadge(badge.id, {
          document_url: file_url
        });
      }
      queryClient.invalidateQueries({ queryKey: ['service-agreement-badges'] });
    } catch (error) {
      toast.error('Failed to upload master document');
    } finally {
      setUploadingMaster(false);
    }
  };

  const handleDownloadMaster = async () => {
    setIsGenerating(true);
    try {
      // Generate empty template
      const blob = await apiClient.generateServiceAgreement({
        fields: {},
        upload_to_s3: false
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Service_Agreement_Master.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      toast.success('Master Agreement generated successfully');
    } catch (error) {
      console.error('Failed to generate agreement:', error);
      toast.error('Failed to generate Master Agreement');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStatusChange = (badgeId, newStatus) => {
    updateBadgeMutation.mutate({
      id: badgeId,
      data: { status: newStatus }
    });
  };

  const handleToggleActive = (badgeId, currentActive) => {
    updateBadgeMutation.mutate({
      id: badgeId,
      data: { is_active: !currentActive }
    });
  };

  const handleSaveComment = (badgeId) => {
    updateBadgeMutation.mutate({
      id: badgeId,
      data: { staff_comment: editingComment }
    });
  };

  const handleCreateForClient = (clientId) => {
    createBadgeMutation.mutate({
      client_id: clientId,
      badge_type: 'service_agreement',
      status: 'pending',
      is_active: true,
      document_url: DEFAULT_MASTER_URL
    });
  };

  const getStatusBadge = (status) => {
    const configs = {
      pending: { bg: 'bg-amber-100', text: 'text-amber-800', icon: Clock },
      need_signing: { bg: 'bg-orange-100', text: 'text-orange-800', icon: AlertCircle },
      submitted: { bg: 'bg-blue-100', text: 'text-blue-800', icon: FileText },
      completed: { bg: 'bg-emerald-100', text: 'text-emerald-800', icon: CheckCircle }
    };
    const config = configs[status] || configs.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status?.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const badgesByClient = badges.reduce((acc, badge) => {
    acc[badge.client_id] = badge;
    return acc;
  }, {});

  const stats = {
    total: badges.length,
    pending: badges.filter(b => b.status === 'pending').length,
    submitted: badges.filter(b => b.status === 'submitted').length,
    completed: badges.filter(b => b.status === 'completed').length
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-[#1e3a5f] shadow-lg border-b border-[#1e3a5f]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to={createPageUrl('StaffDashboard')} className="inline-flex items-center text-white hover:text-slate-200 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center p-3 shadow-lg">
              <FileText className="w-8 h-8 text-[#1e3a5f]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Service Agreement Management</h1>
              <p className="text-slate-300 text-sm">Manage master documents and client submissions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-[#1e3a5f]">{stats.total}</div>
              <div className="text-sm text-slate-600">Total Badges</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-amber-600">{stats.pending}</div>
              <div className="text-sm text-slate-600">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-600">{stats.submitted}</div>
              <div className="text-sm text-slate-600">Submitted</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-emerald-600">{stats.completed}</div>
              <div className="text-sm text-slate-600">Completed</div>
            </CardContent>
          </Card>
        </div>

        {/* Master Document Upload */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Master Document</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={handleDownloadMaster}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                {isGenerating ? 'Generating...' : 'Download Current Template'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Client Badges List */}
        <Card>
          <CardHeader>
            <CardTitle>Client Service Agreements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {clients.map(client => {
                const badge = badgesByClient[client.client_id];

                return (
                  <div key={client.client_id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-slate-600" />
                        <div>
                          <div className="font-semibold text-slate-900">{client.client_name}</div>
                          <div className="text-sm text-slate-600">{client.client_mail}</div>
                        </div>
                      </div>

                    </div>

                    {badge && (
                      <div className="space-y-3 pt-3 border-t border-slate-200">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-xs text-slate-600">Status</Label>
                            <Select
                              value={badge.status}
                              onValueChange={(value) => handleStatusChange(badge.id, value)}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="not_required">Not Required</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="need_signing">Need Signing</SelectItem>
                                <SelectItem value="submitted">Submitted</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs text-slate-600">Documents</Label>
                            <div className="flex gap-2 mt-1">
                              {badge.submitted_document_url && (
                                <a href={badge.submitted_document_url} target="_blank" rel="noopener noreferrer">
                                  <Button size="sm" variant="outline">
                                    <Download className="w-3 h-3 mr-1" />
                                    Signed
                                  </Button>
                                </a>
                              )}
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs text-slate-600">Staff Comment</Label>
                          <div className="flex gap-2 mt-1">
                            <Textarea
                              value={selectedClient === badge.id ? editingComment : (badge.staff_comment || '')}
                              onChange={(e) => setEditingComment(e.target.value)}
                              onFocus={() => {
                                setSelectedClient(badge.id);
                                setEditingComment(badge.staff_comment || '');
                              }}
                              placeholder="Add notes for client..."
                              className="flex-1"
                              rows={2}
                            />
                            {selectedClient === badge.id && (
                              <Button
                                size="sm"
                                onClick={() => handleSaveComment(badge.id)}
                              >
                                Save
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}