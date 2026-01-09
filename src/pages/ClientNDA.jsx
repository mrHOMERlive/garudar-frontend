import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { ArrowLeft, Send, Download, Upload } from 'lucide-react';

export default function ClientNDA() {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: client, isLoading: clientLoading } = useQuery({
    queryKey: ['currentClient', user?.email],
    queryFn: async () => {
      const clients = await base44.entities.Client.filter({ email: user.email });
      if (clients[0]) return clients[0];
      
      // Auto-create client for testing
      const newClient = await base44.entities.Client.create({
        client_id: `CLI-${Date.now()}`,
        name: user.full_name || user.email,
        email: user.email,
        login: user.email,
        password: 'temp123',
        kyc_status: 'created',
        nda_status: 'not_started'
      });
      return newClient;
    },
    enabled: !!user
  });

  const { data: ndaRequest } = useQuery({
    queryKey: ['ndaRequest', client?.id],
    queryFn: async () => {
      const requests = await base44.entities.NDARequest.filter({ client_id: client.id });
      return requests[0];
    },
    enabled: !!client
  });

  const [formData, setFormData] = useState({
    effective_date: '',
    term_ru: '',
    term_en: '',
    partner_inn: '',
    partner_name_ru: '',
    partner_address_ru: '',
    partner_name_en: '',
    partner_address_en: '',
    partner_signatory_ru: '',
    partner_signatory_en: '',
    partner_contact_name: '',
    partner_contact_email: '',
    partner_contact_phone: '',
    paper_copy_required: false
  });

  const createNDAMutation = useMutation({
    mutationFn: async (data) => {
      if (ndaRequest) {
        return await base44.entities.NDARequest.update(ndaRequest.id, data);
      } else {
        return await base44.entities.NDARequest.create({ ...data, client_id: client.id, status: 'draft' });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['ndaRequest']);
      toast.success('NDA information saved');
    }
  });

  const submitNDAMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.NDARequest.update(ndaRequest.id, {
        status: 'submitted',
        submitted_at: new Date().toISOString()
      });
      await base44.entities.Client.update(client.id, { nda_status: 'submitted' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['ndaRequest']);
      queryClient.invalidateQueries(['currentClient']);
      toast.success('NDA submitted for review!');
    }
  });

  const handleFileUpload = async (file) => {
    if (!file || !ndaRequest) return;
    
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.NDARequest.update(ndaRequest.id, { signed_file_url: file_url });
      queryClient.invalidateQueries(['ndaRequest']);
      toast.success('Signed NDA uploaded');
    } catch (error) {
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    createNDAMutation.mutate({ ...ndaRequest, ...formData });
  };

  const handleSubmit = () => {
    if (!ndaRequest) {
      toast.error('Please save NDA information first');
      return;
    }
    submitNDAMutation.mutate();
  };

  if (clientLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#1e3a5f] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!client) return <div>Error loading client data</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-[#1e3a5f] shadow-lg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to={createPageUrl('UserDashboard')}>
            <Button variant="ghost" className="text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1e3a5f] mb-2">NDA Request</h1>
          <p className="text-slate-600">Submit your Non-Disclosure Agreement information</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Partner Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Effective Date *</Label>
                <Input
                  type="date"
                  value={formData.effective_date || ndaRequest?.effective_date || ''}
                  onChange={(e) => handleChange('effective_date', e.target.value)}
                />
              </div>
              <div>
                <Label>Partner INN</Label>
                <Input
                  value={formData.partner_inn || ndaRequest?.partner_inn || ''}
                  onChange={(e) => handleChange('partner_inn', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label>Partner Name (Russian) *</Label>
              <Input
                value={formData.partner_name_ru || ndaRequest?.partner_name_ru || ''}
                onChange={(e) => handleChange('partner_name_ru', e.target.value)}
              />
            </div>

            <div>
              <Label>Partner Name (English) *</Label>
              <Input
                value={formData.partner_name_en || ndaRequest?.partner_name_en || ''}
                onChange={(e) => handleChange('partner_name_en', e.target.value)}
              />
            </div>

            <div>
              <Label>Partner Address (Russian)</Label>
              <Input
                value={formData.partner_address_ru || ndaRequest?.partner_address_ru || ''}
                onChange={(e) => handleChange('partner_address_ru', e.target.value)}
              />
            </div>

            <div>
              <Label>Partner Address (English)</Label>
              <Input
                value={formData.partner_address_en || ndaRequest?.partner_address_en || ''}
                onChange={(e) => handleChange('partner_address_en', e.target.value)}
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Contact Name</Label>
                <Input
                  value={formData.partner_contact_name || ndaRequest?.partner_contact_name || ''}
                  onChange={(e) => handleChange('partner_contact_name', e.target.value)}
                />
              </div>
              <div>
                <Label>Contact Email</Label>
                <Input
                  type="email"
                  value={formData.partner_contact_email || ndaRequest?.partner_contact_email || ''}
                  onChange={(e) => handleChange('partner_contact_email', e.target.value)}
                />
              </div>
              <div>
                <Label>Contact Phone</Label>
                <Input
                  value={formData.partner_contact_phone || ndaRequest?.partner_contact_phone || ''}
                  onChange={(e) => handleChange('partner_contact_phone', e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="paper_copy"
                checked={formData.paper_copy_required || ndaRequest?.paper_copy_required || false}
                onCheckedChange={(checked) => handleChange('paper_copy_required', checked)}
              />
              <label htmlFor="paper_copy" className="text-sm">Paper copy required</label>
            </div>
          </CardContent>
        </Card>

        {ndaRequest?.generated_file_url && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Generated NDA</CardTitle>
            </CardHeader>
            <CardContent>
              <a href={ndaRequest.generated_file_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download Generated NDA
                </Button>
              </a>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Upload Signed NDA</CardTitle>
          </CardHeader>
          <CardContent>
            <label>
              <input
                type="file"
                onChange={(e) => handleFileUpload(e.target.files?.[0])}
                className="hidden"
                accept=".pdf"
                disabled={!ndaRequest}
              />
              <Button
                type="button"
                variant="outline"
                disabled={uploading || !ndaRequest}
                onClick={(e) => e.currentTarget.previousElementSibling?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? 'Uploading...' : 'Upload Signed NDA'}
              </Button>
            </label>
            {ndaRequest?.signed_file_url && (
              <div className="mt-3">
                <a href={ndaRequest.signed_file_url} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    View Uploaded NDA
                  </Button>
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={createNDAMutation.isPending}
          >
            Save Progress
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitNDAMutation.isPending || !ndaRequest}
            className="bg-[#1e3a5f] hover:bg-[#152a45]"
          >
            <Send className="w-4 h-4 mr-2" />
            Submit NDA
          </Button>
        </div>
      </div>
    </div>
  );
}