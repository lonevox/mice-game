import type { Resource } from './resource';
import type { Location } from './location';
import { type DataComponent, type DataComponentRegistryImpl } from '$lib/core/registry/dataComponent';
import { ReactiveProperty } from '$lib/core/registry/reactiveRegistry.svelte';

export interface BuildingCost {
	resourceId: string;
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
	locationId: string;
	unlocked: boolean;

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
	locationId: string;
	unlocked?: boolean;
	baseAmount?: number;
	basePriceScale?: number;
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
	static create(config: BuildingConfig, registry: DataComponentRegistryImpl): Building {
		return {
			id: config.id,
			name: config.name,
			description: config.description,
			icon: config.icon ?? '',
			basePrice: config.basePrice.map((cost) => ({ ...cost })),
			locationId: config.locationId,
			unlocked: config.unlocked ?? false,
			amount: registry.createProperty(`${config.id}_amount`, config.baseAmount ?? 0),
			priceMultiplier: registry.createProperty(`${config.id}_price_multiplier`, 1),
			priceScale: registry.createProperty(`${config.id}_price_scale`, config.basePriceScale ?? 1.15),
		};
	}

	static validate(registry: DataComponentRegistryImpl): void {
		for (const building of this.getAll(registry)) {
			if (!registry.has('location', building.locationId)) {
				throw new Error(`Building "${building.id}" references missing Location "${building.locationId}".`);
			}
			if (!Number.isInteger(building.amount.base) || building.amount.base < 0) {
				throw new Error(`Building "${building.id}" must have a non-negative integer amount.`);
			}
			if (!Number.isFinite(building.priceScale.base) || building.priceScale.base <= 0)
				throw new Error(`Building "${building.id}" must have a positive price scale.`);
			if (!Number.isFinite(building.priceMultiplier.base) || building.priceMultiplier.base <= 0)
				throw new Error(`Building "${building.id}" must have a positive price multiplier.`);

			const costResourceIds = new Set<string>();
			for (const cost of building.basePrice) {
				if (!registry.has('resource', cost.resourceId)) {
					throw new Error(`Building "${building.id}" references missing Resource "${cost.resourceId}".`);
				}
				if (!Number.isFinite(cost.amount) || cost.amount < 0) {
					throw new Error(`Building "${building.id}" has an invalid resource cost.`);
				}
				if (costResourceIds.has(cost.resourceId)) {
					throw new Error(`Building "${building.id}" has duplicate costs for Resource "${cost.resourceId}".`);
				}
				costResourceIds.add(cost.resourceId);
			}
		}
	}

	static getAll(registry: DataComponentRegistryImpl): Building[] {
		return registry.getAll('building');
	}

	static getUnlocked(registry: DataComponentRegistryImpl): Building[] {
		return this.getAll(registry).filter((building) => building.unlocked);
	}

	static getUnlockedAt(registry: DataComponentRegistryImpl, location: Location): Building[] {
		return this.getUnlocked(registry).filter((building) => building.locationId === location.id);
	}

	static setUnlocked(registry: DataComponentRegistryImpl, buildingId: string, unlocked: boolean): void {
		const building = registry.get('building', buildingId);
		if (!building) throw new Error(`Building "${buildingId}" does not exist.`);
		registry.replace('building', buildingId, { ...building, unlocked });
	}

	static buy(registry: DataComponentRegistryImpl, building: Building): boolean {
		// Check if player can afford
		for (const cost of building.basePrice) {
			const resource = this.getCostResource(registry, cost);
			const currentAmount = resource.amount.computed;
			const scaledPrice = this.getScaledPrice(building, cost);
			if (currentAmount < scaledPrice) {
				return false;
			}
		}

		// Deduct costs
		for (const cost of building.basePrice) {
			const resource = this.getCostResource(registry, cost);
			const scaledPrice = this.getScaledPrice(building, cost);
			resource.amount.base -= scaledPrice;
		}

		// Increment building count
		building.amount.base += 1;

		return true;
	}

	static sell(building: Building): boolean {
		if (building.amount.base <= 0) return false;
		building.amount.base -= 1;
		return true;
	}

	static getScaledPrice(building: Building, cost: BuildingCost): number {
		return (
			cost.amount * building.priceMultiplier.computed * Math.pow(building.priceScale.computed, building.amount.computed)
		);
	}

	static canAfford(registry: DataComponentRegistryImpl, building: Building): boolean {
		for (const cost of building.basePrice) {
			const resource = this.getCostResource(registry, cost);
			const scaledPrice = BuildingService.getScaledPrice(building, cost);
			if (resource.amount.computed < scaledPrice) {
				return false;
			}
		}
		return true;
	}

	static getCostResource(registry: DataComponentRegistryImpl, cost: BuildingCost): Resource {
		const resource = registry.get('resource', cost.resourceId);
		if (!resource) throw new Error(`Resource "${cost.resourceId}" does not exist.`);
		return resource;
	}
}
