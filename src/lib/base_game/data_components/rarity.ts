import { type DataComponent } from '$lib/core/registry/dataComponent';

export interface Rarity extends DataComponent {
	color: string;
}

declare module '$lib/core/registry/dataComponentType' {
	interface DataComponentTypeRegistry {
		rarity: {
			type: Rarity;
			config: Rarity;
		};
	}
}
