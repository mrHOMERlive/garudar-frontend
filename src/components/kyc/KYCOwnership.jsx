import React, { useState, useEffect, useMemo } from 'react';
import { apiClient } from '@/api/apiClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import CountrySelector from './CountrySelector';

export default function KYCOwnership({ formData = {}, ubos = [], clientId, kycProfileId, language = 'en' }) {
  const queryClient = useQueryClient();
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const countriesData = await apiClient.getCountries();
        setCountries(Array.isArray(countriesData) ? countriesData : []);
      } catch (error) {
        console.error('Failed to load countries:', error);
        setCountries([]);
      }
    };
    fetchCountries();
  }, []);

  const addUBOMutation = useMutation({
    mutationFn: (data) => apiClient.createUbo(clientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['ubos']);
      toast.success(language === 'en' ? 'Shareholder added' : 'Pemegang saham ditambahkan');
    }
  });

  const deleteUBOMutation = useMutation({
    mutationFn: (id) => apiClient.deleteUbo(clientId, id),
    onSuccess: () => {
      queryClient.invalidateQueries(['ubos']);
      toast.success(language === 'en' ? 'Shareholder removed' : 'Pemegang saham dihapus');
    }
  });

  const handleAddUBO = () => {
    if (!clientId) {
      toast.error(language === 'en' ? 'Client ID missing' : 'ID Klien hilang');
      return;
    }
    addUBOMutation.mutate({
      ubo_name: 'New Shareholder',
      shareholding_percent: 0,
      nationality: '',
      residence_country: ''
    });
  };

  const handleUpdateUBO = async (uboId, field, value) => {
    try {
      await apiClient.updateUbo(clientId, uboId, { [field]: value });
      queryClient.invalidateQueries(['ubos']);
    } catch (error) {
      toast.error(language === 'en' ? 'Failed to update' : 'Gagal memperbarui');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-[#1e3a5f]">
          {language === 'en' ? '4. Ownership Information' : '4. Informasi Kepemilikan'}
        </h3>
        <Button onClick={handleAddUBO} size="sm" disabled={!kycProfileId}>
          <Plus className="w-4 h-4 mr-2" />
          {language === 'en' ? 'Add Shareholder' : 'Tambah Pemegang Saham'}
        </Button>
      </div>

      {ubos.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-slate-500">
            {language === 'en'
              ? 'No shareholders added yet. Click "Add Shareholder" to begin.'
              : 'Belum ada pemegang saham. Klik "Tambah Pemegang Saham" untuk memulai.'}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {ubos.map((ubo, idx) => (
            <Card key={ubo.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex-1 grid gap-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-[#1e3a5f]">
                        {language === 'en' ? `Shareholder ${idx + 1}` : `Pemegang Saham ${idx + 1}`}
                      </h4>
                    </div>
                    <div>
                      <Label>4.1 {language === 'en' ? 'Shareholder and UBO Name (As per Passport or License document)' : 'Nama Pemegang Saham dan UBO (Sesuai Paspor atau Dokumen Izin)'} *</Label>
                      <Input
                        value={ubo.ubo_name || ''}
                        onChange={(e) => handleUpdateUBO(ubo.id, 'ubo_name', e.target.value)}
                        onBlur={(e) => handleUpdateUBO(ubo.id, 'ubo_name', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>4.2 {language === 'en' ? 'Shareholding %' : 'Persentase Kepemilikan %'} *</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={ubo.shareholding_percent || 0}
                        onChange={(e) => handleUpdateUBO(ubo.id, 'shareholding_percent', parseFloat(e.target.value))}
                        onBlur={(e) => handleUpdateUBO(ubo.id, 'shareholding_percent', parseFloat(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label>4.3 {language === 'en' ? 'Nationality and Country of Residence' : 'Kewarganegaraan dan Negara Tempat Tinggal'}</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder={language === 'en' ? 'Nationality' : 'Kewarganegaraan'}
                          value={ubo.nationality || ''}
                          onChange={(e) => handleUpdateUBO(ubo.id, 'nationality', e.target.value)}
                          onBlur={(e) => handleUpdateUBO(ubo.id, 'nationality', e.target.value)}
                        />
                        <CountrySelector
                          value={ubo.residence_country}
                          onChange={(value) => handleUpdateUBO(ubo.id, 'residence_country', value)}
                          language={language}
                          countries={countries}
                        />
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteUBOMutation.mutate(ubo.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}