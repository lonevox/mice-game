import { resources } from '$lib/core/resource.svelte';
import type { Link } from '$lib/core/effect.svelte';
import { GameObject } from '$lib/core/gameObject.svelte';

export type Location = {
	name: string,
	unlocked: boolean,
	buildings: Building[],
}
export const locationDefaults = {
	unlocked: false,
}

export const locations = $state<Record<string, Location>>({});

export function addLocation(location: Location) {
	if (locations.hasOwnProperty(location.name)) {
		throw new Error("Location with name '" + location.name + "' already exists");
	}
	locations[location.name] = location;
}

/**
 * Configures the base values for a Building.
 */
type BuildingConfig = {
	name: string,
	description?: string,
	location: string,
	space?: number,
	owned?: number,
	price: Record<string, number>,
	priceRatio?: number,
	links?: Link[],
}
export class Building extends GameObject {
	// State
	location = $state("");
	baseSpace = $state(1);
	owned = $state(0);
	basePrice = $state<Record<string, number>>({});
	basePriceRatio = $state(1.15);

	// Derived
	space = $derived<number>(this.baseSpace + this.linkedPropertyValues["space"].flat * this.linkedPropertyValues["space"].ratio);
	priceRatio = $derived<number>(this.basePriceRatio + this.linkedPropertyValues["priceRatio"].flat * this.linkedPropertyValues["priceRatio"].ratio);
	price = $derived.by(() => {
		let out = Object.assign({} as Record<string, number>, this.basePrice);
		for (let i = 0; i < this.owned; i++) {
			for (const resource of Object.keys(out)) {
				out[resource] *= this.priceRatio;
			}
		}
		return out;
	});
	canAfford = $derived.by(() => {
		for (const [resource, price] of Object.entries(this.price)) {
			if (resources[resource].amount < price) {
				return false;
			}
		}
		return true;
	});

	constructor(buildingConfig: BuildingConfig) {
		super(buildingConfig.name,
			buildingConfig.description ?? "",
			buildingConfig.links ?? [],
			["space", "priceRatio"]);

		this.location = buildingConfig.location;
		this.basePrice = buildingConfig.price;

		// Optional properties
		if (buildingConfig.space !== undefined) {
			this.baseSpace = buildingConfig.space;
		}
		if (buildingConfig.owned !== undefined) {
			this.owned = buildingConfig.owned;
		}
		if (buildingConfig.priceRatio !== undefined) {
			this.basePriceRatio = buildingConfig.priceRatio;
		}
	}
}

export const buildings = $state<Record<string, Building>>({});

export function addBuilding(buildingConfig: BuildingConfig) {
	const building = new Building(buildingConfig);
	if (buildings.hasOwnProperty(building.name)) {
		throw new Error("Building with name '" + building.name + "' already exists");
	}
	if (!(building.location in locations)) {
		throw new Error("Location '" + building.location + "' doesn't exist");
	}
	buildings[building.name] = building;
	locations[building.location].buildings.push(building);
}

export function tryPurchaseBuilding(building: Building) {
	if (!building.canAfford) return;
	for (const [resource, amount] of Object.entries(building.price)) {
		resources[resource].amount -= amount;
	}
	building.owned += 1;
}
