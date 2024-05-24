import { resources } from '$lib/core/resource.svelte';

const ticksPerSecond = 60;

/**
 * Starts the game loop. Should only be called once.
 */
export function start() {
	setInterval(() => { tick() }, 1000 / ticksPerSecond);
}

function tick() {
	for (const resource of Object.values(resources)) {
		const productionPerTick = resource.production / ticksPerSecond;
		if (resource.amount + productionPerTick < resource.maxAmount) {
			resource.amount += productionPerTick;
		} else {
			resource.amount = resource.maxAmount;
		}
	}
}
