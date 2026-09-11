<script lang="ts">
	import { LocationService } from '$lib/base_game/data_components/location';
	import Building from '$lib/components/Building.svelte';
	import { BuildingService } from '$lib/base_game/data_components/building';
	import {
		CelestialBodyService,
		type CelestialBody
	} from '$lib/base_game/data_components/celestialBody';
	import Breadcrumb from '$lib/components/Breadcrumb.svelte';

	const unlockedCelestialBodies = $derived(CelestialBodyService.getUnlocked());

	function findInitialBody(): CelestialBody | undefined {
		const initialLocation = LocationService.getUnlocked().find((location) =>
			unlockedCelestialBodies.some((body) => body.id === location.celestialBody.id)
		);
		return initialLocation?.celestialBody ?? unlockedCelestialBodies[0];
	}

	let selectedCelestialBody = $state<CelestialBody | undefined>(findInitialBody());

	// Build the breadcrumb chain from selected body up to the highest unlocked ancestor
	const breadcrumbChain = $derived.by(() => {
		if (!selectedCelestialBody) return [];

		const unlockedBodyIds = new Set(unlockedCelestialBodies.map((body) => body.id));
		const chain: CelestialBody[] = [selectedCelestialBody];
		let current = selectedCelestialBody.orbits;

		while (current && unlockedBodyIds.has(current.id)) {
			chain.unshift(current);
			current = current.orbits;
		}

		return chain;
	});

	const breadcrumbs = $derived(
		breadcrumbChain.map((body) => `${body.name} ${body.classification.symbol}`)
	);

	// Find celestial bodies that orbit the selected body (children)
	const childCelestialBodies = $derived.by(() => {
		if (!selectedCelestialBody) return [];

		return unlockedCelestialBodies.filter((body) => body.orbits?.id === selectedCelestialBody?.id);
	});

	const selectedLocations = $derived.by(() => {
		if (!selectedCelestialBody) return [];
		return LocationService.getUnlocked().filter(
			(location) => location.celestialBody?.id === selectedCelestialBody?.id
		);
	});

	function handleNavigate(index: number) {
		selectedCelestialBody = breadcrumbChain[index];
	}

	function navigateToChild(body: CelestialBody) {
		selectedCelestialBody = body;
	}
</script>

<div class="space-y-4">
	{#if breadcrumbs.length > 0}
		<Breadcrumb {breadcrumbs} onNavigate={handleNavigate} />
	{/if}

	{#if childCelestialBodies.length > 0}
		<ul class="space-y-2">
			{#each childCelestialBodies as child (child.id)}
				<li>
					<button class="btn variant-soft-surface" onclick={() => navigateToChild(child)}>
						{child.name}
						{child.classification.symbol}
					</button>
				</li>
			{/each}
		</ul>
	{/if}

	{#each selectedLocations as location (location.id)}
		{@const buildings = BuildingService.getUnlockedAt(location)}
		<div>
			<h4 class="h4 ml-2 mb-2">{location.name}</h4>
			{#if buildings.length > 0}
				<div class="grid grid-cols-2 gap-x-6 gap-y-4">
					{#each buildings as building (building.id)}
						<Building {building} />
					{/each}
				</div>
			{:else}
				<p class="text-surface-500 ml-2">No buildings available</p>
			{/if}
		</div>
	{/each}
</div>
