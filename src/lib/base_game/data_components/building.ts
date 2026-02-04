import { type Resource } from './resource.js';
import { type DataComponent, dataComponentRegistry } from '$lib/core/registry/dataComponent.js';
import { ReactiveProperty } from '$lib/core/registry/reactiveRegistry.svelte.js';

export interface BuildingCost {
	resource: Resource;
	amount: number;
}

export interface BuildingCostConfig {
	resourceId: string;
	amount: number;
}

export interface Building extends DataComponent {
	description?: string;
	icon?: string;
	basePrice: BuildingCost[];

	amount: ReactiveProperty;
	priceMultiplier: ReactiveProperty;
	priceScale: ReactiveProperty;
}

export interface BuildingConfig {
	id: string;
	name: string;
	description?: string;
	icon?: string;
	basePrice: BuildingCostConfig[];
	basePriceScale?: number;
	baseAmount?: number;
}

declare module '$lib/core/registry/dataComponentType' {
	interface DataComponentTypeRegistry {
		building: {
			type: Building;
			config: BuildingConfig;
		};
	}
}

export class BuildingService {
	static create(config: BuildingConfig): Building {
		// Resolve resource IDs to actual Resource instances
		const basePrice: BuildingCost[] = config.basePrice
			.map((cost) => {
				const resource = dataComponentRegistry.get('resource', cost.resourceId);
				if (!resource) {
					console.warn(`Resource "${cost.resourceId}" not found for building "${config.id}"`);
					return null;
				}
				return { resource, amount: cost.amount };
			})
			.filter((cost): cost is BuildingCost => cost !== null);

		const building: Building = {
			id: config.id,
			name: config.name,
			description: config.description,
			icon: config.icon ?? '',
			basePrice,
			amount: dataComponentRegistry.createProperty(`${config.id}_amount`, config.baseAmount ?? 0),
			priceMultiplier: dataComponentRegistry.createProperty(`${config.id}_price_multiplier`, 1),
			priceScale: dataComponentRegistry.createProperty(
				`${config.id}_price_scale`,
				config.basePriceScale ?? 1.15
			)
		};
		dataComponentRegistry.register('building', building.id, building);
		return building;
	}

	static getAll(): Building[] {
		return dataComponentRegistry.getAll('building');
	}

	static buy(building: Building): boolean {
		// Check if player can afford
		for (const cost of building.basePrice) {
			const currentAmount = cost.resource.amount.computed;
			const scaledPrice =
				cost.amount * Math.pow(building.priceScale.computed, building.amount.computed);
			if (currentAmount < scaledPrice) {
				return false;
			}
		}

		// Deduct costs
		for (const cost of building.basePrice) {
			const scaledPrice =
				cost.amount * Math.pow(building.priceScale.computed, building.amount.computed);
			cost.resource.amount.base -= scaledPrice;
		}

		// Increment building count
		building.amount.base += 1;

		return true;
	}

	static sell(building: Building) {
		building.amount.base -= 1;
	}

	static getScaledPrice(building: Building, cost: BuildingCost): number {
		return cost.amount * Math.pow(building.priceScale.computed, building.amount.computed);
	}

	static canAfford(building: Building): boolean {
		for (const cost of building.basePrice) {
			const scaledPrice = BuildingService.getScaledPrice(building, cost);
			if (cost.resource.amount.computed < scaledPrice) {
				return false;
			}
		}
		return true;
	}
}
