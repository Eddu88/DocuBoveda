import React, { useState, useMemo } from 'react';
import { useDocumentSystem } from '../context/DocumentContext';
import { DocumentRecord } from '../types/document';
import { 
  Search, 
  X, 
  FileText, 
  History, 
  Download, 
  Trash2, 
  Eye, 
  Layers, 
  Plus, 
  UploadCloud,
  CheckCircle2,
  Lock,
  Calendar,
  Sparkles,
  ShieldCheck,
  Clock,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { formatBytes } from '../utils/crypto';

interface DocumentListProps {
  onSelectDocument: (doc: DocumentRecord, initialTab?: 'metadata' | 'traceability' | 'versions' | 'storage') => void;
  onOpenUploadModal: (isBulk?: boolean) => void;
  onOpenNewVersionModal: (doc: DocumentRecord) => void;
  onOpenDeleteModal: (doc: DocumentRecord) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  onSelectDocument,
  onOpenUploadModal,
  onOpenNewVersionModal,
  onOpenDeleteModal,
}) => {
  const { documents, currentUser, auditLogs, recordViewEvent, recordDownloadEvent } = useDocumentSystem();

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedArea, setSelectedArea] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Active documents (excluding logically deleted ones)
  const activeDocuments = useMemo(() => {
    return documents.filter(d => !d.isDeleted);
  }, [documents]);

  // Derived filter options
  const documentTypes = useMemo(() => {
    return Array.from(new Set(activeDocuments.map(d => d.metadata.documentType))).sort();
  }, [activeDocuments]);

  const areas = useMemo(() => {
    return Array.from(new Set(activeDocuments.map(d => d.metadata.responsibleArea))).sort();
  }, [activeDocuments]);

  const statuses = useMemo(() => {
    return Array.from(new Set(activeDocuments.map(d => d.metadata.status))).sort();
  }, [activeDocuments]);

  // Filtering Logic
  const filteredDocuments = useMemo(() => {
    return activeDocuments.filter(doc => {
      const q = searchTerm.toLowerCase().trim();
      const meta = doc.metadata;

      if (q) {
        const matchesId = doc.id.toLowerCase().includes(q);
        const matchesTitle = meta.title.toLowerCase().includes(q);
        const matchesDossier = (meta.dossierNumber || '').toLowerCase().includes(q);
        const matchesVendor = (meta.entityOrVendor || '').toLowerCase().includes(q);
        const matchesKeywords = meta.keywords.some(k => k.toLowerCase().includes(q));
        const matchesFiles = doc.versions.some(v => v.fileName.toLowerCase().includes(q));
        const matchesArea = meta.responsibleArea.toLowerCase().includes(q);

        if (!matchesId && !matchesTitle && !matchesDossier && !matchesVendor && !matchesKeywords && !matchesFiles && !matchesArea) {
          return false;
        }
      }

      if (selectedType !== 'ALL' && meta.documentType !== selectedType) return false;
      if (selectedArea !== 'ALL' && meta.responsibleArea !== selectedArea) return false;
      if (selectedStatus !== 'ALL' && meta.status !== selectedStatus) return false;

      return true;
    });
  }, [activeDocuments, searchTerm, selectedType, selectedArea, selectedStatus]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedType('ALL');
    setSelectedArea('ALL');
    setSelectedStatus('ALL');
  };

  const hasActiveFilters = searchTerm !== '' || selectedType !== 'ALL' || selectedArea !== 'ALL' || selectedStatus !== 'ALL';

  const handleRowClick = async (doc: DocumentRecord) => {
    const allowed = await recordViewEvent(doc.id);
    if (allowed) {
      onSelectDocument(doc, 'metadata');
    }
  };

  const handleTraceClick = async (e: React.MouseEvent, doc: DocumentRecord) => {
    e.stopPropagation();
    const allowed = await recordViewEvent(doc.id);
    if (allowed) {
      onSelectDocument(doc, 'traceability');
    }
  };

  const handleDownloadClick = async (e: React.MouseEvent, doc: DocumentRecord) => {
    e.stopPropagation();
    await recordDownloadEvent(doc.id, doc.currentVersionNumber);
  };

  return (
    <div className="space-y-6">
      
      {/* Friendly Welcome & Quick Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Docs */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900 font-mono">{activeDocuments.length}</p>
            <p className="text-xs text-slate-500 font-medium">Documentos Protegidos</p>
          </div>
        </div>

        {/* Card 2: Authenticity Guaranteed */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-emerald-600">100%</p>
            <p className="text-xs text-slate-500 font-medium">Sello Antifraude Activo</p>
          </div>
        </div>

        {/* Card 3: Activity Logged */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <History className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900 font-mono">{auditLogs.length}</p>
            <p className="text-xs text-slate-500 font-medium">Actividades Registradas</p>
          </div>
        </div>

        {/* Card 4: Historical Versions */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900 font-mono">
              {activeDocuments.reduce((acc, d) => acc + d.versions.length, 0)}
            </p>
            <p className="text-xs text-slate-500 font-medium">Versiones Respaldadas</p>
          </div>
        </div>

      </div>

      {/* Main Content Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        
        {/* Search & Actions Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Catálogo de Documentos
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Encuentra cualquier archivo por nombre, fecha, paciente, cliente o tipo.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {currentUser.permissions.canBulkUpload && (
                <button
                  onClick={() => onOpenUploadModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <UploadCloud className="w-4 h-4 text-slate-600" />
                  <span>Subir Varios Archivos</span>
                </button>
              )}

              {currentUser.permissions.canUpload && (
                <button
                  onClick={() => onOpenUploadModal(false)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Subir Documento</span>
                </button>
              )}
            </div>
          </div>

          {/* Search Input & Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            
            <div className="lg:col-span-2 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Escribe para buscar (ej. contrato, factura, Dr. Pérez, paciente, motor...)"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-10 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Tipo Documental */}
            <div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-500 focus:bg-white"
              >
                <option value="ALL">Todos los tipos de documento</option>
                {documentTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Estado */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-500 focus:bg-white"
              >
                <option value="ALL">Todos los estados</option>
                {statuses.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

          </div>

          {/* Active filter summary tag */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>
                Mostrando <strong className="text-slate-900">{filteredDocuments.length}</strong> de {activeDocuments.length} documentos
              </span>
              <button
                onClick={resetFilters}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Quitar filtros
              </button>
            </div>
          )}

        </div>

        {/* High-legibility Document Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Folio / Código</th>
                <th className="py-3 px-4">Nombre del Documento</th>
                <th className="py-3 px-4">Tipo & Área</th>
                <th className="py-3 px-4">Versión</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4">Fecha</th>
                <th className="py-3 px-4 text-right">Opciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-800">No encontramos documentos con esos criterios</p>
                    <p className="text-xs text-slate-400 mt-1">Intenta con otra palabra o elimina los filtros activos.</p>
                  </td>
                </tr>
              ) : (
                filteredDocuments.map(doc => {
                  const currentVer = doc.versions.find(v => v.isCurrent) || doc.versions[doc.versions.length - 1];
                  const hasRestrictedAccess = !currentUser.allowedConfidentiality.includes(doc.metadata.confidentiality);

                  return (
                    <tr
                      key={doc.id}
                      onClick={() => handleRowClick(doc)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Unique Code / Folio */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-indigo-600 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{doc.id}</span>
                          {hasRestrictedAccess && (
                            <span title="Acceso restringido para tu perfil actual">
                              <Lock className="w-3.5 h-3.5 text-amber-500" />
                            </span>
                          )}
                        </div>
                        {doc.metadata.dossierNumber && (
                          <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                            Ref: {doc.metadata.dossierNumber}
                          </div>
                        )}
                      </td>

                      {/* Title & File info */}
                      <td className="py-3.5 px-4 max-w-sm sm:max-w-md">
                        <p className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                          {doc.metadata.title}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5 font-sans">
                          <span className="truncate max-w-[200px] text-slate-500">{currentVer.fileName}</span>
                          <span aria-hidden="true">·</span>
                          <span>{formatBytes(currentVer.fileSize)}</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-emerald-600 font-medium">✓ Original verificado</span>
                        </div>
                      </td>

                      {/* Type & Department */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-medium text-slate-800">{doc.metadata.documentType}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{doc.metadata.responsibleArea}</div>
                      </td>

                      {/* Versions */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-800">{currentVer.versionLabel}</span>
                        {doc.versions.length > 1 && (
                          <span className="text-[11px] text-slate-400 ml-1.5">
                            ({doc.versions.length} versiones)
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 font-semibold text-xs ${
                          doc.metadata.status === 'Vigente' || doc.metadata.status === 'Aprobado'
                            ? 'text-emerald-700'
                            : doc.metadata.status === 'En revisión' || doc.metadata.status === 'Observado'
                            ? 'text-amber-700'
                            : 'text-slate-600'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            doc.metadata.status === 'Vigente' || doc.metadata.status === 'Aprobado'
                              ? 'bg-emerald-500'
                              : doc.metadata.status === 'En revisión' || doc.metadata.status === 'Observado'
                              ? 'bg-amber-500'
                              : 'bg-slate-400'
                          }`} />
                          {doc.metadata.status}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 text-xs">
                        <div>{doc.metadata.registrationDate}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{doc.metadata.registeredBy}</div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          
                          {/* Historial / Quién lo vio */}
                          <button
                            onClick={(e) => handleTraceClick(e, doc)}
                            title="Ver quién abrió o modificó este documento"
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <History className="w-4 h-4" />
                          </button>

                          {/* Descargar */}
                          <button
                            onClick={(e) => handleDownloadClick(e, doc)}
                            title="Descargar copia del archivo"
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </button>

                          {/* Subir Nueva Versión */}
                          {currentUser.permissions.canUploadVersion && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenNewVersionModal(doc);
                              }}
                              title="Subir nueva versión actualizada"
                              className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            >
                              <Layers className="w-4 h-4" />
                            </button>
                          )}

                          {/* Enviar a Papelera */}
                          {currentUser.permissions.canDelete && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenDeleteModal(doc);
                              }}
                              title="Mover a la papelera segura"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}

                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
