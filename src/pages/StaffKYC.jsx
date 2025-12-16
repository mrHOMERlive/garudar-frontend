import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { apiClient } from '@/api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Search, User, Building2, ArrowLeft, Globe } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function StaffKYC() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchAllData, setSearchAllData] = useState(false);
  const [activeTab, setActiveTab] = useState('individual');
  const [selectedRecord, setSelectedRecord] = useState(null);

  // entryType: 1 = Individual, 2 = Corporate
  const { data: searchResults = [], isLoading, refetch } = useQuery({
    queryKey: ['kycSearch', searchQuery, activeTab, searchAllData],
    queryFn: () => apiClient.searchEntries(
      searchQuery, 
      activeTab === 'individual' ? 1 : 2,
      searchAllData ? '1' : '0'
    ),
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
              <Link to={createPageUrl('StaffDashboard')} className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center p-3 shadow-lg">
                  <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69233f5a9a123941f81322f5/b1a1be267_gan.png" 
                    alt="Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-white">KYC Database</h1>
                    <span className="text-xs bg-[#f5a623] px-2 py-1 rounded text-white font-medium">STAFF</span>
                  </div>
                  <p className="text-slate-300 text-sm">Know Your Customer Verification</p>
                </div>
              </Link>
              <Link to={createPageUrl('StaffDashboard')}>
                <Button className="bg-white text-[#1e3a5f] hover:bg-slate-100">
                  <Globe className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button 
            variant="outline" 
            onClick={() => setSelectedRecord(null)}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to results
          </Button>

          <Card className="border-slate-200">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center",
                    selectedRecord.entryType === '1' ? "bg-[#1e3a5f]/10" : "bg-[#f5a623]/10"
                  )}>
                    {selectedRecord.entryType === '1' ? (
                      <User className="w-8 h-8 text-[#1e3a5f]" />
                    ) : (
                      <Building2 className="w-8 h-8 text-[#f5a623]" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-[#1e3a5f] mb-2">{selectedRecord.fullName}</h2>
                    <p className="text-slate-600">
                      Type: {selectedRecord.entryType === '1' ? 'Individual' : 'Corporate'} | 
                      Source: {selectedRecord.sourceList} | 
                      Load Date: {selectedRecord.loadDate ? new Date(selectedRecord.loadDate).toLocaleDateString() : '-'}
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {selectedRecord.tittle && (
                    <div>
                      <Label className="text-slate-500">Title</Label>
                      <p className="text-slate-900 font-medium">{selectedRecord.tittle}</p>
                    </div>
                  )}
                  {selectedRecord.jobTitle && (
                    <div>
                      <Label className="text-slate-500">Job Title</Label>
                      <p className="text-slate-900 font-medium">{selectedRecord.jobTitle}</p>
                    </div>
                  )}
                  {selectedRecord.alias && (
                    <div>
                      <Label className="text-slate-500">Alias</Label>
                      <p className="text-slate-900 font-medium">{selectedRecord.alias}</p>
                    </div>
                  )}
                  {selectedRecord.nationality && (
                    <div>
                      <Label className="text-slate-500">Nationality</Label>
                      <p className="text-slate-900 font-medium">{selectedRecord.nationality}</p>
                    </div>
                  )}
                  {selectedRecord.passportNo && (
                    <div>
                      <Label className="text-slate-500">Passport</Label>
                      <p className="text-slate-900 font-medium">{selectedRecord.passportNo}</p>
                    </div>
                  )}
                  {selectedRecord.identityNo && (
                    <div>
                      <Label className="text-slate-500">Identity No</Label>
                      <p className="text-slate-900 font-medium">{selectedRecord.identityNo}</p>
                    </div>
                  )}
                  {selectedRecord.dob && (
                    <div>
                      <Label className="text-slate-500">Date of Birth</Label>
                      <p className="text-slate-900 font-medium">{selectedRecord.dob}</p>
                    </div>
                  )}
                  {selectedRecord.pob && (
                    <div>
                      <Label className="text-slate-500">Place of Birth</Label>
                      <p className="text-slate-900 font-medium">{selectedRecord.pob}</p>
                    </div>
                  )}
                </div>

                {(selectedRecord.name1 || selectedRecord.name2 || selectedRecord.name3 || selectedRecord.name4) && (
                  <div>
                    <Label className="text-slate-500 mb-2 block">Additional Names</Label>
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
                    <Label className="text-slate-500">Address</Label>
                    <p className="text-slate-900">{selectedRecord.address}</p>
                  </div>
                )}

                {selectedRecord.additionalInfo && (
                  <div>
                    <Label className="text-slate-500">Additional Info</Label>
                    <p className="text-slate-900 whitespace-pre-wrap">{selectedRecord.additionalInfo}</p>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <Label className="text-slate-500">Source List</Label>
                  <p className="text-slate-900 font-medium">{selectedRecord.sourceList || '-'}</p>
                </div>

                <div>
                  <Label className="text-slate-500">Entry Type</Label>
                  <p className="text-slate-900">{selectedRecord.entryType === '1' ? 'Individual' : 'Corporate'}</p>
                </div>

                <div>
                  <Label className="text-slate-500">Load Date</Label>
                  <p className="text-slate-900">{selectedRecord.loadDate ? new Date(selectedRecord.loadDate).toLocaleString() : '-'}</p>
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
            <Link to={createPageUrl('StaffDashboard')} className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center p-3 shadow-lg">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69233f5a9a123941f81322f5/b1a1be267_gan.png" 
                  alt="Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-white">KYC Database</h1>
                  <span className="text-xs bg-[#f5a623] px-2 py-1 rounded text-white font-medium">STAFF</span>
                </div>
                <p className="text-slate-300 text-sm">Know Your Customer Verification</p>
              </div>
            </Link>
            <Link to={createPageUrl('StaffDashboard')}>
              <Button className="bg-white text-[#1e3a5f] hover:bg-slate-100">
                <Globe className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-slate-200 mb-8">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-[#1e3a5f] mb-6">Search...</h2>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="bg-slate-100">
                <TabsTrigger value="individual" className="data-[state=active]:bg-[#1e3a5f] data-[state=active]:text-white">
                  <User className="w-4 h-4 mr-2" />
                  Individual
                </TabsTrigger>
                <TabsTrigger value="corporate" className="data-[state=active]:bg-[#f5a623] data-[state=active]:text-white">
                  <Building2 className="w-4 h-4 mr-2" />
                  Corporate
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex gap-4">
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 border-slate-300"
              />
              <Button 
                onClick={handleSearch}
                className="bg-[#1e3a5f] hover:bg-[#152a45]"
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <Checkbox 
                id="searchAll" 
                checked={searchAllData}
                onCheckedChange={setSearchAllData}
              />
              <Label htmlFor="searchAll" className="text-sm text-slate-600 cursor-pointer">
                Search All Data
              </Label>
            </div>
          </CardContent>
        </Card>

        {searchQuery && (
          <div className="space-y-4">
            {isLoading ? (
              <Card className="border-slate-200">
                <CardContent className="p-8 text-center text-slate-500">
                  Loading...
                </CardContent>
              </Card>
            ) : searchResults.length === 0 ? (
              <Card className="border-slate-200">
                <CardContent className="p-8 text-center text-slate-500">
                  No results found
                </CardContent>
              </Card>
            ) : (
              searchResults.map((record) => (
                <Card 
                  key={record.id} 
                  className={cn(
                    "border-slate-200 hover:shadow-lg transition-all cursor-pointer",
                    activeTab === 'individual' ? "hover:border-[#1e3a5f]" : "hover:border-[#f5a623]"
                  )}
                  onClick={() => setSelectedRecord(record)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0",
                        activeTab === 'individual' ? "bg-[#1e3a5f]/10" : "bg-[#f5a623]/10"
                      )}>
                        {activeTab === 'individual' ? (
                          <User className="w-6 h-6 text-[#1e3a5f]" />
                        ) : (
                          <Building2 className="w-6 h-6 text-[#f5a623]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-[#1e3a5f] mb-1">{record.fullName}</h3>
                        <p className="text-sm text-slate-600 mb-2">
                          Type: {activeTab === 'individual' ? 'Individual' : 'Corporate'} | 
                          Source: {record.sourceList || '-'} | 
                          Load Date: {record.loadDate ? new Date(record.loadDate).toLocaleDateString() : '-'}
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