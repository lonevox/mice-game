export type Rarity = {
	name: string,
	color: string,
}
export const Rarities: Record<string, Rarity> = {
	Common: {
		name: "Common",
		color: "white",
	},
	Uncommon: {
		name: "Uncommon",
		color: "green",
	}
}

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
	rarity: Rarities.Common,
	amount: 0,
	maxAmount: 100,
	production: 0,
	productionRatio: 0,
}
