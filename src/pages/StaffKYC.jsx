import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { apiClient } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Search, User, Building2, ArrowLeft, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { t } from '@/components/utils/language';

export default function StaffKYC() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchAllData, setSearchAllData] = useState(false);
  const [activeTab, setActiveTab] = useState('individual');
  const [selectedRecord, setSelectedRecord] = useState(null);

  // entryType: 1 = Individual, 2 = Corporate
  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ['kycSearch', searchQuery, activeTab, searchAllData],
    queryFn: () => apiClient.searchEntries(searchQuery, activeTab === 'individual' ? 1 : 2, searchAllData ? '1' : '0'),
    enabled: searchQuery.length > 0,
  });

  const handleSearch = () => {
    setSelectedRecord(null);
  };

  if (selectedRecord) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-[#1e3a5f] border-b shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link to={createPageUrl('StaffDashboard')}>
                  <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/10">
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                </Link>
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-2 shadow-lg">
                  <img src="/gan.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-white">{t('staffKycHeaderTitle')}</h1>
                    <span className="text-xs bg-[#f5a623] px-2 py-1 rounded text-white font-medium">
                      {t('staffLabel')}
                    </span>
                  </div>
                  <p className="text-slate-300 text-sm">{t('staffKycHeaderSubtitle')}</p>
                </div>
              </div>
              <Link to={createPageUrl('StaffDashboard')}>
                <Button className="bg-white text-[#1e3a5f] hover:bg-slate-100">
                  <Globe className="w-4 h-4 mr-2" />
                  {t('dashboard')}
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button variant="outline" onClick={() => setSelectedRecord(null)} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('staffKycBackToResults')}
          </Button>

          <Card className="border-slate-200">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      'w-16 h-16 rounded-full flex items-center justify-center',
                      selectedRecord.entryType === 'Individual' ? 'bg-[#1e3a5f]/10' : 'bg-[#f5a623]/10'
                    )}
                  >
                    {selectedRecord.entryType === 'Individual' ? (
                      <User className="w-8 h-8 text-[#1e3a5f]" />
                    ) : (
                      <Building2 className="w-8 h-8 text-[#f5a623]" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-[#1e3a5f] mb-2">{selectedRecord.fullName}</h2>
                    <p className="text-slate-600">
                      {t('staffKycTypeLabelText')}:{' '}
                      {selectedRecord.entryType === 'Individual'
                        ? t('staffKycTypeIndividual')
                        : t('staffKycTypeCorporate')}{' '}
                      | {t('staffKycSourceLabelText')}: {selectedRecord.sourceList} | {t('staffKycLoadDateLabelText')}:{' '}
                      {selectedRecord.loadDate ? new Date(selectedRecord.loadDate).toLocaleDateString() : '-'}
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {selectedRecord.tittle && (
                    <div>
                      <Label className="text-slate-500">{t('staffKycTitleLabel')}</Label>
                      <p className="text-slate-900 font-medium">{selectedRecord.tittle}</p>
                    </div>
                  )}
                  {selectedRecord.jobTitle && (
                    <div>
                      <Label className="text-slate-500">{t('staffKycJobTitleLabel')}</Label>
                      <p className="text-slate-900 font-medium">{selectedRecord.jobTitle}</p>
                    </div>
                  )}
                  {selectedRecord.alias && (
                    <div>
                      <Label className="text-slate-500">{t('staffKycAliasLabel')}</Label>
                      <p className="text-slate-900 font-medium">{selectedRecord.alias}</p>
                    </div>
                  )}
                  {selectedRecord.nationality && (
                    <div>
                      <Label className="text-slate-500">{t('staffKycNationalityLabel')}</Label>
                      <p className="text-slate-900 font-medium">{selectedRecord.nationality}</p>
                    </div>
                  )}
                  {selectedRecord.passportNo && (
                    <div>
                      <Label className="text-slate-500">{t('staffKycPassportLabel')}</Label>
                      <p className="text-slate-900 font-medium">{selectedRecord.passportNo}</p>
                    </div>
                  )}
                  {selectedRecord.identityNo && (
                    <div>
                      <Label className="text-slate-500">{t('staffKycIdentityNoLabel')}</Label>
                      <p className="text-slate-900 font-medium">{selectedRecord.identityNo}</p>
                    </div>
                  )}
                  {selectedRecord.dob && (
                    <div>
                      <Label className="text-slate-500">{t('staffKycDobLabel')}</Label>
                      <p className="text-slate-900 font-medium">{selectedRecord.dob}</p>
                    </div>
                  )}
                  {selectedRecord.pob && (
                    <div>
                      <Label className="text-slate-500">{t('staffKycPobLabel')}</Label>
                      <p className="text-slate-900 font-medium">{selectedRecord.pob}</p>
                    </div>
                  )}
                </div>

                {(selectedRecord.name1 || selectedRecord.name2 || selectedRecord.name3 || selectedRecord.name4) && (
                  <div>
                    <Label className="text-slate-500 mb-2 block">{t('staffKycAdditionalNamesLabel')}</Label>
                    <div className="flex flex-wrap gap-2">
                      {[selectedRecord.name1, selectedRecord.name2, selectedRecord.name3, selectedRecord.name4]
                        .filter(Boolean)
                        .map((name, idx) => (
                          <span key={idx} className="px-3 py-1 bg-slate-100 rounded-full text-sm text-slate-700">
                            {name}
                          </span>
                        ))}
                    </div>
                  </div>
                )}

                {selectedRecord.address && (
                  <div>
                    <Label className="text-slate-500">{t('staffKycAddressLabel')}</Label>
                    <p className="text-slate-900">{selectedRecord.address}</p>
                  </div>
                )}

                {selectedRecord.additionalInfo && (
                  <div>
                    <Label className="text-slate-500">{t('staffKycAdditionalInfoLabel')}</Label>
                    <p className="text-slate-900 whitespace-pre-wrap">{selectedRecord.additionalInfo}</p>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <Label className="text-slate-500">{t('staffKycSourceListLabel')}</Label>
                  <p className="text-slate-900 font-medium">{selectedRecord.sourceList || '-'}</p>
                </div>

                <div>
                  <Label className="text-slate-500">{t('staffKycEntryTypeLabel')}</Label>
                  <p className="text-slate-900">
                    {selectedRecord.entryType === 'Individual'
                      ? t('staffKycTypeIndividual')
                      : t('staffKycTypeCorporate')}
                  </p>
                </div>

                <div>
                  <Label className="text-slate-500">{t('staffKycLoadDateField')}</Label>
                  <p className="text-slate-900">
                    {selectedRecord.loadDate ? new Date(selectedRecord.loadDate).toLocaleString() : '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-[#1e3a5f] border-b shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={createPageUrl('StaffDashboard')}>
                <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/10">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-2 shadow-lg">
                <img src="/gan.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-white">{t('staffKycHeaderTitle')}</h1>
                  <span className="text-xs bg-[#f5a623] px-2 py-1 rounded text-white font-medium">
                    {t('staffLabel')}
                  </span>
                </div>
                <p className="text-slate-300 text-sm">{t('staffKycHeaderSubtitle')}</p>
              </div>
            </div>
            <Link to={createPageUrl('StaffDashboard')}>
              <Button className="bg-white text-[#1e3a5f] hover:bg-slate-100">
                <Globe className="w-4 h-4 mr-2" />
                {t('dashboard')}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-slate-200 mb-8">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-[#1e3a5f] mb-6">{t('staffKycSearchTitle')}</h2>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="bg-slate-100">
                <TabsTrigger
                  value="individual"
                  className="data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-white"
                >
                  <User className="w-4 h-4 mr-2" />
                  {t('staffKycIndividualTab')}
                </TabsTrigger>
                <TabsTrigger
                  value="corporate"
                  className="data-[state=active]:bg-[#f5a623] data-[state=active]:text-white"
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  {t('staffKycCorporateTab')}
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex gap-4">
              <Input
                placeholder={t('staffKycSearchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 border-slate-300"
              />
              <Button onClick={handleSearch} className="bg-[#1e3a5f] hover:bg-[#152a45]">
                <Search className="w-4 h-4 mr-2" />
                {t('search')}
              </Button>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <Checkbox id="searchAll" checked={searchAllData} onCheckedChange={setSearchAllData} />
              <Label htmlFor="searchAll" className="text-sm text-slate-600 cursor-pointer">
                {t('staffKycSearchAllData')}
              </Label>
            </div>
          </CardContent>
        </Card>

        {searchQuery && (
          <div className="space-y-4">
            {isLoading ? (
              <Card className="border-slate-200">
                <CardContent className="p-8 text-center text-slate-500">{t('loading')}</CardContent>
              </Card>
            ) : searchResults.length === 0 ? (
              <Card className="border-slate-200">
                <CardContent className="p-8 text-center text-slate-500">{t('staffKycNoResultsFound')}</CardContent>
              </Card>
            ) : (
              searchResults.map((record) => (
                <Card
                  key={record.id}
                  className={cn(
                    'border-slate-200 hover:shadow-lg transition-all cursor-pointer',
                    activeTab === 'individual' ? 'hover:border-[#1e3a5f]' : 'hover:border-[#f5a623]'
                  )}
                  onClick={() => setSelectedRecord(record)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          'w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0',
                          activeTab === 'individual' ? 'bg-[#1e3a5f]/10' : 'bg-[#f5a623]/10'
                        )}
                      >
                        {activeTab === 'individual' ? (
                          <User className="w-6 h-6 text-[#1e3a5f]" />
                        ) : (
                          <Building2 className="w-6 h-6 text-[#f5a623]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-[#1e3a5f] mb-1">{record.fullName}</h3>
                        <p className="text-sm text-slate-600 mb-2">
                          {t('staffKycTypeLabelText')}:{' '}
                          {activeTab === 'individual' ? t('staffKycTypeIndividual') : t('staffKycTypeCorporate')} |{' '}
                          {t('staffKycSourceLabelText')}: {record.sourceList || '-'} | {t('staffKycLoadDateLabelText')}:{' '}
                          {record.loadDate ? new Date(record.loadDate).toLocaleDateString() : '-'}
                        </p>
                        {record.additionalInfo && (
                          <p className="text-slate-700 line-clamp-2">{record.additionalInfo}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
