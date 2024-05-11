// This file contains the base game content.

import { addBuilding, addLocation, buildingDefaults, locationDefaults } from '$lib/core/building.svelte';
import { addResource, rarities, resourceDefaults } from '$lib/core/resource.svelte';

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
		location: "Rath",
		space: 2,
		// effects: new EffectSource({
		// 	resourceProductionBase: {
		// 		grain: () => 0.125 * this.owned,
		// 	},
		// 	eventChanceRatio: {
		// 		rainbow: () => 0.05 * this.owned,
		// 	},
		// 	enableEvent: {
		// 		rainbow: () => this.owned > 0,
		// 	},
		// }),
	});
	addBuilding({
		...buildingDefaults,
		name: "Burrow",
		location: "Rath",
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
