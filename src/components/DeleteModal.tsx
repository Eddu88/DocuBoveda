import React, { useState } from 'react';
import { useDocumentSystem } from '../context/DocumentContext';
import { DocumentRecord } from '../types/document';
import { X, Trash2, ShieldAlert } from 'lucide-react';

interface DeleteModalProps {
  document: DocumentRecord | null;
  onClose: () => void;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  document: doc,
  onClose,
}) => {
  const { softDeleteDocument, addToast } = useDocumentSystem();
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!doc) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      addToast({
        type: 'warning',
        title: 'Motivo requerido',
        message: 'Por favor indica la razón para archivar este documento.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await softDeleteDocument({
        documentId: doc.id,
        reason,
      });
      onClose();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'No se pudo mover a la papelera',
        message: err.message || 'Error al procesar la acción.',
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
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Mover a la Papelera Segura</h2>
              <p className="text-xs text-slate-500 font-mono">{doc.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
            <p className="font-bold text-amber-950">Protección contra borrados accidentales</p>
            <p className="text-amber-800 text-[11px] leading-relaxed">
              El documento se ocultará de la lista principal, pero se conservará en tu <strong>Papelera Segura</strong>. Podrás restaurarlo en cualquier momento si lo necesitas de nuevo.
            </p>
          </div>

          <div>
            <p className="text-slate-500 mb-1">Documento a mover:</p>
            <p className="font-semibold text-slate-900">{doc.metadata.title}</p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              ¿Por qué deseas moverlo a la papelera? *
            </label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ejemplo: Factura anulada por el proveedor, documento duplicado, expediente cerrado..."
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-600"
            />
          </div>

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
              disabled={!reason.trim() || isSubmitting}
              className="px-4 py-2 font-bold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-lg shadow-xs transition-colors"
            >
              {isSubmitting ? 'Moviendo...' : 'Mover a la Papelera Segura'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
