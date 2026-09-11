import { type DataComponent, type DataComponentRegistryImpl } from '$lib/core/registry/dataComponent';

export interface Location extends DataComponent {
	unlocked: boolean;
	celestialBodyId: string;
}

export interface LocationConfig {
	id: string;
	name: string;
	unlocked?: boolean;
	celestialBodyId: string;
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
		return {
			id: config.id,
			name: config.name,
			unlocked: config.unlocked ?? false,
			celestialBodyId: config.celestialBodyId,
		};
	}

	static validate(registry: DataComponentRegistryImpl): void {
		for (const location of this.getAll(registry)) {
			if (!registry.has('celestialBody', location.celestialBodyId)) {
				throw new Error(`Location "${location.id}" references missing Celestial Body "${location.celestialBodyId}".`);
			}
		}
	}

	static getAll(registry: DataComponentRegistryImpl): Location[] {
		return registry.getAll('location');
	}

	static getUnlocked(registry: DataComponentRegistryImpl): Location[] {
		return this.getAll(registry).filter((location) => location.unlocked);
	}

	static setUnlocked(registry: DataComponentRegistryImpl, locationId: string, unlocked: boolean): void {
		const location = registry.get('location', locationId);
		if (!location) throw new Error(`Location "${locationId}" does not exist.`);
		registry.replace('location', locationId, { ...location, unlocked });
	}
}
