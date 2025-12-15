import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { Send, Download, Copy, Mail, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AmountCurrencySection from '../components/remittance/AmountCurrencySection';
import BeneficiaryInfoSection from '../components/remittance/BeneficiaryInfoSection';
import BankDetailsSection from '../components/remittance/BankDetailsSection';
import TransactionRemarkSection from '../components/remittance/TransactionRemarkSection';
import InvoiceInfoModal from '../components/remittance/InvoiceInfoModal';
import { generateCSVData, downloadCSV } from '../components/remittance/utils/csvGenerator';

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
    if (!formData.beneficiary_name) {
      newErrors.beneficiary_name = 'Beneficiary name is required';
    }
    if (!formData.beneficiary_address) {
      newErrors.beneficiary_address = 'Beneficiary address is required';
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
      const user = await base44.auth.me();
      const orderNumber = `${user.id.slice(0, 4).toUpperCase()}-${Date.now().toString().slice(-6)}`;
      
      // Generate CSV data
      const csvData = generateCSVData(orderData);
      
      return await base44.entities.RemittanceOrder.create({
        ...orderData,
        order_number: orderNumber,
        status: 'created',
        csv_data: JSON.stringify(csvData),
        status_history: [{ status: 'created', timestamp: new Date().toISOString() }]
      });
    },
    onSuccess: (data) => {
      setCreatedOrder(data);
      setShowInvoiceModal(true);
      toast.success('Order created successfully!', {
        description: `Order #${data.order_number}`
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
    downloadCSV(csvData, `order_${createdOrder?.order_number || 'draft'}.csv`);
    toast.success('Order exported to CSV');
  };

  const copyInvoiceEmail = () => {
    navigator.clipboard.writeText(INVOICE_EMAIL);
    toast.success('Email copied to clipboard');
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
          />

          <TransactionRemarkSection
            formData={formData}
            onChange={handleFormChange}
            errors={errors}
            setErrors={setErrors}
          />

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
          orderNumber={createdOrder.order_number}
          invoiceNumber={formData.remark_inv_no}
        />
      )}
    </div>
  );
}