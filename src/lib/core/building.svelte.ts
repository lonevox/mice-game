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
	location: string,
	space: number,
	owned: number,
}
export const buildingDefaults = {
	space: 1,
	owned: 0,
}

export const buildings: Record<string, Building> = {};

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
