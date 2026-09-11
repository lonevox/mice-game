<script lang="ts">
	import type { ReactiveProperty } from '$lib/core/registry/reactiveRegistry.svelte.js';
	import { useGame } from '$lib/core/gameContext';
	import { formatDecimal } from '$lib/core/util/stringFormatting.js';

	interface Props {
		property: ReactiveProperty;
		propertyName: string;
		valueFormatter?: (value: number) => string;
	}

	let { property, propertyName, valueFormatter = formatDecimal }: Props = $props();

	const game = useGame();
	const breakdown = $derived(game.registry.getValueBreakdown(property.id));
</script>

<div class="space-y-1">
	<p class="font-bold">{propertyName}: {valueFormatter(breakdown.totalValue)}</p>

	{#if breakdown.contributions.length > 0}
		<hr class="opacity-50" />
		<div class="text-sm space-y-0.5">
			<p>Base: {valueFormatter(breakdown.baseValue)}</p>
			{#each breakdown.contributions as contrib (`${contrib.link.from}:${contrib.link.to}:${contrib.link.type}`)}
				{@const sign = contrib.contribution >= 0 ? '+' : ''}
				{@const label = contrib.link.metadata?.label ?? contrib.link.from}
				<p class="text-surface-400">
					{sign}{valueFormatter(contrib.contribution)} from {label}
				</p>
			{/each}
		</div>
	{/if}
</div>
