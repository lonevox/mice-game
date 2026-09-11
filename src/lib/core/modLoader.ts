import type { DataComponent, DataComponentRegistry } from './registry/dataComponent';
import { DataComponentRegistryImpl } from './registry/dataComponent';
import type { DataComponentTypeDefinition, ModConfig } from './mod';
import { DataComponentTypeCatalog } from './registry/dataComponentType';
import type { GameSystem } from './system';
import { topologicalSort } from './util/topologicalSort';

/** Loads a batch atomically using declare, create, validate, and activate phases. */
export class ModLoader {
	private loadedMods = new Map<string, ModConfig>();
	private systems = new Map<string, GameSystem>();

	constructor(
		private registry: DataComponentRegistryImpl,
		private typeCatalog: DataComponentTypeCatalog,
	) {}

	loadMods(mods: ModConfig[]): void {
		this.validateModIds(mods);

		const activeMods = mods.filter((mod) => {
			const loaded = this.loadedMods.get(mod.id);
			if (!loaded) return true;
			if (loaded !== mod) {
				throw new Error(`A different mod with ID "${mod.id}" is already loaded.`);
			}
			return false;
		});
		if (activeMods.length === 0) return;

		const modMap = new Map(activeMods.map((mod) => [mod.id, mod]));
		for (const mod of activeMods) {
			for (const dependencyId of mod.dependencies ?? []) {
				if (!this.loadedMods.has(dependencyId) && !modMap.has(dependencyId)) {
					throw new Error(`Mod "${mod.id}" depends on missing mod "${dependencyId}".`);
				}
			}
		}

		const sortedMods = topologicalSort(
			activeMods,
			(mod) =>
				(mod.dependencies ?? [])
					.map((dependencyId) => modMap.get(dependencyId))
					.filter((dependency): dependency is ModConfig => dependency !== undefined),
			(mod) => mod.id,
		);

		this.validateSystems(sortedMods);
		const registryCheckpoint = this.registry.checkpoint();
		const typeCheckpoint = this.typeCatalog.checkpoint();

		try {
			this.declareTypes(sortedMods);
			this.validateTypeGraph();
			const sortedTypes = this.getSortedComponentTypes(sortedMods);
			this.validateComponentConfigs(sortedMods, sortedTypes);
			this.createComponents(sortedMods, sortedTypes);
			this.validateComponents(sortedTypes);

			const links = sortedMods.flatMap((mod) => mod.links ?? []);
			if (links.length > 0) this.registry.addLinks(links);

			for (const mod of sortedMods) {
				for (const system of mod.systems ?? []) this.systems.set(system.id, system);
				this.loadedMods.set(mod.id, mod);
				console.log(`Loaded mod: ${mod.name} (${mod.id})`);
			}
		} catch (error) {
			this.registry.restore(registryCheckpoint);
			this.typeCatalog.restore(typeCheckpoint);
			throw error;
		}
	}

	private validateModIds(mods: ModConfig[]): void {
		const ids = new Set<string>();
		for (const mod of mods) {
			if (!mod.id) throw new Error(`Mod is missing an ID: ${mod.name ?? 'unnamed'}.`);
			if (ids.has(mod.id)) throw new Error(`Duplicate mod ID in load batch: "${mod.id}".`);
			ids.add(mod.id);
		}
	}

	private validateSystems(mods: ModConfig[]): void {
		const ids = new Set(this.systems.keys());
		for (const mod of mods) {
			for (const system of mod.systems ?? []) {
				if (!system.id) throw new Error(`Mod "${mod.id}" contains a system without an ID.`);
				if (ids.has(system.id)) throw new Error(`Duplicate game system ID: "${system.id}".`);
				ids.add(system.id);
			}
		}
	}

	private declareTypes(mods: ModConfig[]): void {
		for (const mod of mods) {
			for (const [type, definition] of Object.entries(mod.dataComponentTypes ?? {})) {
				const typedType = type as keyof DataComponentRegistry;
				this.typeCatalog.register(typedType, definition as unknown as DataComponentTypeDefinition<typeof typedType>);
				this.registry.initializeType(typedType);
			}
		}
	}

	private getSortedComponentTypes(mods: ModConfig[]): (keyof DataComponentRegistry)[] {
		const types = [
			...new Set(mods.flatMap((mod) => Object.keys(mod.dataComponents ?? {}))),
		] as (keyof DataComponentRegistry)[];

		for (const type of types) {
			if (!this.typeCatalog.has(type)) {
				throw new Error(`DataComponents use undefined type "${String(type)}".`);
			}
		}

		const typeSet = new Set(types);
		return topologicalSort(
			types,
			(type) => this.typeCatalog.getDependencies(type).filter((dependency) => typeSet.has(dependency)),
			String,
		);
	}

	private validateTypeGraph(): void {
		const types = this.typeCatalog.getTypes();
		for (const type of types) {
			for (const dependency of this.typeCatalog.getDependencies(type)) {
				if (!this.typeCatalog.has(dependency)) {
					throw new Error(`DataComponent type "${String(type)}" depends on undefined type "${String(dependency)}".`);
				}
			}
		}
		topologicalSort(types, (type) => this.typeCatalog.getDependencies(type), String);
	}

	private validateComponentConfigs(mods: ModConfig[], types: (keyof DataComponentRegistry)[]): void {
		const idsByType = new Map<keyof DataComponentRegistry, Set<string>>();
		for (const type of types) idsByType.set(type, new Set(this.registry.getIds(type)));

		for (const mod of mods) {
			for (const type of types) {
				for (const config of mod.dataComponents?.[type] ?? []) {
					const component = config as { id?: unknown; name?: unknown };
					if (typeof component.id !== 'string' || component.id.length === 0) {
						throw new Error(`Mod "${mod.id}" has a ${String(type)} DataComponent without an ID.`);
					}
					if (typeof component.name !== 'string' || component.name.length === 0) {
						throw new Error(`${String(type)} DataComponent "${component.id}" does not have a valid name.`);
					}
					if (idsByType.get(type)!.has(component.id)) {
						throw new Error(`Duplicate ${String(type)} DataComponent ID: "${component.id}".`);
					}
					idsByType.get(type)!.add(component.id);
				}
			}
		}
	}

	private createComponents(mods: ModConfig[], types: (keyof DataComponentRegistry)[]): void {
		for (const type of types) {
			const service = this.typeCatalog.getDefinition(type)?.service;
			for (const mod of mods) {
				for (const config of mod.dataComponents?.[type] ?? []) {
					const instance: DataComponent = service
						? service.create(config as never, this.registry)
						: (config as DataComponent);
					this.registry.register(type, instance.id, instance as never);
				}
			}
		}
	}

	private validateComponents(types: (keyof DataComponentRegistry)[]): void {
		for (const type of types) {
			this.typeCatalog.getDefinition(type)?.service?.validate?.(this.registry);
		}
	}

	isLoaded(modId: string): boolean {
		return this.loadedMods.has(modId);
	}

	getLoadedMods(): ModConfig[] {
		return Array.from(this.loadedMods.values());
	}

	getMod(modId: string): ModConfig | undefined {
		return this.loadedMods.get(modId);
	}

	getSystems(): GameSystem[] {
		return Array.from(this.systems.values());
	}
}
