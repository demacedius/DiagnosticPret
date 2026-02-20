import type { SupabaseClient } from '@supabase/supabase-js';

export interface UserDiagnostic {
  id: string;
  user_id: string;
  created_at: string;
  score: number;
  taux_endettement: number;
  apport_pct: number;
  reste_a_vivre: number;
  mensualite: number;
  hcsf_ok: boolean;
  revenus: number;
  charges: number;
  montant: number;
  apport: number;
  duree?: number;
  taux_interet?: number;
  contrat?: string;
  anciennete?: string;
  decouvert?: string;
  nb_enfants?: number;
  diagnostic_type: 'express' | 'premium';
}

export interface SaveDiagnosticParams {
  userId: string;
  score: number;
  tauxEndettement: number;
  apportPct: number;
  resteAVivre: number;
  mensualite: number;
  hcsfOk: boolean;
  revenus: number;
  charges: number;
  montant: number;
  apport: number;
  duree?: number;
  tauxInteret?: number;
  contrat?: string;
  anciennete?: string;
  decouvert?: string;
  nbEnfants?: number;
  diagnosticType?: 'express' | 'premium';
}

export async function saveUserDiagnostic(
  supabase: SupabaseClient,
  params: SaveDiagnosticParams
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('user_diagnostics').insert({
      user_id: params.userId,
      score: params.score,
      taux_endettement: params.tauxEndettement,
      apport_pct: params.apportPct,
      reste_a_vivre: params.resteAVivre,
      mensualite: params.mensualite,
      hcsf_ok: params.hcsfOk,
      revenus: params.revenus,
      charges: params.charges,
      montant: params.montant,
      apport: params.apport,
      duree: params.duree,
      taux_interet: params.tauxInteret,
      contrat: params.contrat,
      anciennete: params.anciennete,
      decouvert: params.decouvert,
      nb_enfants: params.nbEnfants || 0,
      diagnostic_type: params.diagnosticType || 'express',
    });

    if (error) {
      console.error('Error saving diagnostic:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected error saving diagnostic:', err);
    return { success: false, error: 'Unexpected error' };
  }
}

export async function getUserDiagnostics(
  supabase: SupabaseClient,
  userId: string,
  limit = 50
): Promise<{ data: UserDiagnostic[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('user_diagnostics')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching diagnostics:', error);
      return { data: [], error: error.message };
    }

    return { data: data || [] };
  } catch (err) {
    console.error('Unexpected error fetching diagnostics:', err);
    return { data: [], error: 'Unexpected error' };
  }
}

export async function getDiagnosticStats(
  supabase: SupabaseClient,
  userId: string
): Promise<{
  totalCount: number;
  avgScore: number;
  latestScore: number;
  firstScore: number;
  progression: number;
}> {
  try {
    const { data } = await getUserDiagnostics(supabase, userId, 100);

    if (!data || data.length === 0) {
      return {
        totalCount: 0,
        avgScore: 0,
        latestScore: 0,
        firstScore: 0,
        progression: 0,
      };
    }

    const totalCount = data.length;
    const avgScore = Math.round(
      data.reduce((sum, d) => sum + d.score, 0) / totalCount
    );
    const latestScore = data[0].score;
    const firstScore = data[data.length - 1].score;
    const progression = latestScore - firstScore;

    return {
      totalCount,
      avgScore,
      latestScore,
      firstScore,
      progression,
    };
  } catch (err) {
    console.error('Error calculating stats:', err);
    return {
      totalCount: 0,
      avgScore: 0,
      latestScore: 0,
      firstScore: 0,
      progression: 0,
    };
  }
}
