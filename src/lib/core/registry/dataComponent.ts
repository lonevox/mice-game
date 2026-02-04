import { ReactiveRegistry } from './reactiveRegistry.svelte.js';
import type { DataComponentRegistry } from './dataComponentType';

/**
 * The most basic form of data in the game. It should be extended to add more game features
 * (e.g. Building or Resource) in order to be compatible with the reactive system.
 */
export interface DataComponent {
	id: string;
	name: string;
}

declare module './reactiveRegistry.svelte.js' {
	interface TypeRegistryMap {
		DataComponentRegistry: DataComponentRegistry;
	}
}

class DataComponentRegistryImpl extends ReactiveRegistry<
	DataComponent,
	'DataComponentRegistry',
	DataComponentRegistry
> {
	constructor() {
		super('DataComponentRegistry');
	}
}

export const dataComponentRegistry = new DataComponentRegistryImpl();

// Re-export for convenience
export type { DataComponentRegistry, DataComponentConfigRegistry } from './dataComponentType';
