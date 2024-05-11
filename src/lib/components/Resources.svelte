<script lang="ts">
	import { resources } from '$lib/core/resource.svelte';
	import { ticksPerSecond } from '$lib/core/game.svelte';

	function formatAmount(amount: number): string {
		if (Number.isInteger(amount)) {
			return amount.toString();
		}
		return amount.toFixed(2);
	}

	function formatProduction(production: number): string {
		if (production > 0) {
			return "+" + production * ticksPerSecond + "/s";
		}
		if (production < 0) {
			return "-" + production * ticksPerSecond + "/s";
		}
		return "";
	}
</script>

<div class="space-y-1">
	<h4 class="h4">Resources</h4>
	<div class="mx-auto bg-surface-900 table w-96 border-spacing-1">
		{#each resources as resource}
			<div class="table-row hover:bg-surface-800">
				<p class="table-cell max-w-16 px-1 truncate" style="color: {resource.rarity.color}">{resource.name}</p>
				<p class="table-cell px-1">{formatAmount(resource.amount)}</p>
				<p class="table-cell px-1 text-surface-500">/{resource.maxAmount}</p>
				<p class="table-cell px-1">{formatProduction(resource.production)}</p>
			</div>
		{/each}
	</div>
</div>
