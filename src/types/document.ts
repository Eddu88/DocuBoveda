/**
 * Core types for Linux SGD (Sistema de Gestión Documental y Trazabilidad Integral)
 */

export type DocumentStatus = 
  | 'Borrador'
  | 'Registrado'
  | 'En revisión'
  | 'Aprobado'
  | 'Vigente'
  | 'Observado'
  | 'Archivado'
  | 'Anulado';

export type DocumentType = 
  | 'Contrato'
  | 'Factura'
  | 'Acta'
  | 'Oficio'
  | 'Resolución'
  | 'Informe Técnico'
  | 'Póliza'
  | 'Memorándum'
  | 'Convenio'
  | 'Expediente';

export type DocumentCategory = 
  | 'Legal'
  | 'Financiera'
  | 'RRHH'
  | 'Operaciones'
  | 'Auditoría'
  | 'Dirección'
  | 'Tecnología';

export type ConfidentialityLevel = 
  | 'Público'
  | 'Interno'
  | 'Confidencial'
  | 'Restringido';

export interface DocumentVersion {
  versionNumber: number; // 1.0, 2.0, 3.0
  versionLabel: string; // 'v1.0', 'v2.0'
  fileName: string;
  fileSize: number;
  mimeType: string;
  sha256Hash: string;
  uploadDate: string; // ISO
  uploadedBy: string; // User Name
  userId: string;
  changeReason: string;
  storagePath: string; // e.g. /data/gestor_documental/DOC-2026-000001/v1/contrato.pdf
  posixPermissions: string; // e.g. -rw-r-----
  posixOwner: string; // e.g. www-data:archival_ops
  isCurrent: boolean;
  contentSnippet?: string; // Text snippet / mock file payload
}

export interface DocumentMetadata {
  title: string;
  documentType: DocumentType;
  category: DocumentCategory;
  responsibleArea: string;
  documentDate: string; // YYYY-MM-DD
  registrationDate: string; // YYYY-MM-DD
  registeredBy: string;
  registeredByUserId: string;
  status: DocumentStatus;
  confidentiality: ConfidentialityLevel;
  observations: string;
  dossierNumber?: string; // Número de expediente
  processCode?: string; // Código de proceso
  entityOrVendor?: string; // Entidad o proveedor relacionado
  expirationDate?: string; // Fecha de vencimiento
  keywords: string[];
  relatedDocumentIds: string[];
}

export interface DocumentRecord {
  id: string; // e.g. DOC-2026-000001
  metadata: DocumentMetadata;
  versions: DocumentVersion[];
  currentVersionNumber: number;
  isDeleted: boolean;
  deletionInfo?: {
    deletedAt: string;
    deletedBy: string;
    reason: string;
  };
  createdAt: string;
  updatedAt: string;
}
