import { resources } from '$lib/core/resource.svelte';

export const ticksPerSecond = 5;

const tickInterval = setInterval(() => { tick() }, 1000 / ticksPerSecond);

function tick() {
	for (const resource of Object.values(resources)) {
		if (resource.amount + resource.production < resource.maxAmount) {
			resource.amount += resource.production;
		} else {
			resource.amount = resource.maxAmount;
		}
	}
}
