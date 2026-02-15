<script lang="ts">
  import DiagnosticPremium from '../DiagnosticPremium.svelte';

  let { dossierId }: { dossierId: string } = $props();

  let saved = $state(false);
  let saveError = $state('');

  async function handleResult(result: unknown, inputs: unknown) {
    saved = false;
    saveError = '';
    try {
      const res = await fetch('/api/courtier/diagnostics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dossierId, result, inputs }),
      });
      if (!res.ok) throw new Error('Erreur serveur');
      saved = true;
    } catch (e) {
      saveError = 'Impossible de sauvegarder le diagnostic.';
    }
  }
</script>

{#if saved}
  <div class="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm font-medium">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
    Diagnostic sauvegardé dans le dossier.
  </div>
{/if}
{#if saveError}
  <div class="mb-4 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm">
    {saveError}
  </div>
{/if}

<DiagnosticPremium {dossierId} onResult={handleResult} />
