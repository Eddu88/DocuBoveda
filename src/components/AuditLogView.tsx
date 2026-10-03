import React, { useState, useMemo } from 'react';
import { useDocumentSystem } from '../context/DocumentContext';
import { AuditLogEntry } from '../types/audit';
import { 
  History, 
  Search, 
  ShieldCheck, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  User as UserIcon,
  Clock,
  Printer,
  X
} from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const { auditLogs, users, verifyLedgerIntegrity, addToast } = useDocumentSystem();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');
  const [selectedUserId, setSelectedUserId] = useState<string>('ALL');
  const [isVerifyingChain, setIsVerifyingChain] = useState(false);
  const [chainVerificationResult, setChainVerificationResult] = useState<{
    isValid: boolean;
    checkedAt: string;
    totalBlocks: number;
  } | null>(null);

  // Friendly action labels mapping
  const actionLabels: Record<string, { label: string; color: string }> = {
    'CREACION': { label: 'Guardó documento nuevo', color: 'text-emerald-700 bg-emerald-50' },
    'VISUALIZACION': { label: 'Consultó documento', color: 'text-indigo-700 bg-indigo-50' },
    'DESCARGA': { label: 'Descargó archivo', color: 'text-sky-700 bg-sky-50' },
    'MODIFICACION_METADATOS': { label: 'Editó información', color: 'text-amber-700 bg-amber-50' },
    'NUEVA_VERSION': { label: 'Subió nueva versión', color: 'text-purple-700 bg-purple-50' },
    'CAMBIO_ESTADO': { label: 'Cambió estado', color: 'text-blue-700 bg-blue-50' },
    'ELIMINACION_LOGICA': { label: 'Movió a papelera', color: 'text-rose-700 bg-rose-50' },
    'RESTAURACION': { label: 'Restauró de papelera', color: 'text-emerald-700 bg-emerald-50' },
    'INTENTO_DENEGADO': { label: 'Acceso bloqueado (Sin permiso)', color: 'text-rose-800 bg-rose-100 font-bold' },
    'VERIFICACION_HASH': { label: 'Comprobó autenticidad', color: 'text-teal-700 bg-teal-50' },
  };

  // Filtered audit entries
  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const q = searchTerm.toLowerCase().trim();
      if (q) {
        const matchesDoc = log.documentId.toLowerCase().includes(q);
        const matchesTitle = log.documentTitle.toLowerCase().includes(q);
        const matchesUser = log.userName.toLowerCase().includes(q);
        const matchesDesc = log.description.toLowerCase().includes(q);
        if (!matchesDoc && !matchesTitle && !matchesUser && !matchesDesc) {
          return false;
        }
      }

      if (selectedAction !== 'ALL' && log.action !== selectedAction) return false;
      if (selectedUserId !== 'ALL' && log.userId !== selectedUserId) return false;

      return true;
    }).slice().reverse();
  }, [auditLogs, searchTerm, selectedAction, selectedUserId]);

  const handleVerifyChain = async () => {
    setIsVerifyingChain(true);
    try {
      const res = await verifyLedgerIntegrity();
      setChainVerificationResult({
        isValid: res.isValid,
        checkedAt: new Date().toLocaleTimeString(),
        totalBlocks: auditLogs.length,
      });

      if (res.isValid) {
        addToast({
          type: 'success',
          title: 'Historial 100% Auténtico',
          message: `Todos los ${auditLogs.length} registros del historial están intactos y certificados contra alteraciones.`,
        });
      }
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Error de verificación',
        message: err.message,
      });
    } finally {
      setIsVerifyingChain(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['N° Registro', 'Folio Documento', 'Título', 'Usuario', 'Cargo / Área', 'Acción Realizada', 'Fecha y Hora', 'Detalle'];
    const rows = filteredLogs.map(l => [
      l.auditId,
      l.documentId,
      `"${l.documentTitle.replace(/"/g, '""')}"`,
      `"${l.userName}"`,
      `"${l.userRole}"`,
      actionLabels[l.action]?.label || l.action,
      new Date(l.eventDate).toLocaleString('es-ES'),
      `"${l.description.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reporte_actividad_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      type: 'info',
      title: 'Reporte en Excel Descargado',
      message: `Se descargó el archivo con ${filteredLogs.length} registros de actividad.`,
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" />
            <span>Historial de Actividad & Quién Vio Tus Documentos</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Cada consulta, descarga o cambio queda registrado con fecha y hora. Nadie puede borrar o alterar este registro.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleVerifyChain}
            disabled={isVerifyingChain}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl shadow-2xs transition-colors whitespace-nowrap"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{isVerifyingChain ? 'Comprobando...' : 'Comprobar Autenticidad del Historial'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-2xs transition-colors whitespace-nowrap"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Descargar en Excel</span>
          </button>
        </div>
      </div>

      {/* Verification Status Banner */}
      {chainVerificationResult && (
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/80 text-emerald-950 flex items-start justify-between gap-4 text-xs animate-in fade-in">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">
                Historial 100% Verificado y Seguro
              </p>
              <p className="mt-0.5 text-emerald-800">
                Se comprobaron los {chainVerificationResult.totalBlocks} registros de actividad. Ningún dato ha sido borrado, modificado o manipulado. Comprobado a las {chainVerificationResult.checkedAt}.
              </p>
            </div>
          </div>
          <button
            onClick={() => setChainVerificationResult(null)}
            className="text-slate-400 hover:text-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs shadow-xs">
        
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre de persona, documento o acción..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white"
          />
        </div>

        <div>
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
          >
            <option value="ALL">Todas las acciones</option>
            <option value="CREACION">Guardó documento nuevo</option>
            <option value="VISUALIZACION">Consultó documento</option>
            <option value="DESCARGA">Descargó archivo</option>
            <option value="MODIFICACION_METADATOS">Editó información</option>
            <option value="NUEVA_VERSION">Subió nueva versión</option>
            <option value="CAMBIO_ESTADO">Cambió estado</option>
            <option value="ELIMINACION_LOGICA">Movió a papelera</option>
            <option value="RESTAURACION">Restauró documento</option>
            <option value="INTENTO_DENEGADO">Acceso bloqueado</option>
          </select>
        </div>

        <div>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
          >
            <option value="ALL">Todas las personas</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Fecha y Hora</th>
                <th className="py-3 px-4">Quién lo hizo</th>
                <th className="py-3 px-4">Acción</th>
                <th className="py-3 px-4">Documento</th>
                <th className="py-3 px-4">Qué sucedió</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No encontramos actividades con esos criterios de búsqueda.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => {
                  const date = new Date(log.eventDate);
                  const isDenied = log.action === 'INTENTO_DENEGADO';
                  const actionInfo = actionLabels[log.action] || { label: log.action, color: 'text-slate-700 bg-slate-100' };

                  return (
                    <tr
                      key={log.auditId}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isDenied ? 'bg-rose-50/60' : ''
                      }`}
                    >
                      {/* Date & Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500">
                        <div className="font-medium text-slate-800">
                          {date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* User */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">{log.userName}</div>
                        <div className="text-[10px] text-slate-400">{log.userRole}</div>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${actionInfo.color}`}>
                          {actionInfo.label}
                        </span>
                      </td>

                      {/* Document */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-mono text-indigo-600 font-bold">{log.documentId}</div>
                        <div className="text-[11px] text-slate-600 truncate mt-0.5">
                          {log.documentTitle}
                        </div>
                      </td>

                      {/* Description */}
                      <td className="py-3.5 px-4 max-w-md">
                        <p className="text-slate-800 leading-snug">
                          {log.description}
                        </p>
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
