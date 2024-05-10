export type Building = {
	name: string,
	location: string,
	space: number,
	owned: number,
}
export const buildings: Record<string, Building> = {
	foragingZone: {
		name: "Foraging Zone",
		location: "Rath",
		space: 2,
		owned: 0,
	},
	burrow: {
		name: "Burrow",
		location: "Rath",
		space: 1,
		owned: 0,
	},
}

export type Location = {
	name: string,
	unlocked: boolean,
	buildings: Building[],
}
export const locations = $state<Record<string, Location>>({
	rath: {
		name: "Rath",
		unlocked: true,
		buildings: [buildings.foragingZone, buildings.burrow],
	}
});
