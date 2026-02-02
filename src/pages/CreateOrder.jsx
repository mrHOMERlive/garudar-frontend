import React, { useState } from 'react';
import { apiClient } from '@/api/apiClient';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    amount: 0,
    currency: 'USD',
    client_payment_currency: 'USD',
    beneficiary_name: '',
    beneficiary_address: '',
    beneficiary_country: '',
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
  const [salesContractFile, setSalesContractFile] = useState(null);
  const [invoiceFile, setInvoiceFile] = useState(null);
  const [otherDocsFile, setOtherDocsFile] = useState(null);
  const [uploadingDocuments, setUploadingDocuments] = useState(false);

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
    if (!formData.beneficiary_country) {
      newErrors.beneficiary_country = 'Beneficiary country is required';
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

      // Найти названия стран по кодам
      const selectedBankCountry = countries.find(c => c.code === orderData.country_bank);
      const bankCountryName = selectedBankCountry ? selectedBankCountry.name : orderData.country_bank;

      const selectedBeneficiaryCountry = countries.find(c => c.code === orderData.beneficiary_country);
      const beneficiaryCountryName = selectedBeneficiaryCountry ? selectedBeneficiaryCountry.name : orderData.beneficiary_country;

      // Преобразуем данные формы в формат API (OrderPoboDto-Input)
      const apiOrderData = {
        order_id: orderNumber,
        amount: parseFloat(orderData.amount),
        currency: orderData.currency,
        client_payment_currency: orderData.client_payment_currency,
        beneficiary_name: orderData.beneficiary_name,
        beneficiary_adress: orderData.beneficiary_address,
        beneficiary_country: beneficiaryCountryName,
        destination_account: orderData.destination_account,
        bank_country: bankCountryName,
        bank_bic: orderData.bic,
        bank_name: orderData.bank_name,
        bank_address: orderData.bank_address,
        remark: orderData.transaction_remark,
        invocie_required: true,
        invocie_received: false,
        payment_proof: false,
      };

      return await apiClient.createOrder(apiOrderData);
    },
    onSuccess: async (data) => {
      setCreatedOrder(data);
      toast.success('Order created successfully!', {
        description: `Order #${data.orderId}`
      });

      await uploadDocumentsAfterOrder(data.orderId);

      setShowInvoiceModal(true);
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

  const copyInvoiceEmail = () => {
    navigator.clipboard.writeText(INVOICE_EMAIL);
    toast.success('Email copied to clipboard');
  };

  const handleFileUpload = (file, type) => {
    if (!file) return;

    // Map backend doc types to state setters
    const setFile = {
      sales_contract: setSalesContractFile,
      invoice: setInvoiceFile,
      other: setOtherDocsFile
    }[type];

    if (setFile) {
      setFile(file);
      toast.success('Document selected', {
        description: file.name
      });
    }
  };

  const uploadDocumentsAfterOrder = async (orderId) => {
    const uploads = [];

    if (invoiceFile) {
      uploads.push({
        file: invoiceFile,
        docType: 'invoice',
        name: 'Invoice'
      });
    }

    if (salesContractFile) {
      uploads.push({
        file: salesContractFile,
        docType: 'sales_contract',
        name: 'Sales Contract'
      });
    }

    if (otherDocsFile) {
      uploads.push({
        file: otherDocsFile,
        docType: 'other',
        name: 'Other Documents'
      });
    }

    if (uploads.length === 0) return;

    setUploadingDocuments(true);

    try {
      for (const upload of uploads) {
        await apiClient.uploadOrderDocument(orderId, upload.file, upload.docType);
        toast.success(`${upload.name} uploaded successfully`);
      }
    } catch (error) {
      toast.error('Failed to upload some documents', {
        description: error.message
      });
    } finally {
      setUploadingDocuments(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-[#1e3a5f] shadow-lg border-b border-[#1e3a5f]/20">
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
                <p className="text-slate-300 text-sm">Create Payment Order</p>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <Link to={createPageUrl('UserDashboard')}>
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                >
                  <History className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
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

          {/* Invoice & Documents Info Block */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-amber-700" />
              </div>
              <div className="flex-1 space-y-4">
                <div>
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

                <div className="pt-3 border-t border-amber-200">
                  <h4 className="font-semibold text-amber-900 mb-3">Upload Documents (Optional)</h4>
                  <p className="text-xs text-amber-700 mb-3">You can upload documents here or send them by email</p>

                  <div className="space-y-3">
                    {/* Sales Contract Upload */}
                    <div>
                      <Label className="text-xs text-amber-800 mb-1">Sales Contract</Label>
                      <div className="flex items-center gap-2">
                        <label className="flex-1">
                          <input
                            type="file"
                            onChange={(e) => handleFileUpload(e.target.files?.[0], 'sales_contract')}
                            className="hidden"
                            accept=".pdf,.doc,.docx"
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className={`w-full border-amber-300 hover:bg-amber-50 ${salesContractFile ? 'border-emerald-500 text-emerald-700' : ''}`}
                            onClick={(e) => e.currentTarget.previousElementSibling?.click()}
                            disabled={uploadingDocuments}
                          >
                            <Upload className="w-3 h-3 mr-2" />
                            {salesContractFile ? 'Selected ✓' : 'Upload Sales Contract'}
                          </Button>
                        </label>
                      </div>
                      {salesContractFile && (
                        <p className="text-xs text-amber-700 mt-1">
                          {salesContractFile.name} ({(salesContractFile.size / 1024).toFixed(1)} KB)
                        </p>
                      )}
                    </div>

                    {/* Invoice Upload */}
                    <div>
                      <Label className="text-xs text-amber-800 mb-1">Invoice</Label>
                      <div className="flex items-center gap-2">
                        <label className="flex-1">
                          <input
                            type="file"
                            onChange={(e) => handleFileUpload(e.target.files?.[0], 'invoice')}
                            className="hidden"
                            accept=".pdf,.doc,.docx"
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className={`w-full border-amber-300 hover:bg-amber-50 ${invoiceFile ? 'border-emerald-500 text-emerald-700' : ''}`}
                            onClick={(e) => e.currentTarget.previousElementSibling?.click()}
                            disabled={uploadingDocuments}
                          >
                            <Upload className="w-3 h-3 mr-2" />
                            {invoiceFile ? 'Selected ✓' : 'Upload Invoice'}
                          </Button>
                        </label>
                      </div>
                      {invoiceFile && (
                        <p className="text-xs text-amber-700 mt-1">
                          {invoiceFile.name} ({(invoiceFile.size / 1024).toFixed(1)} KB)
                        </p>
                      )}
                    </div>

                    {/* Other Documents Upload */}
                    <div>
                      <Label className="text-xs text-amber-800 mb-1">Other Documents</Label>
                      <div className="flex items-center gap-2">
                        <label className="flex-1">
                          <input
                            type="file"
                            onChange={(e) => handleFileUpload(e.target.files?.[0], 'other')}
                            className="hidden"
                            accept=".pdf,.doc,.docx,.zip"
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className={`w-full border-amber-300 hover:bg-amber-50 ${otherDocsFile ? 'border-emerald-500 text-emerald-700' : ''}`}
                            onClick={(e) => e.currentTarget.previousElementSibling?.click()}
                            disabled={uploadingDocuments}
                          >
                            <Upload className="w-3 h-3 mr-2" />
                            {otherDocsFile ? 'Selected ✓' : 'Upload Other Documents'}
                          </Button>
                        </label>
                      </div>
                      {otherDocsFile && (
                        <p className="text-xs text-amber-700 mt-1">
                          {otherDocsFile.name} ({(otherDocsFile.size / 1024).toFixed(1)} KB)
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              onClick={handleSubmit}
              disabled={createOrderMutation.isPending}
              className="bg-[#1e3a5f] hover:bg-[#152a45] text-white font-semibold px-8 py-6 text-base shadow-lg"
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
          onClose={() => {
            setShowInvoiceModal(false);
            navigate(createPageUrl('UserDashboard'));
          }}
          orderNumber={createdOrder.orderId}
          invoiceNumber={formData.remark_inv_no}
        />
      )}
    </div>
  );
}