<script lang="ts">
	let {
		breadcrumbs,
		onNavigate
	}: {
		breadcrumbs: string[];
		onNavigate?: (index: number) => void;
	} = $props();
</script>

<ol class="flex items-center gap-2 overflow-x-auto whitespace-nowrap">
	{#each breadcrumbs as crumb, i}
		{#if i > 0}
			<li class="shrink-0 opacity-50" aria-hidden="true">&gt;</li>
		{/if}

		<li class="shrink-0">
			{#if onNavigate && i < breadcrumbs.length - 1}
				<button class="opacity-60 hover:underline" onclick={() => onNavigate(i)}>
					{crumb}
				</button>
			{:else}
				<span aria-current={i === breadcrumbs.length - 1 ? 'page' : undefined}>{crumb}</span>
			{/if}
		</li>
	{/each}
</ol>
