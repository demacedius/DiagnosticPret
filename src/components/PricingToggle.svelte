<script lang="ts">
  let billing = $state<'mensuel' | 'annuel'>('annuel');

  // Stripe payment links
  const STRIPE = {
    premiumMensuel: 'https://buy.stripe.com/7sY6oHgHi0mEbjQ6kweQM03',
    premiumAnnuel:  'https://buy.stripe.com/28E4gz2Qsd9q9bIeR2eQM02',
    proAnnuel:      'https://buy.stripe.com/5kQbJ12Qs3yQ87E38keQM01',
    proMensuel:     'https://buy.stripe.com/8x29AT1Mo1qI4VsdMYeQM00',
  };

  
  const plans = [
    {
      id: 'express',
      name: 'Express',
      desc: 'Diagnostic rapide, gratuit',
      mensuelPrice: 0,
      mensuelLabel: '0€',
      mensuelSuffix: '/accès',
      mensuelSaving: null,
      mensuelHref: '/',
      annuelPrice: 0,
      annuelLabel: '0€',
      annuelSuffix: '/accès',
      annuelSaving: null,
      annuelHref: '/',
      cta: "Lancer l'analyse",
      features: [
        'Score global de votre profil',
        "Analyse du taux d'endettement",
        'Détection des signaux négatifs',
      ],
      highlighted: false,
      badge: null,
    },
    {
      id: 'premium',
      name: 'Premium',
      desc: "Diagnostic complet · plan d'action",
      mensuelPrice: 19,
      mensuelLabel: '19€',
      mensuelSuffix: '/mois',
      mensuelSaving: null,
      mensuelHref: STRIPE.premiumMensuel,
      annuelPrice: 16,
      annuelLabel: '16€',
      annuelSuffix: '/mois',
      annuelSaving: '190€/an · économisez 38€',
      annuelHref: STRIPE.premiumAnnuel,
      cta: 'Démarrer mon diagnostic →',
      features: [
        'Tout du plan Express',
        'Analyse approfondie ligne par ligne',
        'Identification précise des blocages',
        "Plan d'action personnalisé",
        "Simulations d'amortisation",
        'Rapport PDF téléchargeable',
      ],
      highlighted: true,
      badge: '✦ Recommandé',
    },
    {
      id: 'pro',
      name: 'Pro',
      desc: 'Pour les courtiers et professionnels',
      mensuelPrice: 49,
      mensuelLabel: '49€',
      mensuelSuffix: '/mois',
      mensuelSaving: null,
      mensuelHref: STRIPE.proMensuel,
      annuelPrice: 41,
      annuelLabel: '41€',
      annuelSuffix: '/mois',
      annuelSaving: '490€/an · économisez 98€',
      annuelHref: STRIPE.proAnnuel,
      cta: "Choisir Pro →",
      features: [
        'Tout du plan Premium',
        'Analyses illimitées',
        'Export multi-dossiers',
        'Dashboard courtier',
        'Support prioritaire',
      ],
      highlighted: false,
      badge: null,
    },
  ];

  function currentHref(plan: typeof plans[0]) {
    return billing === 'mensuel' ? plan.mensuelHref : plan.annuelHref;
  }
  function currentLabel(plan: typeof plans[0]) {
    return billing === 'mensuel' ? plan.mensuelLabel : plan.annuelLabel;
  }
  function currentSuffix(plan: typeof plans[0]) {
    return billing === 'mensuel' ? plan.mensuelSuffix : plan.annuelSuffix;
  }
  function currentSaving(plan: typeof plans[0]) {
    return billing === 'mensuel' ? plan.mensuelSaving : plan.annuelSaving;
  }
  function strikeLabel(plan: typeof plans[0]) {
    // En annuel, barrer le prix mensuel pour montrer l'économie
    return billing === 'annuel' && plan.mensuelPrice > 0 ? plan.mensuelLabel : null;
  }
</script>

<!-- Billing toggle -->
<div class="flex justify-center mb-10">
  <div class="inline-flex items-center bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-1 gap-0.5 shadow-sm transition-colors duration-200">
    <button
      type="button"
      onclick={() => (billing = 'mensuel')}
      class="px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200
        {billing === 'mensuel'
          ? 'bg-gray-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm'
          : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'}"
    >
      Mensuel
    </button>
    <button
      type="button"
      onclick={() => (billing = 'annuel')}
      class="px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200
        {billing === 'annuel'
          ? 'bg-gray-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm'
          : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'}"
    >
      Annuel
    </button>
    <span
      class="ml-1 mr-1 px-2 py-0.5 text-xs font-semibold rounded-full transition-all duration-200
        {billing === 'annuel' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500'}"
    >
      -20%
    </span>
  </div>
</div>

<!-- Cards -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
  {#each plans as plan}
    <div
      class="relative flex flex-col rounded-2xl transition-shadow duration-200
        {plan.highlighted
          ? 'bg-gray-900 text-white shadow-2xl -mt-2 ring-1 ring-gray-800'
          : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md'}"
    >
      <!-- Badge recommandé -->
      {#if plan.badge}
        <div class="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span class="inline-flex items-center gap-1 px-3 py-1 bg-amber-400 text-amber-900 text-xs font-bold rounded-full shadow-sm whitespace-nowrap">
            {plan.badge}
          </span>
        </div>
      {/if}

      <div class="p-6 flex flex-col flex-1 {plan.badge ? 'pt-8' : ''}">

        <!-- Plan header -->
        <div class="mb-5">
          <h3 class="text-base font-bold {plan.highlighted ? 'text-white' : 'text-gray-900 dark:text-white'}">{plan.name}</h3>
          <p class="text-xs mt-0.5 {plan.highlighted ? 'text-white/50' : 'text-gray-500 dark:text-slate-400'}">{plan.desc}</p>
        </div>

        <!-- Prix -->
        <div class="flex items-end gap-1.5 mb-1">
          {#if strikeLabel(plan)}
            <span class="text-base line-through mb-0.5 {plan.highlighted ? 'text-white/30' : 'text-gray-300 dark:text-slate-600'}">
              {strikeLabel(plan)}
            </span>
          {/if}
          <span class="text-4xl font-black leading-none {plan.highlighted ? 'text-white' : 'text-gray-900 dark:text-white'}">
            {currentLabel(plan)}
          </span>
          <span class="text-sm mb-0.5 {plan.highlighted ? 'text-white/40' : 'text-gray-400 dark:text-slate-500'}">
            {currentSuffix(plan)}
          </span>
        </div>

        <!-- Saving note -->
        <div class="mb-5 h-4">
          {#if currentSaving(plan)}
            <p class="text-xs font-medium {plan.highlighted ? 'text-green-400' : 'text-green-600 dark:text-green-400'}">
              {currentSaving(plan)}
            </p>
          {/if}
        </div>

        <!-- Features -->
        <ul class="space-y-2.5 flex-1 mb-6">
          {#each plan.features as feature}
            <li class="flex items-start gap-2 text-sm {plan.highlighted ? 'text-white/80' : 'text-gray-600 dark:text-slate-300'}">
              <svg
                class="flex-shrink-0 mt-0.5 {plan.highlighted ? 'text-white' : 'text-gray-900 dark:text-slate-200'}"
                width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
              >
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {feature}
            </li>
          {/each}
        </ul>

        <!-- CTA → Stripe ou page interne -->
        <a
          href={currentHref(plan)}
          class="w-full text-center py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-150
            {plan.highlighted
              ? 'bg-white text-gray-900 hover:bg-gray-100'
              : 'bg-gray-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-gray-800 dark:hover:bg-white'}"
        >
          {plan.cta}
        </a>

      </div>
    </div>
  {/each}
</div>

<!-- Note facturation annuelle -->
<div class="h-6 mt-4 text-center">
  {#if billing === 'annuel'}
    <p class="text-xs text-gray-400 dark:text-slate-500">Facturation annuelle en une fois · Résiliable à tout moment</p>
  {:else}
    <p class="text-xs text-gray-400 dark:text-slate-500">Facturation mensuelle · Sans engagement</p>
  {/if}
</div>
