import type { DataComponentTypeDefinition } from '../mod';

/**
 * Maps DataComponent type keys to both their runtime type and config type.
 * Augmented by each data component file.
 */
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

const typeMetadata = new Map<keyof DataComponentTypeRegistry, DataComponentTypeDefinition>();

export function registerDataComponentType<K extends keyof DataComponentTypeRegistry>(
	type: K,
	metadata: DataComponentTypeDefinition = {}
): void {
	typeMetadata.set(type, metadata);
}

export function getTypeDependencies(
	type: keyof DataComponentTypeRegistry
): (keyof DataComponentTypeRegistry)[] {
	return (typeMetadata.get(type)?.dependencies ?? []) as (keyof DataComponentTypeRegistry)[];
}

export function getTypeService(
	type: keyof DataComponentTypeRegistry
): { create: (config: any) => any; finalize?: () => void } | undefined {
	return typeMetadata.get(type)?.service;
}

export function isTypeRegistered(type: keyof DataComponentTypeRegistry): boolean {
	return typeMetadata.has(type);
}
