import React from 'react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from 'lucide-react';
import { formatThreshold } from './thresholdUtils';

export default function ThresholdConfirmDialog({ open, onConfirm, onCancel, amount, currency }) {
  return (
    <AlertDialog open={open} onOpenChange={(val) => !val && onCancel()}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            Regulatory Threshold Alert
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-sm text-slate-700">
              <p>
                Your order amount of <strong>{currency} {parseFloat(amount).toLocaleString('en-US')}</strong> meets
                or exceeds the <strong>{formatThreshold(currency)}</strong> regulatory reporting threshold
                for remittance companies.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="font-semibold text-amber-900 mb-2">You are required to provide:</p>
                <ul className="text-xs text-amber-800 list-disc list-inside space-y-1">
                  <li>Invoice or Proforma Invoice</li>
                  <li>Sales Contract or Purchase Order</li>
                  <li>Documents proving the transfer purpose</li>
                  <li>Beneficial Ownership declaration (if applicable)</li>
                </ul>
              </div>
              <p className="text-xs text-slate-500 italic">
                This order will be submitted and flagged for enhanced due diligence review.
                Please upload supporting documents promptly.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} className="border-slate-300">
            Go Back & Review
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            I Understand, Submit Order
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
