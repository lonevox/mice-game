import { type DataComponent, dataComponentRegistry } from '$lib/core/registry/dataComponent';
import type { CelestialBody } from '$lib/base_game/data_components/celestialBody';

export interface Location extends DataComponent {
	unlocked: boolean;
	celestialBody: CelestialBody;
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
		const celestialBody = dataComponentRegistry.get('celestialBody', config.celestialBodyId);
		if (!celestialBody) {
			throw new Error(
				`Error creating Location: '${config.celestialBodyId}' is not a valid Celestial Body ID.`
			);
		}

		const location: Location = {
			id: config.id,
			name: config.name,
			unlocked: config.unlocked ?? false,
			celestialBody
		};
		dataComponentRegistry.register('location', location.id, location);
		return location;
	}

	static getAll(): Location[] {
		return dataComponentRegistry.getAll('location');
	}

	static getUnlocked(): Location[] {
		return this.getAll().filter((location) => location.unlocked);
	}
}
