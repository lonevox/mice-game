// This file contains the base game content.

import {
	addBuilding,
	addLocation,
	locationDefaults
} from '$lib/core/building.svelte';
import { addResource, rarities } from '$lib/core/resource.svelte';
import { link, multiply } from '$lib/core/effect.svelte';

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
		name: "Burrow",
		location: "Rath",
		owned: 1,
		price: {
			"Grain": 10,
		},
		links: [
			link("Building.Burrow.owned", "Resource.Mice.maxAmount", {
				operation: multiply(6),
			}),
		],
	});
	addBuilding({
		name: "Foraging Zone",
		description: "An area reserved for poking around.",
		location: "Rath",
		space: 2,
		price: {
			"Grain": 10,
		},
		links: [
			link("Building.Foraging Zone.owned", "Resource.Grain.production", {
				operation: multiply(0.125),
			}),
		],
	});
	addBuilding({
		name: "Fortified Stump",
		description: "Castle on a hill of wood.",
		location: "Rath",
		space: 2,
		price: {
			"Grain": 10,
		},
		links: [
			link("Building.Fortified Stump.owned", "Resource.Grain.production", {
				operation: multiply(0.05),
				alternativeType: "ratio",
			}),
		],
	});

	// Nib
	addBuilding({
		name: "Rover Factory",
		description: "Produces rovers to explore Nib.",
		location: "Nib",
		space: 2,
		price: {
			"Grain": 10,
		},
	});

	//// Resources ////

	addResource({
		name: "Grain",
		description: "Food for your mice.",
		rarity: rarities.Common,
		maxAmount: 5000,
		amount: 20,
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
