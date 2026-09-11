import type { ModConfig } from './mod';
import type { DataComponentRegistry } from './registry/dataComponent';
import { dataComponentRegistry } from './registry/dataComponent';
import {
	getTypeDependencies,
	getTypeService,
	isTypeRegistered,
	registerDataComponentType
} from './registry/dataComponentType';
import { topologicalSort } from './util/topologicalSort';

export class ModLoader {
	private loadedMods = new Map<string, ModConfig>();

	/**
	 * Load multiple mods in the correct order based on dependencies.
	 */
	loadMods(mods: ModConfig[]): void {
		// Validate all mods have IDs
		for (const mod of mods) {
			if (!mod.id) {
				throw new Error(`Mod is missing required 'id' field: ${mod.name ?? 'unnamed'}`);
			}
		}

		// Check for duplicate IDs
		const ids = mods.map((m) => m.id);
		const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
		if (duplicates.length > 0) {
			throw new Error(`Duplicate mod IDs found: ${[...new Set(duplicates)].join(', ')}`);
		}

		// Create a map for quick lookup
		const modMap = new Map(mods.map((m) => [m.id, m]));

		// Validate dependencies exist
		for (const mod of mods) {
			for (const depId of mod.dependencies ?? []) {
				if (!modMap.has(depId)) {
					throw new Error(`Mod "${mod.id}" depends on "${depId}", but it's not in the load list`);
				}
			}
		}

		// Sort mods by dependencies
		const sortedMods = topologicalSort(mods, (mod) => {
			return (mod.dependencies ?? [])
				.map((depId) => modMap.get(depId))
				.filter((m): m is ModConfig => m !== undefined);
		});

		// Load in order
		for (const mod of sortedMods) {
			this.loadMod(mod);
		}
	}

	/**
	 * Load a single mod. Dependencies must already be loaded.
	 */
	private loadMod(modConfig: ModConfig): void {
		// Verify dependencies are loaded
		for (const depId of modConfig.dependencies ?? []) {
			if (!this.loadedMods.has(depId)) {
				throw new Error(`Cannot load mod "${modConfig.id}": dependency "${depId}" is not loaded`);
			}
		}

		// Register new DataComponent types from this mod
		if (modConfig.dataComponentTypes) {
			for (const [type, definition] of Object.entries(modConfig.dataComponentTypes)) {
				registerDataComponentType(type as keyof DataComponentRegistry, definition);
				dataComponentRegistry.initializeType(type as keyof DataComponentRegistry);
			}
		}

		// Register DataComponent instances
		if (modConfig.dataComponents) {
			const types = Object.keys(modConfig.dataComponents) as (keyof DataComponentRegistry)[];
			const sortedTypes = topologicalSort(types, (type) => getTypeDependencies(type));

			for (const type of sortedTypes) {
				if (!isTypeRegistered(type)) {
					throw new Error(
						`Mod "${modConfig.id}" tried to register DataComponents of type "${type}", ` +
							`but this type hasn't been defined. Add it to dataComponentTypes.`
					);
				}

				const configs = modConfig.dataComponents[type];
				if (configs) {
					const service = getTypeService(type);
					for (const config of configs) {
						if (service) {
							service.create(config);
						} else {
							dataComponentRegistry.register(type, (config as any).id, config as any);
						}
					}
					service?.finalize?.();
				}
			}
		}

		// Add links
		if (modConfig.links) {
			dataComponentRegistry.addLinks(modConfig.links);
		}

		this.loadedMods.set(modConfig.id, modConfig);
		console.log(`Loaded mod: ${modConfig.name} (${modConfig.id})`);
	}

	/**
	 * Check if a mod is loaded.
	 */
	isLoaded(modId: string): boolean {
		return this.loadedMods.has(modId);
	}

	/**
	 * Get all loaded mods.
	 */
	getLoadedMods(): ModConfig[] {
		return Array.from(this.loadedMods.values());
	}

	/**
	 * Get a loaded mod by ID.
	 */
	getMod(modId: string): ModConfig | undefined {
		return this.loadedMods.get(modId);
	}
}
