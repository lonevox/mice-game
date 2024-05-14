<script lang="ts">
	import { type Building, purchaseBuilding } from '$lib/core/building.svelte';
	import { popup } from '@skeletonlabs/skeleton';
	import { formatDecimal, formatProduction } from '$lib/core/util.svelte.js';
	let { building = $bindable() } = $props<{ building }>();

	function formatBuildingText(building: Building) {
		if (building.owned > 0) {
			return building.name + " (" + building.owned + ")";
		}
		return building.name;
	}
</script>

<div>
	<div class="btn-group variant-ghost w-full" use:popup={{ event: 'hover', target: 'popupHover-' + building.name, placement: 'right-start' }}>
		<button class="variant-filled-surface w-full" onclick={() => purchaseBuilding(building)}>{formatBuildingText(building)}</button>
		{#if building.owned > 0}
			<button onclick={() => building.owned -= 1}>Sell</button>
		{/if}
	</div>
	<div class="card p-4 w-72 shadow-xl space-y-2 z-10 duration-0" data-popup={"popupHover-" + building.name}>
		<p>{building.description}</p>
		<hr />
		{#each Object.entries(building.price.value) as [resource, amount]}
			<div class="grid grid-cols-2">
				<p>{resource.toLowerCase()}</p>
				<p class="text-right">{formatDecimal(amount)}</p>
			</div>
		{/each}
		<hr />
		<p class="text-center font-bold">Effects</p>
		{#each Object.entries(building.effects) as [effectName, effect]}
			{#if effectName === "resourceProductionBase"}
				{#each Object.entries(effect) as [key, value]}
					<p class="text-surface-300">{key} production: {formatProduction(value.initial)}</p>
				{/each}
			{/if}
		{/each}
		<div class="arrow bg-surface-100-800-token"></div>
	</div>
</div>
