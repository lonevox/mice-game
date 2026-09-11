import type { DataComponentTypeDefinition } from '../mod';

/**
 * Maps DataComponent type keys to both their runtime type and config type.
 * Augmented by each data component file.
 */
// An empty declaration is intentional: data-component modules augment this registry.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DataComponentTypeRegistry {
	// Will be augmented: key -> { type: RuntimeType, config: ConfigType }
}

// Derive the separate registries from the unified one
export type DataComponentRegistry = {
	[K in keyof DataComponentTypeRegistry]: DataComponentTypeRegistry[K]['type'];
};
export type DataComponentConfigRegistry = {
	[K in keyof DataComponentTypeRegistry]: DataComponentTypeRegistry[K]['config'];
};

export class DataComponentTypeCatalog {
	private metadata = new Map<keyof DataComponentTypeRegistry, DataComponentTypeDefinition<never>>();

	register<K extends keyof DataComponentTypeRegistry>(type: K, metadata: DataComponentTypeDefinition<K> = {}): void {
		if (this.metadata.has(type)) {
			throw new Error(`DataComponent type "${String(type)}" is already registered.`);
		}
		this.metadata.set(type, metadata as unknown as DataComponentTypeDefinition<never>);
	}

	getDependencies(type: keyof DataComponentTypeRegistry): (keyof DataComponentTypeRegistry)[] {
		return (this.metadata.get(type)?.dependencies ?? []) as (keyof DataComponentTypeRegistry)[];
	}

	getDefinition(type: keyof DataComponentTypeRegistry): DataComponentTypeDefinition<never> | undefined {
		return this.metadata.get(type);
	}

	has(type: keyof DataComponentTypeRegistry): boolean {
		return this.metadata.has(type);
	}

	getTypes(): (keyof DataComponentTypeRegistry)[] {
		return Array.from(this.metadata.keys());
	}

	checkpoint(): Map<keyof DataComponentTypeRegistry, DataComponentTypeDefinition<never>> {
		return new Map(this.metadata);
	}

	restore(checkpoint: Map<keyof DataComponentTypeRegistry, DataComponentTypeDefinition<never>>): void {
		this.metadata = new Map(checkpoint);
	}
}
