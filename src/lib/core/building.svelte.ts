import type { Effect, EffectRecord } from '$lib/core/effect.svelte';

export type Location = {
	name: string,
	unlocked: boolean,
	buildings: Building[],
}
export const locationDefaults = {
	unlocked: false,
	buildings: [],
}

export const locations = $state<Record<string, Location>>({});

export function addLocation(location: Location) {
	if (locations.hasOwnProperty(location.name)) {
		throw new Error("Location with name '" + location.name + "' already exists");
	}
	locations[location.name] = location;
}

export type Building = {
	name: string,
	description: string,
	location: string,
	space: number,
	owned: number,
	effects: Record<string, EffectRecord>,
}
export const buildingDefaults = {
	description: "",
	space: 1,
	owned: 0,
	effects: {},
}

export const buildings = $state<Record<string, Building>>({});

const buildingEffects = $derived.by(() => {
	let out: Record<string, Record<string, Effect[]>> = {};
	for (const building of Object.values(buildings)) {
		for (const [effectName, effectRecord] of Object.entries(building.effects)) {
			if (!out.hasOwnProperty(effectName)) {
				out[effectName] = {};
			}
			let outEffect = out[effectName];
			for (const [key, value] of Object.entries(effectRecord)) {
				if (!outEffect.hasOwnProperty(key)) {
					outEffect[key] = [];
				}
				outEffect[key].push(value);
			}
		}
	}
	return out;
});
export function getBuildingEffects() {
	return buildingEffects;
}

const resourceProductionBaseEffects = $derived.by(() => {
	let value = $state(buildingEffects.resourceProductionBase as Record<string, Effect<number>[]>);
	return value;
});
export function getResourceProductionBaseEffects() {
	return resourceProductionBaseEffects;
}

export function addBuilding(building: Building) {
	if (buildings.hasOwnProperty(building.name)) {
		throw new Error("Building with name '" + building.name + "' already exists");
	}
	if (!(building.location in locations)) {
		throw new Error("Location '" + building.location + "' doesn't exist");
	}
	buildings[building.name] = building;
	locations[building.location].buildings.push(building);
}
