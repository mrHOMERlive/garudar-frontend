import React, { useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * A single bank drop target. Mirrors dropping заявки into one of the three
 * bank folders (GPB / VTB / SPB). Native HTML5 drag-and-drop with a
 * click-to-browse fallback; validates extensions before handing files up.
 *
 * Props:
 *  - title, hint, icon (lucide component)
 *  - accept: array of lowercase extensions, e.g. ['.xls', '.xlsx']
 *  - disabled, busy: boolean
 *  - onFiles(files: File[]): called with the validated, non-empty file list
 *  - onReject(message): called when files fail validation
 */
export default function DropZone({
  title,
  hint,
  icon: Icon,
  accept = [],
  disabled = false,
  busy = false,
  onFiles,
  onReject,
}) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const extOf = (name) => {
    const i = name.lastIndexOf('.');
    return i >= 0 ? name.slice(i).toLowerCase() : '';
  };

  const handle = (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;
    const bad = files.filter((f) => accept.length && !accept.includes(extOf(f.name)));
    if (bad.length) {
      onReject?.(`${title}: expected ${accept.join('/')} — ${bad.map((f) => f.name).join(', ')}`);
      return;
    }
    onFiles?.(files);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled || busy) return;
    handle(e.dataTransfer.files);
  };

  return (
    <button
      type="button"
      disabled={disabled || busy}
      onClick={() => !disabled && !busy && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled && !busy) setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed',
        'p-6 text-center transition-colors min-h-[150px] w-full',
        disabled
          ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
          : 'border-slate-300 bg-white text-slate-600 hover:border-[#1e3a5f] hover:bg-slate-50 cursor-pointer',
        dragOver && !disabled && 'border-[#1e3a5f] bg-blue-50 ring-2 ring-[#1e3a5f]/20'
      )}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept.join(',')}
        className="hidden"
        onChange={(e) => {
          handle(e.target.files);
          e.target.value = '';
        }}
      />
      {busy ? (
        <Loader2 className="w-7 h-7 animate-spin text-[#1e3a5f]" />
      ) : (
        Icon && <Icon className={cn('w-7 h-7', disabled ? 'text-slate-300' : 'text-[#1e3a5f]')} />
      )}
      <span className="font-medium text-sm">{title}</span>
      {hint && <span className="text-xs text-slate-400">{hint}</span>}
      <span className="text-[11px] text-slate-400">
        {busy ? 'Uploading…' : `Drop files or click · ${accept.join(' / ')}`}
      </span>
    </button>
  );
}
