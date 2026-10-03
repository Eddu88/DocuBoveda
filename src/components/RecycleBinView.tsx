import React, { useState } from 'react';
import { useDocumentSystem } from '../context/DocumentContext';
import { DocumentRecord } from '../types/document';
import { Trash2, RotateCcw, ShieldCheck, CheckCircle2, X, FileText } from 'lucide-react';
import { formatBytes } from '../utils/crypto';

export const RecycleBinView: React.FC = () => {
  const { documents, currentUser, restoreDocument, addToast } = useDocumentSystem();
  
  const [restoringDoc, setRestoringDoc] = useState<DocumentRecord | null>(null);
  const [restoreReason, setRestoreReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const deletedDocs = documents.filter(d => d.isDeleted);

  const handleConfirmRestore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restoringDoc) return;

    if (!restoreReason.trim()) {
      addToast({
        type: 'warning',
        title: 'Motivo requerido',
        message: 'Por favor indica por qué deseas recuperar este documento.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await restoreDocument({
        documentId: restoringDoc.id,
        reason: restoreReason,
      });
      setRestoringDoc(null);
      setRestoreReason('');
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Error al restaurar',
        message: err.message || 'No se pudo recuperar el documento.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-amber-600" />
            <span>Papelera Segura</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Aquí se conservan los documentos dados de baja. Puedes recuperarlos a tu catálogo activo en cualquier momento.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Protección activa contra pérdidas</span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Folio</th>
                <th className="py-3 px-4">Documento</th>
                <th className="py-3 px-4">Fecha de Baja</th>
                <th className="py-3 px-4">Dado de baja por</th>
                <th className="py-3 px-4">Motivo Indicado</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {deletedDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500/70 mb-2" />
                    <p className="font-semibold text-slate-800">Tu papelera segura está vacía</p>
                    <p className="text-xs text-slate-400 mt-0.5">Todos tus documentos están activos en tu catálogo.</p>
                  </td>
                </tr>
              ) : (
                deletedDocs.map(doc => {
                  const delInfo = doc.deletionInfo;
                  const currentVer = doc.versions[doc.versions.length - 1];

                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-amber-600 whitespace-nowrap">
                        {doc.id}
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="font-semibold text-slate-900 line-clamp-1">{doc.metadata.title}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {currentVer.fileName} ({formatBytes(currentVer.fileSize)})
                        </p>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {delInfo ? new Date(delInfo.deletedAt).toLocaleDateString('es-ES') : '—'}
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                        {delInfo?.deletedBy || '—'}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 max-w-sm">
                        <p className="leading-snug italic text-slate-500">
                          "{delInfo?.reason || 'Sin motivo indicado'}"
                        </p>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        {currentUser.permissions.canRestore ? (
                          <button
                            onClick={() => setRestoringDoc(doc)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors ml-auto shadow-2xs"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Restaurar a mi lista</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            Solo supervisores
                          </span>
                        )}
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restore Confirmation Dialog */}
      {restoringDoc && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Restaurar Documento
                </h3>
              </div>
              <button
                onClick={() => setRestoringDoc(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmRestore} className="p-5 space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                El documento <strong>{restoringDoc.metadata.title}</strong> volverá a aparecer en tu lista principal con todas sus versiones e historial intactos.
              </p>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ¿Por qué deseas restaurarlo? *
                </label>
                <textarea
                  rows={3}
                  required
                  value={restoreReason}
                  onChange={(e) => setRestoreReason(e.target.value)}
                  placeholder="Ejemplo: Se requiere consultar el expediente nuevamente o fue enviado por error..."
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setRestoringDoc(null)}
                  className="px-3.5 py-2 text-slate-600 hover:text-slate-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!restoreReason.trim() || isSubmitting}
                  className="px-4 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg shadow-xs"
                >
                  {isSubmitting ? 'Restaurando...' : 'Confirmar y Restaurar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
