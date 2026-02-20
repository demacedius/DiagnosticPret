<script lang="ts">
  // ─── Props ────────────────────────────────────────────────────────
  let {
    baseScore,
    baseRevenus,
    baseCharges,
    baseMontant,
    baseApport,
    baseDecouvert,
  }: {
    baseScore: number;
    baseRevenus: number;
    baseCharges: number;
    baseMontant: number;
    baseApport: number;
    baseDecouvert: string;
  } = $props();

  // ─── State ────────────────────────────────────────────────────────
  let apportDelta    = $state(0);      // Delta € sur l'apport
  let revenusDelta   = $state(0);      // Delta € sur les revenus
  let chargesDelta   = $state(0);      // Delta € sur les charges
  let montantDelta   = $state(0);      // Delta € sur le montant
  let decouvertFixed = $state(false);  // Si true : découvert corrigé

  // ─── Helpers ──────────────────────────────────────────────────────
  function mensualiteEst(m: number): number {
    if (m <= 0) return 0;
    const r = 0.045 / 12, n = 240;
    return (m * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }

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

  // ─── Computed score ───────────────────────────────────────────────
  const newScore = $derived((() => {
    const r = baseRevenus + revenusDelta;
    const c = baseCharges + chargesDelta;
    const m = baseMontant + montantDelta;
    const a = baseApport + apportDelta;

    if (r <= 0 || m <= 0) return baseScore;

    const mens   = mensualiteEst(m);
    const taux   = (c + mens) / r * 100;
    const apPct  = m > 0 ? a / (m + a) * 100 : 0;
    const rav    = r - c - mens;
    const dec    = (baseDecouvert === 'oui' && !decouvertFixed) ? 'oui' : 'non';

    const tauxPts = tauxPtsFor(taux);
    const apPts   = apPtsFor(apPct);
    const decPts  = dec === 'non' ? 15 : 0;
    let   ravPts  = 0;
    if      (rav >= 1200) ravPts = 10;
    else if (rav >= 800)  ravPts = 6;
    else if (rav >= 400)  ravPts = 2;

    const raw = tauxPts + apPts + decPts + ravPts;
    return Math.round(raw / 75 * 100);
  })());

  const scoreDelta = $derived(newScore - baseScore);

  const newValues = $derived({
    revenus: baseRevenus + revenusDelta,
    charges: baseCharges + chargesDelta,
    montant: baseMontant + montantDelta,
    apport: baseApport + apportDelta,
    decouvert: (baseDecouvert === 'oui' && !decouvertFixed) ? 'oui' : 'non',
  });

  // ─── Format helpers ───────────────────────────────────────────────
  function fmt(n: number): string {
    return Math.round(n).toLocaleString('fr-FR');
  }

  function resetAll() {
    apportDelta = 0;
    revenusDelta = 0;
    chargesDelta = 0;
    montantDelta = 0;
    decouvertFixed = false;
  }
</script>

<div class="space-y-4">
  <!-- Header -->
  <div class="flex items-center justify-between mb-4">
    <div>
      <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Simulateur interactif</h3>
      <p class="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Testez l'impact de chaque levier en temps réel</p>
    </div>
    <button
      type="button"
      onclick={resetAll}
      class="text-xs font-medium text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors">
      Réinitialiser
    </button>
  </div>

  <!-- Score preview -->
  <div class="rounded-xl border border-gray-200 dark:border-slate-700 p-4 {scoreDelta > 0 ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' : scoreDelta < 0 ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800' : 'bg-gray-50 dark:bg-slate-800'}">
    <div class="flex items-center justify-between">
      <div>
        <div class="text-xs text-gray-500 dark:text-slate-400 mb-1">Score projeté</div>
        <div class="flex items-baseline gap-2">
          <span class="text-3xl font-black {newScore >= 70 ? 'text-green-600 dark:text-green-400' : newScore >= 45 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}">
            {newScore}
          </span>
          <span class="text-sm text-gray-400 dark:text-slate-500">/100</span>
          {#if scoreDelta !== 0}
            <span class="text-sm font-semibold {scoreDelta > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}">
              {scoreDelta > 0 ? '+' : ''}{scoreDelta}
            </span>
          {/if}
        </div>
      </div>
      <div class="text-right">
        <div class="text-xs text-gray-500 dark:text-slate-400 mb-1">Score actuel</div>
        <div class="text-2xl font-bold text-gray-400 dark:text-slate-500">{baseScore}</div>
      </div>
    </div>
  </div>

  <!-- Sliders -->
  <div class="space-y-4">

    <!-- Apport -->
    <div>
      <div class="flex items-center justify-between mb-2">
        <label class="text-xs font-medium text-gray-700 dark:text-slate-300">
          Apport personnel
        </label>
        <span class="text-xs font-semibold {apportDelta > 0 ? 'text-green-600 dark:text-green-400' : apportDelta < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-slate-400'}">
          {fmt(newValues.apport)}&nbsp;€ {apportDelta !== 0 ? `(${apportDelta > 0 ? '+' : ''}${fmt(apportDelta)})` : ''}
        </span>
      </div>
      <input
        type="range"
        min="-50000"
        max="100000"
        step="1000"
        bind:value={apportDelta}
        class="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-gray-900 dark:accent-slate-100"
      />
    </div>

    <!-- Revenus -->
    <div>
      <div class="flex items-center justify-between mb-2">
        <label class="text-xs font-medium text-gray-700 dark:text-slate-300">
          Revenus nets mensuels
        </label>
        <span class="text-xs font-semibold {revenusDelta > 0 ? 'text-green-600 dark:text-green-400' : revenusDelta < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-slate-400'}">
          {fmt(newValues.revenus)}&nbsp;€ {revenusDelta !== 0 ? `(${revenusDelta > 0 ? '+' : ''}${fmt(revenusDelta)})` : ''}
        </span>
      </div>
      <input
        type="range"
        min="-2000"
        max="5000"
        step="100"
        bind:value={revenusDelta}
        class="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-gray-900 dark:accent-slate-100"
      />
    </div>

    <!-- Charges -->
    <div>
      <div class="flex items-center justify-between mb-2">
        <label class="text-xs font-medium text-gray-700 dark:text-slate-300">
          Autres charges mensuelles
        </label>
        <span class="text-xs font-semibold {chargesDelta < 0 ? 'text-green-600 dark:text-green-400' : chargesDelta > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-slate-400'}">
          {fmt(newValues.charges)}&nbsp;€ {chargesDelta !== 0 ? `(${chargesDelta > 0 ? '+' : ''}${fmt(chargesDelta)})` : ''}
        </span>
      </div>
      <input
        type="range"
        min="-1000"
        max="2000"
        step="50"
        bind:value={chargesDelta}
        class="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-gray-900 dark:accent-slate-100"
      />
    </div>

    <!-- Montant -->
    <div>
      <div class="flex items-center justify-between mb-2">
        <label class="text-xs font-medium text-gray-700 dark:text-slate-300">
          Montant du prêt
        </label>
        <span class="text-xs font-semibold {montantDelta < 0 ? 'text-green-600 dark:text-green-400' : montantDelta > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-slate-400'}">
          {fmt(newValues.montant)}&nbsp;€ {montantDelta !== 0 ? `(${montantDelta > 0 ? '+' : ''}${fmt(montantDelta)})` : ''}
        </span>
      </div>
      <input
        type="range"
        min="-100000"
        max="100000"
        step="5000"
        bind:value={montantDelta}
        class="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-gray-900 dark:accent-slate-100"
      />
    </div>

    <!-- Découvert -->
    {#if baseDecouvert === 'oui'}
      <div class="rounded-lg border border-gray-200 dark:border-slate-700 p-3">
        <label class="flex items-center justify-between cursor-pointer">
          <div>
            <div class="text-xs font-medium text-gray-700 dark:text-slate-300">Corriger le découvert bancaire</div>
            <div class="text-xs text-gray-500 dark:text-slate-400 mt-0.5">3 mois de relevés sans découvert</div>
          </div>
          <input
            type="checkbox"
            bind:checked={decouvertFixed}
            class="w-5 h-5 rounded border-gray-300 dark:border-slate-600 text-gray-900 dark:text-slate-100 focus:ring-gray-900 dark:focus:ring-slate-100"
          />
        </label>
      </div>
    {/if}
  </div>

  <!-- Summary -->
  {#if scoreDelta !== 0}
    <div class="rounded-lg border-2 {scoreDelta > 0 ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : 'border-red-500 bg-red-50 dark:bg-red-900/10'} p-3">
      <div class="flex items-start gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="{scoreDelta > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} mt-0.5">
          {#if scoreDelta > 0}
            <polyline points="20 6 9 17 4 12"/>
          {:else}
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          {/if}
        </svg>
        <div class="flex-1">
          <p class="text-xs font-semibold {scoreDelta > 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}">
            {scoreDelta > 0 ? `Gain de ${scoreDelta} points` : `Perte de ${Math.abs(scoreDelta)} points`}
          </p>
          <p class="text-xs {scoreDelta > 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'} mt-1">
            {scoreDelta > 0
              ? `Votre score passerait de ${baseScore} à ${newScore}. Continuez sur cette voie !`
              : `Votre score chuterait de ${baseScore} à ${newScore}. Préférez d'autres leviers.`
            }
          </p>
        </div>
      </div>
    </div>
  {/if}
</div>
