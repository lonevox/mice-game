import type { DataComponentRegistry, DataComponentRegistryImpl } from '$lib/core/registry/dataComponent';
import type { Link } from '$lib/core/types';
import type { DataComponentConfigRegistry } from '$lib/core/registry/dataComponentType';
import type { GameSystem } from '$lib/core/system';

export type DataComponentTypeDefinition<K extends keyof DataComponentRegistry = keyof DataComponentRegistry> = {
	dependencies?: (keyof DataComponentRegistry)[];
	service?: {
		create: (config: DataComponentConfigRegistry[K], registry: DataComponentRegistryImpl) => DataComponentRegistry[K];
		validate?: (registry: DataComponentRegistryImpl) => void;
	};
};

export type ModConfig = {
	/**
	 * Unique identifier for this mod.
	 */
	id: string;
	/**
	 * Display name for this mod.
	 */
	name: string;
	/**
	 * Optional description of what this mod adds.
	 */
	description?: string;
	/**
	 * Mod IDs that must be loaded before this mod.
	 * The base game has id 'base_game'.
	 */
	dependencies?: string[];
	/**
	 * Declares new DataComponent types with their metadata.
	 * The key is the type name, the value contains dependencies and service.
	 */
	dataComponentTypes?: {
		[K in keyof DataComponentRegistry]?: DataComponentTypeDefinition<K>;
	};
	/**
	 * Contains all DataComponent configs of the mod in arrays.
	 * Each key maps to an array of the appropriate config type for that DataComponent.
	 * Can include configs for types declared by other mods.
	 */
	dataComponents?: {
		[K in keyof DataComponentConfigRegistry]?: DataComponentConfigRegistry[K][];
	};
	/** Runtime systems contributed by this mod. */
	systems?: GameSystem[];
	/**
	 * Contains all Links that the mod declares. These links don't need to be between DataComponents
	 * of the mod; they can be between DataComponents of any mod.
	 */
	links?: Link[];
};
