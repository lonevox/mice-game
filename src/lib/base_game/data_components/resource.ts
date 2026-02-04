import { type DataComponent, dataComponentRegistry } from '$lib/core/registry/dataComponent.js';
import { ReactiveProperty } from '$lib/core/registry/reactiveRegistry.svelte.js';

export interface Resource extends DataComponent {
	icon: string;
	amount: ReactiveProperty;
	maxAmount: ReactiveProperty;
	production: ReactiveProperty;
}

export interface ResourceConfig {
	id: string;
	name: string;
	icon?: string;
	baseAmount?: number;
	baseMaxAmount?: number;
	baseProduction?: number;
}

declare module '$lib/core/registry/dataComponentType' {
	interface DataComponentTypeRegistry {
		resource: {
			type: Resource;
			config: ResourceConfig;
		};
	}
}

export class ResourceService {
	static create(config: ResourceConfig): Resource {
		const resource: Resource = {
			id: config.id,
			name: config.name,
			icon: config.icon ?? '',
			// Properties auto-register themselves with the registry
			amount: dataComponentRegistry.createProperty(`${config.id}_amount`, config.baseAmount ?? 0),
			maxAmount: dataComponentRegistry.createProperty(
				`${config.id}_max_amount`,
				config.baseMaxAmount ?? 0
			),
			production: dataComponentRegistry.createProperty(
				`${config.id}_production`,
				config.baseProduction ?? 0
			)
		};
		dataComponentRegistry.register('resource', resource.id, resource);
		return resource;
	}

	static getAll(): Resource[] {
		return dataComponentRegistry.getAll('resource');
	}

	/**
	 * Apply production to a resource over a time delta.
	 * Clamps the result to [0, maxAmount].
	 */
	static applyProduction(resource: Resource, deltaTime: number): void {
		const produced = resource.production.computed * deltaTime;
		const newAmount = resource.amount.base + produced;
		const maxAmount = resource.maxAmount.computed;

		resource.amount.base = Math.max(0, Math.min(newAmount, maxAmount));
	}
}
