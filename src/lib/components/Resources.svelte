<script lang="ts">
	import { Rarities, type Resource, resourceDefaults } from '$lib/resource';

	const resources = $state<Resource[]>([
		{
			...resourceDefaults,
			name: "thing",
			rarity: Rarities.Common,
			production: 0.125,
		},
		{
			...resourceDefaults,
			name: "another longer thing",
			rarity: Rarities.Uncommon,
		}
	]);

	const ticksPerSecond = 5;

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
				<p class="table-cell px-1">{resource.amount}</p>
				<p class="table-cell px-1 text-surface-500">/{resource.maxAmount}</p>
				<p class="table-cell px-1">{formatProduction(resource.production)}</p>
			</div>
		{/each}
	</div>
</div>
