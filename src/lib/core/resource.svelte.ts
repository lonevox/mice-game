import { getResourceProductionBaseEffects } from '$lib/core/building.svelte';
import { evaluateNumericEffects } from '$lib/core/effect.svelte';
import { derived } from '$lib/core/util.svelte';

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

export type Category = {
	name: string,
	open: boolean,
}
export const categoryDefaults = {
	open: false,
}

export type Resource = {
	name: string,
	rarity: Rarity,
	category?: Category,
	amount: number,
	maxAmount: number,
	production: { readonly value: number },
	productionRatio: number,
}
export const resourceDefaults = {
	rarity: rarities.Common,
	amount: 0,
	maxAmount: 100,
	production: { value: 0 },
	productionRatio: 1,
}

export const resources = $state<Record<string, Resource>>({});

export function addResource(resource: Resource) {
	if (resource.hasOwnProperty(resource.name)) {
		throw new Error("Resource with name '" + resource.name + "' already exists");
	}
	resource.production = derived(() => {
		let effects = getResourceProductionBaseEffects();
		// TODO: Instead of the possibility of effects[resource.name] being undefined,
		//  resourceProductionBaseEffects should have all resources, not just the ones that have a
		//  resourceProductionBase effect.
		if (effects[resource.name] !== undefined) {
			return evaluateNumericEffects(effects[resource.name]);
		}
		return 0;
	});
	resources[resource.name] = resource;
}
