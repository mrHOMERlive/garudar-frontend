import React from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, CreditCard, DollarSign, FileText, MapPin } from 'lucide-react';

export function CreateOrderAnimation() {
  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-xl shadow-2xl border border-slate-200 p-6 space-y-4"
      >
        {/* Header */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3 pb-4 border-b border-slate-200"
        >
          <div className="w-10 h-10 rounded-lg bg-[#1e3a5f] flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-[#1e3a5f]">New Transfer Order</div>
            <div className="text-xs text-slate-500">Fill in payment details</div>
          </div>
        </motion.div>

        {/* Amount Section */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-2"
        >
          <div className="text-xs font-medium text-slate-600">Transfer Amount</div>
          <div className="flex gap-2">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex-1 h-10 rounded-lg bg-[#f5a623]/10 border border-[#f5a623]/30 flex items-center px-3"
            >
              <DollarSign className="w-4 h-4 text-[#f5a623] mr-2" />
              <span className="font-mono text-[#1e3a5f] font-semibold">50,000.00</span>
            </motion.div>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="w-20 h-10 rounded-lg bg-[#1e3a5f] flex items-center justify-center"
            >
              <span className="text-white font-semibold text-sm">USD</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Beneficiary */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="space-y-2"
        >
          <div className="text-xs font-medium text-slate-600">Beneficiary</div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1 }}
            className="p-3 rounded-lg bg-slate-50 border border-slate-200"
          >
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-[#1e3a5f]" />
              <span className="font-medium text-[#1e3a5f] text-sm">ACME Trading Co.</span>
            </div>
            <div className="flex items-start gap-2 text-xs text-slate-600">
              <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span>123 Business Park, Singapore</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Bank Details */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="space-y-2"
        >
          <div className="text-xs font-medium text-slate-600">Bank Details</div>
          <div className="grid grid-cols-2 gap-2">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.3 }}
              className="p-2 rounded bg-slate-50 border border-slate-200"
            >
              <div className="text-xs text-slate-500 mb-1">BIC/SWIFT</div>
              <div className="font-mono text-xs font-semibold text-[#1e3a5f]">DBSSSGSG</div>
            </motion.div>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="p-2 rounded bg-slate-50 border border-slate-200"
            >
              <div className="text-xs text-slate-500 mb-1">Account</div>
              <div className="font-mono text-xs font-semibold text-[#1e3a5f]">1234567890</div>
            </motion.div>
          </div>
        </motion.div>

        {/* Submit Button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.6 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full h-10 rounded-lg bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8f] text-white font-medium shadow-lg hover:shadow-xl transition-shadow"
        >
          Create Order
        </motion.button>

        {/* Floating Badge */}
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 1.8, type: "spring" }}
          className="absolute -top-3 -right-3"
        >
          <Badge className="bg-emerald-500 text-white shadow-lg">
            ✓ Secure
          </Badge>
        </motion.div>
      </motion.div>
    </div>
  );
}

export function OrderMonitoringAnimation() {
  const orders = [
    { id: 'ORD/25/001', amount: '25,000', currency: 'USD', status: 'on_execution', beneficiary: 'Global Corp Ltd' },
    { id: 'ORD/25/002', amount: '15,500', currency: 'EUR', status: 'pending_payment', beneficiary: 'Euro Trading GmbH' },
    { id: 'ORD/25/003', amount: '50,000', currency: 'USD', status: 'released', beneficiary: 'Asia Pacific Inc' },
  ];

  const statusColors = {
    on_execution: 'bg-blue-500',
    pending_payment: 'bg-amber-500',
    released: 'bg-emerald-500',
  };

  const statusLabels = {
    on_execution: 'In Progress',
    pending_payment: 'Pending',
    released: 'Complete',
  };

  return (
    <div className="bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8f] p-4 flex items-center justify-between"
      >
        <div>
          <div className="text-white font-bold">Active Orders</div>
          <div className="text-slate-300 text-xs">Real-time tracking</div>
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
          className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
        >
          <span className="text-white font-bold">{orders.length}</span>
        </motion.div>
      </motion.div>

      {/* Orders Table */}
      <div className="p-4 space-y-2">
        {orders.map((order, idx) => (
          <motion.div
            key={order.id}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 + idx * 0.2 }}
            className="p-3 rounded-lg border border-slate-200 hover:border-[#1e3a5f]/30 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-[#1e3a5f]/10 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-[#1e3a5f]" />
                </div>
                <div>
                  <div className="font-mono text-xs font-semibold text-[#1e3a5f]">{order.id}</div>
                  <div className="text-xs text-slate-500">{order.beneficiary}</div>
                </div>
              </div>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 + idx * 0.2 }}
              >
                <Badge className={`${statusColors[order.status]} text-white text-xs`}>
                  {statusLabels[order.status]}
                </Badge>
              </motion.div>
            </div>
            <div className="flex items-center justify-between">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: 'auto' }}
                transition={{ delay: 0.7 + idx * 0.2 }}
                className="font-semibold text-[#1e3a5f]"
              >
                {order.amount} {order.currency}
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 + idx * 0.2 }}
                className="text-xs text-slate-500"
              >
                {order.status === 'released' ? '✓ Settled' : 'Processing...'}
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer Stats */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="border-t border-slate-200 p-4 bg-slate-50 grid grid-cols-3 gap-4"
      >
        <div className="text-center">
          <div className="text-xs text-slate-500 mb-1">Total Volume</div>
          <div className="font-bold text-[#1e3a5f]">$90.5K</div>
        </div>
        <div className="text-center border-x border-slate-200">
          <div className="text-xs text-slate-500 mb-1">In Progress</div>
          <div className="font-bold text-blue-600">2</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-slate-500 mb-1">Completed</div>
          <div className="font-bold text-emerald-600">1</div>
        </div>
      </motion.div>
    </div>
  );
}