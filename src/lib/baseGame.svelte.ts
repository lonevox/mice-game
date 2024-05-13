// This file contains the base game content.

import {
	addBuilding,
	addLocation,
	buildingDefaults, buildings, getBuildingEffects, getResourceProductionBaseEffects,
	locationDefaults
} from '$lib/core/building.svelte';
import { addResource, rarities, resourceDefaults } from '$lib/core/resource.svelte';
import { effect } from '$lib/core/effect.svelte';

export function load() {
	console.log("Loading base game...")

	// Locations
	addLocation({
		...locationDefaults,
		name: "Rath",
		unlocked: true,
	});

	// Buildings
	addBuilding({
		...buildingDefaults,
		name: "Foraging Zone",
		description: "An area reserved for poking around.",
		location: "Rath",
		space: 2,
		effects: {
			resourceProductionBase: {
				"Grain": effect(0.125, (v) => v * buildings["Foraging Zone"].owned),
			},
		},
	});
	addBuilding({
		...buildingDefaults,
		name: "Burrow",
		location: "Rath",
		effects: {
			resourceProductionBase: {
				"Grain": effect(0.5, (v) => v * buildings["Burrow"].owned),
			}
		},
	});

	// Resources
	addResource({
		...resourceDefaults,
		name: "Grain",
		rarity: rarities.Common,
	});
	addResource({
		...resourceDefaults,
		name: "Another Longer Thing",
		rarity: rarities.Uncommon,
	});
}
