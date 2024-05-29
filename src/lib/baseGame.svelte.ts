// This file contains the base game content.

import {
	addBuilding,
	addLocation, defaultBuildingConfig,
	locationDefaults
} from '$lib/core/building.svelte';
import { addResource, rarities } from '$lib/core/resource.svelte';
import { Link, multiply } from '$lib/core/effect.svelte';

export function load() {
	console.log("Loading base game...")

	//// Locations ////

	addLocation({
		...locationDefaults,
		name: "Rath",
		unlocked: true,
		buildings: [],
	});
	addLocation({
		...locationDefaults,
		name: "Nib",	// Moon of Rath
		unlocked: true, // TODO: unlocked only for testing purposes
		buildings: [],
	});

	//// Buildings ////

	// Rath
	addBuilding({
		...defaultBuildingConfig,
		name: "Burrow",
		location: "Rath",
		owned: 1,
		price: {
			"Grain": 10,
		},
		links: [
			Link.of("Building.Burrow.owned", "Resource.Mice.maxAmount", {
				operation: multiply(6),
			}),
		],
	});
	addBuilding({
		...defaultBuildingConfig,
		name: "Foraging Zone",
		description: "An area reserved for poking around.",
		location: "Rath",
		price: {
			"Grain": 10,
		},
		linkablePropertyBaseValues: {
			space: {
				flat: 2,
			},
		},
		links: [
			Link.of("Building.Foraging Zone.owned", "Resource.Grain.production", {
				operation: multiply(3),
			}),
		],
	});
	addBuilding({
		...defaultBuildingConfig,
		name: "Fortified Stump",
		description: "Castle on a hill of wood.",
		location: "Rath",
		price: {
			"Grain": 10,
		},
		links: [
			Link.of("Building.Fortified Stump.owned", "Resource.Grain.production", {
				operation: multiply(-0.05),
				alternativeType: "ratio",
			}),
		],
	});

	// Nib
	addBuilding({
		...defaultBuildingConfig,
		name: "Rover Factory",
		description: "Produces rovers to explore Nib.",
		location: "Nib",
		price: {
			"Grain": 10,
		},
		linkablePropertyBaseValues: {
			space: {
				flat: 2,
			},
		},
		links: [
			Link.of("Building.Rover Factory.owned", "Resource.Grain.production", {
				operation: multiply(1),
			}),
			Link.of("Building.Rover Factory.owned", "Resource.Mice.maxAmount", {
				operation: multiply(-6),
			}),
		],
	});

	//// Resources ////

	addResource({
		name: "Grain",
		description: "Food for your mice.",
		rarity: rarities.Common,
		amount: 20,
		linkablePropertyBaseValues: {
			maxAmount: {
				flat: 100,
			},
		},
	});
	addResource({
		name: "Mice",
		rarity: rarities.Common,
		amount: 1,
	});
	addResource({
		name: "Rats",
		rarity: rarities.Common,
	});
	addResource({
		name: "Another Longer Thing",
		rarity: rarities.Uncommon,
	});
}
