import { GameObject, type GameObjectConfig } from '$lib/core/gameObject.svelte';
import type { LinkablePropertyValue } from '$lib/core/effect.svelte';

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

type ResourceLinkableProperty = "maxAmount" | "production";
/**
 * Configures the base values for a Resource.
 */
type ResourceConfig = GameObjectConfig & {
	rarity?: Rarity,
	category?: ResourceCategory,
	amount?: number,
	linkablePropertyBaseValues?: Partial<Record<ResourceLinkableProperty, Partial<LinkablePropertyValue>>>,
}
export class Resource extends GameObject {
	// State
	rarity = $state<Rarity>(rarities.Common);
	category = $state<ResourceCategory>();
	amount = $state(0);

	// Linkable properties (defined here only for type benefits)
	maxAmount = $derived(0);
	production = $derived(0);

	constructor(resourceConfig: ResourceConfig) {
		super(resourceConfig, ["maxAmount", "production"]);

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
