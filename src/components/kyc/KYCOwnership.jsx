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

  // Sort UBOs to ensure stable order
  const sortedUbos = useMemo(() => {
    return [...ubos].sort((a, b) => a.id - b.id);
  }, [ubos]);

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
      const currentUbo = ubos.find(u => u.id === uboId);
      const payload = {
        ubo_name: currentUbo?.ubo_name,
        shareholding_percent: currentUbo?.shareholding_percent,
        nationality: currentUbo?.nationality,
        residence_country: currentUbo?.residence_country,
        [field]: value
      };

      await apiClient.updateUbo(clientId, uboId, payload);
      queryClient.invalidateQueries(['ubos']);
    } catch (error) {
      console.error('Update failed:', error);
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

      {sortedUbos.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-slate-500">
            {language === 'en'
              ? 'No shareholders added yet. Click "Add Shareholder" to begin.'
              : 'Belum ada pemegang saham. Klik "Tambah Pemegang Saham" untuk memulai.'}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedUbos.map((ubo, idx) => (
            <ShareholderItem
              key={ubo.id}
              ubo={ubo}
              index={idx}
              language={language}
              countries={countries}
              onUpdate={handleUpdateUBO}
              onDelete={(id) => deleteUBOMutation.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ShareholderItem({ ubo, index, language, countries, onUpdate, onDelete }) {
  const [localState, setLocalState] = useState({
    ubo_name: ubo.ubo_name || '',
    shareholding_percent: ubo.shareholding_percent || 0,
    nationality: ubo.nationality || '',
    residence_country: ubo.residence_country || ''
  });

  // Sync local state when prop updates (e.g. initial load or external update)
  useEffect(() => {
    setLocalState({
      ubo_name: ubo.ubo_name || '',
      shareholding_percent: ubo.shareholding_percent || 0,
      nationality: ubo.nationality || '',
      residence_country: ubo.residence_country || ''
    });
  }, [ubo.ubo_name, ubo.shareholding_percent, ubo.nationality, ubo.residence_country]);

  const handleChange = (field, value) => {
    setLocalState(prev => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field, value) => {
    // Only update if value matches what's in local state (it should)
    // and is different from prop (handled by diff check usually, but api call is cheap enough if checked)
    if (value !== ubo[field]) {
      onUpdate(ubo.id, field, value);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="flex-1 grid gap-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-[#1e3a5f]">
                {language === 'en' ? `Shareholder ${index + 1}` : `Pemegang Saham ${index + 1}`}
              </h4>
            </div>
            <div>
              <Label>4.1 {language === 'en' ? 'Shareholder and UBO Name (As per Passport or License document)' : 'Nama Pemegang Saham dan UBO (Sesuai Paspor atau Dokumen Izin)'} *</Label>
              <Input
                value={localState.ubo_name}
                onChange={(e) => handleChange('ubo_name', e.target.value)}
                onBlur={(e) => handleBlur('ubo_name', e.target.value)}
              />
            </div>
            <div>
              <Label>4.2 {language === 'en' ? 'Shareholding %' : 'Persentase Kepemilikan %'} *</Label>
              <Input
                type="number"
                min="0"
                max="100"
                value={localState.shareholding_percent}
                onChange={(e) => {
                  let val = e.target.value;
                  if (parseFloat(val) > 100) val = "100";
                  if (parseFloat(val) < 0) val = "0";
                  handleChange('shareholding_percent', val);
                }}
                onBlur={(e) => {
                  const val = parseFloat(e.target.value);
                  const finalVal = isNaN(val) ? 0 : val;
                  handleBlur('shareholding_percent', finalVal);
                  // Normalize display value
                  handleChange('shareholding_percent', finalVal);
                }}
              />
            </div>
            <div>
              <Label>4.3 {language === 'en' ? 'Nationality and Country of Residence' : 'Kewarganegaraan dan Negara Tempat Tinggal'}</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder={language === 'en' ? 'Nationality' : 'Kewarganegaraan'}
                  value={localState.nationality}
                  onChange={(e) => handleChange('nationality', e.target.value)}
                  onBlur={(e) => handleBlur('nationality', e.target.value)}
                />
                <CountrySelector
                  value={localState.residence_country}
                  onChange={(value) => {
                    // Ensure we send the code, not the name
                    let finalValue = value;
                    const countryObj = countries.find(c => c.name === value || c.code === value);
                    if (countryObj) {
                      finalValue = countryObj.code;
                    }
                    handleChange('residence_country', finalValue);
                    handleBlur('residence_country', finalValue);
                  }}
                  language={language}
                  countries={countries}
                />
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(ubo.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}