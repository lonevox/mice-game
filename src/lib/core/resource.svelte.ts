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
	production: number,
	productionRatio: number,
}
export const resourceDefaults = {
	rarity: rarities.Common,
	amount: 1,
	maxAmount: 100,
	production: 0,
	productionRatio: 1,
}

export const resources = $state<Record<string, Resource>>({});

export function addResource(resource: Resource) {
	if (resource.hasOwnProperty(resource.name)) {
		throw new Error("Resource with name '" + resource.name + "' already exists");
	}
	resources[resource.name] = resource;
}
