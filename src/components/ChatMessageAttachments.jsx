import React, { useState } from 'react';
import {
  FileText,
  FileSpreadsheet,
  FileCode,
  FileArchive,
  File,
  Download,
  ExternalLink,
  Eye,
  X,
  FileCheck2,
  Image as ImageIcon
} from 'lucide-react';
import { resolveMediaUrl } from '../utils/mediaUrl';

// Format bytes into human-readable size
export function formatFileSize(bytes) {
  if (!bytes || isNaN(bytes)) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Get file styling and icon by extension or mime type
export function getFileInfo(fileName = '', mimeType = '') {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const mime = mimeType?.toLowerCase() || '';

  if (mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext)) {
    return {
      type: 'image',
      badge: 'IMG',
      color: 'from-sky-500 to-blue-600',
      badgeBg: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30',
      Icon: ImageIcon
    };
  }
  if (mime.includes('pdf') || ext === 'pdf') {
    return {
      type: 'pdf',
      badge: 'PDF',
      color: 'from-rose-500 to-red-600',
      badgeBg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
      Icon: FileText
    };
  }
  if (['doc', 'docx', 'rtf'].includes(ext) || mime.includes('word') || mime.includes('document')) {
    return {
      type: 'doc',
      badge: 'DOC',
      color: 'from-blue-600 to-indigo-600',
      badgeBg: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
      Icon: FileText
    };
  }
  if (['xls', 'xlsx', 'csv'].includes(ext) || mime.includes('sheet') || mime.includes('excel')) {
    return {
      type: 'sheet',
      badge: 'XLS',
      color: 'from-emerald-600 to-teal-600',
      badgeBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      Icon: FileSpreadsheet
    };
  }
  if (['ppt', 'pptx'].includes(ext) || mime.includes('presentation')) {
    return {
      type: 'presentation',
      badge: 'PPT',
      color: 'from-amber-500 to-orange-600',
      badgeBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
      Icon: FileText
    };
  }
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return {
      type: 'archive',
      badge: 'ZIP',
      color: 'from-purple-600 to-violet-600',
      badgeBg: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
      Icon: FileArchive
    };
  }
  if (['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'html', 'css', 'json', 'sql'].includes(ext)) {
    return {
      type: 'code',
      badge: 'CODE',
      color: 'from-cyan-600 to-blue-600',
      badgeBg: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
      Icon: FileCode
    };
  }

  return {
    type: 'file',
    badge: ext ? ext.toUpperCase().slice(0, 4) : 'FILE',
    color: 'from-slate-600 to-slate-700',
    badgeBg: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30',
    Icon: File
  };
}

export default function ChatMessageAttachments({ attachments, isMe = false }) {
  const [selectedImage, setSelectedImage] = useState(null);

  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="space-y-2 mt-2">
      {attachments.map((att, idx) => {
        const fileInfo = getFileInfo(att.name, att.fileType);
        const isImage = fileInfo.type === 'image';
        const fileUrl = resolveMediaUrl(att.url) || '#';
        const fileName = att.name || 'Shared Document';
        const sizeStr = formatFileSize(att.fileSize);

        if (isImage) {
          return (
            <div key={idx} className="relative group overflow-hidden rounded-xl border border-black/10 dark:border-white/10 max-w-sm">
              <img
                src={fileUrl}
                alt={fileName}
                className="w-full max-h-72 object-cover rounded-xl cursor-pointer transition-transform duration-300 group-hover:scale-105"
                onClick={() => setSelectedImage({ url: fileUrl, name: fileName })}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2.5 flex items-end justify-between">
                <span className="text-[11px] text-white font-semibold truncate max-w-[70%]">
                  {fileName}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedImage({ url: fileUrl, name: fileName })}
                    className="p-1 rounded-lg bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-colors"
                    title="Enlarge image"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href={fileUrl}
                    download={fileName}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 rounded-lg bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-colors"
                    title="Download image"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          );
        }

        const { Icon, badge, color, badgeBg } = fileInfo;

        return (
          <div
            key={idx}
            className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
              isMe
                ? 'bg-white/15 dark:bg-black/20 border-white/20 text-white shadow-sm hover:bg-white/20'
                : 'bg-slate-50 dark:bg-[#0A1020] border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white shadow-sm hover:border-sky-500/40'
            }`}
          >
            {/* File Icon Badge */}
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} text-white flex flex-col items-center justify-center shrink-0 shadow-md`}>
              <Icon className="w-4 h-4 mb-0.5" />
              <span className="text-[8px] font-black tracking-wider leading-none">{badge}</span>
            </div>

            {/* File Details */}
            <div className="flex-1 min-w-0 pr-1">
              <p className="text-xs font-bold truncate select-all leading-tight">
                {fileName}
              </p>
              <div className="flex items-center gap-2 mt-0.5 text-[10px] opacity-80 font-medium">
                {sizeStr && <span>{sizeStr}</span>}
                <span className="w-1 h-1 rounded-full bg-current opacity-60" />
                <span className="capitalize">{fileInfo.type === 'pdf' ? 'PDF Document' : fileInfo.type === 'sheet' ? 'Spreadsheet' : 'Document'}</span>
              </div>
            </div>

            {/* Direct Open / Download Actions */}
            <div className="flex items-center gap-1 shrink-0">
              <a
                href={fileUrl}
                download={fileName}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 rounded-xl transition-all flex items-center justify-center ${
                  isMe
                    ? 'bg-white/20 hover:bg-white/30 text-white'
                    : 'bg-sky-500 hover:bg-sky-400 text-white shadow-md shadow-sky-500/20 active:scale-95'
                }`}
                title={`Download ${fileName}`}
              >
                <Download className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        );
      })}

      {/* Lightbox Modal for Image Previews */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
              <a
                href={selectedImage.url}
                download={selectedImage.name}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-colors"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </a>
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <img
              src={selectedImage.url}
              alt={selectedImage.name}
              className="max-h-[82vh] max-w-full rounded-2xl object-contain shadow-2xl"
            />
            <p className="text-white text-xs font-semibold mt-3 bg-black/50 px-3 py-1 rounded-full">
              {selectedImage.name}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
