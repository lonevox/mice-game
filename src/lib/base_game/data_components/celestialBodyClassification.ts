import { type DataComponent } from '$lib/core/registry/dataComponent';

export interface CelestialBodyClassification extends DataComponent {
	symbol: string;
}

declare module '$lib/core/registry/dataComponentType' {
	interface DataComponentTypeRegistry {
		celestialBodyClassification: {
			type: CelestialBodyClassification;
			config: CelestialBodyClassification;
		};
	}
}
