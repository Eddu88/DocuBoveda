/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DocumentProvider, useDocumentSystem } from './context/DocumentContext';
import { Header } from './components/Header';
import { DocumentList } from './components/DocumentList';
import { DocumentDetailDrawer } from './components/DocumentDetailDrawer';
import { UploadModal } from './components/UploadModal';
import { NewVersionModal } from './components/NewVersionModal';
import { DeleteModal } from './components/DeleteModal';
import { AuditLogView } from './components/AuditLogView';
import { RecycleBinView } from './components/RecycleBinView';
import { LinuxArchitectureView } from './components/LinuxArchitectureView';
import { ToastContainer } from './components/ToastContainer';
import { DocumentRecord } from './types/document';

function MainAppContent() {
  const [currentTab, setCurrentTab] = useState<'documents' | 'audit' | 'recycle' | 'architecture'>('documents');
  
  // Modal states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isBulkUploadMode, setIsBulkUploadMode] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentRecord | null>(null);
  const [initialDrawerTab, setInitialDrawerTab] = useState<'metadata' | 'traceability' | 'versions' | 'storage'>('metadata');
  const [versioningDocument, setVersioningDocument] = useState<DocumentRecord | null>(null);
  const [deletingDocument, setDeletingDocument] = useState<DocumentRecord | null>(null);

  const { documents } = useDocumentSystem();

  // Keep selectedDocument in sync with context if it's open and gets updated
  const activeSelectedDoc = selectedDocument 
    ? documents.find(d => d.id === selectedDocument.id) || selectedDocument 
    : null;

  const handleOpenUpload = (isBulk = false) => {
    setIsBulkUploadMode(isBulk);
    setIsUploadModalOpen(true);
  };

  const handleSelectDocument = (
    doc: DocumentRecord, 
    tab: 'metadata' | 'traceability' | 'versions' | 'storage' = 'metadata'
  ) => {
    setSelectedDocument(doc);
    setInitialDrawerTab(tab);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      
      {/* Top Navigation conforming to Top Bar Contract */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        openUploadModal={() => handleOpenUpload(false)}
      />

      {/* Main Container Viewport (1440px baseline with fluid margins) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        
        {currentTab === 'documents' && (
          <DocumentList
            onSelectDocument={handleSelectDocument}
            onOpenUploadModal={handleOpenUpload}
            onOpenNewVersionModal={(doc) => setVersioningDocument(doc)}
            onOpenDeleteModal={(doc) => setDeletingDocument(doc)}
          />
        )}

        {currentTab === 'audit' && (
          <AuditLogView />
        )}

        {currentTab === 'recycle' && (
          <RecycleBinView />
        )}

        {currentTab === 'architecture' && (
          <LinuxArchitectureView />
        )}

      </main>

      {/* Document Detailed Inspection & Traceability Drawer */}
      {activeSelectedDoc && (
        <DocumentDetailDrawer
          document={activeSelectedDoc}
          initialTab={initialDrawerTab}
          onClose={() => setSelectedDocument(null)}
          onOpenNewVersionModal={(doc) => {
            setVersioningDocument(doc);
          }}
        />
      )}

      {/* Upload Document Modal (Single or Bulk) */}
      <UploadModal
        isOpen={isUploadModalOpen}
        initialBulkMode={isBulkUploadMode}
        onClose={() => setIsUploadModalOpen(false)}
      />

      {/* New Version Creation Modal */}
      <NewVersionModal
        document={versioningDocument}
        onClose={() => setVersioningDocument(null)}
      />

      {/* Soft Delete Confirmation Modal */}
      <DeleteModal
        document={deletingDocument}
        onClose={() => setDeletingDocument(null)}
      />

      {/* Real-time Toast Notifications */}
      <ToastContainer />

      {/* Quiet Commercial Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-5 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-medium text-slate-700">DocuBóveda · Bóveda Digital Segura & Trazabilidad de Documentos</span>
          <span className="text-slate-400">Protección garantizada con sellos de autenticidad y copias de seguridad continuas</span>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <DocumentProvider>
      <MainAppContent />
    </DocumentProvider>
  );
}
