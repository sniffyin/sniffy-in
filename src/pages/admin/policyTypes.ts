/**
 * policyTypes.ts — Role Policy Acknowledgment ("read the role policy, sign it,
 * get a PDF") feature.
 *
 * Two tables (see supabase/migrations/20260917000000_policy_acknowledgments.sql):
 *   - role_policies: the master content per role, editable from the admin
 *     Policies tab (PoliciesTab.tsx). Sections are a small heading+bullets
 *     shape rather than free-form rich text, so the public sign page and the
 *     generated PDF can render it consistently.
 *   - policy_acknowledgments: one row per admin-generated sign-link, keyed by
 *     an opaque `token` used in the public URL (/policy-sign/:token). It
 *     snapshots the policy's title/sections at creation time so a later edit
 *     to the master text never rewrites what someone already read and signed.
 *     `markAcknowledgmentSigned` guards its UPDATE with `.eq('status','pending')`
 *     so a link can only ever be signed once.
 */

import { supabase } from '../../lib/supabase';
import { buildOfferLetterContent, type OfferLetterData, type OfferLetterPosition } from './offerLetterTemplate';

export type PolicyRole = 'groomer' | 'coordinator' | 'founder';

export const POLICY_ROLES: PolicyRole[] = ['groomer', 'coordinator', 'founder'];

export const POLICY_ROLE_LABEL: Record<PolicyRole, string> = {
  groomer:     'Groomer',
  coordinator: 'Coordinator',
  founder:     'Founder',
};

export interface RolePolicySection {
  heading: string;
  items: string[];
}

export interface RolePolicy {
  role:       PolicyRole;
  title:      string;
  intro:      string | null;
  sections:   RolePolicySection[];
  updated_at: string;
  updated_by: string | null;
}

export type AckStatus = 'pending' | 'signed';

/** 'policy' = role responsibilities acknowledgment; 'offer_letter' = groomer
 *  offer letter (content in policy_sections, letter fields in offer_data). */
export type AckKind = 'policy' | 'offer_letter';

export interface PolicyAcknowledgment {
  id:              string;
  kind:            AckKind;
  offer_data:      OfferLetterData | null;
  role:            PolicyRole;
  signer_name:     string;
  groomer_id:      string | null;
  token:           string;
  status:          AckStatus;
  policy_title:    string;
  policy_sections: RolePolicySection[];
  pdf_path:        string | null;
  signed_at:       string | null;
  created_by:      string | null;
  created_at:      string;
}

const PDF_BUCKET = 'policy-signatures';

/** Supabase's PostgrestError/StorageError are plain objects, not
 *  `instanceof Error` — `String(err)` on one renders "[object Object]".
 *  Pull `.message` off whatever shape actually got thrown. */
export function errMsg(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === 'object' && 'message' in err && typeof (err as { message?: unknown }).message === 'string') {
    return (err as { message: string }).message;
  }
  return String(err);
}

// ─── Master content (admin-editable) ──────────────────────────────────

export async function fetchRolePolicies(): Promise<RolePolicy[]> {
  const { data, error } = await supabase.from('role_policies').select('*').order('role');
  if (error) throw error;
  return (data ?? []) as RolePolicy[];
}

export async function fetchRolePolicy(role: PolicyRole): Promise<RolePolicy | null> {
  const { data, error } = await supabase
    .from('role_policies')
    .select('*')
    .eq('role', role)
    .maybeSingle();
  if (error) throw error;
  return data as RolePolicy | null;
}

export async function saveRolePolicy(
  policy: Pick<RolePolicy, 'role' | 'title' | 'intro' | 'sections'>,
  updatedBy: string,
): Promise<void> {
  const { error } = await supabase.from('role_policies').upsert({
    role:       policy.role,
    title:      policy.title,
    intro:      policy.intro,
    sections:   policy.sections,
    updated_by: updatedBy,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

// ─── Acknowledgment links (admin-issued, publicly signed once) ───────

function randomToken(): string {
  // 24 random bytes as hex — short enough for a clean URL, long enough
  // that guessing a live token is infeasible. This token IS the auth.
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}

export async function fetchAcknowledgments(): Promise<PolicyAcknowledgment[]> {
  const { data, error } = await supabase
    .from('policy_acknowledgments')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);
  if (error) throw error;
  return (data ?? []) as PolicyAcknowledgment[];
}

export async function fetchAcknowledgmentByToken(token: string): Promise<PolicyAcknowledgment | null> {
  const { data, error } = await supabase
    .from('policy_acknowledgments')
    .select('*')
    .eq('token', token)
    .maybeSingle();
  if (error) throw error;
  return data as PolicyAcknowledgment | null;
}

export async function createAcknowledgmentLink(opts: {
  role:       PolicyRole;
  signerName: string;
  groomerId?: string | null;
  createdBy:  string;
  policy:     RolePolicy;
}): Promise<PolicyAcknowledgment> {
  const token = randomToken();
  const { data, error } = await supabase
    .from('policy_acknowledgments')
    .insert({
      role:            opts.role,
      signer_name:     opts.signerName,
      groomer_id:      opts.groomerId ?? null,
      token,
      status:          'pending',
      policy_title:    opts.policy.title,
      policy_sections: opts.policy.sections,
      created_by:      opts.createdBy,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data as PolicyAcknowledgment;
}

export async function createOfferLetterLink(opts: {
  signerName:    string;
  groomerId?:    string | null;
  createdBy:     string;
  letterDate:    string;
  effectiveDate: string;
  position?:     OfferLetterPosition;
  reportingGroomer?: string | null;
}): Promise<PolicyAcknowledgment> {
  const letter = buildOfferLetterContent({
    employeeName: opts.signerName,
    letterDate: opts.letterDate,
    effectiveDate: opts.effectiveDate,
    position: opts.position,
    reportingGroomer: opts.reportingGroomer,
  });
  const { data, error } = await supabase
    .from('policy_acknowledgments')
    .insert({
      kind:            'offer_letter',
      offer_data:      letter.data,
      role:            'groomer',
      signer_name:     opts.signerName,
      groomer_id:      opts.groomerId ?? null,
      token:           randomToken(),
      status:          'pending',
      policy_title:    letter.title,
      policy_sections: letter.sections,
      created_by:      opts.createdBy,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data as PolicyAcknowledgment;
}

export function buildPolicyLinkUrl(token: string): string {
  return `${window.location.origin}/policy-sign/${token}`;
}

// ─── Signing (called from the public /policy-sign/:token page) ───────

export async function uploadSignedPolicyPdf(token: string, pdfBlob: Blob): Promise<string> {
  const path = `${token}.pdf`;
  const { error } = await supabase.storage.from(PDF_BUCKET).upload(path, pdfBlob, {
    contentType: 'application/pdf',
    upsert: true,
  });
  if (error) throw error;
  return path;
}

export function getSignedPolicyPdfUrl(path: string): string {
  const { data } = supabase.storage.from(PDF_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/** Flips status → 'signed'. The `.eq('status','pending')` guard means this
 *  can never re-sign (or overwrite the pdf_path of) an already-signed row —
 *  that's what makes the link one-time. */
export async function markAcknowledgmentSigned(token: string, pdfPath: string): Promise<void> {
  const { error } = await supabase
    .from('policy_acknowledgments')
    .update({ status: 'signed', pdf_path: pdfPath, signed_at: new Date().toISOString() })
    .eq('token', token)
    .eq('status', 'pending');
  if (error) throw error;
}
