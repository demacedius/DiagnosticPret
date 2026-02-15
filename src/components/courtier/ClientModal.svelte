<script lang="ts">
  let { onCreated }: { onCreated: (client: { id: string; nom: string; email: string | null }) => void } = $props();

  let open  = $state(false);
  let nom   = $state('');
  let email = $state('');
  let error = $state('');
  let loading = $state(false);

  function show() { open = true; nom = ''; email = ''; error = ''; }
  function hide() { open = false; }

  async function submit(e: Event) {
    e.preventDefault();
    if (!nom.trim()) { error = 'Le nom est requis.'; return; }
    loading = true;
    error = '';
    try {
      const res = await fetch('/api/courtier/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom: nom.trim(), email: email.trim() || null }),
      });
      if (!res.ok) throw new Error('Erreur serveur');
      const client = await res.json();
      onCreated(client);
      hide();
    } catch {
      error = 'Impossible de créer le client.';
    } finally {
      loading = false;
    }
  }
</script>

<button
  onclick={show}
  class="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-semibold rounded-lg hover:bg-gray-800 dark:hover:bg-white transition-colors"
>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
  Nouveau client
</button>

{#if open}
  <!-- Backdrop -->
  <div
    class="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
    role="button"
    tabindex="-1"
    onclick={hide}
    onkeydown={(e) => e.key === 'Escape' && hide()}
    aria-label="Fermer"
  ></div>

  <!-- Modal -->
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6">
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-base font-semibold text-gray-900 dark:text-white">Nouveau client</h2>
        <button onclick={hide} class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-gray-400">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>

      <form onsubmit={submit} class="flex flex-col gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
            Nom <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            bind:value={nom}
            placeholder="Marie Dupont"
            class="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-300"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
            Email <span class="text-gray-400 text-xs font-normal">(optionnel)</span>
          </label>
          <input
            type="email"
            bind:value={email}
            placeholder="marie@exemple.fr"
            class="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-slate-300"
          />
        </div>
        {#if error}
          <p class="text-sm text-red-600 dark:text-red-400">{error}</p>
        {/if}
        <div class="flex gap-3 pt-1">
          <button type="button" onclick={hide}
            class="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
            Annuler
          </button>
          <button type="submit" disabled={loading}
            class="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-gray-900 dark:bg-slate-100 dark:text-slate-900 rounded-lg hover:bg-gray-800 dark:hover:bg-white transition-colors disabled:opacity-50">
            {loading ? 'Création…' : 'Créer'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
