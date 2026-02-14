<script lang="ts">
  import { onMount } from 'svelte';

  let dark = $state(false);

  onMount(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'dark') {
      dark = true;
    } else if (stored === 'light') {
      dark = false;
    } else {
      dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    applyTheme(dark);
  });

  function applyTheme(isDark: boolean) {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }

  function toggle() {
    dark = !dark;
    applyTheme(dark);
  }
</script>

<button
  type="button"
  onclick={toggle}
  aria-label={dark ? 'Passer en mode clair' : 'Passer en mode sombre'}
  class="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors duration-150"
>
  {#if dark}
    <!-- Soleil -->
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
    </svg>
  {:else}
    <!-- Lune -->
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  {/if}
</button>
