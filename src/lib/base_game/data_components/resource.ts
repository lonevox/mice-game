import { type DataComponent, type DataComponentRegistryImpl } from '$lib/core/registry/dataComponent.js';
import { ReactiveProperty } from '$lib/core/registry/reactiveRegistry.svelte.js';
import type { GameSystem } from '$lib/core/system';

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
	static create(config: ResourceConfig, registry: DataComponentRegistryImpl): Resource {
		const resource: Resource = {
			id: config.id,
			name: config.name,
			icon: config.icon ?? '',
			// Properties auto-register themselves with the registry
			amount: registry.createProperty(`${config.id}_amount`, config.baseAmount ?? 0),
			maxAmount: registry.createProperty(`${config.id}_max_amount`, config.baseMaxAmount ?? 0),
			production: registry.createProperty(`${config.id}_production`, config.baseProduction ?? 0),
		};
		return resource;
	}

	static validate(registry: DataComponentRegistryImpl): void {
		for (const resource of this.getAll(registry)) {
			const values = [resource.amount.base, resource.maxAmount.base, resource.production.base];
			if (values.some((value) => !Number.isFinite(value))) {
				throw new Error(`Resource "${resource.id}" has a non-finite base value.`);
			}
			if (resource.amount.base < 0 || resource.maxAmount.base < 0) {
				throw new Error(`Resource "${resource.id}" has a negative amount or maximum.`);
			}
		}
	}

	static getAll(registry: DataComponentRegistryImpl): Resource[] {
		return registry.getAll('resource');
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

export const resourceProductionSystem: GameSystem = {
	id: 'base_game.resource_production',
	update(registry, deltaTime) {
		for (const resource of ResourceService.getAll(registry)) {
			ResourceService.applyProduction(resource, deltaTime);
		}
	},
};
