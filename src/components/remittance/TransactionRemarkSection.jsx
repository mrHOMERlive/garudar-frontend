import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, AlertCircle, Eye, Plus, X } from 'lucide-react';
import { validateLatinText, parseDate } from './utils/validators';

const DEFAULT_DOCUMENT_TYPES = [
  { value: 'inv', label: 'Invoice' },
  { value: 'invoice', label: 'Invoice (full)' },
  { value: 'contract', label: 'Contract' },
  { value: 'proforma invoice', label: 'Proforma Invoice' }
];

export default function TransactionRemarkSection({ formData, onChange, errors, setErrors }) {
  const [preview, setPreview] = useState('');
  const [documents, setDocuments] = useState([
    { type: 'inv', number: '', date: '' }
  ]);

  useEffect(() => {
    if (formData.transaction_remark_mode === 'template') {
      // Build remark with multiple documents
      let remark = `${formData.remark_payment || 'Payment'} for ${formData.remark_goods || 'goods'} under `;
      
      const docParts = documents
        .filter(doc => doc.number && doc.date)
        .map(doc => {
          const parsed = parseDate(doc.date);
          return `${doc.type} ${doc.number} dd ${parsed?.formatted || doc.date}`;
        });
      
      if (docParts.length > 0) {
        remark += docParts.join(', ');
      } else {
        remark = '';
      }
      
      setPreview(remark);
      onChange({ transaction_remark: remark });
      
      if (remark.length > 500) {
        setErrors(prev => ({
          ...prev,
          transaction_remark: 'Transaction remark exceeds 500 characters'
        }));
      } else if (!remark) {
        setErrors(prev => ({
          ...prev,
          transaction_remark: 'Please add at least one document'
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          transaction_remark: null
        }));
      }
    }
  }, [
    formData.transaction_remark_mode,
    formData.remark_goods,
    formData.remark_payment,
    documents
  ]);

  const handleManualChange = (value) => {
    onChange({ transaction_remark: value });
    
    const validation = validateLatinText(value, 500);
    setErrors(prev => ({
      ...prev,
      transaction_remark: validation.valid ? null : validation.error
    }));
  };

  const handleModeChange = (mode) => {
    onChange({ 
      transaction_remark_mode: mode,
      transaction_remark: mode === 'manual' ? '' : preview
    });
    setErrors(prev => ({
      ...prev,
      transaction_remark: null
    }));
  };

  const addDocument = () => {
    setDocuments([...documents, { type: 'inv', number: '', date: '' }]);
  };

  const removeDocument = (index) => {
    if (documents.length > 1) {
      setDocuments(documents.filter((_, i) => i !== index));
    }
  };

  const updateDocument = (index, field, value) => {
    const newDocs = [...documents];
    newDocs[index][field] = value;
    setDocuments(newDocs);
  };

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <FileText className="w-5 h-5 text-teal-700" />
          Transaction Remark
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-5">
        <Tabs value={formData.transaction_remark_mode || 'template'} onValueChange={handleModeChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="template">Template</TabsTrigger>
            <TabsTrigger value="manual">Manual</TabsTrigger>
          </TabsList>
        </Tabs>

        {formData.transaction_remark_mode === 'manual' ? (
          <div className="space-y-2">
            <Label htmlFor="transaction_remark" className="text-slate-700 font-medium">
              Transaction Remark *
              <span className="text-xs text-slate-500 ml-2">(Max 500 chars)</span>
            </Label>
            <Textarea
              id="transaction_remark"
              value={formData.transaction_remark || ''}
              onChange={(e) => handleManualChange(e.target.value)}
              placeholder="Enter transaction remark..."
              className={`border-slate-200 focus:border-teal-700 focus:ring-teal-700 min-h-[100px] ${errors.transaction_remark ? 'border-red-500' : ''}`}
              maxLength={500}
              required
            />
            {errors.transaction_remark && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.transaction_remark}</span>
              </div>
            )}
            <div className="text-xs text-slate-500">
              {formData.transaction_remark?.length || 0} / 500 characters
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="text-xs text-slate-600 mb-1">Template:</div>
              <code className="text-sm text-slate-800">{'{PAYMENT}'} for {'{GOODS}'} under {'{TYPE} {NUMBER} dd {DATE}'} (multiple)</code>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payment" className="text-slate-700 font-medium">
                  Payment Type {'{PAYMENT}'}
                </Label>
                <Input
                  id="payment"
                  value={formData.remark_payment || 'Payment'}
                  onChange={(e) => onChange({ remark_payment: e.target.value })}
                  placeholder="Payment, partial payment"
                  className="border-slate-200 focus:border-teal-700 focus:ring-teal-700"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="goods" className="text-slate-700 font-medium">
                  Goods {'{GOODS}'}
                </Label>
                <Input
                  id="goods"
                  value={formData.remark_goods || 'goods'}
                  onChange={(e) => onChange({ remark_goods: e.target.value })}
                  placeholder="goods"
                  className="border-slate-200 focus:border-teal-700 focus:ring-teal-700"
                  maxLength={40}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-slate-700 font-medium">Documents</Label>
                <Button
                  type="button"
                  onClick={addDocument}
                  size="sm"
                  variant="outline"
                  className="border-teal-700 text-teal-700 hover:bg-blue-50"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Document
                </Button>
              </div>

              {documents.map((doc, index) => (
                <div key={index} className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label className="text-xs text-slate-600">Document Type *</Label>
                        <Select
                          value={doc.type}
                          onValueChange={(value) => updateDocument(index, 'type', value)}
                        >
                          <SelectTrigger className="border-slate-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DEFAULT_DOCUMENT_TYPES.map((docType) => (
                              <SelectItem key={docType.value} value={docType.value}>
                                {docType.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs text-slate-600">Document Number *</Label>
                        <Input
                          value={doc.number}
                          onChange={(e) => updateDocument(index, 'number', e.target.value)}
                          placeholder="e.g., 24543"
                          className="border-slate-200"
                          maxLength={32}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs text-slate-600">Document Date *</Label>
                        <Input
                          type="date"
                          value={doc.date}
                          onChange={(e) => updateDocument(index, 'date', e.target.value)}
                          className="border-slate-200"
                        />
                      </div>
                    </div>

                    {documents.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeDocument(index)}
                        size="icon"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 mt-6"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-teal-700" />
                <span className="text-sm font-semibold text-teal-700">Preview:</span>
              </div>
              <div className="text-sm text-slate-800 bg-white p-3 rounded border border-teal-100">
                {preview || 'Fill in the required fields to see preview...'}
              </div>
              <div className="text-xs text-slate-500 mt-2">
                {preview.length} / 500 characters
              </div>
            </div>

            {errors.transaction_remark && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.transaction_remark}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}