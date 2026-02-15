<script lang="ts">
  interface Point { created_at: string; score_global: number; }

  let { diagnostics }: { diagnostics: Point[] } = $props();

  const W = 400;
  const H = 120;
  const PAD = 20;

  const points = $derived(
    [...diagnostics]
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  );

  const polyline = $derived(() => {
    if (points.length < 2) return '';
    return points.map((p, i) => {
      const x = PAD + (i / (points.length - 1)) * (W - PAD * 2);
      const y = H - PAD - ((p.score_global / 100) * (H - PAD * 2));
      return `${x},${y}`;
    }).join(' ');
  });

  function scoreColor(score: number) {
    if (score >= 70) return '#22c55e';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  }

  function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  }
</script>

{#if points.length === 0}
  <p class="text-sm text-gray-400 dark:text-slate-500 text-center py-4">Aucun diagnostic encore.</p>
{:else if points.length === 1}
  <div class="flex items-center justify-center gap-3 py-4">
    <span class="text-3xl font-bold" style={`color: ${scoreColor(points[0].score_global)}`}>
      {points[0].score_global}
    </span>
    <span class="text-sm text-gray-400 dark:text-slate-500">/ 100</span>
  </div>
{:else}
  <svg viewBox={`0 0 ${W} ${H}`} class="w-full h-auto" aria-label="Évolution du score">
    <!-- Grille -->
    {#each [25, 50, 75] as y}
      {@const cy = H - PAD - (y / 100) * (H - PAD * 2)}
      <line x1={PAD} y1={cy} x2={W - PAD} y2={cy}
        stroke="currentColor" stroke-width="0.5" class="text-gray-200 dark:text-slate-700" stroke-dasharray="4,4"/>
      <text x={PAD - 4} y={cy + 4} text-anchor="end" class="fill-gray-400 dark:fill-slate-500" style="font-size:9px">{y}</text>
    {/each}
    <!-- Ligne -->
    <polyline points={polyline()} fill="none" stroke="#6366f1" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
    <!-- Points -->
    {#each points as p, i}
      {@const x = PAD + (i / (points.length - 1)) * (W - PAD * 2)}
      {@const cy = H - PAD - ((p.score_global / 100) * (H - PAD * 2))}
      <circle cx={x} cy={cy} r="4" fill={scoreColor(p.score_global)} stroke="white" stroke-width="1.5"/>
      <text x={x} y={H - 4} text-anchor="middle" class="fill-gray-400 dark:fill-slate-500" style="font-size:8px">{fmtDate(p.created_at)}</text>
    {/each}
  </svg>
{/if}
