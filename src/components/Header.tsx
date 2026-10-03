import React, { useState } from 'react';
import { useDocumentSystem } from '../context/DocumentContext';
import { 
  ShieldCheck, 
  Plus, 
  ChevronDown, 
  RotateCcw,
  Check,
  User as UserIcon,
  Trash2,
  History,
  FolderOpen
} from 'lucide-react';

interface HeaderProps {
  currentTab: 'documents' | 'audit' | 'recycle' | 'architecture';
  setCurrentTab: (tab: 'documents' | 'audit' | 'recycle' | 'architecture') => void;
  openUploadModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  openUploadModal,
}) => {
  const { currentUser, users, switchUser, documents, resetToInitialData } = useDocumentSystem();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const deletedCount = documents.filter(d => d.isDeleted).length;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Zone 1: Friendly Brand Wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-xs shadow-indigo-200">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <a
            href="#top"
            onClick={(e) => { e.preventDefault(); setCurrentTab('documents'); }}
            className="text-base font-bold tracking-tight text-slate-900 hover:text-indigo-600 transition-colors flex items-center gap-1.5"
          >
            <span>DocuBóveda</span>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-200/60 rounded px-1.5 py-0.5 ml-1 hidden sm:inline-block">
              Protegido
            </span>
          </a>
        </div>

        {/* Zone 2: Clean 4 Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600">
          <button
            onClick={() => setCurrentTab('documents')}
            className={`transition-colors pb-1 border-b-2 flex items-center gap-1.5 ${
              currentTab === 'documents'
                ? 'text-indigo-600 border-indigo-600'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Mis Documentos</span>
          </button>

          <button
            onClick={() => setCurrentTab('audit')}
            className={`transition-colors pb-1 border-b-2 flex items-center gap-1.5 ${
              currentTab === 'audit'
                ? 'text-indigo-600 border-indigo-600'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Historial de Actividad</span>
          </button>

          <button
            onClick={() => setCurrentTab('recycle')}
            className={`transition-colors pb-1 border-b-2 flex items-center gap-1.5 ${
              currentTab === 'recycle'
                ? 'text-indigo-600 border-indigo-600'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Papelera Segura</span>
            {deletedCount > 0 && (
              <span className="font-mono text-[10px] bg-amber-100 text-amber-800 rounded-full px-1.5 py-0.2">
                {deletedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentTab('architecture')}
            className={`transition-colors pb-1 border-b-2 flex items-center gap-1.5 ${
              currentTab === 'architecture'
                ? 'text-indigo-600 border-indigo-600'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Garantías de Seguridad</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action & Friendly User Profile Switcher */}
        <div className="flex items-center gap-3">
          
          {/* Reset Demo Data */}
          <button
            onClick={resetToInitialData}
            title="Restaurar ejemplos de demostración"
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Restaurar ejemplos"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* New Document CTA */}
          {currentUser.permissions.canUpload && (
            <button
              onClick={openUploadModal}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs hover:shadow-sm whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Subir Documento</span>
            </button>
          )}

          {/* User Profile Switcher */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2.5 pl-2.5 pr-2 py-1.5 rounded-lg border border-slate-200 bg-slate-50/80 hover:bg-slate-100 transition-colors text-left"
            >
              <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                {currentUser.name.charAt(currentUser.name.startsWith('Dr.') ? 4 : 0)}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold text-slate-800 leading-none truncate max-w-[130px]">
                  {currentUser.name}
                </p>
                <p className="text-[11px] text-slate-500 leading-none mt-1">
                  {currentUser.role === 'Gestor documental' ? 'Encargado' : currentUser.role}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Cambiar Perfil de Usuario
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Comprueba cómo ven el sistema diferentes miembros de tu equipo.
                  </p>
                </div>
                <div className="py-1">
                  {users.map(u => {
                    const isSelected = u.id === currentUser.id;
                    return (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          setUserDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs flex items-center justify-between transition-colors ${
                          isSelected ? 'bg-indigo-50/80 text-indigo-950 font-medium' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-900 truncate">{u.name}</span>
                            <span className="text-[10px] text-slate-400">({u.role})</span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {u.department}
                          </p>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
