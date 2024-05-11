import { resources } from '$lib/core/resource.svelte';

export const ticksPerSecond = 5;

const tickInterval = setInterval(() => { tick() }, 1000 / ticksPerSecond);

function tick() {
	for (const resource of Object.values(resources)) {
		const gained = resource.production.value * resource.productionRatio;
		if (resource.amount + gained < resource.maxAmount) {
			resource.amount += gained;
		} else {
			resource.amount = resource.maxAmount;
		}
	}
}
