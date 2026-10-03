/**
 * Cryptographic utility using Web Crypto API for SHA-256 hashing and chain verification
 * Conforms to RNF03 (SHA-256 calculation for file integrity) and RNF04 (Immutable audit log chain)
 */

import { AuditLogEntry } from '../types/audit';

export async function computeFileSha256(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function computeTextSha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function computeAuditEntryHash(
  entry: Omit<AuditLogEntry, 'hash'>,
  previousHash: string
): Promise<string> {
  const payload = JSON.stringify({
    previousHash,
    auditId: entry.auditId,
    documentId: entry.documentId,
    userId: entry.userId,
    action: entry.action,
    eventDate: entry.eventDate,
    oldValue: entry.oldValue ?? null,
    newValue: entry.newValue ?? null,
    description: entry.description,
  });
  return computeTextSha256(payload);
}

export async function verifyAuditChain(
  entries: AuditLogEntry[]
): Promise<{ isValid: boolean; brokenIndex?: number; expectedHash?: string; actualHash?: string }> {
  let prevHash = '0000000000000000000000000000000000000000000000000000000000000000';
  
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    if (entry.previousHash !== prevHash) {
      return {
        isValid: false,
        brokenIndex: i,
        expectedHash: prevHash,
        actualHash: entry.previousHash,
      };
    }
    const computed = await computeAuditEntryHash(entry, prevHash);
    if (computed !== entry.hash) {
      return {
        isValid: false,
        brokenIndex: i,
        expectedHash: computed,
        actualHash: entry.hash,
      };
    }
    prevHash = entry.hash;
  }
  return { isValid: true };
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function generateDocId(existingCount: number, year = 2026): string {
  const nextNum = (existingCount + 1).toString().padStart(6, '0');
  return `DOC-${year}-${nextNum}`;
}

export function generateAuditId(existingCount: number, year = 2026): string {
  const nextNum = (existingCount + 1).toString().padStart(5, '0');
  return `AUD-${year}-${nextNum}`;
}
