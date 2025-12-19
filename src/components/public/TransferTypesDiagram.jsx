import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Building2, Banknote } from 'lucide-react';

export function InboundTransferDiagram({ language = 'en' }) {
  return (
    <div className="space-y-6">
      {/* Without FX Change */}
      <div className="bg-white rounded-xl border-2 border-slate-200 p-6">
        <h4 className="font-semibold text-[#1e3a5f] mb-4 text-sm">
          {language === 'en' ? '1. Inbound Transfer: No currency change' : '1. Inbound Transfer: tanpa perubahan mata uang'}
        </h4>
        <div className="flex items-center justify-between gap-3">
          {/* Counterparty */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="flex-1 max-w-[140px]"
          >
            <div className="border-2 border-slate-300 rounded-lg p-3 bg-white">
              <Building2 className="w-6 h-6 text-slate-600 mx-auto mb-2" />
              <div className="text-xs font-medium text-center text-slate-700">
                {language === 'en' ? 'Counterparty 1 Overseas' : 'Counterparty 1 Overseas'}
              </div>
            </div>
          </motion.div>

          {/* Arrow with USD */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2"
          >
            <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-mono text-xs font-semibold">USD</div>
            <ArrowRight className="w-5 h-5 text-slate-400" />
          </motion.div>

          {/* GAN */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex-1 max-w-[140px]"
          >
            <div className="border-2 border-[#1e3a5f] rounded-lg p-3 bg-gradient-to-br from-[#1e3a5f]/5 to-[#1e3a5f]/10">
              <Banknote className="w-6 h-6 text-[#1e3a5f] mx-auto mb-2" />
              <div className="text-xs font-bold text-center text-[#1e3a5f]">GAN</div>
            </div>
          </motion.div>

          {/* Arrow with USD */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-2"
          >
            <ArrowRight className="w-5 h-5 text-slate-400" />
            <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-mono text-xs font-semibold">USD</div>
          </motion.div>

          {/* Client */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="flex-1 max-w-[140px]"
          >
            <div className="border-2 border-slate-300 rounded-lg p-3 bg-white">
              <Building2 className="w-6 h-6 text-slate-600 mx-auto mb-2" />
              <div className="text-xs font-medium text-center text-slate-700">
                {language === 'en' ? 'Client 1 Indonesia' : 'Client 1 Indonesia'}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Documents */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-4 flex justify-center gap-3"
        >
          <div className="w-20 h-24 bg-white border-2 border-slate-300 rounded-lg shadow-sm relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-8 bg-[#1e3a5f]"></div>
            <div className="pt-10 px-2 space-y-1">
              <div className="h-1 bg-slate-200 rounded"></div>
              <div className="h-1 bg-slate-200 rounded"></div>
              <div className="h-1 bg-slate-200 rounded w-3/4"></div>
            </div>
            <div className="absolute bottom-2 left-2 right-2 text-center text-[9px] font-medium text-slate-600">
              Service<br/>agreement
            </div>
          </div>
          <div className="w-20 h-24 bg-white border-2 border-slate-300 rounded-lg shadow-sm relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-8 bg-[#f5a623]"></div>
            <div className="pt-10 px-2 space-y-1">
              <div className="h-1 bg-slate-200 rounded"></div>
              <div className="h-1 bg-slate-200 rounded"></div>
              <div className="h-1 bg-slate-200 rounded w-3/4"></div>
            </div>
            <div className="absolute bottom-2 left-2 right-2 text-center text-[9px] font-medium text-slate-600">
              Transfer<br/>Order
            </div>
          </div>
        </motion.div>
      </div>

      {/* With FX Change */}
      <div className="bg-white rounded-xl border-2 border-slate-200 p-6">
        <h4 className="font-semibold text-[#1e3a5f] mb-4 text-sm">
          {language === 'en' ? '3. Inbound Transfer: With FX change (foreign to IDR)' : '3. Inbound Transfer: dengan perubahan mata uang (valuta asing ke rupiah)'}
        </h4>
        <div className="flex items-center justify-between gap-3">
          {/* Counterparty */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="flex-1 max-w-[140px]"
          >
            <div className="border-2 border-slate-300 rounded-lg p-3 bg-white">
              <Building2 className="w-6 h-6 text-slate-600 mx-auto mb-2" />
              <div className="text-xs font-medium text-center text-slate-700">
                {language === 'en' ? 'Counterparty 1 Overseas' : 'Counterparty 1 Overseas'}
              </div>
            </div>
          </motion.div>

          {/* Arrow with USD */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2"
          >
            <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-mono text-xs font-semibold">USD</div>
            <ArrowRight className="w-5 h-5 text-slate-400" />
          </motion.div>

          {/* GAN */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex-1 max-w-[140px]"
          >
            <div className="border-2 border-[#1e3a5f] rounded-lg p-3 bg-gradient-to-br from-[#1e3a5f]/5 to-[#1e3a5f]/10">
              <Banknote className="w-6 h-6 text-[#1e3a5f] mx-auto mb-2" />
              <div className="text-xs font-bold text-center text-[#1e3a5f]">GAN</div>
              <div className="text-xs text-center text-[#f5a623] font-semibold mt-1">FX</div>
            </div>
          </motion.div>

          {/* Arrow with IDR */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-2"
          >
            <ArrowRight className="w-5 h-5 text-slate-400" />
            <div className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded font-mono text-xs font-semibold">IDR</div>
          </motion.div>

          {/* Client */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="flex-1 max-w-[140px]"
          >
            <div className="border-2 border-slate-300 rounded-lg p-3 bg-white">
              <Building2 className="w-6 h-6 text-slate-600 mx-auto mb-2" />
              <div className="text-xs font-medium text-center text-slate-700">
                {language === 'en' ? 'Client 1 Indonesia' : 'Client 1 Indonesia'}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Documents */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-4 flex justify-center gap-3"
        >
          <div className="w-20 h-24 bg-white border-2 border-slate-300 rounded-lg shadow-sm relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-8 bg-[#1e3a5f]"></div>
            <div className="pt-10 px-2 space-y-1">
              <div className="h-1 bg-slate-200 rounded"></div>
              <div className="h-1 bg-slate-200 rounded"></div>
              <div className="h-1 bg-slate-200 rounded w-3/4"></div>
            </div>
            <div className="absolute bottom-2 left-2 right-2 text-center text-[9px] font-medium text-slate-600">
              Service<br/>agreement
            </div>
          </div>
          <div className="w-20 h-24 bg-white border-2 border-slate-300 rounded-lg shadow-sm relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-8 bg-[#f5a623]"></div>
            <div className="pt-10 px-2 space-y-1">
              <div className="h-1 bg-slate-200 rounded"></div>
              <div className="h-1 bg-slate-200 rounded"></div>
              <div className="h-1 bg-slate-200 rounded w-3/4"></div>
            </div>
            <div className="absolute bottom-2 left-2 right-2 text-center text-[9px] font-medium text-slate-600">
              Transfer<br/>Order
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function OutboundTransferDiagram({ language = 'en' }) {
  return (
    <div className="space-y-6">
      {/* Without FX Change */}
      <div className="bg-white rounded-xl border-2 border-slate-200 p-6">
        <h4 className="font-semibold text-[#1e3a5f] mb-4 text-sm">
          {language === 'en' ? '2. Outbound Transfer: No currency change' : '2. Outbound Transfer: tanpa perubahan mata uang'}
        </h4>
        <div className="flex items-center justify-between gap-3">
          {/* Client */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="flex-1 max-w-[140px]"
          >
            <div className="border-2 border-slate-300 rounded-lg p-3 bg-white">
              <Building2 className="w-6 h-6 text-slate-600 mx-auto mb-2" />
              <div className="text-xs font-medium text-center text-slate-700">
                {language === 'en' ? 'Client 2 in Indonesia' : 'Client 2 in Indonesia'}
              </div>
            </div>
          </motion.div>

          {/* Arrow with USD */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2"
          >
            <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-mono text-xs font-semibold">USD</div>
            <ArrowRight className="w-5 h-5 text-slate-400" />
          </motion.div>

          {/* GAN */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex-1 max-w-[140px]"
          >
            <div className="border-2 border-[#1e3a5f] rounded-lg p-3 bg-gradient-to-br from-[#1e3a5f]/5 to-[#1e3a5f]/10">
              <Banknote className="w-6 h-6 text-[#1e3a5f] mx-auto mb-2" />
              <div className="text-xs font-bold text-center text-[#1e3a5f]">GAN</div>
            </div>
          </motion.div>

          {/* Arrow with USD */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-2"
          >
            <ArrowRight className="w-5 h-5 text-slate-400" />
            <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-mono text-xs font-semibold">USD</div>
          </motion.div>

          {/* Counterparty */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="flex-1 max-w-[140px]"
          >
            <div className="border-2 border-slate-300 rounded-lg p-3 bg-white">
              <Building2 className="w-6 h-6 text-slate-600 mx-auto mb-2" />
              <div className="text-xs font-medium text-center text-slate-700">
                {language === 'en' ? 'Counterparty 2 Overseas' : 'Counterparty 2 Overseas'}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Documents */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-4 flex justify-center gap-3"
        >
          <div className="w-20 h-24 bg-white border-2 border-slate-300 rounded-lg shadow-sm relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-8 bg-[#1e3a5f]"></div>
            <div className="pt-10 px-2 space-y-1">
              <div className="h-1 bg-slate-200 rounded"></div>
              <div className="h-1 bg-slate-200 rounded"></div>
              <div className="h-1 bg-slate-200 rounded w-3/4"></div>
            </div>
            <div className="absolute bottom-2 left-2 right-2 text-center text-[9px] font-medium text-slate-600">
              Service<br/>agreement
            </div>
          </div>
          <div className="w-20 h-24 bg-white border-2 border-slate-300 rounded-lg shadow-sm relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-8 bg-[#f5a623]"></div>
            <div className="pt-10 px-2 space-y-1">
              <div className="h-1 bg-slate-200 rounded"></div>
              <div className="h-1 bg-slate-200 rounded"></div>
              <div className="h-1 bg-slate-200 rounded w-3/4"></div>
            </div>
            <div className="absolute bottom-2 left-2 right-2 text-center text-[9px] font-medium text-slate-600">
              Transfer<br/>Order
            </div>
          </div>
        </motion.div>
      </div>

      {/* With FX Change */}
      <div className="bg-white rounded-xl border-2 border-slate-200 p-6">
        <h4 className="font-semibold text-[#1e3a5f] mb-4 text-sm">
          {language === 'en' ? '4. Outbound Transfer: With FX change (IDR to foreign)' : '4. Outbound Transfer: dengan perubahan mata uang (rupiah ke valuta asing)'}
        </h4>
        <div className="flex items-center justify-between gap-3">
          {/* Client */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="flex-1 max-w-[140px]"
          >
            <div className="border-2 border-slate-300 rounded-lg p-3 bg-white">
              <Building2 className="w-6 h-6 text-slate-600 mx-auto mb-2" />
              <div className="text-xs font-medium text-center text-slate-700">
                {language === 'en' ? 'Client 2 in Indonesia' : 'Client 2 in Indonesia'}
              </div>
            </div>
          </motion.div>

          {/* Arrow with IDR */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2"
          >
            <div className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded font-mono text-xs font-semibold">IDR</div>
            <ArrowRight className="w-5 h-5 text-slate-400" />
          </motion.div>

          {/* GAN */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex-1 max-w-[140px]"
          >
            <div className="border-2 border-[#1e3a5f] rounded-lg p-3 bg-gradient-to-br from-[#1e3a5f]/5 to-[#1e3a5f]/10">
              <Banknote className="w-6 h-6 text-[#1e3a5f] mx-auto mb-2" />
              <div className="text-xs font-bold text-center text-[#1e3a5f]">GAN</div>
              <div className="text-xs text-center text-[#f5a623] font-semibold mt-1">FX</div>
            </div>
          </motion.div>

          {/* Arrow with USD */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-2"
          >
            <ArrowRight className="w-5 h-5 text-slate-400" />
            <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-mono text-xs font-semibold">USD</div>
          </motion.div>

          {/* Counterparty */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="flex-1 max-w-[140px]"
          >
            <div className="border-2 border-slate-300 rounded-lg p-3 bg-white">
              <Building2 className="w-6 h-6 text-slate-600 mx-auto mb-2" />
              <div className="text-xs font-medium text-center text-slate-700">
                {language === 'en' ? 'Counterparty 2 Overseas' : 'Counterparty 2 Overseas'}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Documents */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-4 flex justify-center gap-3"
        >
          <div className="w-20 h-24 bg-white border-2 border-slate-300 rounded-lg shadow-sm relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-8 bg-[#1e3a5f]"></div>
            <div className="pt-10 px-2 space-y-1">
              <div className="h-1 bg-slate-200 rounded"></div>
              <div className="h-1 bg-slate-200 rounded"></div>
              <div className="h-1 bg-slate-200 rounded w-3/4"></div>
            </div>
            <div className="absolute bottom-2 left-2 right-2 text-center text-[9px] font-medium text-slate-600">
              Service<br/>agreement
            </div>
          </div>
          <div className="w-20 h-24 bg-white border-2 border-slate-300 rounded-lg shadow-sm relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-8 bg-[#f5a623]"></div>
            <div className="pt-10 px-2 space-y-1">
              <div className="h-1 bg-slate-200 rounded"></div>
              <div className="h-1 bg-slate-200 rounded"></div>
              <div className="h-1 bg-slate-200 rounded w-3/4"></div>
            </div>
            <div className="absolute bottom-2 left-2 right-2 text-center text-[9px] font-medium text-slate-600">
              Transfer<br/>Order
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}