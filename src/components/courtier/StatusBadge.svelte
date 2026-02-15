<script lang="ts">
  import type { DossierStatut } from '../../lib/courtier-types';

  let { statut, dossierId, editable = false }: {
    statut: DossierStatut;
    dossierId?: string;
    editable?: boolean;
  } = $props();

  let current = $state(statut);
  let saving = $state(false);

  const labels: Record<DossierStatut, string> = {
    en_attente: 'En attente',
    en_cours:   'En cours',
    accorde:    'Accordé',
    refuse:     'Refusé',
  };

  const colors: Record<DossierStatut, string> = {
    en_attente: 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300',
    en_cours:   'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    accorde:    'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    refuse:     'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  async function onChange(e: Event) {
    const val = (e.target as HTMLSelectElement).value as DossierStatut;
    if (!dossierId) return;
    saving = true;
    try {
      await fetch(`/api/courtier/dossiers/${dossierId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut: val }),
      });
      current = val;
    } finally {
      saving = false;
    }
  }
</script>

{#if editable && dossierId}
  <select
    value={current}
    onchange={onChange}
    disabled={saving}
    class={`text-xs font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer ${colors[current]}`}
  >
    {#each Object.entries(labels) as [val, label]}
      <option value={val}>{label}</option>
    {/each}
  </select>
{:else}
  <span class={`text-xs font-medium px-2.5 py-1 rounded-full ${colors[current]}`}>
    {labels[current]}
  </span>
{/if}
