export type DossierStatut = 'en_attente' | 'en_cours' | 'accorde' | 'refuse';

export interface CourtierClient {
  id: string;
  broker_id: string;
  nom: string;
  email: string | null;
  invite_token: string | null;
  invite_used: boolean;
  client_clerk_id: string | null;
  created_at: string;
}

export interface CourtierDossier {
  id: string;
  client_id: string;
  broker_id: string;
  titre: string;
  statut: DossierStatut;
  created_at: string;
  updated_at: string;
}

export interface CourtierDiagnostic {
  id: string;
  dossier_id: string;
  broker_id: string;
  // inputs
  input_revenus: number;
  input_charges: number;
  input_montant: number;
  input_apport: number;
  input_duree: number;
  input_taux_interet: number;
  input_contrat: string;
  input_anciennete: string;
  input_decouvert: string;
  input_nb_enfants: number;
  // résultats
  score_global: number;
  taux_endettement: number;
  mensualite: number;
  reste_a_vivre: number;
  apport_pct: number;
  hcsf_ok: boolean;
  actions: ActionItem[];
  simulations: Simulation[];
  created_at: string;
}

export interface ActionItem {
  priorite: 'bloquant' | 'important' | 'conseil';
  titre: string;
  detail: string;
}

export interface Simulation {
  taux: number;
  mensualite: number;
  coutTotal: number;
  tauxEndettement: number;
}

export interface DiagnosticResult {
  scoreGlobal: number;
  tauxEndettement: number;
  mensualite: number;
  resteAVivre: number;
  apportPct: number;
  hcsfOk: boolean;
  actions: ActionItem[];
  simulations: Simulation[];
}

export interface DiagnosticInput {
  revenus: number;
  charges: number;
  montant: number;
  apport: number;
  duree: number;
  tauxInteret: number;
  contrat: string;
  anciennete: string;
  decouvert: string;
  nbEnfants: number;
}
