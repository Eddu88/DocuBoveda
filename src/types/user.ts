/**
 * User & RBAC Types for Linux SGD
 * Conforms to RF06 (Role-Based Access Control)
 */

import { ConfidentialityLevel } from './document';

export type UserRole = 
  | 'Administrador'
  | 'Gestor documental'
  | 'Consultor'
  | 'Auditor'
  | 'Supervisor';

export interface UserPermissions {
  canUpload: boolean;
  canBulkUpload: boolean;
  canEditMetadata: boolean;
  canUploadVersion: boolean;
  canChangeStatus: boolean;
  canDelete: boolean;
  canRestore: boolean;
  canViewAudit: boolean;
  canExportAudit: boolean;
  canVerifyHash: boolean;
  canViewRestricted: boolean;
}

export interface User {
  id: string; // USR-001
  name: string;
  email: string;
  role: UserRole;
  department: string;
  allowedConfidentiality: ConfidentialityLevel[];
  permissions: UserPermissions;
}

export const ROLE_PERMISSIONS: Record<UserRole, UserPermissions> = {
  'Administrador': {
    canUpload: true,
    canBulkUpload: true,
    canEditMetadata: true,
    canUploadVersion: true,
    canChangeStatus: true,
    canDelete: true,
    canRestore: true,
    canViewAudit: true,
    canExportAudit: true,
    canVerifyHash: true,
    canViewRestricted: true,
  },
  'Supervisor': {
    canUpload: true,
    canBulkUpload: true,
    canEditMetadata: true,
    canUploadVersion: true,
    canChangeStatus: true,
    canDelete: false, // Supervisor approves but cannot delete
    canRestore: true,
    canViewAudit: true,
    canExportAudit: true,
    canVerifyHash: true,
    canViewRestricted: true,
  },
  'Gestor documental': {
    canUpload: true,
    canBulkUpload: true,
    canEditMetadata: true,
    canUploadVersion: true,
    canChangeStatus: false, // Cannot unilaterally change to Aprobado/Archivado
    canDelete: false,
    canRestore: false,
    canViewAudit: true,
    canExportAudit: false,
    canVerifyHash: true,
    canViewRestricted: false, // Only up to Confidencial, not Restringido unless granted
  },
  'Auditor': {
    canUpload: false,
    canBulkUpload: false,
    canEditMetadata: false,
    canUploadVersion: false,
    canChangeStatus: false,
    canDelete: false,
    canRestore: false,
    canViewAudit: true,
    canExportAudit: true,
    canVerifyHash: true,
    canViewRestricted: true, // Auditor has inspection access
  },
  'Consultor': {
    canUpload: false,
    canBulkUpload: false,
    canEditMetadata: false,
    canUploadVersion: false,
    canChangeStatus: false,
    canDelete: false,
    canRestore: false,
    canViewAudit: false, // Restricted from raw audit logs
    canExportAudit: false,
    canVerifyHash: true,
    canViewRestricted: false, // Only Público or Interno
  },
};
