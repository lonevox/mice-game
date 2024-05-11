import { resources } from '$lib/core/resource.svelte';

export const ticksPerSecond = 5;

const tickInterval = setInterval(() => { tick() }, 1000 / ticksPerSecond);

function tick() {
	for (let i = 0; i < resources.length; i++) {
		const resource = resources[i];
		const gained = resource.production * resource.productionRatio;
		if (resource.amount + gained < resource.maxAmount) {
			resources[i].amount += gained;
		} else {
			resources[i].amount = resource.maxAmount;
		}
	}

	// TODO: The following might work instead of the above code.

	// for (const resource of resources) {
	// 	const gained = resource.production * resource.productionRatio;
	// 	if (resource.amount + gained < resource.maxAmount) {
	// 		resource.amount += gained;
	// 	} else {
	// 		resource.amount = resource.maxAmount;
	// 	}
	// }
}
