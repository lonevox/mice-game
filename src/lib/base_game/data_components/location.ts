import type { Building } from '$lib/base_game/data_components/building.js';
import { type DataComponent, dataComponentRegistry } from '$lib/core/registry/dataComponent';

export interface Location extends DataComponent {
	unlocked: boolean;
	buildings: Building[];
}

export interface LocationConfig {
	id: string;
	name: string;
	unlocked?: boolean;
	buildingIds?: string[];
}

declare module '$lib/core/registry/dataComponentType' {
	interface DataComponentTypeRegistry {
		location: {
			type: Location;
			config: LocationConfig;
		};
	}
}

export class LocationService {
	static create(config: LocationConfig): Location {
		// Resolve building IDs to actual Building instances
		const buildings: Building[] = (config.buildingIds ?? [])
			.map((id) => dataComponentRegistry.get('building', id))
			.filter((b): b is Building => b !== undefined);

		const location: Location = {
			id: config.id,
			name: config.name,
			unlocked: config.unlocked ?? false,
			buildings
		};
		dataComponentRegistry.register('location', location.id, location);
		return location;
	}

	static getAll(): Location[] {
		return dataComponentRegistry.getAll('location');
	}

	static getUnlocked(): Location[] {
		return this.getAll().filter((loc) => loc.unlocked);
	}
}
