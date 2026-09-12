<script lang="ts">
	import { LocationService } from '$lib/base_game/data_components/location';
	import Building from '$lib/base_game/components/Building.svelte';
	import { BuildingService } from '$lib/base_game/data_components/building';
	import { CelestialBodyService, type CelestialBody } from '$lib/base_game/data_components/celestialBody';
	import Breadcrumb from '$lib/components/Breadcrumb.svelte';
	import { useGame } from '$lib/core/gameContext';

	const game = useGame();
	const unlockedCelestialBodies = $derived(CelestialBodyService.getUnlocked(game.registry));

	function findInitialBody(): CelestialBody | undefined {
		const initialLocation = LocationService.getUnlocked(game.registry).find((location) =>
			unlockedCelestialBodies.some((body) => body.id === location.celestialBodyId),
		);
		return initialLocation
			? game.registry.get('celestialBody', initialLocation.celestialBodyId)
			: unlockedCelestialBodies[0];
	}

	let selectedCelestialBody = $state<CelestialBody | undefined>(findInitialBody());

	// Build the breadcrumb chain from selected body up to the highest unlocked ancestor
	const breadcrumbChain = $derived.by(() => {
		if (!selectedCelestialBody) return [];

		const unlockedBodyIds = new Set(unlockedCelestialBodies.map((body) => body.id));
		const chain: CelestialBody[] = [selectedCelestialBody];
		let current = CelestialBodyService.getParent(game.registry, selectedCelestialBody);

		while (current && unlockedBodyIds.has(current.id)) {
			chain.unshift(current);
			current = CelestialBodyService.getParent(game.registry, current);
		}

		return chain;
	});

	const breadcrumbs = $derived(
		breadcrumbChain.map((body) => `${body.name} ${CelestialBodyService.getClassification(game.registry, body).symbol}`),
	);

	// Find celestial bodies that orbit the selected body (children)
	const childCelestialBodies = $derived.by(() => {
		if (!selectedCelestialBody) return [];

		return CelestialBodyService.getChildren(game.registry, selectedCelestialBody);
	});

	const selectedLocations = $derived.by(() => {
		if (!selectedCelestialBody) return [];
		return LocationService.getUnlocked(game.registry).filter(
			(location) => location.celestialBodyId === selectedCelestialBody?.id,
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
						{CelestialBodyService.getClassification(game.registry, child).symbol}
					</button>
				</li>
			{/each}
		</ul>
	{/if}

	{#each selectedLocations as location (location.id)}
		{@const buildings = BuildingService.getUnlockedAt(game.registry, location)}
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
