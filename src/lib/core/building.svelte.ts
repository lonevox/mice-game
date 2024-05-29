import { resources } from '$lib/core/resource.svelte';
import type { LinkablePropertyValue } from '$lib/core/effect.svelte';
import { GameObject, type GameObjectConfig } from '$lib/core/gameObject.svelte';

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

type BuildingLinkableProperty = "space" | "priceRatio";
/**
 * Configures the base values for a Building.
 */
type BuildingConfig = GameObjectConfig & {
	location: string,
	owned?: number,
	price: Record<string, number>,
	linkablePropertyBaseValues?: Partial<Record<BuildingLinkableProperty, Partial<LinkablePropertyValue>>>,
}
export const defaultBuildingConfig = {
	linkablePropertyBaseValues: {
		space: { flat: 1, ratio: 1 },
		priceRatio: { flat: 1.15, ratio: 1 },
	},
}
export class Building extends GameObject {
	// State
	location = $state("");
	owned = $state(0);
	basePrice = $state<Record<string, number>>({});

	// Linkable properties (defined here only for type benefits)
	space = $derived(0);
	priceRatio = $derived(0);

	// Derived
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
		super(buildingConfig, ["space", "priceRatio"]);

		this.location = buildingConfig.location;
		this.basePrice = buildingConfig.price;

		// Optional properties
		if (buildingConfig.owned !== undefined) {
			this.owned = buildingConfig.owned;
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
