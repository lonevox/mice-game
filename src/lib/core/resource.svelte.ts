import type { Link } from '$lib/core/effect.svelte';
import { GameObject } from '$lib/core/gameObject.svelte';

export type Rarity = {
	name: string,
	color: string,
}
export const rarities = $state<Record<string, Rarity>>({
	Common: {
		name: "Common",
		color: "white",
	},
	Uncommon: {
		name: "Uncommon",
		color: "green",
	}
});

export type ResourceCategory = {
	name: string,
	open: boolean,
}
export const categoryDefaults = {
	open: false,
}

/**
 * Configures the base values for a Resource.
 */
type ResourceConfig = {
	name: string,
	description?: string,
	rarity?: Rarity,
	category?: ResourceCategory,
	amount?: number,
	maxAmount?: number,
	production?: number,
	links?: Link[],
}
export class Resource extends GameObject {
	// State
	rarity = $state<Rarity>(rarities.Common);
	category = $state<ResourceCategory>();
	amount = $state(0);
	baseMaxAmount = $state(0);
	baseProduction = $state(0);

	// Derived
	maxAmount = $derived<number>(this.baseMaxAmount + this.linkedPropertyValues["maxAmount"].flat * this.linkedPropertyValues["maxAmount"].ratio);
	production = $derived<number>(this.baseProduction + this.linkedPropertyValues["production"].flat * this.linkedPropertyValues["production"].ratio);

	constructor(resourceConfig: ResourceConfig) {
		super(resourceConfig.name,
			resourceConfig.description ?? "",
			resourceConfig.links ?? [],
			["maxAmount", "production"]);

		// Optional properties
		if (resourceConfig.rarity !== undefined) {
			this.rarity = resourceConfig.rarity;
		}
		if (resourceConfig.category !== undefined) {
			this.category = resourceConfig.category;
		}
		if (resourceConfig.amount !== undefined) {
			this.amount = resourceConfig.amount;
		}
		if (resourceConfig.maxAmount !== undefined) {
			this.baseMaxAmount = resourceConfig.maxAmount;
		}
		if (resourceConfig.production !== undefined) {
			this.baseProduction = resourceConfig.production;
		}
	}
}

export const resources = $state<Record<string, Resource>>({});

export function addResource(resourceConfig: ResourceConfig) {
	const resource = new Resource(resourceConfig);
	if (resource.hasOwnProperty(resource.name)) {
		throw new Error("Resource with name '" + resource.name + "' already exists");
	}
	resources[resource.name] = resource;
}
