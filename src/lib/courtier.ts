import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  CourtierClient,
  CourtierDossier,
  CourtierDiagnostic,
  DiagnosticResult,
  DiagnosticInput,
} from './courtier-types';

export async function getClients(brokerId: string, supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('courtier_clients')
    .select('*')
    .eq('broker_id', brokerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as CourtierClient[];
}

export async function getClient(clientId: string, supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('courtier_clients')
    .select('*')
    .eq('id', clientId)
    .single();
  if (error) throw error;
  return data as CourtierClient;
}

export async function createClient(
  brokerId: string,
  nom: string,
  email: string | null,
  supabase: SupabaseClient
) {
  const { data, error } = await supabase
    .from('courtier_clients')
    .insert({ broker_id: brokerId, nom, email })
    .select()
    .single();
  if (error) throw error;
  return data as CourtierClient;
}

export async function getDossiers(clientId: string, supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('courtier_dossiers')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as CourtierDossier[];
}

export async function getDossier(dossierId: string, supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('courtier_dossiers')
    .select('*')
    .eq('id', dossierId)
    .single();
  if (error) throw error;
  return data as CourtierDossier;
}

export async function createDossier(
  brokerId: string,
  clientId: string,
  titre: string,
  supabase: SupabaseClient
) {
  const { data, error } = await supabase
    .from('courtier_dossiers')
    .insert({ broker_id: brokerId, client_id: clientId, titre })
    .select()
    .single();
  if (error) throw error;
  return data as CourtierDossier;
}

export async function updateDossierStatut(
  dossierId: string,
  statut: string,
  supabase: SupabaseClient
) {
  const { error } = await supabase
    .from('courtier_dossiers')
    .update({ statut, updated_at: new Date().toISOString() })
    .eq('id', dossierId);
  if (error) throw error;
}

export async function getDiagnostics(dossierId: string, supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('courtier_diagnostics')
    .select('*')
    .eq('dossier_id', dossierId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as CourtierDiagnostic[];
}

export async function saveDiagnostic(
  brokerId: string,
  dossierId: string,
  result: DiagnosticResult,
  inputs: DiagnosticInput,
  supabase: SupabaseClient
) {
  const { data, error } = await supabase
    .from('courtier_diagnostics')
    .insert({
      broker_id:         brokerId,
      dossier_id:        dossierId,
      input_revenus:     inputs.revenus,
      input_charges:     inputs.charges,
      input_montant:     inputs.montant,
      input_apport:      inputs.apport,
      input_duree:       inputs.duree,
      input_taux_interet: inputs.tauxInteret,
      input_contrat:     inputs.contrat,
      input_anciennete:  inputs.anciennete,
      input_decouvert:   inputs.decouvert,
      input_nb_enfants:  inputs.nbEnfants,
      score_global:      result.scoreGlobal,
      taux_endettement:  result.tauxEndettement,
      mensualite:        result.mensualite,
      reste_a_vivre:     result.resteAVivre,
      apport_pct:        result.apportPct,
      hcsf_ok:           result.hcsfOk,
      actions:           result.actions,
      simulations:       result.simulations,
    })
    .select()
    .single();
  if (error) throw error;
  return data as CourtierDiagnostic;
}

export async function generateInviteToken(
  clientId: string,
  supabase: SupabaseClient
) {
  const token = crypto.randomUUID();
  const { error } = await supabase
    .from('courtier_clients')
    .update({ invite_token: token, invite_used: false })
    .eq('id', clientId);
  if (error) throw error;
  return token;
}

export async function getClientByInviteToken(
  token: string,
  supabase: SupabaseClient
) {
  const { data, error } = await supabase
    .from('courtier_clients')
    .select('*')
    .eq('invite_token', token)
    .single();
  if (error) return null;
  return data as CourtierClient;
}

export async function linkClientToClerkUser(
  clientId: string,
  clerkUserId: string,
  supabase: SupabaseClient
) {
  const { error } = await supabase
    .from('courtier_clients')
    .update({ client_clerk_id: clerkUserId, invite_used: true })
    .eq('id', clientId);
  if (error) throw error;
}
