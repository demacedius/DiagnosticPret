<script lang="ts">
  import { slide, fade } from 'svelte/transition';

  // ─── Types ────────────────────────────────────────────────────────
  type Priorite = 'bloquant' | 'important' | 'conseil';
  interface ActionItem { priorite: Priorite; titre: string; detail: string; }
  interface Simulation { taux: number; mensualite: number; coutTotal: number; tauxEndettement: number; }
  interface RoadmapMilestone { mois: number; titre: string; items: string[]; type: 'now' | 'mid' | 'final'; }

  // ─── Props optionnels (courtier) ──────────────────────────────────
  let { dossierId = undefined, onResult = undefined }: {
    dossierId?: string;
    onResult?: (result: {
      scoreGlobal: number; tauxEndettement: number; mensualite: number;
      resteAVivre: number; apportPct: number; hcsfOk: boolean;
      actions: ActionItem[]; simulations: Simulation[];
    }, inputs: {
      revenus: number; charges: number; montant: number; apport: number;
      duree: number; tauxInteret: number; contrat: string;
      anciennete: string; decouvert: string; nbEnfants: number;
    }) => void;
  } = $props();

  // ─── Form state ───────────────────────────────────────────────────
  let revenus     = $state('');
  let charges     = $state('');
  let montant     = $state('');
  let duree       = $state('20');
  let tauxInteret = $state('4.0');
  let apport      = $state('');
  let contrat     = $state('cdi');
  let anciennete  = $state('plus2ans');
  let decouvert   = $state('non');
  let nbEnfants   = $state('0');

  // ─── UI state ─────────────────────────────────────────────────────
  let submitted = $state(false);
  let errors    = $state<Record<string, string>>({});

  // ─── Results ──────────────────────────────────────────────────────
  let mensualite     = $state(0);
  let tauxEndettement = $state(0);
  let resteAVivre    = $state(0);
  let apportPct      = $state(0);
  let hcsfOk         = $state(false);
  let scoreGlobal    = $state(0);
  let actions        = $state<ActionItem[]>([]);
  let simulations       = $state<Simulation[]>([]);
  let delaiMois         = $state('');
  let roadmapMilestones = $state<RoadmapMilestone[]>([]);

  // ─── Helpers ──────────────────────────────────────────────────────
  function calcMensualite(p: number, tauxAnnuel: number, dureeAns: number): number {
    const r = tauxAnnuel / 100 / 12;
    const n = dureeAns * 12;
    if (r === 0 || n === 0) return n > 0 ? p / n : 0;
    return (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }

  function fmt(n: number): string {
    return Math.round(n).toLocaleString('fr-FR');
  }

  function fmtPct(n: number): string {
    return n.toFixed(1).replace('.', ',') + '\u00a0%';
  }

  /** Back-calculate max borrowable amount from a target monthly payment */
  function maxMontantFromMens(mensMax: number, tauxAnnuel: number, dureeAns: number): number {
    const r = tauxAnnuel / 100 / 12;
    const n = dureeAns * 12;
    if (r === 0) return mensMax * n;
    return mensMax * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));
  }

  // ─── Validation ───────────────────────────────────────────────────
  function validate(): boolean {
    const errs: Record<string, string> = {};
    const r = parseFloat(revenus);
    const c = parseFloat(charges);
    const m = parseFloat(montant);
    const a = parseFloat(apport);
    const t = parseFloat(tauxInteret);
    const d = parseInt(duree);

    if (!revenus   || isNaN(r) || r <= 0)        errs.revenus     = 'Requis (> 0 €)';
    if (!charges   || isNaN(c) || c < 0)         errs.charges     = 'Requis (≥ 0 €)';
    if (!montant   || isNaN(m) || m <= 0)        errs.montant     = 'Requis (> 0 €)';
    if (!apport    || isNaN(a) || a < 0)         errs.apport      = 'Requis (≥ 0 €)';
    if (isNaN(t)   || t < 0.1 || t > 20)        errs.tauxInteret = 'Taux invalide (0,1 – 20 %)';
    if (isNaN(d)   || d < 5   || d > 30)        errs.duree       = 'Durée invalide (5 – 30 ans)';

    errors = errs;
    return Object.keys(errs).length === 0;
  }

  // ─── Computation ──────────────────────────────────────────────────
  function compute(): void {
    const r  = parseFloat(revenus);
    const c  = parseFloat(charges);
    const m  = parseFloat(montant);
    const a  = parseFloat(apport);
    const t  = parseFloat(tauxInteret);
    const d  = parseInt(duree);
    const ne = parseInt(nbEnfants) || 0;

    const mens     = calcMensualite(m, t, d);
    const taux     = r > 0 ? ((c + mens) / r) * 100 : 0;
    const reste    = r - c - mens;
    const prixTot  = m + a;
    const apPct    = prixTot > 0 ? (a / prixTot) * 100 : 0;

    mensualite      = mens;
    tauxEndettement = taux;
    resteAVivre     = reste;
    apportPct       = apPct;
    hcsfOk          = taux <= 35 && d <= 25;

    // ── Score (100 pts) ────────────────────────────────────────────
    let score = 0;

    // Emploi (25 pts)
    const emploiPts: Record<string, Record<string, number>> = {
      cdi:          { plus2ans: 25, '6a24mois': 18, moins6mois: 10 },
      fonctionnaire:{ plus2ans: 25, '6a24mois': 25, moins6mois: 25 },
      cdd:          { plus2ans:  8, '6a24mois':  5, moins6mois:  2 },
      independant:  { plus2ans: 10, '6a24mois':  6, moins6mois:  3 },
      interim:      { plus2ans:  4, '6a24mois':  2, moins6mois:  0 },
    };
    score += emploiPts[contrat]?.[anciennete] ?? 10;

    // Taux endettement (30 pts)
    if      (taux <= 25) score += 30;
    else if (taux <= 30) score += 22;
    else if (taux <= 35) score += 12;

    // Apport (20 pts)
    if      (apPct >= 20) score += 20;
    else if (apPct >= 10) score += 12;
    else if (apPct >=  5) score +=  5;

    // Découvert (15 pts)
    if (decouvert === 'non') score += 15;

    // Reste à vivre (10 pts)
    const nbUC     = 1 + ne * 0.3;
    const ravParUC = reste / nbUC;
    if      (ravParUC >= 1200) score += 10;
    else if (ravParUC >=  800) score +=  6;
    else if (ravParUC >=  400) score +=  2;

    scoreGlobal = score;

    // ── Plan d'action ──────────────────────────────────────────────
    const acts: ActionItem[] = [];

    // Bloquants
    if (taux > 35) {
      const mensMax33 = r * 0.33 - c;
      const montantMax33 = mensMax33 > 0 ? Math.round(maxMontantFromMens(mensMax33, t, d)) : 0;
      const reductionNeeded = Math.max(0, Math.round(m - montantMax33));
      acts.push({
        priorite: 'bloquant',
        titre: `Taux d'endettement à ${fmtPct(taux)} — refus HCSF probable`,
        detail: `La règle HCSF fixe le plafond à 35\u00a0% des revenus nets. Avec une mensualité de ${fmt(mens)}\u00a0€ et ${fmt(c)}\u00a0€ de charges existantes, votre taux dépasse la limite.${montantMax33 > 0 ? ` Pour passer sous 35\u00a0%, vous devriez emprunter au maximum ${fmt(montantMax33)}\u00a0€ (soit ${fmt(reductionNeeded)}\u00a0€ de moins que votre projet actuel).` : ' Réduisez le montant emprunté ou augmentez significativement votre apport.'}`,
      });
    }
    if (d > 25) acts.push({
      priorite: 'bloquant',
      titre: `Durée de ${d}\u00a0ans — dépasse la limite HCSF`,
      detail: 'La durée maximale autorisée est 25\u00a0ans (27\u00a0ans pour un achat sur plan VEFA). Au-delà, les banques ne peuvent légalement accorder le prêt.',
    });
    if (apPct < 5) {
      const apportPour10 = m / 9;
      const manquePour10 = Math.max(0, Math.round(apportPour10 - a));
      acts.push({
        priorite: 'bloquant',
        titre: `Apport insuffisant (${fmtPct(apPct)} du prix total)`,
        detail: `Votre apport couvre moins de 5\u00a0% du bien. Les banques refusent quasi-systématiquement en dessous de ce seuil. Il vous manque ${fmt(manquePour10)}\u00a0€ pour atteindre 10\u00a0% du prix total — le minimum pour couvrir les frais de notaire (~7-8\u00a0%) et de garantie (~1-2\u00a0%).`,
      });
    }

    // Importants
    if (taux > 30 && taux <= 35) {
      const mensMax30 = r * 0.30 - c;
      const montantPour30 = mensMax30 > 0 ? Math.round(maxMontantFromMens(mensMax30, t, d)) : 0;
      const reductionPour30 = Math.max(0, Math.round(m - montantPour30));
      acts.push({
        priorite: 'important',
        titre: `Taux d'endettement à ${fmtPct(taux)} — zone orange`,
        detail: `Vous êtes dans la zone 30-35\u00a0%. La banque peut accorder une dérogation HCSF (quota de 20\u00a0% des dossiers), mais ce n'est pas acquis.${montantPour30 > 0 && reductionPour30 > 0 ? ` En réduisant votre emprunt de ${fmt(reductionPour30)}\u00a0€ (→\u00a0${fmt(montantPour30)}\u00a0€), votre taux passerait sous 30\u00a0%.` : ''}`,
      });
    }
    if (apPct >= 5 && apPct < 10) {
      const apportPour10 = m / 9;
      const manquePour10 = Math.max(0, Math.round(apportPour10 - a));
      acts.push({
        priorite: 'important',
        titre: `Apport à ${fmtPct(apPct)} — en dessous du seuil recommandé`,
        detail: `Un apport de 10\u00a0% est le minimum conseillé pour couvrir les frais annexes (notaire, garantie). Il vous manque ${fmt(manquePour10)}\u00a0€ pour atteindre ce seuil, ce qui fragilise le dossier.`,
      });
    }
    if (decouvert === 'oui') acts.push({
      priorite: 'important',
      titre: 'Découvert fréquent — signal négatif fort',
      detail: 'Les banques analysent 3 à 6\u00a0mois de relevés. Un découvert récurrent indique une gestion tendue. Régularisez votre situation au moins 3\u00a0mois avant de déposer votre dossier.',
    });
    if (contrat === 'interim' || (contrat === 'cdd' && anciennete !== 'plus2ans')) acts.push({
      priorite: 'important',
      titre: `Contrat ${contrat === 'interim' ? 'intérim' : 'CDD'} — stabilité insuffisante`,
      detail: 'Les banques exigent généralement un CDI ou une ancienneté significative. En intérim ou CDD court, le dossier est quasi-systématiquement refusé sauf co-emprunteur en CDI ou dossier exceptionnel.',
    });
    if (reste < 400) {
      const mensMaxRAV = r - c - 800;
      const montantPourRAV = mensMaxRAV > 0 ? Math.round(maxMontantFromMens(mensMaxRAV, t, d)) : 0;
      acts.push({
        priorite: 'important',
        titre: `Reste à vivre faible (${fmt(reste)}\u00a0€/mois)`,
        detail: `Un reste à vivre inférieur à 400\u00a0€ est un signal d'alerte fort. Les banques estiment généralement un minimum de 800-1\u202f000\u00a0€ par foyer.${montantPourRAV > 0 ? ` Pour disposer de 800\u00a0€/mois de reste à vivre, votre mensualité ne devrait pas dépasser ${fmt(mensMaxRAV)}\u00a0€ (emprunt max. ${fmt(montantPourRAV)}\u00a0€).` : ''}`,
      });
    }

    // Conseils
    if (apPct >= 10 && apPct < 20) {
      const apportPour20 = m / 4;
      const manquePour20 = Math.max(0, Math.round(apportPour20 - a));
      acts.push({
        priorite: 'conseil',
        titre: `Apport à ${fmtPct(apPct)} — bon, mais 20\u00a0% serait optimal`,
        detail: `Un apport de 20\u00a0% ou plus permet de négocier un meilleur taux d'intérêt (gain de 0,1 à 0,3\u00a0%) et améliore la perception du dossier. Il vous manque ${fmt(manquePour20)}\u00a0€ pour atteindre ce seuil optimal.`,
      });
    }
    if (taux <= 25) {
      const mensMax30 = r * 0.30 - c;
      const montantMax30 = mensMax30 > 0 ? Math.round(maxMontantFromMens(mensMax30, t, d)) : m;
      const margeSupp = Math.max(0, montantMax30 - m);
      acts.push({
        priorite: 'conseil',
        titre: `Excellent taux d'endettement (${fmtPct(taux)}) — marge idéale`,
        detail: `Votre taux est bien en dessous du plafond réglementaire. Votre profil vous permettrait d'emprunter jusqu'à ${fmt(montantMax30)}\u00a0€ en restant sous 30\u00a0%${margeSupp > 0 ? ` (${fmt(margeSupp)}\u00a0€ de marge par rapport à votre projet actuel)` : ''}.`,
      });
    }
    if (contrat === 'cdi' && anciennete === 'plus2ans') acts.push({
      priorite: 'conseil',
      titre: 'CDI titulaire > 2\u00a0ans — profil emploi solide',
      detail: "Valorisez l'ancienneté et les perspectives d'évolution dans votre dossier de présentation.",
    });
    if (contrat === 'fonctionnaire') acts.push({
      priorite: 'conseil',
      titre: 'Fonctionnaire — profil emploi maximal',
      detail: "Les fonctionnaires titulaires bénéficient du profil emploi le plus solide aux yeux des banques. Cet élément compense souvent d'autres fragilités éventuelles.",
    });

    actions = acts;

    // ── Roadmap ────────────────────────────────────────────────────
    const delai = parseInt(delaiMois) || 0;
    if (delai > 0) {
      const apportCible10  = m / 9; // apport needed to hit 10 %
      const manqueApport   = Math.max(0, apportCible10 - a);
      const épargne        = manqueApport > 0 ? Math.ceil(manqueApport / delai) : 0;

      // Score projeté si actions appliquées
      const curApScore  = apPct >= 20 ? 20 : apPct >= 10 ? 12 : apPct >= 5 ? 5 : 0;
      const apFinal     = a + épargne * delai;
      const apPctFinal  = (apFinal / (m + apFinal)) * 100;
      const projApScore = apPctFinal >= 20 ? 20 : apPctFinal >= 10 ? 12 : apPctFinal >= 5 ? 5 : 0;
      const scoreProjete = Math.min(100, score + (projApScore - curApScore) + (decouvert === 'oui' ? 15 : 0));

      const q1 = delai <= 6 ? Math.max(1, Math.round(delai / 3)) : 3;
      const q2 = Math.round(delai / 2);
      const q3 = Math.max(q1 + 1, delai - 3);
      const rm: RoadmapMilestone[] = [];

      // M+0 : Actions immédiates
      const m0: string[] = ["Consultez un courtier pour une première évaluation gratuite de votre dossier"];
      if (decouvert === 'oui') m0.push("Régularisez votre solde bancaire dès maintenant — 3 relevés sains sont requis avant tout dépôt");
      if (contrat === 'interim') m0.push("Ciblez un poste en CDI : votre statut actuel rend l'obtention d'un prêt quasi-impossible");
      else if (contrat === 'cdd' && anciennete !== 'plus2ans') m0.push("Négociez une titularisation en CDI ou patientez jusqu'à 2 ans d'ancienneté");
      if (épargne > 0) m0.push(`Épargnez ${fmt(épargne)} €/mois sur un Livret A ou PEL dédié pour atteindre ${fmt(Math.round(apportCible10))} € d'apport`);
      rm.push({ mois: 0, titre: 'Actions immédiates', items: m0, type: 'now' });

      // Q1 : Préparation administrative
      const mq1: string[] = [];
      if (decouvert === 'oui') mq1.push(`${q1 >= 3 ? '3' : q1} mois de relevés bancaires sains atteints — dossier assaini`);
      mq1.push("Rassemblez les documents socle : 3 bulletins de salaire, dernier avis d'imposition, relevés bancaires");
      if (contrat === 'independant') mq1.push("Préparez vos 2 derniers bilans comptables + déclarations de revenus (exigés par toutes les banques)");
      if (taux > 35) {
        const mensMax33 = r * 0.33 - c;
        if (mensMax33 > 0) mq1.push(`Réduisez votre projet à ${fmt(Math.round(maxMontantFromMens(mensMax33, t, d)))} € max pour passer sous le seuil HCSF de 35 %`);
      }
      rm.push({ mois: q1, titre: 'Préparation administrative', items: mq1, type: 'mid' });

      // Q2 : Mi-parcours (seulement si délai >= 8 et créneau disponible)
      if (delai >= 8 && q2 > q1 && q2 < q3) {
        const mq2: string[] = [];
        if (épargne > 0) {
          const apAuMi = Math.round(a + épargne * q2);
          mq2.push(`Épargne accumulée : ${fmt(apAuMi)} € sur ${fmt(Math.round(apportCible10))} € visés`);
        }
        mq2.push("Affinez votre projet : zone géographique, surface, neuf ou ancien, budget définitif");
        mq2.push("Vérifiez votre éligibilité au PTZ (primo-accédant, plafonds de revenus)");
        rm.push({ mois: q2, titre: 'Point mi-parcours', items: mq2, type: 'mid' });
      }

      // Q3 : Recherche active
      if (q3 > q1 && q3 < delai) {
        const mq3: string[] = [
          "Lancez les visites — réactivité clé sur les biens correspondant à vos critères",
          "Obtenez 2-3 simulations de financement (banques + courtier) pour comparer les offres",
        ];
        if (taux > 30 && taux <= 35) {
          const mensMax30 = r * 0.30 - c;
          if (mensMax30 > 0) mq3.push(`Ciblez des biens jusqu'à ${fmt(Math.round(maxMontantFromMens(mensMax30, t, d)))} € pour passer sous 30 % d'endettement`);
        }
        mq3.push("Renseignez-vous sur les aides locales : Action Logement, subventions régionales");
        rm.push({ mois: q3, titre: 'Recherche active du bien', items: mq3, type: 'mid' });
      }

      // M+(délai-1) : Constitution du dossier
      const mDossier = delai - 1;
      if (mDossier > q3 && mDossier > 0) {
        rm.push({
          mois: mDossier,
          titre: 'Constitution du dossier complet',
          items: [
            "3 derniers bulletins de salaire + contrat de travail",
            "3 derniers relevés bancaires de tous vos comptes",
            "2 derniers avis d'imposition",
            `Justificatif d'apport : ${fmt(Math.round(a + épargne * delai))} € sur Livret A ou compte épargne`,
            "Compromis de vente signé avec le vendeur",
          ],
          type: 'mid',
        });
      }

      // M+délai : Objectif final
      const mFinal: string[] = [];
      if (scoreProjete > score) mFinal.push(`Score projeté : ${scoreProjete}/100 (contre ${score}/100 aujourd'hui)`);
      if (épargne > 0) mFinal.push(`Apport visé : ${fmt(Math.round(a + épargne * delai))} €`);
      mFinal.push("Dépôt du dossier de financement — réponse banque sous 3-4 semaines");
      mFinal.push("Réception de l'offre de prêt → délai légal de réflexion de 10 jours");
      mFinal.push("Signature de l'acte authentique chez le notaire");
      rm.push({ mois: delai, titre: 'Objectif achat', items: mFinal, type: 'final' });

      roadmapMilestones = rm;
    } else {
      roadmapMilestones = [];
    }

    // ── Simulations ───────────────────────────────────────────────
    simulations = [3.5, 4.0, 4.5, 5.0].map((tx) => {
      const ms  = calcMensualite(m, tx, d);
      const ci  = ms * d * 12 - m;
      const te  = r > 0 ? ((c + ms) / r) * 100 : 0;
      return { taux: tx, mensualite: ms, coutTotal: ci, tauxEndettement: te };
    });
  }

  // ─── Handlers ─────────────────────────────────────────────────────
  function handleSubmit() {
    if (!validate()) return;
    compute();
    submitted = true;
    setTimeout(() => {
      document.getElementById('resultats-premium')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
    if (onResult && dossierId) {
      onResult(
        { scoreGlobal, tauxEndettement, mensualite, resteAVivre, apportPct: apportPct, hcsfOk, actions, simulations },
        { revenus: parseFloat(revenus), charges: parseFloat(charges), montant: parseFloat(montant),
          apport: parseFloat(apport), duree: parseInt(duree), tauxInteret: parseFloat(tauxInteret),
          contrat, anciennete, decouvert, nbEnfants: parseInt(nbEnfants) || 0 }
      );
    }
  }

  function reset() {
    submitted = false;
    errors    = {};
    revenus = ''; charges = ''; montant = ''; apport = '';
    duree = '20'; tauxInteret = '4.0';
    contrat = 'cdi'; anciennete = 'plus2ans';
    decouvert = 'non'; nbEnfants = '0';
    delaiMois = ''; roadmapMilestones = [];
  }

  // ─── Derived style helpers ────────────────────────────────────────
  const sc = $derived((() => {
    if (scoreGlobal >= 70) return { bar: 'bg-green-500', text: 'text-green-600 dark:text-green-400', label: 'Excellent dossier' };
    if (scoreGlobal >= 50) return { bar: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400', label: 'Dossier correct' };
    return { bar: 'bg-red-500', text: 'text-red-600 dark:text-red-400', label: 'Dossier à renforcer' };
  })());

  function tauxColor(t: number): string {
    if (t <= 25) return 'text-green-600 dark:text-green-400';
    if (t <= 30) return 'text-amber-600 dark:text-amber-400';
    if (t <= 35) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  }

  function prioriteStyle(p: Priorite) {
    if (p === 'bloquant')  return { border: 'border-red-200 dark:border-red-800/50',    bg: 'bg-red-50 dark:bg-red-900/10',    dot: 'bg-red-500',   tag: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400',     label: 'Bloquant' };
    if (p === 'important') return { border: 'border-amber-200 dark:border-amber-800/50', bg: 'bg-amber-50 dark:bg-amber-900/10', dot: 'bg-amber-500', tag: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400', label: 'Important' };
    return                        { border: 'border-blue-200 dark:border-blue-800/50',   bg: 'bg-blue-50 dark:bg-blue-900/10',   dot: 'bg-blue-400',  tag: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',   label: 'Conseil' };
  }
</script>

<svelte:head>
  <style>
    .print-only { display: none; }
    @media print {
      @page { margin: 18mm 14mm; }
      html { color-scheme: light !important; }
      header, footer, nav, .no-print { display: none !important; }
      body {
        background: white !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .print-only { display: block !important; }
      .print-section {
        break-inside: avoid;
        margin-bottom: 12px;
      }
      .card {
        background: white !important;
        box-shadow: none !important;
        border: 1px solid #e5e7eb !important;
      }
    }
  </style>
</svelte:head>

<div class="w-full">

  <!-- ─── FORM ────────────────────────────────────────────────────── -->
  {#if !submitted}
    <div transition:fade={{ duration: 200 }}>
      <form
        onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}
        novalidate
        class="space-y-6"
      >
        <!-- Section 1: Situation financière -->
        <div class="card">
          <h2 class="text-sm font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
            <span class="w-5 h-5 rounded-full bg-gray-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs flex items-center justify-center font-bold">1</span>
            Votre situation financière
          </h2>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Revenus -->
            <div>
              <label for="dp-revenus" class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                Revenus nets mensuels du foyer
              </label>
              <div class="relative">
                <input id="dp-revenus" type="number" min="0" step="100" placeholder="4 000"
                  bind:value={revenus}
                  class="input-field pr-8 {errors.revenus ? 'border-red-400 focus:ring-red-400' : ''}" />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 text-sm pointer-events-none">€</span>
              </div>
              {#if errors.revenus}<p class="text-xs text-red-500 mt-1" transition:fade={{ duration: 150 }}>{errors.revenus}</p>{/if}
            </div>

            <!-- Charges -->
            <div>
              <label for="dp-charges" class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                Autres charges mensuelles
              </label>
              <div class="relative">
                <input id="dp-charges" type="number" min="0" step="100" placeholder="500"
                  bind:value={charges}
                  class="input-field pr-8 {errors.charges ? 'border-red-400 focus:ring-red-400' : ''}" />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 text-sm pointer-events-none">€</span>
              </div>
              <p class="text-xs text-gray-400 dark:text-slate-500 mt-1.5 leading-relaxed">
                Crédits en cours (voiture, conso…), pensions alimentaires.<br>
                <span class="text-gray-500 dark:text-slate-400">Résidence principale : n'incluez pas le loyer actuel — il disparaît à l'achat.</span>
              </p>
              {#if errors.charges}<p class="text-xs text-red-500 mt-1" transition:fade={{ duration: 150 }}>{errors.charges}</p>{/if}
            </div>

            <!-- Apport -->
            <div>
              <label for="dp-apport" class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                Apport personnel
              </label>
              <div class="relative">
                <input id="dp-apport" type="number" min="0" step="1000" placeholder="40 000"
                  bind:value={apport}
                  class="input-field pr-8 {errors.apport ? 'border-red-400 focus:ring-red-400' : ''}" />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 text-sm pointer-events-none">€</span>
              </div>
              {#if errors.apport}<p class="text-xs text-red-500 mt-1" transition:fade={{ duration: 150 }}>{errors.apport}</p>{/if}
            </div>

            <!-- Nb enfants -->
            <div>
              <label for="dp-enfants" class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                Nombre d'enfants à charge
              </label>
              <select id="dp-enfants" bind:value={nbEnfants} class="input-field">
                {#each ['0','1','2','3','4'] as n}
                  <option value={n}>{n === '4' ? '4 ou plus' : n}</option>
                {/each}
              </select>
            </div>
          </div>
        </div>

        <!-- Section 2: Projet immobilier -->
        <div class="card">
          <h2 class="text-sm font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
            <span class="w-5 h-5 rounded-full bg-gray-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs flex items-center justify-center font-bold">2</span>
            Votre projet immobilier
          </h2>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Montant emprunté -->
            <div>
              <label for="dp-montant" class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                Montant à emprunter
              </label>
              <div class="relative">
                <input id="dp-montant" type="number" min="0" step="5000" placeholder="200 000"
                  bind:value={montant}
                  class="input-field pr-8 {errors.montant ? 'border-red-400 focus:ring-red-400' : ''}" />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 text-sm pointer-events-none">€</span>
              </div>
              {#if errors.montant}<p class="text-xs text-red-500 mt-1" transition:fade={{ duration: 150 }}>{errors.montant}</p>{/if}
            </div>

            <!-- Taux d'intérêt -->
            <div>
              <label for="dp-taux" class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                Taux d'intérêt annuel estimé
              </label>
              <div class="relative">
                <input id="dp-taux" type="number" min="0.1" max="20" step="0.1" placeholder="4,0"
                  bind:value={tauxInteret}
                  class="input-field pr-8 {errors.tauxInteret ? 'border-red-400 focus:ring-red-400' : ''}" />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 text-sm pointer-events-none">%</span>
              </div>
              {#if errors.tauxInteret}<p class="text-xs text-red-500 mt-1" transition:fade={{ duration: 150 }}>{errors.tauxInteret}</p>{/if}
            </div>

            <!-- Durée -->
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                Durée souhaitée
              </label>
              <div class="flex flex-wrap gap-2">
                {#each [15, 20, 25] as d}
                  <button type="button" onclick={() => (duree = String(d))}
                    class="flex-1 min-w-[80px] py-3 px-4 text-sm font-medium rounded-lg border transition-all duration-150
                      {duree === String(d)
                        ? 'bg-gray-900 dark:bg-slate-100 text-white dark:text-slate-900 border-gray-900 dark:border-slate-100'
                        : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'}">
                    {d} ans
                  </button>
                {/each}
                <div class="flex-1 min-w-[120px] relative">
                  <input type="number" min="5" max="30" placeholder="Autre…"
                    value={![15,20,25].includes(parseInt(duree)) ? duree : ''}
                    oninput={(e) => { duree = (e.target as HTMLInputElement).value || '20'; }}
                    class="input-field w-full {errors.duree ? 'border-red-400' : ''}" />
                </div>
              </div>
              {#if errors.duree}<p class="text-xs text-red-500 mt-1" transition:fade={{ duration: 150 }}>{errors.duree}</p>{/if}
            </div>

            <!-- Délai cible -->
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                Dans combien de mois souhaitez-vous acheter ?
                <span class="ml-1 font-normal text-gray-400 dark:text-slate-500">(optionnel — génère une roadmap personnalisée)</span>
              </label>
              <div class="flex flex-wrap gap-2">
                {#each [['', 'Non défini'], ['6', '6 mois'], ['12', '12 mois'], ['18', '18 mois'], ['24', '24 mois']] as [val, label]}
                  <button type="button" onclick={() => (delaiMois = val)}
                    class="flex-1 min-w-[80px] py-3 px-4 text-sm font-medium rounded-lg border transition-all duration-150
                      {delaiMois === val
                        ? 'bg-gray-900 dark:bg-slate-100 text-white dark:text-slate-900 border-gray-900 dark:border-slate-100'
                        : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'}">
                    {label}
                  </button>
                {/each}
              </div>
            </div>
          </div>
        </div>

        <!-- Section 3: Profil emprunteur -->
        <div class="card">
          <h2 class="text-sm font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
            <span class="w-5 h-5 rounded-full bg-gray-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs flex items-center justify-center font-bold">3</span>
            Votre profil emprunteur
          </h2>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Contrat -->
            <div>
              <label for="dp-contrat" class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                Type de contrat
              </label>
              <select id="dp-contrat" bind:value={contrat} class="input-field">
                <option value="cdi">CDI</option>
                <option value="fonctionnaire">Fonctionnaire / titulaire</option>
                <option value="cdd">CDD</option>
                <option value="independant">Indépendant / auto-entrepreneur</option>
                <option value="interim">Intérim</option>
              </select>
            </div>

            <!-- Ancienneté -->
            <div>
              <label for="dp-anciennete" class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                Ancienneté dans le poste actuel
              </label>
              <select id="dp-anciennete" bind:value={anciennete} class="input-field">
                <option value="plus2ans">Plus de 2 ans</option>
                <option value="6a24mois">Entre 6 mois et 2 ans</option>
                <option value="moins6mois">Moins de 6 mois</option>
              </select>
            </div>

            <!-- Découvert -->
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                Découvert bancaire fréquent (3 derniers mois)
              </label>
              <div class="flex gap-2">
                {#each [['non','Non'], ['oui','Oui']] as [val, label]}
                  <button type="button" onclick={() => (decouvert = val)}
                    class="flex-1 py-3 px-4 text-sm font-medium rounded-lg border transition-all duration-150
                      {decouvert === val
                        ? 'bg-gray-900 dark:bg-slate-100 text-white dark:text-slate-900 border-gray-900 dark:border-slate-100'
                        : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'}">
                    {label}
                  </button>
                {/each}
              </div>
            </div>
          </div>
        </div>

        <!-- Submit -->
        <button type="submit"
          class="w-full py-4 bg-gray-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold text-sm rounded-xl hover:bg-gray-800 dark:hover:bg-white active:scale-[0.99] transition-all duration-150 flex items-center justify-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          Lancer le diagnostic complet
        </button>

        <p class="text-xs text-gray-400 dark:text-slate-500 text-center">
          Outil pédagogique · Aucune garantie d'obtention · Ne remplace pas un conseiller financier
        </p>
      </form>
    </div>

  <!-- ─── RESULTS ──────────────────────────────────────────────────── -->
  {:else}
    <div id="resultats-premium" transition:slide={{ duration: 300, axis: 'y' }} class="space-y-5">

      <!-- En-tête impression uniquement -->
      <div class="print-only" style="border-bottom: 2px solid #1f2937; padding-bottom: 12px; margin-bottom: 4px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div style="font-size: 20px; font-weight: 900; color: #111; letter-spacing: -0.5px;">DossierPrêt</div>
            <div style="font-size: 11px; color: #6b7280; margin-top: 2px;">dossierpret.fr — Rapport de diagnostic immobilier</div>
          </div>
          <div style="text-align: right; font-size: 11px; color: #6b7280;">
            Généré le {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </div>
        </div>
        <div style="margin-top: 10px; display: flex; gap: 20px; align-items: center; font-size: 12px;">
          <span style="font-weight: 700; color: #111;">Score : {scoreGlobal}/100 — {sc.label}</span>
          <span style="font-weight: 600; color: {hcsfOk ? '#059669' : '#dc2626'};">{hcsfOk ? '✓ Conforme HCSF' : '✗ Non conforme HCSF'}</span>
        </div>
      </div>

      <!-- Score global -->
      <div class="card print-section">
        <div class="flex items-center justify-between mb-1">
          <p class="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">Score global du dossier</p>
          <span class="text-xs font-bold {sc.text}">{sc.label}</span>
        </div>
        <div class="flex items-end gap-3 mb-3">
          <span class="text-4xl font-black text-gray-900 dark:text-white">{scoreGlobal}</span>
          <span class="text-lg text-gray-400 dark:text-slate-500 mb-1">/ 100</span>
        </div>
        <div class="w-full h-2.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div class="h-full {sc.bar} rounded-full transition-all duration-700"
            style="width: {scoreGlobal}%"></div>
        </div>
        <div class="flex justify-between text-xs text-gray-300 dark:text-slate-600 mt-1">
          <span>Fragile</span><span>Correct</span><span>Excellent</span>
        </div>
      </div>

      <!-- HCSF compliance -->
      <div class="rounded-xl border p-5 print-section transition-colors duration-200
        {hcsfOk
          ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800/50'
          : 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800/50'}">
        <div class="flex items-start gap-3">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
            {hcsfOk ? 'bg-green-100 dark:bg-green-900/40' : 'bg-red-100 dark:bg-red-900/40'}">
            {#if hcsfOk}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            {:else}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            {/if}
          </div>
          <div>
            <p class="text-sm font-semibold {hcsfOk ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}">
              {hcsfOk ? 'Conforme aux règles HCSF' : 'Non conforme aux règles HCSF'}
            </p>
            <p class="text-sm mt-0.5 {hcsfOk ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}">
              {hcsfOk
                ? `Taux d'endettement : ${fmtPct(tauxEndettement)} (≤ 35 %) · Durée : ${duree} ans (≤ 25 ans)`
                : `${tauxEndettement > 35 ? `Taux à ${fmtPct(tauxEndettement)} — dépasse 35 %` : ''}${tauxEndettement > 35 && parseInt(duree) > 25 ? ' · ' : ''}${parseInt(duree) > 25 ? `Durée de ${duree} ans — dépasse 25 ans` : ''}`}
            </p>
          </div>
        </div>
      </div>

      <!-- Métriques clés -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 print-section">
        {#each [
          { label: 'Mensualité estimée', value: `${fmt(mensualite)} €`, sub: `sur ${duree} ans` },
          { label: "Taux d'endettement", value: fmtPct(tauxEndettement), sub: 'max HCSF : 35 %', color: tauxColor(tauxEndettement) },
          { label: 'Reste à vivre', value: `${fmt(resteAVivre)} €`, sub: 'après mensualité + charges' },
          { label: 'Apport / prix total', value: fmtPct(apportPct), sub: 'recommandé : ≥ 10 %' },
        ] as m}
          <div class="card">
            <p class="text-xs text-gray-400 dark:text-slate-500 mb-1">{m.label}</p>
            <p class="text-xl font-black {m.color ?? 'text-gray-900 dark:text-white'}">{m.value}</p>
            <p class="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{m.sub}</p>
          </div>
        {/each}
      </div>

      <!-- Plan d'action -->
      {#if actions.length > 0}
        <div class="card print-section">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-4">Plan d'action personnalisé</h3>
          <div class="space-y-3">
            {#each actions as action, i}
              {@const style = prioriteStyle(action.priorite)}
              <div class="rounded-xl border p-4 {style.border} {style.bg} transition-colors duration-200">
                <div class="flex items-start gap-3">
                  <div class="w-5 h-5 rounded-full {style.dot} flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span class="text-white text-xs font-bold">{i + 1}</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex flex-wrap items-center gap-2 mb-1">
                      <span class="text-xs font-semibold px-2 py-0.5 rounded-full {style.tag}">{style.label}</span>
                      <p class="text-sm font-semibold text-gray-900 dark:text-white">{action.titre}</p>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">{action.detail}</p>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Roadmap vers l'achat -->
      {#if roadmapMilestones.length > 0}
        <div class="card print-section">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">Roadmap vers l'achat</h3>
          <p class="text-xs text-gray-400 dark:text-slate-500 mb-6">Objectif dans {delaiMois} mois · jalons personnalisés selon votre situation</p>

          <div class="relative">
            <!-- Ligne verticale -->
            <div class="absolute left-[15px] top-4 bottom-4 w-px bg-gray-100 dark:bg-slate-700/60"></div>

            <div class="space-y-7">
              {#each roadmapMilestones as step}
                <div class="relative flex gap-4">
                  <!-- Badge mois -->
                  <div class="flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center z-10
                    {step.type === 'now'   ? 'bg-gray-900 dark:bg-slate-100 border-gray-900 dark:border-slate-100' :
                     step.type === 'final' ? 'bg-green-500 dark:bg-green-500 border-green-500' :
                                             'bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600'}">
                    <span class="text-xs font-bold leading-none
                      {step.type === 'now'   ? 'text-white dark:text-slate-900' :
                       step.type === 'final' ? 'text-white' :
                                               'text-gray-500 dark:text-slate-400'}">
                      {step.mois === 0 ? 'J0' : `+${step.mois}`}
                    </span>
                  </div>

                  <!-- Contenu -->
                  <div class="flex-1 min-w-0 pb-1">
                    <p class="text-sm font-semibold text-gray-900 dark:text-white mb-2">{step.titre}</p>
                    <ul class="space-y-1.5">
                      {#each step.items as item}
                        <li class="flex items-start gap-2 text-sm text-gray-600 dark:text-slate-300 leading-snug">
                          <span class="text-gray-300 dark:text-slate-600 mt-0.5 flex-shrink-0 select-none">›</span>
                          {item}
                        </li>
                      {/each}
                    </ul>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>
      {/if}

      <!-- Simulations d'amortissement -->
      <div class="card print-section">
        <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-1">Simulations d'amortissement</h3>
        <p class="text-xs text-gray-400 dark:text-slate-500 mb-4">
          Montant : {fmt(parseFloat(montant) || 0)}&nbsp;€ · Durée : {duree}&nbsp;ans · 4 scénarios de taux
        </p>
        <div class="overflow-x-auto -mx-1">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-100 dark:border-slate-700">
                <th class="text-left py-2 px-3 text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide">Taux</th>
                <th class="text-right py-2 px-3 text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide">Mensualité</th>
                <th class="text-right py-2 px-3 text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide">Coût intérêts</th>
                <th class="text-right py-2 px-3 text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide">Taux d'endettement</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50 dark:divide-slate-800">
              {#each simulations as sim}
                <tr class="{sim.taux === parseFloat(tauxInteret) ? 'bg-gray-50 dark:bg-slate-700/30' : ''} transition-colors">
                  <td class="py-3 px-3 font-semibold text-gray-900 dark:text-white">
                    {sim.taux.toFixed(1).replace('.', ',')} %
                    {#if sim.taux === parseFloat(tauxInteret)}
                      <span class="ml-1 text-xs text-gray-400 dark:text-slate-500">(votre taux)</span>
                    {/if}
                  </td>
                  <td class="py-3 px-3 text-right font-medium text-gray-900 dark:text-white">{fmt(sim.mensualite)}&nbsp;€</td>
                  <td class="py-3 px-3 text-right text-gray-500 dark:text-slate-400">{fmt(sim.coutTotal)}&nbsp;€</td>
                  <td class="py-3 px-3 text-right font-medium {tauxColor(sim.tauxEndettement)}">{fmtPct(sim.tauxEndettement)}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Actions footer -->
      <div class="flex flex-col sm:flex-row gap-3 no-print">
        <button
          onclick={() => window.print()}
          class="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
          Imprimer / Sauvegarder PDF
        </button>
        <button
          onclick={reset}
          class="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-sm font-semibold hover:bg-gray-800 dark:hover:bg-white transition-colors">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          Nouvelle analyse
        </button>
      </div>

      <!-- Disclaimer -->
      <p class="text-xs text-gray-400 dark:text-slate-500 text-center leading-relaxed">
        Outil d'information pédagogique basé sur les règles HCSF en vigueur. Aucune garantie d'obtention de financement. Ne remplace pas l'avis d'un courtier ou d'un conseiller bancaire.
      </p>

    </div>
  {/if}

</div>
