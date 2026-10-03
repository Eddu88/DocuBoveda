import React, { useState, useRef } from 'react';
import { useDocumentSystem } from '../context/DocumentContext';
import { DocumentType, DocumentCategory, ConfidentialityLevel, DocumentStatus } from '../types/document';
import { 
  X, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  ShieldCheck, 
  Calendar,
  Layers,
  FileCheck,
  Building
} from 'lucide-react';
import { computeFileSha256, formatBytes } from '../utils/crypto';

interface UploadModalProps {
  isOpen: boolean;
  initialBulkMode?: boolean;
  onClose: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  initialBulkMode = false,
  onClose,
}) => {
  const { createDocument, createBulkDocuments, currentUser, addToast } = useDocumentSystem();

  const [isBulkMode, setIsBulkMode] = useState(initialBulkMode);
  
  // Single Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileSha256, setFileSha256] = useState<string>('');
  const [isHashing, setIsHashing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [documentType, setDocumentType] = useState<DocumentType>('Contrato');
  const [category, setCategory] = useState<DocumentCategory>('Operaciones');
  const [responsibleArea, setResponsibleArea] = useState(currentUser.department || 'Administración');
  const [documentDate, setDocumentDate] = useState(new Date().toISOString().split('T')[0]);
  const [confidentiality, setConfidentiality] = useState<ConfidentialityLevel>('Interno');
  const [dossierNumber, setDossierNumber] = useState('');
  const [entityOrVendor, setEntityOrVendor] = useState('');
  const [observations, setObservations] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Bulk Upload State
  const [bulkFiles, setBulkFiles] = useState<File[]>([]);
  const [bulkType, setBulkType] = useState<DocumentType>('Informe Técnico');
  const [bulkArea, setBulkArea] = useState(currentUser.department || 'Operaciones');
  const [bulkConfidentiality, setBulkConfidentiality] = useState<ConfidentialityLevel>('Interno');
  const [bulkObservations, setBulkObservations] = useState('');

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!title) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
        setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }

      setIsHashing(true);
      try {
        const hash = await computeFileSha256(file);
        setFileSha256(hash);
      } catch (err) {
        console.error('Error hashing file', err);
      } finally {
        setIsHashing(false);
      }
    }
  };

  const handleBulkFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setBulkFiles(Array.from(e.target.files));
    }
  };

  const handleSubmitSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      addToast({
        type: 'warning',
        title: 'Selecciona un archivo',
        message: 'Por favor elige un archivo PDF, Word, Excel o imagen.',
      });
      return;
    }
    if (!title.trim()) {
      addToast({
        type: 'warning',
        title: 'Título necesario',
        message: 'Escribe un nombre o descripción para identificar este documento.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createDocument({
        file: selectedFile,
        metadata: {
          title,
          documentType,
          category,
          responsibleArea,
          documentDate,
          status: 'Vigente',
          confidentiality,
          observations,
          dossierNumber: dossierNumber.trim() || undefined,
          entityOrVendor: entityOrVendor.trim() || undefined,
          keywords: [documentType.toLowerCase(), responsibleArea.toLowerCase()],
          relatedDocumentIds: [],
        },
        initialChangeReason: 'Carga inicial del documento',
      });

      onClose();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'No se pudo guardar',
        message: err.message || 'Ocurrió un error al guardar el documento.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitBulk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bulkFiles.length === 0) {
      addToast({
        type: 'warning',
        title: 'Selecciona archivos',
        message: 'Elige al menos un archivo para subir.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createBulkDocuments({
        files: bulkFiles,
        commonMetadata: {
          documentType: bulkType,
          category: 'Operaciones',
          responsibleArea: bulkArea,
          confidentiality: bulkConfidentiality,
          observations: bulkObservations || 'Carga múltiple de archivos',
        },
      });
      onClose();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Error al subir archivos',
        message: err.message || 'No se pudieron procesar todos los archivos.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {isBulkMode ? 'Subir Varios Archivos a la Vez' : 'Subir y Proteger Documento'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tus documentos se guardan con copia de respaldo y sello de autenticidad antifraude.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="px-5 pt-3 border-b border-slate-200 flex gap-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setIsBulkMode(false)}
            className={`pb-2.5 border-b-2 transition-colors ${
              !isBulkMode 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Subir un documento individual
          </button>
          <button
            type="button"
            onClick={() => setIsBulkMode(true)}
            className={`pb-2.5 border-b-2 transition-colors ${
              isBulkMode 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Subir varios archivos juntos (Lote)
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 text-xs">
          {!isBulkMode ? (
            <form onSubmit={handleSubmitSingle} className="space-y-4">
              
              {/* File Dropzone */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Selecciona el Archivo *
                </label>
                
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
                    selectedFile 
                      ? 'border-emerald-500 bg-emerald-50/50' 
                      : 'border-slate-300 hover:border-indigo-500 bg-slate-50/60'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.doc,.xlsx,.xls,.png,.jpg,.jpeg,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {selectedFile ? (
                    <div className="space-y-1">
                      <FileCheck className="w-8 h-8 mx-auto text-emerald-600" />
                      <p className="font-bold text-slate-900">{selectedFile.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {formatBytes(selectedFile.size)} · Listo para proteger
                      </p>
                      <div className="pt-1 text-[11px] text-emerald-700 font-medium flex items-center justify-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Sello digital antifraude generado automáticamente</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <UploadCloud className="w-8 h-8 mx-auto text-indigo-500" />
                      <p className="font-semibold text-slate-800">
                        Haz clic aquí para seleccionar o arrastra tu archivo
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Admite PDF, Word, Excel, fotos e informes escaneados
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Title & Inputs */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nombre o Título del Documento *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej. Contrato de Mantenimiento, Ficha del Paciente, Factura..."
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tipo de Documento
                  </label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                  >
                    <option value="Contrato">Contrato / Convenio</option>
                    <option value="Factura">Factura / Boleta / Recibo</option>
                    <option value="Acta">Consentimiento / Acta / Ficha</option>
                    <option value="Informe Técnico">Informe Técnico / Orden de Trabajo</option>
                    <option value="Resolución">Certificado / Resolución</option>
                    <option value="Memorándum">Guía de Despacho / Nota</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Área o Responsable
                  </label>
                  <input
                    type="text"
                    value={responsibleArea}
                    onChange={(e) => setResponsibleArea(e.target.value)}
                    placeholder="Ej. Clínica, Taller, Operaciones..."
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Cliente, Paciente o Proveedor (Opcional)
                  </label>
                  <input
                    type="text"
                    value={entityOrVendor}
                    onChange={(e) => setEntityOrVendor(e.target.value)}
                    placeholder="Ej. Juan Pérez, Ferretería El Minero..."
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    N° de Referencia o Carpeta (Opcional)
                  </label>
                  <input
                    type="text"
                    value={dossierNumber}
                    onChange={(e) => setDossierNumber(e.target.value)}
                    placeholder="Ej. EXP-2026, OT-440..."
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Notas adicionales (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Detalles importantes sobre este archivo..."
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!selectedFile || isSubmitting || isHashing}
                  className="px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-xs transition-colors"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar y Proteger'}
                </button>
              </div>

            </form>
          ) : (
            <form onSubmit={handleSubmitBulk} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Elige los archivos para subir juntos
                </label>
                <input
                  type="file"
                  multiple
                  onChange={handleBulkFilesChange}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-700 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                />
                {bulkFiles.length > 0 && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 max-h-36 overflow-y-auto text-xs space-y-1">
                    <p className="font-bold text-slate-800">
                      {bulkFiles.length} archivos seleccionados:
                    </p>
                    {bulkFiles.map((f, idx) => (
                      <div key={idx} className="flex items-center justify-between text-slate-600">
                        <span className="truncate max-w-sm">{f.name}</span>
                        <span className="text-slate-400">{formatBytes(f.size)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tipo de Documento para el Lote
                  </label>
                  <select
                    value={bulkType}
                    onChange={(e) => setBulkType(e.target.value as DocumentType)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                  >
                    <option value="Informe Técnico">Informe / Orden de Trabajo</option>
                    <option value="Factura">Factura / Boleta</option>
                    <option value="Contrato">Contrato</option>
                    <option value="Acta">Ficha / Consentimiento</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Área o Responsable
                  </label>
                  <input
                    type="text"
                    value={bulkArea}
                    onChange={(e) => setBulkArea(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={bulkFiles.length === 0 || isSubmitting}
                  className="px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-xs"
                >
                  {isSubmitting ? 'Guardando...' : `Guardar ${bulkFiles.length} Archivos`}
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
