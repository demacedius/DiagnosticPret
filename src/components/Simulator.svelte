<script lang="ts">
  import { slide, fade } from 'svelte/transition';

  // ─── Types ────────────────────────────────────────────────────────
  type Priorite = 'bloquant' | 'important' | 'conseil';
  interface Action { titre: string; priorite: Priorite; }
  interface Criteria { label: string; pts: number; max: number; }
  interface Scenario { label: string; scoreAfter: number; delta: number; }

  // ─── Props ────────────────────────────────────────────────────────
  let { hasPremium = false }: { hasPremium?: boolean } = $props();

  // ─── Form state ───────────────────────────────────────────────────
  let revenus   = $state('');
  let charges   = $state('');
  let montant   = $state('');
  let apport    = $state('');
  let decouvert = $state('non');

  // ─── UI state ─────────────────────────────────────────────────────
  let submitted       = $state(false);
  let errors          = $state<Record<string, string>>({});
  let bannerDismissed = $state(false);

  // ─── Results: free ────────────────────────────────────────────────
  let score           = $state(0);
  let riskLevel       = $state<'faible' | 'moyen' | 'élevé'>('élevé');
  let tauxEndettement = $state(0);
  let mensualite      = $state(0);
  let hcsfOk          = $state(false);
  let actions         = $state<Action[]>([]);

  // ─── Results: premium preview (blurred) ───────────────────────────
  let criteriaBreakdown = $state<Criteria[]>([]);
  let projectionMois    = $state(0);
  let scenarios         = $state<Scenario[]>([]);

  // ─── Helpers ──────────────────────────────────────────────────────
  /** Mensualité estimée — taux 4,5 %, 20 ans */
  function mensualiteEst(m: number): number {
    if (m <= 0) return 0;
    const r = 0.045 / 12, n = 240;
    return (m * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }

  function fmt(n: number): string { return Math.round(n).toLocaleString('fr-FR'); }
  function fmtPct(n: number): string { return n.toFixed(1).replace('.', ',') + '\u00a0%'; }

  function tauxPtsFor(taux: number): number {
    if (taux <= 25) return 30;
    if (taux <= 30) return 22;
    if (taux <= 35) return 12;
    return 0;
  }
  function apPtsFor(pct: number): number {
    if (pct >= 20) return 20;
    if (pct >= 10) return 12;
    if (pct >= 5)  return 5;
    return 0;
  }

  // ─── Validation ───────────────────────────────────────────────────
  function validate(): boolean {
    const errs: Record<string, string> = {};
    const r = parseFloat(revenus), c = parseFloat(charges);
    const m = parseFloat(montant),  a = parseFloat(apport);

    if (!revenus || isNaN(r) || r <= 0) errs.revenus = 'Requis (> 0 €)';
    if (!charges || isNaN(c) || c < 0)  errs.charges = 'Requis (≥ 0 €)';
    if (!montant || isNaN(m) || m <= 0) errs.montant = 'Requis (> 0 €)';
    if (!apport  || isNaN(a) || a < 0)  errs.apport  = 'Requis (≥ 0 €)';

    errors = errs;
    return Object.keys(errs).length === 0;
  }

  // ─── Compute ──────────────────────────────────────────────────────
  function compute() {
    const r = parseFloat(revenus) || 0;
    const c = parseFloat(charges) || 0;
    const m = parseFloat(montant) || 0;
    const a = parseFloat(apport)  || 0;

    const mens  = mensualiteEst(m);
    const taux  = r > 0 ? (c + mens) / r * 100 : 0;
    const apPct = m > 0 ? a / (m + a) * 100 : 0;
    const rav   = r - c - mens;

    mensualite      = mens;
    tauxEndettement = taux;
    hcsfOk          = taux <= 35;

    // ── Score : 4 critères sur 75, mis à l'échelle /100 ──────────
    const tauxPts = tauxPtsFor(taux);
    const apPts   = apPtsFor(apPct);
    const decPts  = decouvert === 'non' ? 15 : 0;
    let   ravPts  = 0;
    if      (rav >= 1200) ravPts = 10;
    else if (rav >= 800)  ravPts = 6;
    else if (rav >= 400)  ravPts = 2;

    const raw = tauxPts + apPts + decPts + ravPts;
    const sc  = Math.round(raw / 75 * 100);

    score     = sc;
    riskLevel = sc <= 40 ? 'élevé' : sc <= 65 ? 'moyen' : 'faible';

    // ── Plan d'action ─────────────────────────────────────────────
    const acts: Action[] = [];
    if (taux > 35)
      acts.push({ priorite: 'bloquant',  titre: `Taux d'endettement à ${fmtPct(taux)} — refus HCSF probable` });
    if (apPct < 5)
      acts.push({ priorite: 'bloquant',  titre: `Apport insuffisant (${fmtPct(apPct)} du prix total)` });
    if (decouvert === 'oui')
      acts.push({ priorite: 'important', titre: 'Découvert bancaire fréquent — signal négatif fort' });
    if (taux > 30 && taux <= 35)
      acts.push({ priorite: 'important', titre: `Taux d'endettement à ${fmtPct(taux)} — zone orange` });
    if (apPct >= 5 && apPct < 10)
      acts.push({ priorite: 'important', titre: `Apport à ${fmtPct(apPct)} — en dessous du seuil recommandé` });
    if (rav < 400 && r > 0)
      acts.push({ priorite: 'important', titre: `Reste à vivre faible (${fmt(rav)}\u00a0€/mois)` });
    if (taux <= 25)
      acts.push({ priorite: 'conseil',   titre: `Excellent taux d'endettement (${fmtPct(taux)}) — point fort` });
    if (apPct >= 10 && apPct < 20) {
      const manque = Math.round(m / 4 - a);
      if (manque > 0) acts.push({ priorite: 'conseil', titre: `${fmt(manque)}\u00a0€ supplémentaires pour atteindre 20\u00a0% d'apport` });
    }
    actions = acts;

    // ── Criteria breakdown (blurred) ──────────────────────────────
    criteriaBreakdown = [
      { label: "Taux d'endettement",       pts: tauxPts, max: 30 },
      { label: 'Apport personnel',         pts: apPts,   max: 20 },
      { label: 'Stabilité professionnelle',pts: 0,        max: 25 },
      { label: 'Gestion bancaire',         pts: decPts,  max: 15 },
      { label: 'Reste à vivre',            pts: ravPts,  max: 10 },
    ];

    // ── Projection (blurred) ──────────────────────────────────────
    if (sc < 70) {
      if (apPts < 12) {
        const missing = Math.max(0, m / 9 - a);
        projectionMois = missing > 0 ? Math.ceil(missing / 400) : 6;
      } else if (decouvert === 'oui') {
        projectionMois = 3;
      } else {
        projectionMois = 6;
      }
    } else {
      projectionMois = 0;
    }

    // ── Scenarios (blurred) ───────────────────────────────────────
    const scens: Scenario[] = [];

    // Scenario 1: apport +50 %
    const a1      = a * 1.5;
    const apPct1  = m > 0 ? a1 / (m + a1) * 100 : 0;
    const sc1     = Math.min(100, Math.round((tauxPts + apPtsFor(apPct1) + decPts + ravPts) / 75 * 100));
    if (sc1 > sc)
      scens.push({ label: `Apport +50\u00a0% → ${fmt(Math.round(a1))}\u00a0€`, scoreAfter: sc1, delta: sc1 - sc });

    // Scenario 2: montant −15 %
    const m2      = m * 0.85;
    const taux2   = r > 0 ? (c + mensualiteEst(m2)) / r * 100 : 0;
    const sc2     = Math.min(100, Math.round((tauxPtsFor(taux2) + apPts + decPts + ravPts) / 75 * 100));
    if (sc2 > sc)
      scens.push({ label: `Montant −15\u00a0% → ${fmt(Math.round(m2))}\u00a0€`, scoreAfter: sc2, delta: sc2 - sc });

    // Scenario 3: fix overdraft
    if (decouvert === 'oui') {
      const sc3 = Math.min(100, Math.round((tauxPts + apPts + 15 + ravPts) / 75 * 100));
      scens.push({ label: '3\u00a0mois de relevés sans découvert', scoreAfter: sc3, delta: sc3 - sc });
    }

    scenarios = scens;
  }

  // ─── Handlers ─────────────────────────────────────────────────────
  function handleSubmit() {
    if (!validate()) return;
    compute();
    submitted = true;
    bannerDismissed = false;
    setTimeout(() => {
      document.getElementById('sim-resultats')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  function reset() {
    submitted = false;
    revenus = ''; charges = ''; montant = ''; apport = '';
    decouvert = 'non';
    errors = {}; actions = [];
    bannerDismissed = false;
  }

  function loadDemo() {
    revenus = '3500'; charges = '500'; montant = '200000';
    apport = '8000'; decouvert = 'oui';
    handleSubmit();
  }

  // ─── Derived style helpers ────────────────────────────────────────
  const riskStyle = $derived((() => {
    if (riskLevel === 'élevé') return { bg: 'bg-red-50 dark:bg-red-900/20',   text: 'text-red-700 dark:text-red-400',   bar: 'bg-red-500'   };
    if (riskLevel === 'moyen') return { bg: 'bg-amber-50 dark:bg-amber-900/20',text: 'text-amber-700 dark:text-amber-400',bar: 'bg-amber-500' };
    return                            { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-400', bar: 'bg-green-500' };
  })());

  const scoreTextColor = $derived(
    score >= 70 ? 'text-green-600 dark:text-green-400' :
    score >= 45 ? 'text-amber-600 dark:text-amber-400' :
                  'text-red-600 dark:text-red-400'
  );

  function prioriteDot(p: Priorite): string {
    if (p === 'bloquant')  return 'bg-red-500';
    if (p === 'important') return 'bg-amber-500';
    return 'bg-blue-400';
  }
</script>

<!-- ─── FORM CARD ──────────────────────────────────────────────────── -->
<div class="w-full">
  <div class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-card-lg p-6 sm:p-8 transition-colors duration-200">
    <div class="mb-6">
      <div class="flex items-center gap-2 mb-1">
        <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span class="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Diagnostic express</span>
      </div>
      <p class="text-sm text-gray-500 dark:text-slate-400">Votre profil · Sans engagement</p>
    </div>

    <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} novalidate>
      <!-- Montant du prêt -->
      <div class="mb-4">
        <label for="sim-montant" class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
          Montant du prêt recherché
        </label>
        <div class="relative">
          <input id="sim-montant" type="number" min="0" step="5000" placeholder="200 000"
            bind:value={montant}
            class="input-field pr-8 {errors.montant ? 'border-red-400 focus:ring-red-400' : ''}" />
          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 text-sm font-medium pointer-events-none">€</span>
        </div>
        {#if errors.montant}<p class="text-xs text-red-500 mt-1" transition:fade={{ duration: 150 }}>{errors.montant}</p>{/if}
      </div>

      <!-- Revenus + Charges -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label for="sim-revenus" class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Revenus nets mensuels</label>
          <div class="relative">
            <input id="sim-revenus" type="number" min="0" step="100" placeholder="3 500"
              bind:value={revenus}
              class="input-field pr-8 {errors.revenus ? 'border-red-400 focus:ring-red-400' : ''}" />
            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 text-sm font-medium pointer-events-none">€</span>
          </div>
          {#if errors.revenus}<p class="text-xs text-red-500 mt-1" transition:fade={{ duration: 150 }}>{errors.revenus}</p>{/if}
        </div>

        <div>
          <label for="sim-charges" class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Autres charges mensuelles</label>
          <div class="relative">
            <input id="sim-charges" type="number" min="0" step="100" placeholder="500"
              bind:value={charges}
              class="input-field pr-8 {errors.charges ? 'border-red-400 focus:ring-red-400' : ''}" />
            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 text-sm font-medium pointer-events-none">€</span>
          </div>
          {#if errors.charges}<p class="text-xs text-red-500 mt-1" transition:fade={{ duration: 150 }}>{errors.charges}</p>{/if}
        </div>
      </div>

      <!-- Apport + Découvert -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label for="sim-apport" class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Apport personnel</label>
          <div class="relative">
            <input id="sim-apport" type="number" min="0" step="1000" placeholder="20 000"
              bind:value={apport}
              class="input-field pr-8 {errors.apport ? 'border-red-400 focus:ring-red-400' : ''}" />
            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 text-sm font-medium pointer-events-none">€</span>
          </div>
          {#if errors.apport}<p class="text-xs text-red-500 mt-1" transition:fade={{ duration: 150 }}>{errors.apport}</p>{/if}
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Découvert fréquent</label>
          <div class="flex gap-2">
            <button type="button" onclick={() => (decouvert = 'non')}
              class="flex-1 py-3 px-4 text-sm font-medium rounded-lg border transition-all duration-150
                {decouvert === 'non'
                  ? 'bg-gray-900 dark:bg-slate-100 text-white dark:text-slate-900 border-gray-900 dark:border-slate-100'
                  : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'}">
              Non
            </button>
            <button type="button" onclick={() => (decouvert = 'oui')}
              class="flex-1 py-3 px-4 text-sm font-medium rounded-lg border transition-all duration-150
                {decouvert === 'oui'
                  ? 'bg-gray-900 dark:bg-slate-100 text-white dark:text-slate-900 border-gray-900 dark:border-slate-100'
                  : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'}">
              Oui
            </button>
          </div>
        </div>
      </div>

      <!-- Submit -->
      <button type="submit"
        class="w-full py-3.5 bg-gray-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold text-sm rounded-xl hover:bg-gray-800 dark:hover:bg-white active:scale-[0.99] transition-all duration-150 flex items-center justify-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        Lancer l'analyse
      </button>
    </form>

    <!-- Trust badges -->
    <div class="flex flex-wrap items-center justify-center gap-4 mt-5">
      {#each ['Gratuit', 'Instantané', 'Sans engagement'] as label}
        <span class="flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-500">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          {label}
        </span>
      {/each}
    </div>
  </div>

  <!-- Demo link -->
  <div class="text-center mt-4">
    <button type="button" onclick={loadDemo}
      class="text-sm text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white underline underline-offset-2 transition-colors">
      Voir une démo
    </button>
  </div>
</div>

<!-- ─── RESULTS ────────────────────────────────────────────────────── -->
{#if submitted}
  <div id="sim-resultats" transition:slide={{ duration: 300, axis: 'y' }} class="mt-6 space-y-4">

    <!-- A: Résultats gratuits ──────────────────────────────────────── -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-card p-6 transition-colors duration-200">

      <!-- Score + Niveau de risque -->
      <div class="flex items-start justify-between mb-3">
        <div>
          <p class="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-1">Score indicatif</p>
          <div class="flex items-end gap-1.5">
            <span class="text-4xl font-black {scoreTextColor}">{score}</span>
            <span class="text-lg text-gray-400 dark:text-slate-500 mb-0.5">/100</span>
          </div>
          <p class="text-xs text-gray-400 dark:text-slate-500 mt-0.5">4 critères · profil emploi non inclus</p>
        </div>
        <span class="px-3 py-1.5 rounded-full text-sm font-semibold {riskStyle.bg} {riskStyle.text}">
          Risque {riskLevel}
        </span>
      </div>

      <!-- Barre de score -->
      <div class="w-full h-2 bg-gray-100 dark:bg-slate-700 rounded-full mb-4 overflow-hidden">
        <div class="h-full {riskStyle.bar} rounded-full transition-all duration-700" style="width: {score}%"></div>
      </div>

      <!-- Indicateur HCSF -->
      <div class="flex items-center gap-2 mb-5 px-3 py-2.5 rounded-lg {hcsfOk ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}">
        {#if hcsfOk}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          <span class="text-xs font-medium text-green-700 dark:text-green-400">
            Mensualité estimée&nbsp;: {fmt(mensualite)}&nbsp;€ · Taux d'endettement {fmtPct(tauxEndettement)} — conforme HCSF
          </span>
        {:else}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          <span class="text-xs font-medium text-red-700 dark:text-red-400">
            Mensualité estimée&nbsp;: {fmt(mensualite)}&nbsp;€ · Taux d'endettement {fmtPct(tauxEndettement)} — dépasse 35&nbsp;%
          </span>
        {/if}
      </div>

      <!-- Aperçu plan d'action (max 3) -->
      <div>
        <p class="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-3">
          Aperçu du plan d'action
        </p>
        {#if actions.length === 0}
          <p class="text-sm text-green-700 dark:text-green-400">Aucun point bloquant détecté sur les critères vérifiés.</p>
        {:else}
          <ul class="space-y-2.5">
            {#each actions.slice(0, 3) as action}
              <li class="flex items-start gap-2.5">
                <span class="w-2 h-2 rounded-full {prioriteDot(action.priorite)} flex-shrink-0 mt-1.5"></span>
                <span class="text-sm text-gray-700 dark:text-slate-300 leading-snug">{action.titre}</span>
              </li>
            {/each}
          </ul>
          {#if actions.length > 3}
            <p class="text-xs text-gray-400 dark:text-slate-500 mt-3 pl-4">
              + {actions.length - 3} recommandation{actions.length - 3 > 1 ? 's' : ''} dans l'analyse complète
            </p>
          {/if}
        {/if}
      </div>
    </div>

    <!-- D: Bandeau dismissible ────────────────────────────────────── -->
    {#if !hasPremium && !bannerDismissed && score < 70}
      <div transition:fade={{ duration: 200 }}
        class="flex items-center justify-between gap-3 px-4 py-3 bg-gray-900 dark:bg-slate-100 rounded-xl">
        <p class="text-xs font-medium text-white dark:text-slate-900 leading-snug">
          Vous êtes à <span class="font-black">{70 - score}&nbsp;points</span> d'un profil plus solide.
          Débloquez le plan complet.
        </p>
        <div class="flex items-center gap-2 flex-shrink-0">
          <a href="/premium?upgrade=1"
            class="text-xs font-semibold bg-white dark:bg-slate-900 text-gray-900 dark:text-white px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap">
            Voir le plan
          </a>
          <button onclick={() => (bannerDismissed = true)} aria-label="Fermer ce message"
            class="text-white/50 dark:text-slate-500 hover:text-white dark:hover:text-slate-900 transition-colors p-0.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>
    {/if}

    <!-- B+C: Analyse complète ──────────────────────────────────── -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-card overflow-hidden transition-colors duration-200">

      <!-- En-tête -->
      <div class="px-6 pt-5 pb-4 border-b border-gray-100 dark:border-slate-700">
        <div class="flex items-center gap-2 mb-0.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="text-gray-900 dark:text-slate-100">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <span class="text-xs font-semibold text-gray-900 dark:text-slate-100 uppercase tracking-wider">Analyse {hasPremium ? 'complète' : 'complète Premium'}</span>
        </div>
        <p class="text-xs text-gray-400 dark:text-slate-500">{hasPremium ? 'Votre analyse détaillée et le plan d\'action chiffré' : 'Débloquez l\'analyse détaillée et le plan d\'action chiffré'}</p>
      </div>

      <!-- 4 blocs verrouillés -->
      <div class="p-4 space-y-3">

        <!-- Bloc 1 : Décomposition du score -->
        <div class="relative rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden"
          aria-label="{hasPremium ? 'Décomposition du score par critère' : 'Contenu Premium — Décomposition du score par critère'}">
          <div class="p-4 {!hasPremium ? 'select-none pointer-events-none' : ''}"
            style="{!hasPremium ? 'filter: blur(3px)' : ''}"
            aria-hidden="{!hasPremium}">
            <p class="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-3">Décomposition du score par critère</p>
            <div class="space-y-2.5">
              {#each criteriaBreakdown as crit}
                <div class="flex items-center gap-2">
                  <span class="text-xs text-gray-600 dark:text-slate-300 w-36 flex-shrink-0 truncate">{crit.label}</span>
                  <div class="flex-1 h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div class="h-full bg-gray-400 dark:bg-slate-500 rounded-full"
                      style="width: {crit.max > 0 ? Math.round(crit.pts / crit.max * 100) : 0}%"></div>
                  </div>
                  <span class="text-xs font-medium text-gray-500 dark:text-slate-400 w-10 text-right flex-shrink-0">{crit.pts}/{crit.max}</span>
                </div>
              {/each}
            </div>
          </div>
          {#if !hasPremium}
          <div class="absolute inset-0 flex items-center justify-center
            bg-gradient-to-b from-white/10 via-white/65 to-white/95 dark:from-slate-800/10 dark:via-slate-800/65 dark:to-slate-800/95">
            <div class="text-center">
              <div class="w-7 h-7 bg-gray-900 dark:bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" class="text-white dark:text-slate-900">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <p class="text-xs font-semibold text-gray-700 dark:text-slate-300">Score par critère</p>
            </div>
          </div>
          {/if}
        </div>

        <!-- Bloc 2 : Plan d'action complet -->
        <div class="relative rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden"
          aria-label="{hasPremium ? 'Plan d\'action personnalisé complet' : 'Contenu Premium — Plan d\'action personnalisé complet'}">
          <div class="p-4 {!hasPremium ? 'select-none pointer-events-none' : ''}"
            style="{!hasPremium ? 'filter: blur(3px)' : ''}"
            aria-hidden="{!hasPremium}">
            <p class="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-3">Plan d'action personnalisé — {actions.length} points</p>
            <div class="space-y-2">
              {#each actions as action}
                <div class="rounded-lg p-2.5 bg-gray-50 dark:bg-slate-700/50">
                  <p class="text-xs font-medium text-gray-700 dark:text-slate-300">{action.titre}</p>
                  <p class="text-xs text-gray-400 dark:text-slate-500 mt-0.5 leading-relaxed">Explication détaillée et chiffres précis pour corriger ce point</p>
                </div>
              {/each}
            </div>
          </div>
          {#if !hasPremium}
          <div class="absolute inset-0 flex items-center justify-center
            bg-gradient-to-b from-white/10 via-white/65 to-white/95 dark:from-slate-800/10 dark:via-slate-800/65 dark:to-slate-800/95">
            <div class="text-center">
              <div class="w-7 h-7 bg-gray-900 dark:bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" class="text-white dark:text-slate-900">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <p class="text-xs font-semibold text-gray-700 dark:text-slate-300">Plan d'action · {actions.length} recommandations</p>
            </div>
          </div>
          {/if}
        </div>

        <!-- Bloc 3 : Projection temporelle -->
        <div class="relative rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden"
          aria-label="{hasPremium ? 'Projection temporelle' : 'Contenu Premium — Projection temporelle'}">
          <div class="p-4 {!hasPremium ? 'select-none pointer-events-none' : ''}"
            style="{!hasPremium ? 'filter: blur(3px)' : ''}"
            aria-hidden="{!hasPremium}">
            <p class="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-3">Projection temporelle</p>
            <div class="flex items-center gap-4">
              <div class="text-center flex-shrink-0">
                <p class="text-3xl font-black text-gray-900 dark:text-white">{projectionMois > 0 ? projectionMois : '—'}</p>
                <p class="text-xs text-gray-400 dark:text-slate-500">mois</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-700 dark:text-slate-300">Pour atteindre un score de 70/100</p>
                <p class="text-xs text-gray-400 dark:text-slate-500 mt-0.5">En appliquant les actions prioritaires identifiées</p>
              </div>
            </div>
          </div>
          {#if !hasPremium}
          <div class="absolute inset-0 flex items-center justify-center
            bg-gradient-to-b from-white/10 via-white/65 to-white/95 dark:from-slate-800/10 dark:via-slate-800/65 dark:to-slate-800/95">
            <div class="text-center">
              <div class="w-7 h-7 bg-gray-900 dark:bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" class="text-white dark:text-slate-900">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <p class="text-xs font-semibold text-gray-700 dark:text-slate-300">Projection temporelle</p>
            </div>
          </div>
          {/if}
        </div>

        <!-- Bloc 4 : Scénarios "Et si…" -->
        <div class="relative rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden"
          aria-label="{hasPremium ? 'Scénarios d\'optimisation' : 'Contenu Premium — Scénarios d\'optimisation'}">
          <div class="p-4 {!hasPremium ? 'select-none pointer-events-none' : ''}"
            style="{!hasPremium ? 'filter: blur(3px)' : ''}"
            aria-hidden="{!hasPremium}">
            <p class="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-3">Scénarios «&nbsp;Et si…&nbsp;»</p>
            {#if scenarios.length > 0}
              <div class="space-y-2">
                {#each scenarios as scen}
                  <div class="flex items-center justify-between rounded-lg p-2.5 bg-gray-50 dark:bg-slate-700/50 gap-2">
                    <span class="text-xs text-gray-700 dark:text-slate-300 flex-1">{scen.label}</span>
                    <div class="flex items-center gap-1.5 flex-shrink-0">
                      <span class="text-xs font-bold text-green-600 dark:text-green-400">+{scen.delta}&nbsp;pts</span>
                      <span class="text-xs text-gray-400 dark:text-slate-500">→ {scen.scoreAfter}/100</span>
                    </div>
                  </div>
                {/each}
              </div>
            {:else}
              <p class="text-xs text-gray-400 dark:text-slate-500">3 scénarios d'optimisation de votre dossier simulés</p>
            {/if}
          </div>
          {#if !hasPremium}
          <div class="absolute inset-0 flex items-center justify-center
            bg-gradient-to-b from-white/10 via-white/65 to-white/95 dark:from-slate-800/10 dark:via-slate-800/65 dark:to-slate-800/95">
            <div class="text-center">
              <div class="w-7 h-7 bg-gray-900 dark:bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" class="text-white dark:text-slate-900">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <p class="text-xs font-semibold text-gray-700 dark:text-slate-300">Scénarios d'optimisation</p>
            </div>
          </div>
          {/if}
        </div>
      </div>

      <!-- C: CTA ──────────────────────────────────────────────────── -->
      {#if !hasPremium}
      <div class="px-6 pb-6">
        <a href="/premium?upgrade=1"
          class="w-full flex items-center justify-center gap-2 py-3.5 bg-gray-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold text-sm rounded-xl hover:bg-gray-800 dark:hover:bg-white active:scale-[0.99] transition-all duration-150 mb-3">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          Débloquer l'analyse complète
        </a>
        <div class="text-center mb-3">
          <a href="/premium" class="text-xs text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white underline underline-offset-2 transition-colors">
            Voir les tarifs
          </a>
        </div>
        <p class="text-xs text-gray-400 dark:text-slate-500 text-center">
          Aucune donnée bancaire n'est stockée — outil pédagogique
        </p>
      </div>
      {/if}
    </div>

    <!-- Disclaimer + Reset ─────────────────────────────────────── -->
    <p class="text-xs text-gray-400 dark:text-slate-500 text-center leading-relaxed">
      Simulation indicative basée sur 4 critères. Aucune garantie d'obtention de financement.
    </p>
    <div class="text-center">
      <button type="button" onclick={reset}
        class="text-xs text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 underline underline-offset-2 transition-colors">
        Recommencer une nouvelle analyse
      </button>
    </div>
  </div>
{/if}
