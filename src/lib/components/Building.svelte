<script lang="ts">
	import { type Building, tryPurchaseBuilding } from '$lib/core/building.svelte';
	import { popup } from '@skeletonlabs/skeleton';
	import { formatDecimal, formatTimeLeft } from '$lib/core/util.svelte.js';
	import { Resource, resources } from '$lib/core/resource.svelte';
	import { getLinks } from '$lib/core/effect.svelte';
	let { building = $bindable() } = $props<{ building }>();

	function formatBuildingText(building: Building) {
		if (building.owned > 0) {
			return building.displayName + " (" + building.owned + ")";
		}
		return building.displayName;
	}

	function formatResourcePrice(resource: Resource, price: number): string {
		if (resource.amount > price) {
			return formatDecimal(price);
		}
		const secondsLeft = (price - resource.amount) / resource.production;
		const timeLeft = formatTimeLeft(secondsLeft);
		if (timeLeft === "") {
			return formatDecimal(resource.amount) + " / " + formatDecimal(price)
		}
		return formatDecimal(resource.amount) + " / " + formatDecimal(price) + " (" + timeLeft + ")";
	}
</script>

<div>
	<div class="btn-group variant-ghost w-full" use:popup={{ event: 'hover', target: 'popupHover-' + building.name, placement: 'right-start' }}>
		<button
			class="variant-filled-surface w-full"
			style={!building.canAfford ? 'cursor: default !important' : ''}
			disabled={!building.canAfford}
			onclick={() => tryPurchaseBuilding(building)}
		>
			{formatBuildingText(building)}
		</button>
		{#if building.owned > 0}
			<button onclick={() => building.owned -= 1}>Sell</button>
		{/if}
	</div>
	<div class="card p-4 w-72 shadow-xl space-y-2 z-10 duration-0" data-popup={"popupHover-" + building.name}>
		<p>{building.description}</p>
		<hr />
		{#each Object.entries(building.price) as [resourceName, price]}
			<div class="flex">
				<p class="flex-none">{resourceName.toLowerCase()}</p>
				<p class="flex-1 text-right" class:text-error-400={price > resources[resourceName].amount}>{formatResourcePrice(resources[resourceName], price)}</p>
			</div>
		{/each}
		<hr />
		<p class="text-center font-bold">Effects</p>
		{#each Object.entries(getLinks()["Building"]?.[building.name] ?? []) as [fromPropertyName, linkedTo]}
			{#if fromPropertyName === "owned"}
				<p class="underline">For each {building.displayName}</p>
				{#each Object.entries(linkedTo) as [gameObjectClass, propertyPairs]}
					{#each Object.entries(propertyPairs) as [gameObjectName, property]}
						{#each Object.entries(property) as [propertyName, propertyValue]}
							{#if propertyName === "maxAmount"}
								<p class="text-surface-600-300-token">Max {gameObjectName}: {propertyValue.operation.argument}</p>
							{/if}
						{/each}
					{/each}
				{/each}
			{/if}
		{/each}
		<div class="arrow bg-surface-100-800-token"></div>
	</div>
</div>
