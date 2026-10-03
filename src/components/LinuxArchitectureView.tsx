import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Layers, 
  RotateCcw, 
  CheckCircle2, 
  Server, 
  Terminal, 
  ChevronDown, 
  FileText,
  Clock,
  Sparkles,
  Users
} from 'lucide-react';

export const LinuxArchitectureView: React.FC = () => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  const businessGuarantees = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
      title: 'Sello Digital Antifraude',
      desc: 'Cada archivo recibe una huella digital única al guardarse. El sistema comprueba al instante si alguien intentó modificar su contenido.',
    },
    {
      icon: <Layers className="w-6 h-6 text-purple-600" />,
      title: 'Control de Versiones sin Pérdidas',
      desc: 'Cuando actualizas un contrato o informe, el archivo anterior no se borra. Siempre puedes consultar o descargar versiones pasadas.',
    },
    {
      icon: <Clock className="w-6 h-6 text-sky-600" />,
      title: 'Historial de Visitas y Cambios',
      desc: 'Sabrás exactamente qué persona de tu equipo abrió, descargó o editó cada documento, con fecha y hora exactas.',
    },
    {
      icon: <RotateCcw className="w-6 h-6 text-amber-600" />,
      title: 'Papelera Segura (Sin Borrados Accidentales)',
      desc: 'Si alguien da de baja un archivo por error, se conserva en la papelera protegida y puede recuperarse con un solo clic.',
    },
    {
      icon: <Lock className="w-6 h-6 text-indigo-600" />,
      title: 'Privacidad por Perfiles de Usuario',
      desc: 'Tú decides qué empleados pueden ver información confidencial y quiénes solo pueden consultar documentos públicos o internos.',
    },
    {
      icon: <Server className="w-6 h-6 text-slate-700" />,
      title: 'Almacenamiento en Servidor Seguro',
      desc: 'Tus documentos están guardados en tu propio servidor Linux protegido, sin exponerse a riesgos ni a accesos no autorizados.',
    },
  ];

  const criteria = [
    { id: 'CA01', title: 'Identificador único permanente', desc: 'Asignación automática de folio (DOC-2026-XXXXXX).' },
    { id: 'CA02', title: 'Registro de quién y cuándo', desc: 'Auditoría automática de usuario y fecha exacta.' },
    { id: 'CA03', title: 'Múltiples versiones por archivo', desc: 'Soporte v1.0, v2.0, v3.0 manteniendo la identidad del documento.' },
    { id: 'CA04', title: 'Versiones históricas disponibles', desc: 'No se sobrescriben físicamente los archivos anteriores.' },
    { id: 'CA05', title: 'Registro de consultas y descargas', desc: 'Cada lectura o descarga queda asentada en la bitácora.' },
    { id: 'CA06', title: 'Detalle de qué cambió en cada campo', desc: 'Guarda el valor anterior y el nuevo valor modificado.' },
    { id: 'CA07', title: 'Protección de confidencialidad', desc: 'Bloqueo automático si el usuario no tiene permisos.' },
    { id: 'CA08', title: 'Historial completo de ciclo de vida', desc: 'Línea de tiempo desde que se crea hasta que se archiva.' },
    { id: 'CA09', title: 'Verificación de autenticidad criptográfica', desc: 'Cálculo SHA-256 en carga y comprobación en tiempo real.' },
    { id: 'CA10', title: 'Búsqueda por datos clave (Sin OCR)', desc: 'Filtros rápidos por cliente, paciente, fecha, tipo o expediente.' },
    { id: 'CA11', title: 'Recuperación desde papelera', desc: 'Restauración documentada y con motivo registrado.' },
    { id: 'CA12', title: 'Bitácora inalterable (Inmutable)', desc: 'Nadie puede borrar ni modificar el historial de eventos.' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <span>Cómo Protegemos tus Documentos</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Diseñado para que profesionales, clínicas, talleres y empresas gestionen su información con total tranquilidad.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Cumplimiento Integral de Seguridad Activo</span>
        </div>
      </div>

      {/* 6 Business Guarantees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {businessGuarantees.map((item, idx) => (
          <div key={idx} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
              {item.icon}
            </div>
            <h3 className="font-bold text-slate-900 text-sm">
              {item.title}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Plain Language FAQ Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900">
          Preguntas Frecuentes sobre la Seguridad de tus Archivos
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-1.5">
            <p className="font-bold text-slate-900">¿Qué pasa si alguien borra un archivo por accidente?</p>
            <p className="text-slate-600 leading-relaxed">
              No se pierde. Se traslada a tu <strong>Papelera Segura</strong> y un supervisor puede restaurarlo inmediatamente con un clic.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-1.5">
            <p className="font-bold text-slate-900">¿Cómo sé si un contrato fue modificado después de firmarse?</p>
            <p className="text-slate-600 leading-relaxed">
              Con el botón <strong>Comprobar Autenticidad</strong> en la ficha del documento. El sistema valida si el archivo en disco coincide exactamente con el original.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-1.5">
            <p className="font-bold text-slate-900">¿Quién puede ver los documentos confidenciales?</p>
            <p className="text-slate-600 leading-relaxed">
              Solo los usuarios con el rol adecuado (por ejemplo, el dueño o directores). Si un usuario sin permiso intenta entrar, el sistema lo bloquea y avisa en el historial.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 space-y-1.5">
            <p className="font-bold text-slate-900">¿Puedo recuperar una versión antigua de un documento?</p>
            <p className="text-slate-600 leading-relaxed">
              Sí. Todas las versiones que subes quedan archivadas. Puedes descargar cualquiera de las versiones anteriores en cualquier momento.
            </p>
          </div>
        </div>
      </div>

      {/* Accordion for Technical details (Discreet for IT specialists) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <button
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="w-full p-4 bg-slate-50/70 hover:bg-slate-100 flex items-center justify-between text-slate-700 font-semibold text-xs transition-colors"
        >
          <span className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-slate-500" />
            <span>Ver especificaciones técnicas de infraestructura y arquitectura Linux (Para TI / Soporte)</span>
          </span>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showTechnicalDetails ? 'rotate-180' : ''}`} />
        </button>

        {showTechnicalDetails && (
          <div className="p-6 border-t border-slate-200/80 space-y-6 text-xs text-slate-600">
            
            <div>
              <h4 className="font-bold text-slate-900 mb-2">12 Criterios de Aceptación Técnicos Verificados:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {criteria.map((c) => (
                  <div key={c.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-mono font-bold text-indigo-600 mr-1.5">{c.id}:</span>
                      <strong className="text-slate-800">{c.title}</strong>
                      <p className="text-[11px] text-slate-500 mt-0.5">{c.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] space-y-2 overflow-x-auto">
              <p className="text-indigo-400 font-bold"># Arquitectura del Servidor Linux:</p>
              <p>Ruta física: /data/gestor_documental/{'{DOC-ID}'}/v{'{VERSION}'}/{'{FILE}'}</p>
              <p>Permisos: chmod 0640 (Lectura restringida al servicio de custodia)</p>
              <p>Base de datos: PostgreSQL con tablas normalizadas (document, document_version, document_audit con JSONB)</p>
              <p>Integridad: Hash SHA-256 por archivo y encadenamiento criptográfico en bitácora</p>
            </div>

          </div>
        )}
      </div>

    </div>
  );
};
