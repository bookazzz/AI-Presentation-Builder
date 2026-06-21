'use client';

import { useRef, useState, useCallback } from 'react';
import './FileUpload.css';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  accept?: string;
  maxSizeMB?: number;
}

export default function FileUpload({ onFileSelect, accept = '.txt,.docx,.xlsx,.csv,.pdf', maxSizeMB = 20 }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragover, setDragover] = useState(false);

  const handleFile = useCallback((f: File) => {
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (f.size > maxBytes) {
      alert(`Файл слишком большой. Максимум ${maxSizeMB} МБ.`);
      return;
    }
    setFile(f);
    onFileSelect(f);
  }, [maxSizeMB, onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragover(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleRemove = useCallback(() => {
    setFile(null);
    onFileSelect(null);
    if (inputRef.current) inputRef.current.value = '';
  }, [onFileSelect]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} Б`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
  };

  return (
    <div
      className={['file-upload', dragover ? 'file-upload--dragover' : '', file ? 'file-upload--active' : ''].filter(Boolean).join(' ')}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragover(true); }}
      onDragLeave={() => setDragover(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        style={{ display: 'none' }}
      />

      {!file ? (
        <>
          <div className="file-upload__icon">📄</div>
          <div className="file-upload__title">Перетащите файл сюда или нажмите для выбора</div>
          <div className="file-upload__hint">TXT, DOCX, XLSX, CSV, PDF до {maxSizeMB} МБ</div>
          <div className="file-upload__formats">
            {['TXT', 'DOCX', 'XLSX', 'CSV', 'PDF'].map((fmt) => (
              <span key={fmt} className="file-upload__format">{fmt}</span>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="file-upload__icon">✅</div>
          <div className="file-upload__title">Файл загружен</div>
          <div className="file-upload__file-info">
            <span className="file-upload__file-name">{file.name}</span>
            <span className="file-upload__file-size">{formatSize(file.size)}</span>
            <span className="file-upload__remove" onClick={(e) => { e.stopPropagation(); handleRemove(); }}>
              Удалить
            </span>
          </div>
        </>
      )}
    </div>
  );
}
