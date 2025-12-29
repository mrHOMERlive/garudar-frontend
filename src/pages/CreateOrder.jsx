import React, { useState } from 'react';
import { apiClient } from '@/api/apiClient';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { Send, Download, Copy, Mail, History, Upload } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import AmountCurrencySection from '../components/remittance/AmountCurrencySection';
import BeneficiaryInfoSection from '../components/remittance/BeneficiaryInfoSection';
import BankDetailsSection from '../components/remittance/BankDetailsSection';
import TransactionRemarkSection from '../components/remittance/TransactionRemarkSection';
import InvoiceInfoModal from '../components/remittance/InvoiceInfoModal';
import { generateCSVData, downloadCSV } from '../components/remittance/utils/csvGenerator';
import { validateLatinText } from '../components/remittance/utils/validators';

const INVOICE_EMAIL = 'sales@garudar.id';

export default function CreateOrder() {
  const [formData, setFormData] = useState({
    amount: 0,
    currency: 'USD',
    beneficiary_name: '',
    beneficiary_address: '',
    destination_account: '',
    country_bank: '',
    bic: '',
    bank_name: '',
    bank_address: '',
    bank_manual_override: false,
    transaction_remark_mode: 'template',
    transaction_remark: '',
    remark_inv_no: '',
    remark_date: '',
    remark_goods: 'goods',
    remark_type: 'inv',
    remark_payment: 'Payment'
  });

  const [errors, setErrors] = useState({});
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [uploadingSalesContract, setUploadingSalesContract] = useState(false);
  const [uploadingInvoice, setUploadingInvoice] = useState(false);
  const [uploadingOther, setUploadingOther] = useState(false);
  const [salesContractUrl, setSalesContractUrl] = useState('');
  const [invoiceUrl, setInvoiceUrl] = useState('');
  const [otherDocsUrl, setOtherDocsUrl] = useState('');

  // Загрузка справочника стран (API возвращает {code, name})
  const { data: countries = [] } = useQuery({
    queryKey: ['countries'],
    queryFn: () => apiClient.getCountries(),
  });

  const handleFormChange = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount is required';
    }
    if (!formData.currency) {
      newErrors.currency = 'Currency is required';
    }
    const nameValidation = validateLatinText(formData.beneficiary_name, 70);
    if (!nameValidation.valid) {
      newErrors.beneficiary_name = nameValidation.error;
    }
    const addressValidation = validateLatinText(formData.beneficiary_address, 105);
    if (!addressValidation.valid) {
      newErrors.beneficiary_address = addressValidation.error;
    }
    if (!formData.destination_account) {
      newErrors.destination_account = 'Account number is required';
    }
    if (!formData.country_bank) {
      newErrors.country_bank = 'Country is required';
    }
    if (!formData.bic) {
      newErrors.bic = 'BIC is required';
    }
    if (!formData.bank_name) {
      newErrors.bank_name = 'Bank name is required';
    }
    if (!formData.bank_address) {
      newErrors.bank_address = 'Bank address is required';
    }
    if (!formData.transaction_remark) {
      newErrors.transaction_remark = 'Transaction remark is required';
    }

    // Check for manual override requirement
    if (formData.bic && !formData.bank_name && !formData.bank_manual_override) {
      newErrors.bank_name = 'Enable manual override to fill bank details';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createOrderMutation = useMutation({
    mutationFn: async (orderData) => {
      const user = await apiClient.getCurrentUser();
      const orderNumber = `PO-${new Date().toISOString().slice(0, 10)}-${Date.now().toString().slice(-6)}`;
      
      // Generate CSV data
      const csvData = generateCSVData(orderData);
      
      // Найти название страны по коду
      const selectedCountry = countries.find(c => c.code === orderData.country_bank);
      const countryName = selectedCountry ? selectedCountry.name : orderData.country_bank;
      
      // Преобразуем данные формы в формат API (OrderPoboDto-Input)
      const apiOrderData = {
        order_id: orderNumber,
        amount: parseFloat(orderData.amount),
        currency: orderData.currency,
        beneficiary_name: orderData.beneficiary_name,
        beneficiary_adress: orderData.beneficiary_address,
        destination_account: orderData.destination_account,
        bank_country: countryName,
        bank_bic: orderData.bic,
        bank_name: orderData.bank_name,
        bank_address: orderData.bank_address,
        remark: orderData.transaction_remark,
        invoice_number: orderData.remark_inv_no,
        invocie_required: true,
        invocie_received: false,
        payment_proof: false,
      };
      
      return await apiClient.createOrder(apiOrderData);
    },
    onSuccess: (data) => {
      setCreatedOrder(data);
      setShowInvoiceModal(true);
      toast.success('Order created successfully!', {
        description: `Order #${data.orderId}`
      });
    },
    onError: (error) => {
      toast.error('Failed to create order', {
        description: error.message
      });
    }
  });

  const handleSubmit = () => {
    if (validateForm()) {
      createOrderMutation.mutate(formData);
    } else {
      toast.error('Please fix all errors before submitting');
    }
  };

  const exportToCSV = () => {
    const csvData = generateCSVData(createdOrder || formData);
    downloadCSV(csvData, `order_${createdOrder?.orderId || 'draft'}.csv`);
    toast.success('Order exported to CSV');
  };

  const copyInvoiceEmail = () => {
    navigator.clipboard.writeText(INVOICE_EMAIL);
    toast.success('Email copied to clipboard');
  };

  const handleFileUpload = async (file, type) => {
    if (!file) return;
    
    const setUploading = {
      salesContract: setUploadingSalesContract,
      invoice: setUploadingInvoice,
      other: setUploadingOther
    }[type];
    
    const setUrl = {
      salesContract: setSalesContractUrl,
      invoice: setInvoiceUrl,
      other: setOtherDocsUrl
    }[type];
    
    setUploading(true);
    try {
      const fileUrl = await apiClient.uploadFile(file);
      setUrl(fileUrl);
      toast.success('Document uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-900 to-slate-900 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl('UserDashboard')} className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center p-3 shadow-lg">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69233f5a9a123941f81322f5/b1a1be267_gan.png" 
                  alt="Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-white">GTrans</h1>
                  <span className="text-xs bg-emerald-500 px-2 py-1 rounded text-white font-medium">CLIENT</span>
                </div>
                <p className="text-teal-300 text-sm">Create Payment Order</p>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <Link to={createPageUrl('UserDashboard')}>
                <Button
                  variant="outline"
                  className="border-teal-400 text-teal-100 hover:bg-teal-800/50 bg-transparent"
                >
                  <History className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              {createdOrder && (
                <Button
                  onClick={exportToCSV}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <AmountCurrencySection
            formData={formData}
            onChange={handleFormChange}
            errors={errors}
            setErrors={setErrors}
          />

          <BeneficiaryInfoSection
            formData={formData}
            onChange={handleFormChange}
            errors={errors}
            setErrors={setErrors}
          />

          <BankDetailsSection
            formData={formData}
            onChange={handleFormChange}
            errors={errors}
            setErrors={setErrors}
            countries={countries}
          />

          <TransactionRemarkSection
            formData={formData}
            onChange={handleFormChange}
            errors={errors}
            setErrors={setErrors}
          />

          {/* Document Upload Section */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Upload Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Sales Contract */}
              <div className="space-y-2">
                <Label className="text-sm text-slate-600">Sales Contract</Label>
                <label className="block">
                  <input
                    type="file"
                    onChange={(e) => handleFileUpload(e.target.files?.[0], 'salesContract')}
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className={`w-full ${salesContractUrl ? 'border-emerald-500 text-emerald-700' : 'border-slate-300'}`}
                    onClick={(e) => e.currentTarget.previousElementSibling?.click()}
                    disabled={uploadingSalesContract}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadingSalesContract ? 'Uploading...' : salesContractUrl ? 'Uploaded ✓' : 'Upload'}
                  </Button>
                </label>
                {salesContractUrl && (
                  <a href={salesContractUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                    View document
                  </a>
                )}
              </div>

              {/* Invoice */}
              <div className="space-y-2">
                <Label className="text-sm text-slate-600">Invoice</Label>
                <label className="block">
                  <input
                    type="file"
                    onChange={(e) => handleFileUpload(e.target.files?.[0], 'invoice')}
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className={`w-full ${invoiceUrl ? 'border-emerald-500 text-emerald-700' : 'border-slate-300'}`}
                    onClick={(e) => e.currentTarget.previousElementSibling?.click()}
                    disabled={uploadingInvoice}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadingInvoice ? 'Uploading...' : invoiceUrl ? 'Uploaded ✓' : 'Upload'}
                  </Button>
                </label>
                {invoiceUrl && (
                  <a href={invoiceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                    View document
                  </a>
                )}
              </div>

              {/* Other Documents */}
              <div className="space-y-2">
                <Label className="text-sm text-slate-600">Other Documents</Label>
                <label className="block">
                  <input
                    type="file"
                    onChange={(e) => handleFileUpload(e.target.files?.[0], 'other')}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className={`w-full ${otherDocsUrl ? 'border-emerald-500 text-emerald-700' : 'border-slate-300'}`}
                    onClick={(e) => e.currentTarget.previousElementSibling?.click()}
                    disabled={uploadingOther}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadingOther ? 'Uploading...' : otherDocsUrl ? 'Uploaded ✓' : 'Upload'}
                  </Button>
                </label>
                {otherDocsUrl && (
                  <a href={otherDocsUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                    View document
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Invoice Info Block */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-amber-700" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900 mb-2">Invoice Required</h3>
                <p className="text-sm text-amber-800 mb-3">
                  To complete order processing, please send your invoice to:
                </p>
                <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-amber-200">
                  <code className="text-sm font-mono text-slate-800 flex-1">
                    {INVOICE_EMAIL}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyInvoiceEmail}
                    className="border-amber-300 hover:bg-amber-50"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              onClick={handleSubmit}
              disabled={createOrderMutation.isPending}
              className="bg-gradient-to-r from-teal-700 to-cyan-800 hover:from-teal-600 hover:to-cyan-700 text-white font-semibold px-8 py-6 text-base shadow-lg"
            >
              {createOrderMutation.isPending ? (
                <>Processing...</>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Send the Order
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Invoice Modal */}
      {createdOrder && (
        <InvoiceInfoModal
          open={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
          orderNumber={createdOrder.orderId}
          invoiceNumber={formData.remark_inv_no}
        />
      )}
    </div>
  );
}