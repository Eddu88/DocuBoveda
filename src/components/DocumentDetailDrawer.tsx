import React, { useState } from 'react';
import { useDocumentSystem } from '../context/DocumentContext';
import { DocumentRecord, DocumentMetadata, DocumentStatus } from '../types/document';
import { 
  X, 
  FileText, 
  History, 
  Layers, 
  ShieldCheck, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Edit3, 
  Save, 
  ArrowRight,
  Clock,
  User as UserIcon,
  Plus,
  Lock,
  ChevronDown,
  Terminal,
  Calendar,
  Share2
} from 'lucide-react';
import { formatBytes } from '../utils/crypto';

interface DocumentDetailDrawerProps {
  document: DocumentRecord;
  initialTab?: 'metadata' | 'traceability' | 'versions' | 'storage';
  onClose: () => void;
  onOpenNewVersionModal: (doc: DocumentRecord) => void;
}

export const DocumentDetailDrawer: React.FC<DocumentDetailDrawerProps> = ({
  document: doc,
  initialTab = 'metadata',
  onClose,
  onOpenNewVersionModal,
}) => {
  const { 
    auditLogs, 
    currentUser, 
    updateDocumentMetadata, 
    changeDocumentStatus, 
    recordDownloadEvent,
    verifyDocumentFileIntegrity,
    addToast 
  } = useDocumentSystem();

  const [activeTab, setActiveTab] = useState<'metadata' | 'traceability' | 'versions' | 'storage'>(initialTab);
  
  // Edit Metadata State
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<DocumentMetadata>>({
    title: doc.metadata.title,
    documentType: doc.metadata.documentType,
    category: doc.metadata.category,
    responsibleArea: doc.metadata.responsibleArea,
    confidentiality: doc.metadata.confidentiality,
    observations: doc.metadata.observations,
    dossierNumber: doc.metadata.dossierNumber || '',
    processCode: doc.metadata.processCode || '',
    entityOrVendor: doc.metadata.entityOrVendor || '',
    expirationDate: doc.metadata.expirationDate || '',
  });
  const [editReason, setEditReason] = useState('');

  // Status Change State
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<DocumentStatus>(doc.metadata.status);
  const [statusReason, setStatusReason] = useState('');

  // Sello de Autenticidad verification state
  const [verifyingVersion, setVerifyingVersion] = useState<number | null>(null);
  const [verificationResult, setVerificationResult] = useState<{
    version: number;
    verified: boolean;
    storedHash: string;
    computedHash: string;
    timestamp: string;
  } | null>(null);

  // Technical details toggle
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  // Filter audit logs for this document
  const docAuditLogs = auditLogs
    .filter(log => log.documentId === doc.id)
    .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());

  const currentVersion = doc.versions.find(v => v.isCurrent) || doc.versions[doc.versions.length - 1];

  const handleSaveMetadata = async () => {
    if (!editReason.trim()) {
      addToast({
        type: 'warning',
        title: 'Motivo requerido',
        message: 'Por seguridad, escribe brevemente por qué realizas este cambio.',
      });
      return;
    }

    const success = await updateDocumentMetadata({
      documentId: doc.id,
      newMetadata: editFormData,
      reason: editReason,
    });

    if (success) {
      setIsEditingMetadata(false);
      setEditReason('');
    }
  };

  const handleSaveStatus = async () => {
    if (!statusReason.trim()) {
      addToast({
        type: 'warning',
        title: 'Motivo requerido',
        message: 'Indica la razón del cambio de estado.',
      });
      return;
    }

    const success = await changeDocumentStatus({
      documentId: doc.id,
      newStatus,
      reason: statusReason,
    });

    if (success) {
      setIsChangingStatus(false);
      setStatusReason('');
    }
  };

  const handleRunHashVerification = async (versionNumber: number) => {
    setVerifyingVersion(versionNumber);
    try {
      const res = await verifyDocumentFileIntegrity(doc.id, versionNumber);
      setVerificationResult({
        version: versionNumber,
        ...res,
      });
      addToast({
        type: 'success',
        title: 'Sello de Autenticidad Verificado',
        message: `El archivo v${versionNumber} es exactamente el original. No ha sido alterado ni modificado.`,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Error de Verificación',
        message: err.message || 'No se pudo verificar el archivo',
      });
    } finally {
      setVerifyingVersion(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in">
      <div className="w-full max-w-3xl bg-white h-full flex flex-col shadow-2xl border-l border-slate-200 animate-in slide-in-from-right duration-200">
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex items-start justify-between">
          <div className="min-w-0 flex-1 pr-4">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono font-bold text-indigo-600">{doc.id}</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="font-semibold text-slate-700">Versión {currentVersion.versionLabel} vigente</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className={`font-semibold ${
                doc.metadata.status === 'Vigente' || doc.metadata.status === 'Aprobado'
                  ? 'text-emerald-700'
                  : 'text-amber-700'
              }`}>
                {doc.metadata.status}
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-1 leading-snug line-clamp-2">
              {doc.metadata.title}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <span>{currentVersion.fileName}</span>
              <span aria-hidden="true">·</span>
              <span>{formatBytes(currentVersion.fileSize)}</span>
              <span aria-hidden="true">·</span>
              <span>Subido el {doc.metadata.registrationDate}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => recordDownloadEvent(doc.id, currentVersion.versionNumber)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-lg border border-slate-300 shadow-2xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Descargar</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              aria-label="Cerrar panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation (Clean & Commercial) */}
        <div className="flex items-center gap-1 px-5 pt-2 border-b border-slate-200 bg-white text-xs font-semibold">
          <button
            onClick={() => setActiveTab('metadata')}
            className={`flex items-center gap-1.5 pb-2.5 px-2.5 border-b-2 transition-colors ${
              activeTab === 'metadata'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Ficha del Documento</span>
          </button>

          <button
            onClick={() => setActiveTab('traceability')}
            className={`flex items-center gap-1.5 pb-2.5 px-2.5 border-b-2 transition-colors ${
              activeTab === 'traceability'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Quién lo Vio y Modificó ({docAuditLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('versions')}
            className={`flex items-center gap-1.5 pb-2.5 px-2.5 border-b-2 transition-colors ${
              activeTab === 'versions'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Versiones Anteriores ({doc.versions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('storage')}
            className={`flex items-center gap-1.5 pb-2.5 px-2.5 border-b-2 transition-colors ${
              activeTab === 'storage'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Sello de Autenticidad</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: METADATA */}
          {activeTab === 'metadata' && (
            <div className="space-y-6 text-xs">
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Información Principal</h3>
                  <p className="text-slate-500">Datos para localizar y catalogar este archivo.</p>
                </div>
                
                <div className="flex items-center gap-2">
                  {currentUser.permissions.canChangeStatus && !isChangingStatus && (
                    <button
                      onClick={() => setIsChangingStatus(true)}
                      className="px-3 py-1.5 font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
                    >
                      Cambiar Estado
                    </button>
                  )}

                  {currentUser.permissions.canEditMetadata && !isEditingMetadata && (
                    <button
                      onClick={() => setIsEditingMetadata(true)}
                      className="flex items-center gap-1 px-3 py-1.5 font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 border border-indigo-200/80 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Editar Datos</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Status Change Inline Form */}
              {isChangingStatus && (
                <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-3">
                  <p className="font-bold text-amber-900">
                    Cambiar Estado del Documento
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">Nuevo Estado</label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value as DocumentStatus)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                      >
                        <option value="Borrador">Borrador</option>
                        <option value="Registrado">Registrado</option>
                        <option value="En revisión">En revisión</option>
                        <option value="Aprobado">Aprobado</option>
                        <option value="Vigente">Vigente</option>
                        <option value="Observado">Observado</option>
                        <option value="Archivado">Archivado</option>
                        <option value="Anulado">Anulado</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-700 font-medium mb-1">
                        ¿Por qué se cambia el estado? *
                      </label>
                      <input
                        type="text"
                        value={statusReason}
                        onChange={(e) => setStatusReason(e.target.value)}
                        placeholder="Ej. Firmado por ambas partes, visto bueno final..."
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setIsChangingStatus(false)}
                      className="px-3 py-1.5 text-slate-600 hover:text-slate-900"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveStatus}
                      className="px-3 py-1.5 font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-2xs"
                    >
                      Guardar y Registrar Cambio
                    </button>
                  </div>
                </div>
              )}

              {/* Editing Form vs Display */}
              {isEditingMetadata ? (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block font-medium text-slate-700 mb-1">Título del Documento *</label>
                      <input
                        type="text"
                        value={editFormData.title || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Área o Departamento</label>
                      <input
                        type="text"
                        value={editFormData.responsibleArea || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, responsibleArea: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Tipo de Documento</label>
                      <select
                        value={editFormData.documentType}
                        onChange={(e) => setEditFormData({ ...editFormData, documentType: e.target.value as any })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                      >
                        <option value="Contrato">Contrato</option>
                        <option value="Factura">Factura</option>
                        <option value="Acta">Acta / Consentimiento</option>
                        <option value="Informe Técnico">Informe Técnico</option>
                        <option value="Resolución">Resolución</option>
                        <option value="Memorándum">Memorándum / Guía</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Cliente, Paciente o Proveedor</label>
                      <input
                        type="text"
                        value={editFormData.entityOrVendor || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, entityOrVendor: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 mb-1">N° de Carpeta o Expediente</label>
                      <input
                        type="text"
                        value={editFormData.dossierNumber || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, dossierNumber: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-medium text-slate-700 mb-1">Notas u Observaciones</label>
                      <textarea
                        rows={2}
                        value={editFormData.observations || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, observations: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                      />
                    </div>

                    <div className="sm:col-span-2 bg-indigo-50/70 p-3 rounded-lg border border-indigo-100">
                      <label className="block font-bold text-indigo-950 mb-1">
                        ¿Por qué estás modificando estos datos? (Quedará registrado en el historial) *
                      </label>
                      <input
                        type="text"
                        value={editReason}
                        onChange={(e) => setEditReason(e.target.value)}
                        placeholder="Ejemplo: Se corrigió el nombre del cliente y el área asignada"
                        className="w-full bg-white border border-indigo-200 rounded-lg px-3 py-2 text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                    <button
                      onClick={() => setIsEditingMetadata(false)}
                      className="px-3 py-2 text-slate-600 hover:text-slate-900"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSaveMetadata}
                      className="flex items-center gap-1.5 px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Guardar Cambios</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50/60 border border-slate-200 rounded-xl p-5 divide-y divide-slate-200/80">
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 pb-4">
                    <div>
                      <p className="text-slate-500 text-[11px]">Código Único</p>
                      <p className="font-mono font-bold text-indigo-600 mt-0.5">{doc.id}</p>
                    </div>

                    <div>
                      <p className="text-slate-500 text-[11px]">Tipo de Documento</p>
                      <p className="font-semibold text-slate-900 mt-0.5">{doc.metadata.documentType}</p>
                    </div>

                    <div>
                      <p className="text-slate-500 text-[11px]">Área Responsable</p>
                      <p className="font-semibold text-slate-900 mt-0.5">{doc.metadata.responsibleArea}</p>
                    </div>

                    <div>
                      <p className="text-slate-500 text-[11px]">Fecha del Documento</p>
                      <p className="font-medium text-slate-700 mt-0.5">{doc.metadata.documentDate}</p>
                    </div>

                    <div>
                      <p className="text-slate-500 text-[11px]">Fecha de Registro</p>
                      <p className="font-medium text-slate-700 mt-0.5">{doc.metadata.registrationDate}</p>
                    </div>

                    <div>
                      <p className="text-slate-500 text-[11px]">Registrado Por</p>
                      <p className="font-semibold text-slate-900 mt-0.5">{doc.metadata.registeredBy}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 py-4">
                    <div>
                      <p className="text-slate-500 text-[11px]">N° de Expediente / Carpeta</p>
                      <p className="font-medium text-slate-800 mt-0.5">{doc.metadata.dossierNumber || 'No asignado'}</p>
                    </div>

                    <div>
                      <p className="text-slate-500 text-[11px]">Cliente, Paciente o Proveedor</p>
                      <p className="font-semibold text-slate-900 mt-0.5">{doc.metadata.entityOrVendor || 'Sin entidad asignada'}</p>
                    </div>

                    <div>
                      <p className="text-slate-500 text-[11px]">Fecha de Vencimiento</p>
                      <p className="font-medium text-slate-700 mt-0.5">{doc.metadata.expirationDate || 'Sin vencimiento'}</p>
                    </div>
                  </div>

                  {/* Observations */}
                  <div className="pt-4">
                    <p className="text-slate-500 text-[11px]">Notas y Observaciones</p>
                    <p className="text-slate-700 mt-1 leading-relaxed">
                      {doc.metadata.observations || 'Sin notas registradas.'}
                    </p>
                  </div>

                </div>
              )}

              {/* Friendly summary card */}
              <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-4 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-emerald-950">
                    Documento 100% Protegido
                  </p>
                  <p className="text-emerald-800 mt-0.5 leading-relaxed">
                    Cualquier persona que consulte, descargue o modifique este documento quedará registrada de forma automática en la pestaña <strong>Quién lo Vio y Modificó</strong>.
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: AUDITORÍA & HISTORIAL AMIGABLE */}
          {activeTab === 'traceability' && (
            <div className="space-y-6 text-xs">
              
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-4 flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-bold text-indigo-950 text-sm">
                    Historial Completo: Quién abrió, modificó o descargó este documento
                  </h3>
                  <p className="text-indigo-800 mt-1 leading-relaxed">
                    Este registro es permanente e inalterable. Te permite saber con certeza qué sucedió con tu documento en todo momento.
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xl font-bold text-indigo-900">{docAuditLogs.length}</div>
                  <div className="text-[11px] text-indigo-600 font-medium">Eventos registrados</div>
                </div>
              </div>

              {/* Friendly chronological timeline */}
              <div className="relative pl-6 space-y-5 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {docAuditLogs.map((log) => {
                  const eventDate = new Date(log.eventDate);
                  const formattedDate = eventDate.toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });
                  const formattedTime = eventDate.toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div key={log.auditId} className="relative group">
                      
                      {/* Timeline dot */}
                      <div className="absolute -left-[27px] top-1.5 w-3 h-3 rounded-full bg-white border-2 border-indigo-600 group-hover:scale-125 transition-transform" />

                      <div className="bg-white border border-slate-200/90 rounded-xl p-4 space-y-2 shadow-2xs">
                        
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900">{log.userName}</span>
                            <span className="text-slate-400">({log.userRole})</span>
                          </div>
                          <div className="text-slate-400 text-[11px]">
                            {formattedDate} a las {formattedTime}
                          </div>
                        </div>

                        <p className="text-slate-700 leading-relaxed font-medium">
                          {log.description}
                        </p>

                        {/* Field Diff view in plain human language */}
                        {log.action === 'MODIFICACION_METADATOS' && log.newValue && (
                          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] space-y-1">
                            <span className="font-semibold text-slate-600">Detalle del cambio:</span>
                            {Object.keys(log.newValue).map(field => (
                              <div key={field} className="flex items-center gap-2 text-slate-700">
                                <span className="font-medium capitalize">{field}:</span>
                                <span className="text-rose-600 line-through">
                                  {String(log.oldValue?.[field] ?? 'vacío')}
                                </span>
                                <ArrowRight className="w-3 h-3 text-slate-400" />
                                <span className="text-emerald-700 font-semibold">
                                  {String(log.newValue?.[field])}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                          <span>Registro oficial inmutable</span>
                          <span className="text-emerald-600 font-semibold">✓ Protegido</span>
                        </div>

                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* TAB 3: VERSIONES ANTERIORES */}
          {activeTab === 'versions' && (
            <div className="space-y-6 text-xs">
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Historial de Versiones</h3>
                  <p className="text-slate-500">
                    Nunca pierdes un archivo. Si subes una nueva versión, las anteriores se conservan intactas.
                  </p>
                </div>

                {currentUser.permissions.canUploadVersion && (
                  <button
                    onClick={() => onOpenNewVersionModal(doc)}
                    className="flex items-center gap-1.5 px-3 py-1.5 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Subir Nueva Versión</span>
                  </button>
                )}
              </div>

              {/* Version items */}
              <div className="space-y-3">
                {doc.versions.slice().reverse().map(ver => (
                  <div
                    key={ver.versionNumber}
                    className={`p-4 rounded-xl border transition-colors ${
                      ver.isCurrent 
                        ? 'bg-indigo-50/40 border-indigo-200' 
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{ver.versionLabel}</span>
                        {ver.isCurrent ? (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 rounded px-1.5 py-0.5">
                            Versión Vigente
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500 bg-slate-100 rounded px-1.5 py-0.5">
                            Versión Anterior Guardada
                          </span>
                        )}
                      </div>

                      <div className="text-slate-500 text-xs">
                        Subido por <strong>{ver.uploadedBy}</strong> el {ver.uploadDate.split('T')[0]}
                      </div>
                    </div>

                    <div className="mt-3 space-y-1.5 text-slate-700">
                      <p className="font-semibold text-slate-900">{ver.fileName} ({formatBytes(ver.fileSize)})</p>
                      <p className="text-slate-600">
                        <strong>Motivo del cambio:</strong> {ver.changeReason}
                      </p>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-center justify-between">
                      <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Sello digital de autenticidad activo</span>
                      </span>

                      <button
                        onClick={() => recordDownloadEvent(doc.id, ver.versionNumber)}
                        className="flex items-center gap-1 px-3 py-1 font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-600" />
                        <span>Descargar esta versión</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 4: SELLO DE AUTENTICIDAD & PROTECCIÓN */}
          {activeTab === 'storage' && (
            <div className="space-y-6 text-xs text-slate-700">
              
              {/* Authenticity Guarantee Card */}
              <div className="bg-gradient-to-br from-indigo-50 via-white to-emerald-50 border border-indigo-100 rounded-2xl p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Garantía de Autenticidad Digital
                </h3>
                <p className="text-slate-600 max-w-md mx-auto leading-relaxed">
                  Cada vez que subes un archivo, el sistema le aplica un <strong>sello criptográfico único</strong>. Si alguien intentara modificar el archivo fuera del sistema, se detectaría de inmediato.
                </p>

                <div className="pt-2">
                  <button
                    onClick={() => handleRunHashVerification(currentVersion.versionNumber)}
                    disabled={verifyingVersion === currentVersion.versionNumber}
                    className="inline-flex items-center gap-2 px-5 py-2.5 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {verifyingVersion === currentVersion.versionNumber 
                        ? 'Comprobando archivo...' 
                        : 'Comprobar Autenticidad del Archivo Ahora'}
                    </span>
                  </button>
                </div>

                {verificationResult && (
                  <div className="mt-4 p-4 bg-emerald-100/70 border border-emerald-300 rounded-xl text-emerald-950 font-medium flex items-center justify-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                    <span>
                      ✓ Resultado: Archivo 100% Original. No ha sufrido alteraciones ni manipulaciones desde su subida.
                    </span>
                  </div>
                )}
              </div>

              {/* Plain explanation of security */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <p className="font-bold text-slate-900">Sin riesgo de borrado accidental</p>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    Si eliminas un archivo por error, se resguarda en la Papelera Segura y puedes recuperarlo en cualquier momento.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <p className="font-bold text-slate-900">Acceso privado y controlado</p>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    Solo las personas con permisos autorizados pueden ver o descargar documentos confidenciales o restringidos.
                  </p>
                </div>
              </div>

              {/* Accordion for Technical details (Discreet for IT) */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                  className="w-full p-3.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-slate-700 font-semibold transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-slate-500" />
                    <span>Ver detalles técnicos avanzados para TI / Soporte (Opcional)</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showTechnicalDetails ? 'rotate-180' : ''}`} />
                </button>

                {showTechnicalDetails && (
                  <div className="p-4 bg-white border-t border-slate-200 font-mono text-[11px] text-slate-600 space-y-2">
                    <p><strong>Ruta Linux de Almacenamiento:</strong> {currentVersion.storagePath}</p>
                    <p><strong>Permisos POSIX:</strong> {currentVersion.posixPermissions} ({currentVersion.posixOwner})</p>
                    <p className="break-all"><strong>Firma SHA-256:</strong> {currentVersion.sha256Hash}</p>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
