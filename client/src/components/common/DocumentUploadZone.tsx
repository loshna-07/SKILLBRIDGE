import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, X, ExternalLink, Loader2 } from 'lucide-react';
import api from '../../services/api';

interface DocumentUploadZoneProps {
  fileUrl?: string | null;
  onUploadSuccess: (url: string, fileName?: string) => void;
  onRemove?: () => void;
  label?: string;
  accept?: string;
  maxSizeMB?: number;
  helperText?: string;
  required?: boolean;
}

export const DocumentUploadZone: React.FC<DocumentUploadZoneProps> = ({
  fileUrl,
  onUploadSuccess,
  onRemove,
  label = 'Upload Supporting Document',
  accept = '.pdf,.png,.jpg,.jpeg,.webp',
  maxSizeMB = 5,
  helperText = 'Supported formats: PDF, PNG, JPG, JPEG, WebP (Max 5MB)',
  required = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<'upload' | 'url'>('upload');
  const [manualUrl, setManualUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    setError(null);

    // Validate size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds ${maxSizeMB}MB limit.`);
      return;
    }

    // Validate format
    const allowedExtensions = accept.split(',').map((ext) => ext.trim().toLowerCase());
    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!allowedExtensions.includes(fileExtension) && !allowedExtensions.includes('*')) {
      setError(`Invalid file type. Allowed: ${accept}`);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setUploadProgress(20);

    try {
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(Math.min(95, Math.max(20, percent)));
          }
        },
      });

      const serverFileUrl = response.data?.fileUrl || response.data?.url;
      if (!serverFileUrl) {
        throw new Error('Upload completed, but no URL was returned.');
      }

      setUploadProgress(100);
      setUploadedFileName(file.name);
      onUploadSuccess(serverFileUrl, file.name);
    } catch (err: any) {
      console.error('File upload error:', err);
      setError(err.response?.data?.message || err.message || 'File upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleManualUrlSubmit = () => {
    if (!manualUrl.trim()) {
      setError('Please provide a valid document URL.');
      return;
    }
    setError(null);
    onUploadSuccess(manualUrl.trim(), 'External Document');
  };

  const handleRemove = () => {
    setUploadedFileName(null);
    setManualUrl('');
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onRemove) {
      onRemove();
    } else {
      onUploadSuccess('', '');
    }
  };

  const isPdf = fileUrl?.toLowerCase().includes('.pdf');

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="flex items-center gap-1.5 text-[11px]">
          <button
            type="button"
            onClick={() => {
              setInputMode('upload');
              setError(null);
            }}
            className={`px-2 py-0.5 rounded font-medium transition-colors ${
              inputMode === 'upload'
                ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            File Upload
          </button>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <button
            type="button"
            onClick={() => {
              setInputMode('url');
              setError(null);
            }}
            className={`px-2 py-0.5 rounded font-medium transition-colors ${
              inputMode === 'url'
                ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            URL Link
          </button>
        </div>
      </div>

      {/* Uploaded File Display */}
      {fileUrl ? (
        <div className="flex items-center justify-between p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 transition-all">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              {isPdf ? <FileText className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            </div>
            <div className="overflow-hidden text-left">
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                {uploadedFileName || fileUrl.split('/').pop() || 'Document Attached'}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Ready for verification
                </span>
                <a
                  href={fileUrl.startsWith('http') ? fileUrl : `http://localhost:5000${fileUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-0.5 ml-1"
                >
                  <ExternalLink className="w-3 h-3" /> View
                </a>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 rounded-lg transition-colors"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
              title="Remove document"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : inputMode === 'upload' ? (
        /* Drag and Drop Zone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20'
              : 'border-slate-300 dark:border-slate-700 hover:border-brand-400 dark:hover:border-brand-500 bg-slate-50/50 dark:bg-slate-900/40'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
          />

          {uploading ? (
            <div className="py-2 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 text-brand-600 dark:text-brand-400 animate-spin" />
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Uploading document... {uploadProgress}%
              </p>
              <div className="w-48 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-600 dark:bg-brand-400 transition-all duration-200 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-1.5">
              <div className="w-9 h-9 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-0.5">
                <Upload className="w-4 h-4" />
              </div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Click to browse <span className="font-normal text-slate-500 dark:text-slate-400">or drag & drop</span>
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{helperText}</p>
            </div>
          )}
        </div>
      ) : (
        /* Manual URL Input */
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="https://example.com/certificate.pdf or drive link"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            className="flex-1 px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleManualUrlSubmit}
            className="px-3.5 py-2 text-xs font-medium bg-brand-600 hover:bg-brand-700 text-white rounded-xl transition-colors shrink-0"
          >
            Attach Link
          </button>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1 mt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};
