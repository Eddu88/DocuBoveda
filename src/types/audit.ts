/**
 * Audit and Traceability Types for Linux SGD
 * Conforms to RNF04 (document_audit table with old_value/new_value JSONB and cryptographic hash chain)
 */

export type AuditAction = 
  | 'CREACION'
  | 'VISUALIZACION'
  | 'DESCARGA'
  | 'MODIFICACION_METADATOS'
  | 'NUEVA_VERSION'
  | 'CAMBIO_ESTADO'
  | 'ELIMINACION_LOGICA'
  | 'RESTAURACION'
  | 'CAMBIO_PERMISOS'
  | 'MOVIMIENTO'
  | 'INTENTO_DENEGADO'
  | 'VERIFICACION_HASH';

export interface AuditLogEntry {
  auditId: string; // e.g. AUD-2026-0001
  documentId: string;
  documentTitle: string;
  userId: string;
  userName: string;
  userRole: string;
  action: AuditAction;
  eventDate: string; // ISO
  ipAddress: string;
  oldValue?: Record<string, any> | null;
  newValue?: Record<string, any> | null;
  description: string;
  previousHash: string; // Cryptographic chain linking
  hash: string; // SHA-256 (previousHash + auditId + documentId + action + eventDate + oldValue + newValue)
}

export interface HashVerificationResult {
  verified: boolean;
  computedHash: string;
  storedHash: string;
  matched: boolean;
  checkedAt: string;
  checkedBy: string;
  statusMessage: string;
}
