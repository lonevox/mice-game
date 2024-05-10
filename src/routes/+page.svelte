<script lang="ts">
	import { Rarities, type Resource, resourceDefaults } from '$lib/resource';
	import { Tab, TabGroup } from '@skeletonlabs/skeleton';
	import LocationTab from '$lib/components/LocationTab.svelte';

	const resources = $state<Resource[]>([])
	resources.push({
		...resourceDefaults,
		name: "thing",
		rarity: Rarities.Common,
		production: 0.125,
	})
	resources.push({
		...resourceDefaults,
		name: "another longer thing",
		rarity: Rarities.Uncommon,
	})

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

	let tabSet = $state<number>(0);
</script>

<div class="flex flex-row max-w-screen-2xl mx-auto space-x-8">
	<div class="basis-1/4 space-y-1">
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
	<div class="basis-1/2">
		<TabGroup>
			<Tab bind:group={tabSet} name="tab1" value={0} class="font-bold">Field</Tab>
			<Tab bind:group={tabSet} name="tab2" value={1} class="font-bold">Society</Tab>
			<svelte:fragment slot="panel">
				{#if tabSet === 0}
					<LocationTab />
				{:else if tabSet === 1}
					(tab panel 2 contents)
				{/if}
			</svelte:fragment>
		</TabGroup>
	</div>
	<div class="basis-1/4">
		<h4 class="h4">Log</h4>
	</div>
</div>
