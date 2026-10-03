import React, { useState, useRef } from 'react';
import { useDocumentSystem } from '../context/DocumentContext';
import { DocumentRecord } from '../types/document';
import { X, Layers, UploadCloud, FileCheck, CheckCircle2 } from 'lucide-react';
import { computeFileSha256, formatBytes } from '../utils/crypto';

interface NewVersionModalProps {
  document: DocumentRecord | null;
  onClose: () => void;
}

export const NewVersionModal: React.FC<NewVersionModalProps> = ({
  document: doc,
  onClose,
}) => {
  const { createNewVersion, addToast } = useDocumentSystem();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [changeReason, setChangeReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!doc) return null;

  const nextVer = (doc.currentVersionNumber + 1.0).toFixed(1);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      addToast({
        type: 'warning',
        title: 'Selecciona el archivo nuevo',
        message: 'Por favor elige el archivo actualizado que deseas guardar.',
      });
      return;
    }

    if (!changeReason.trim()) {
      addToast({
        type: 'warning',
        title: 'Cuéntanos qué cambió',
        message: 'Escribe una breve nota para recordar por qué se sube esta nueva versión.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createNewVersion({
        documentId: doc.id,
        file: selectedFile,
        reason: changeReason,
      });
      onClose();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'No se pudo guardar la versión',
        message: err.message || 'Error al procesar el archivo.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Subir Nueva Versión (v{nextVer})
              </h2>
              <p className="text-xs text-slate-500 truncate max-w-xs">
                {doc.metadata.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          
          <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-xl space-y-1">
            <p className="font-bold text-purple-950">Tu archivo anterior está a salvo</p>
            <p className="text-purple-800 text-[11px] leading-relaxed">
              La versión actual (v{doc.currentVersionNumber.toFixed(1)}) se conservará en el historial. Podrás consultarla o descargarla cuando quieras.
            </p>
          </div>

          {/* File Picker */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Seleccionar el Archivo Actualizado *
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                selectedFile 
                  ? 'border-purple-500 bg-purple-50/40' 
                  : 'border-slate-300 hover:border-purple-500 bg-slate-50/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="hidden"
              />
              {selectedFile ? (
                <div className="space-y-1">
                  <FileCheck className="w-7 h-7 mx-auto text-purple-600" />
                  <p className="font-bold text-slate-900">{selectedFile.name}</p>
                  <p className="text-[11px] text-slate-500">
                    {formatBytes(selectedFile.size)} · Listo para guardar como versión v{nextVer}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <UploadCloud className="w-7 h-7 mx-auto text-slate-400" />
                  <p className="font-semibold text-slate-800">Haz clic aquí para elegir el archivo</p>
                  <p className="text-[11px] text-slate-400">PDF, Word, Excel, imagen o reporte</p>
                </div>
              )}
            </div>
          </div>

          {/* Note / Reason */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              ¿Qué cambió en este documento? *
            </label>
            <textarea
              rows={3}
              required
              value={changeReason}
              onChange={(e) => setChangeReason(e.target.value)}
              placeholder="Ejemplo: Se corrigió la fecha, se agregaron las firmas o se actualizaron los precios..."
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-slate-600 hover:text-slate-900"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!selectedFile || !changeReason.trim() || isSubmitting}
              className="px-4 py-2 font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg shadow-xs transition-colors"
            >
              {isSubmitting ? 'Guardando...' : `Guardar como Versión v${nextVer}`}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
