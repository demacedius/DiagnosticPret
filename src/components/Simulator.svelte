<script lang="ts">
  import { slide, fade } from 'svelte/transition';

  // Form state
  let revenus = $state('');
  let charges = $state('');
  let apport = $state('');
  let decouvert = $state('non');

  // UI state
  let submitted = $state(false);
  let errors = $state<Record<string, string>>({});

  // Results state
  let risks = $state<Array<{ title: string; detail: string }>>([]);
  let status = $state<'fragile' | 'solide'>('fragile');

  // Demo mode
  function loadDemo() {
    revenus = '3500';
    charges = '1400';
    apport = '8000';
    decouvert = 'oui';
    handleSubmit();
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    const r = parseFloat(revenus);
    const c = parseFloat(charges);
    const a = parseFloat(apport);

    if (!revenus || isNaN(r) || r < 0) errs.revenus = 'Champ requis (valeur ≥ 0)';
    if (!charges || isNaN(c) || c < 0) errs.charges = 'Champ requis (valeur ≥ 0)';
    if (!apport || isNaN(a) || a < 0) errs.apport = 'Champ requis (valeur ≥ 0)';

    errors = errs;
    return Object.keys(errs).length === 0;
  }

  function computeRisks() {
    const r = parseFloat(revenus) || 0;
    const c = parseFloat(charges) || 0;
    const a = parseFloat(apport) || 0;
    const newRisks: Array<{ title: string; detail: string }> = [];

    if (decouvert === 'oui') {
      newRisks.push({
        title: 'Découvert fréquent',
        detail: "Signal négatif pour la banque : peut indiquer une gestion de trésorerie tendue.",
      });
    }

    if (r > 0 && c / r > 0.35) {
      newRisks.push({
        title: 'Pression de charges élevée',
        detail: "Le poids des charges peut limiter la capacité de remboursement perçue.",
      });
    }

    if (r > 0 && a < 3 * r) {
      newRisks.push({
        title: 'Apport jugé fragile',
        detail: "Un apport plus solide améliore la perception de stabilité du projet.",
      });
    }

    risks = newRisks;
    status = newRisks.length === 0 ? 'solide' : 'fragile';
  }

  function handleSubmit() {
    if (!validate()) return;
    computeRisks();
    submitted = true;
    setTimeout(() => {
      document.getElementById('resultats')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  function reset() {
    submitted = false;
    revenus = '';
    charges = '';
    apport = '';
    decouvert = 'non';
    errors = {};
    risks = [];
  }
</script>

<div class="w-full">
  <!-- Form card -->
  <div class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-card-lg p-6 sm:p-8 transition-colors duration-200">
    <div class="mb-6">
      <div class="flex items-center gap-2 mb-1">
        <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span class="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Diagnostic express</span>
      </div>
      <p class="text-sm text-gray-500 dark:text-slate-400">Votre profil · Sans engagement</p>
    </div>

    <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} novalidate>
      <!-- Row: Revenus + Charges -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label for="revenus" class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
            Revenus nets mensuels
          </label>
          <div class="relative">
            <input
              id="revenus"
              type="number"
              min="0"
              step="100"
              placeholder="3 500"
              bind:value={revenus}
              class="input-field pr-8 {errors.revenus ? 'border-red-400 focus:ring-red-400' : ''}"
            />
            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 text-sm font-medium pointer-events-none">€</span>
          </div>
          {#if errors.revenus}
            <p class="text-xs text-red-500 mt-1" transition:fade={{ duration: 150 }}>{errors.revenus}</p>
          {/if}
        </div>

        <div>
          <label for="charges" class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
            Charges mensuelles
          </label>
          <div class="relative">
            <input
              id="charges"
              type="number"
              min="0"
              step="100"
              placeholder="800"
              bind:value={charges}
              class="input-field pr-8 {errors.charges ? 'border-red-400 focus:ring-red-400' : ''}"
            />
            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 text-sm font-medium pointer-events-none">€</span>
          </div>
          {#if errors.charges}
            <p class="text-xs text-red-500 mt-1" transition:fade={{ duration: 150 }}>{errors.charges}</p>
          {/if}
        </div>
      </div>

      <!-- Row: Apport + Découvert -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label for="apport" class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
            Apport
          </label>
          <div class="relative">
            <input
              id="apport"
              type="number"
              min="0"
              step="1000"
              placeholder="30 000"
              bind:value={apport}
              class="input-field pr-8 {errors.apport ? 'border-red-400 focus:ring-red-400' : ''}"
            />
            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 text-sm font-medium pointer-events-none">€</span>
          </div>
          {#if errors.apport}
            <p class="text-xs text-red-500 mt-1" transition:fade={{ duration: 150 }}>{errors.apport}</p>
          {/if}
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
            Découvert fréquent
          </label>
          <div class="flex gap-2">
            <button
              type="button"
              onclick={() => (decouvert = 'non')}
              class="flex-1 py-3 px-4 text-sm font-medium rounded-lg border transition-all duration-150
                {decouvert === 'non'
                  ? 'bg-gray-900 dark:bg-slate-100 text-white dark:text-slate-900 border-gray-900 dark:border-slate-100'
                  : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'}"
            >
              Non
            </button>
            <button
              type="button"
              onclick={() => (decouvert = 'oui')}
              class="flex-1 py-3 px-4 text-sm font-medium rounded-lg border transition-all duration-150
                {decouvert === 'oui'
                  ? 'bg-gray-900 dark:bg-slate-100 text-white dark:text-slate-900 border-gray-900 dark:border-slate-100'
                  : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'}"
            >
              Oui
            </button>
          </div>
        </div>
      </div>

      <!-- Submit -->
      <button
        type="submit"
        class="w-full py-3.5 bg-gray-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold text-sm rounded-xl hover:bg-gray-800 dark:hover:bg-white active:scale-[0.99] transition-all duration-150 flex items-center justify-center gap-2"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        Lancer l'analyse
      </button>
    </form>

    <!-- Trust badges -->
    <div class="flex flex-wrap items-center justify-center gap-4 mt-5">
      <span class="flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-500">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        Gratuit
      </span>
      <span class="flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-500">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        Instantané
      </span>
      <span class="flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-500">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        Sans engagement
      </span>
    </div>
  </div>

  <!-- Demo link -->
  <div class="text-center mt-4">
    <button
      type="button"
      onclick={loadDemo}
      class="text-sm text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white underline underline-offset-2 transition-colors"
    >
      Voir une démo
    </button>
  </div>
</div>

<!-- Results section -->
{#if submitted}
  <div id="resultats" transition:slide={{ duration: 300, axis: 'y' }} class="mt-10">
    <!-- Status header -->
    <div class="flex items-center gap-3 mb-6">
      <div class="w-0.5 h-8 {status === 'solide' ? 'bg-green-500' : 'bg-amber-500'} rounded-full"></div>
      <div>
        <div class="flex items-center gap-2">
          <span class="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500">Résultat de l'analyse</span>
          <span class="badge {status === 'solide' ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'}">
            {#if status === 'solide'}
              ✓ Profil plutôt solide
            {:else}
              ⚠ Profil à renforcer
            {/if}
          </span>
        </div>
      </div>
    </div>

    {#if risks.length > 0}
      <!-- Risks -->
      <div class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-card mb-4 transition-colors duration-200">
        <div class="p-5 border-b border-gray-100 dark:border-slate-700">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Risques identifiés</h3>
          <p class="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Ces éléments peuvent influencer l'évaluation bancaire de votre dossier</p>
        </div>
        <div class="divide-y divide-gray-100 dark:divide-slate-700">
          {#each risks as risk, i}
            <div class="p-5 flex gap-3">
              <div class="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span class="text-amber-600 dark:text-amber-400 text-xs font-bold">{i + 1}</span>
              </div>
              <div>
                <p class="text-sm font-semibold text-gray-900 dark:text-white">{risk.title}</p>
                <p class="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{risk.detail}</p>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Professional tension block -->
      <div class="bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-200 dark:border-slate-700 p-5 mb-4 transition-colors duration-200">
        <p class="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
          Certains éléments de votre dossier peuvent réduire vos chances d'acceptation bancaire. Un diagnostic approfondi permet d'identifier précisément les leviers d'amélioration.
        </p>
      </div>
    {:else}
      <!-- No risks -->
      <div class="bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800/50 p-5 mb-4 transition-colors duration-200">
        <div class="flex items-start gap-3">
          <div class="w-8 h-8 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div>
            <p class="text-sm font-semibold text-gray-900 dark:text-white">Aucun risque majeur détecté</p>
            <p class="text-sm text-gray-600 dark:text-slate-300 mt-1">
              Votre profil présente des bases solides. Un diagnostic complet peut toutefois révéler des optimisations supplémentaires pour maximiser vos chances.
            </p>
          </div>
        </div>
      </div>
    {/if}

    <!-- CTA premium -->
    <div class="bg-gray-900 rounded-2xl p-6 sm:p-8 text-white">
      <div class="flex items-start gap-3 mb-4">
        <div class="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        </div>
        <div>
          <span class="text-xs font-semibold text-white/50 uppercase tracking-widest">Diagnostic personnalisé Premium</span>
          <h3 class="text-lg font-bold mt-1">Optimisez votre profil emprunteur</h3>
          <p class="text-sm text-white/60 mt-1">
            Obtenez une analyse détaillée et un plan d'action personnalisé pour maximiser vos chances d'acceptation bancaire.
          </p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3 mb-6">
        {#each [
          { icon: '📊', label: 'Analyse approfondie', desc: 'Diagnostic complet de tous vos critères' },
          { icon: '🎯', label: 'Identification précise', desc: 'Points bloquants identifiés' },
          { icon: '📋', label: "Plan d'action priorité", desc: 'Recommandations actionnables' },
          { icon: '📈', label: "Simulations d'amortisation", desc: 'Projections et scénarios optimisés' },
        ] as feat}
          <div class="bg-white/5 rounded-xl p-4">
            <p class="text-sm font-semibold">{feat.icon} {feat.label}</p>
            <p class="text-xs text-white/50 mt-0.5">{feat.desc}</p>
          </div>
        {/each}
      </div>

      <a
        href="/premium"
        class="w-full flex items-center justify-center gap-2 py-3.5 bg-white text-gray-900 font-semibold text-sm rounded-xl hover:bg-gray-100 active:scale-[0.99] transition-all duration-150"
      >
        Obtenir mon diagnostic personnalisé
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
      </a>
      <p class="text-xs text-white/40 text-center mt-3">
        <span>✓ Rapport PDF complet</span>
        <span class="mx-2">·</span>
        <span>✓ Accompagnement inclus</span>
      </p>
    </div>

    <!-- Disclaimer -->
    <p class="text-xs text-gray-400 dark:text-slate-500 text-center mt-4 leading-relaxed">
      Outil d'information et de simulation pédagogique. Aucune garantie d'obtention de financement. Ne remplace pas l'avis d'un professionnel (courtier, banque).
    </p>

    <!-- Reset -->
    <div class="text-center mt-3">
      <button
        type="button"
        onclick={reset}
        class="text-xs text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 underline underline-offset-2 transition-colors"
      >
        Recommencer une nouvelle analyse
      </button>
    </div>
  </div>
{/if}
