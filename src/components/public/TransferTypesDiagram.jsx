import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowDown, Building2, Banknote } from 'lucide-react';

export function InboundTransferDiagram({ language = 'en' }) {
  return (
    <div className="space-y-6">
      {/* 1. Inbound Transfer: USD -> USD */}
      <div className="bg-white rounded-xl border-2 border-slate-200 p-6">
        <h4 className="font-semibold text-[#1e3a5f] mb-4 text-sm">
          {language === 'en' ? '1. Inbound Transfer world currency' : '1. Inbound Transfer mata uang dunia'}
        </h4>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-3">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="w-full md:flex-1 md:max-w-[140px]"
          >
            <div className="border-2 border-slate-300 rounded-lg p-3 bg-white">
              <Building2 className="w-6 h-6 text-slate-600 mx-auto mb-2" />
              <div className="text-xs font-medium text-center text-slate-700">
                {language === 'en' ? 'Counterparty 1 Overseas' : 'Counterparty 1 Overseas'}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col md:flex-row items-center gap-2"
          >
            <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-mono text-xs font-semibold">USD</div>
            <ArrowRight className="hidden md:block w-5 h-5 text-slate-400" />
            <ArrowDown className="md:hidden w-5 h-5 text-slate-400" />
          </motion.div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="w-full md:flex-1 md:max-w-[140px]"
          >
            <div className="border-2 border-[#1e3a5f] rounded-lg p-3 bg-gradient-to-br from-[#1e3a5f]/5 to-[#1e3a5f]/10">
              <Banknote className="w-6 h-6 text-[#1e3a5f] mx-auto mb-2" />
              <div className="text-xs font-bold text-center text-[#1e3a5f]">GAN</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex flex-col md:flex-row items-center gap-2"
          >
            <ArrowRight className="hidden md:block w-5 h-5 text-slate-400" />
            <ArrowDown className="md:hidden w-5 h-5 text-slate-400" />
            <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-mono text-xs font-semibold">USD</div>
          </motion.div>

          <motion.div
            initial={{ x: 20, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="w-full md:flex-1 md:max-w-[140px]"
          >
            <div className="border-2 border-slate-300 rounded-lg p-3 bg-white">
              <Building2 className="w-6 h-6 text-slate-600 mx-auto mb-2" />
              <div className="text-xs font-medium text-center text-slate-700">
                {language === 'en' ? 'Client 1 Indonesia' : 'Client 1 Indonesia'}
              </div>
            </div>
          </motion.div>
        </div>

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
              Service<br />agreement
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
              Transfer<br />Order
            </div>
          </div>
        </motion.div>
      </div>

      {/* 2. Inbound Transfer: USD -> IDR */}
      <div className="bg-white rounded-xl border-2 border-slate-200 p-6">
        <h4 className="font-semibold text-[#1e3a5f] mb-4 text-sm">
          {language === 'en' ? '2. Inbound Transfer local currency' : '2. Inbound Transfer mata uang lokal'}
        </h4>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-3">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="w-full md:flex-1 md:max-w-[140px]"
          >
            <div className="border-2 border-slate-300 rounded-lg p-3 bg-white">
              <Building2 className="w-6 h-6 text-slate-600 mx-auto mb-2" />
              <div className="text-xs font-medium text-center text-slate-700">
                {language === 'en' ? 'Counterparty 3 Overseas' : 'Counterparty 3 Overseas'}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col md:flex-row items-center gap-2"
          >
            <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-mono text-xs font-semibold">USD</div>
            <ArrowRight className="hidden md:block w-5 h-5 text-slate-400" />
            <ArrowDown className="md:hidden w-5 h-5 text-slate-400" />
          </motion.div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="w-full md:flex-1 md:max-w-[140px]"
          >
            <div className="border-2 border-[#1e3a5f] rounded-lg p-3 bg-gradient-to-br from-[#1e3a5f]/5 to-[#1e3a5f]/10">
              <Banknote className="w-6 h-6 text-[#1e3a5f] mx-auto mb-2" />
              <div className="text-xs font-bold text-center text-[#1e3a5f]">GAN</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex flex-col md:flex-row items-center gap-2"
          >
            <ArrowRight className="hidden md:block w-5 h-5 text-slate-400" />
            <ArrowDown className="md:hidden w-5 h-5 text-slate-400" />
            <div className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded font-mono text-xs font-semibold">IDR</div>
          </motion.div>

          <motion.div
            initial={{ x: 20, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="w-full md:flex-1 md:max-w-[140px]"
          >
            <div className="border-2 border-slate-300 rounded-lg p-3 bg-white">
              <Building2 className="w-6 h-6 text-slate-600 mx-auto mb-2" />
              <div className="text-xs font-medium text-center text-slate-700">
                {language === 'en' ? 'Client 3 Indonesia' : 'Client 3 Indonesia'}
              </div>
            </div>
          </motion.div>
        </div>

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
              Service<br />agreement
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
              Transfer<br />Order
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
      {/* 3. Outbound Transfer: USD -> USD */}
      <div className="bg-white rounded-xl border-2 border-slate-200 p-6">
        <h4 className="font-semibold text-[#1e3a5f] mb-4 text-sm">
          {language === 'en' ? '3. Outbound Transfer world currency' : '3. Outbound Transfer mata uang dunia'}
        </h4>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-3">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="w-full md:flex-1 md:max-w-[140px]"
          >
            <div className="border-2 border-slate-300 rounded-lg p-3 bg-white">
              <Building2 className="w-6 h-6 text-slate-600 mx-auto mb-2" />
              <div className="text-xs font-medium text-center text-slate-700">
                {language === 'en' ? 'Client 2 in Indonesia' : 'Client 2 in Indonesia'}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col md:flex-row items-center gap-2"
          >
            <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-mono text-xs font-semibold">USD</div>
            <ArrowRight className="hidden md:block w-5 h-5 text-slate-400" />
            <ArrowDown className="md:hidden w-5 h-5 text-slate-400" />
          </motion.div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="w-full md:flex-1 md:max-w-[140px]"
          >
            <div className="border-2 border-[#1e3a5f] rounded-lg p-3 bg-gradient-to-br from-[#1e3a5f]/5 to-[#1e3a5f]/10">
              <Banknote className="w-6 h-6 text-[#1e3a5f] mx-auto mb-2" />
              <div className="text-xs font-bold text-center text-[#1e3a5f]">GAN</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex flex-col md:flex-row items-center gap-2"
          >
            <ArrowRight className="hidden md:block w-5 h-5 text-slate-400" />
            <ArrowDown className="md:hidden w-5 h-5 text-slate-400" />
            <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-mono text-xs font-semibold">USD</div>
          </motion.div>

          <motion.div
            initial={{ x: 20, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="w-full md:flex-1 md:max-w-[140px]"
          >
            <div className="border-2 border-slate-300 rounded-lg p-3 bg-white">
              <Building2 className="w-6 h-6 text-slate-600 mx-auto mb-2" />
              <div className="text-xs font-medium text-center text-slate-700">
                {language === 'en' ? 'Counterparty 2 Overseas' : 'Counterparty 2 Overseas'}
              </div>
            </div>
          </motion.div>
        </div>

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
              Service<br />agreement
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
              Transfer<br />Order
            </div>
          </div>
        </motion.div>
      </div>

      {/* 4. Outbound Transfer: IDR -> USD */}
      <div className="bg-white rounded-xl border-2 border-slate-200 p-6">
        <h4 className="font-semibold text-[#1e3a5f] mb-4 text-sm">
          {language === 'en' ? '4. Outbound Transfer local currency' : '4. Outbound Transfer mata uang lokal'}
        </h4>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-3">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="w-full md:flex-1 md:max-w-[140px]"
          >
            <div className="border-2 border-slate-300 rounded-lg p-3 bg-white">
              <Building2 className="w-6 h-6 text-slate-600 mx-auto mb-2" />
              <div className="text-xs font-medium text-center text-slate-700">
                {language === 'en' ? 'Client 4 in Indonesia' : 'Client 4 in Indonesia'}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col md:flex-row items-center gap-2"
          >
            <div className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded font-mono text-xs font-semibold">IDR</div>
            <ArrowRight className="hidden md:block w-5 h-5 text-slate-400" />
            <ArrowDown className="md:hidden w-5 h-5 text-slate-400" />
          </motion.div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="w-full md:flex-1 md:max-w-[140px]"
          >
            <div className="border-2 border-[#1e3a5f] rounded-lg p-3 bg-gradient-to-br from-[#1e3a5f]/5 to-[#1e3a5f]/10">
              <Banknote className="w-6 h-6 text-[#1e3a5f] mx-auto mb-2" />
              <div className="text-xs font-bold text-center text-[#1e3a5f]">GAN</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex flex-col md:flex-row items-center gap-2"
          >
            <ArrowRight className="hidden md:block w-5 h-5 text-slate-400" />
            <ArrowDown className="md:hidden w-5 h-5 text-slate-400" />
            <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-mono text-xs font-semibold">USD</div>
          </motion.div>

          <motion.div
            initial={{ x: 20, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="w-full md:flex-1 md:max-w-[140px]"
          >
            <div className="border-2 border-slate-300 rounded-lg p-3 bg-white">
              <Building2 className="w-6 h-6 text-slate-600 mx-auto mb-2" />
              <div className="text-xs font-medium text-center text-slate-700">
                {language === 'en' ? 'Counterparty 4 Overseas' : 'Counterparty 4 Overseas'}
              </div>
            </div>
          </motion.div>
        </div>

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
              Service<br />agreement
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
              Transfer<br />Order
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}