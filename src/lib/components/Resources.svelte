<script lang="ts">
	import { resources } from '$lib/core/resource.svelte';
	import { ticksPerSecond } from '$lib/core/game';
	import { formatDecimal } from '$lib/core/util.svelte';

	function formatProduction(production: number): string {
		if (production > 0) {
			return "+" + formatDecimal(production * ticksPerSecond) + "/s";
		}
		if (production < 0) {
			return "-" + formatDecimal(production * ticksPerSecond) + "/s";
		}
		return "";
	}
</script>

<div class="space-y-1">
	<h4 class="h4">Resources</h4>
	<div class="mx-auto bg-surface-900 table w-96 border-spacing-1">
		{#each Object.values(resources) as resource}
			<div class="table-row hover:bg-surface-800">
				<p class="table-cell max-w-10 px-1 truncate" style="color: {resource.rarity.color}">{resource.name.toLowerCase()}</p>
				<p class="table-cell px-1">{formatDecimal(resource.amount)}</p>
				<p class="table-cell px-1 text-surface-500">/{resource.maxAmount}</p>
				<p class="table-cell px-1">{formatProduction(resource.production.value)}</p>
			</div>
		{/each}
	</div>
</div>
