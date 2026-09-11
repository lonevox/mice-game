import { type DataComponent, type DataComponentRegistryImpl } from '$lib/core/registry/dataComponent';
import type { CelestialBodyClassification } from '$lib/base_game/data_components/celestialBodyClassification';

export interface CelestialBody extends DataComponent {
	unlocked: boolean;
	classificationId: string;
	orbitsId?: string;
}

export interface CelestialBodyConfig {
	id: string;
	name: string;
	classificationId: string;
	unlocked?: boolean;
	orbitsId?: string;
}

declare module '$lib/core/registry/dataComponentType' {
	interface DataComponentTypeRegistry {
		celestialBody: {
			type: CelestialBody;
			config: CelestialBodyConfig;
		};
	}
}

export class CelestialBodyService {
	static create(config: CelestialBodyConfig): CelestialBody {
		return {
			id: config.id,
			name: config.name,
			unlocked: config.unlocked ?? false,
			classificationId: config.classificationId,
			orbitsId: config.orbitsId,
		};
	}

	static validate(registry: DataComponentRegistryImpl): void {
		for (const celestialBody of this.getAll(registry)) {
			if (!registry.has('celestialBodyClassification', celestialBody.classificationId)) {
				throw new Error(
					`Celestial Body "${celestialBody.id}" references missing classification "${celestialBody.classificationId}".`,
				);
			}
			if (celestialBody.orbitsId && !registry.has('celestialBody', celestialBody.orbitsId)) {
				throw new Error(`Celestial Body "${celestialBody.id}" orbits missing body "${celestialBody.orbitsId}".`);
			}
		}
		this.validateOrbitHierarchy(registry);
	}

	private static validateOrbitHierarchy(registry: DataComponentRegistryImpl): void {
		const visited = new Set<string>();
		const visiting = new Set<string>();
		const path: CelestialBody[] = [];

		const visit = (body: CelestialBody): void => {
			if (visited.has(body.id)) return;
			if (visiting.has(body.id)) {
				const cycleStart = path.findIndex((candidate) => candidate.id === body.id);
				const cycle = [...path.slice(cycleStart), body].map((candidate) => candidate.id).join(' -> ');
				throw new Error(`Invalid Celestial Body orbit cycle: ${cycle}.`);
			}

			visiting.add(body.id);
			path.push(body);
			const parent = this.getParent(registry, body);
			if (parent) visit(parent);
			path.pop();
			visiting.delete(body.id);
			visited.add(body.id);
		};

		for (const celestialBody of this.getAll(registry)) {
			visit(celestialBody);
		}
	}

	static getAll(registry: DataComponentRegistryImpl): CelestialBody[] {
		return registry.getAll('celestialBody');
	}

	static getUnlocked(registry: DataComponentRegistryImpl): CelestialBody[] {
		return this.getAll(registry).filter((celestialBody) => celestialBody.unlocked);
	}

	static setUnlocked(registry: DataComponentRegistryImpl, celestialBodyId: string, unlocked: boolean): void {
		const celestialBody = registry.get('celestialBody', celestialBodyId);
		if (!celestialBody) throw new Error(`Celestial Body "${celestialBodyId}" does not exist.`);
		registry.replace('celestialBody', celestialBodyId, { ...celestialBody, unlocked });
	}

	static getParent(registry: DataComponentRegistryImpl, celestialBody: CelestialBody): CelestialBody | undefined {
		return celestialBody.orbitsId ? registry.get('celestialBody', celestialBody.orbitsId) : undefined;
	}

	static getChildren(registry: DataComponentRegistryImpl, celestialBody: CelestialBody): CelestialBody[] {
		return this.getUnlocked(registry).filter((body) => body.orbitsId === celestialBody.id);
	}

	static getClassification(
		registry: DataComponentRegistryImpl,
		celestialBody: CelestialBody,
	): CelestialBodyClassification {
		const classification = registry.get('celestialBodyClassification', celestialBody.classificationId);
		if (!classification) {
			throw new Error(
				`Celestial Body "${celestialBody.id}" references missing classification "${celestialBody.classificationId}".`,
			);
		}
		return classification;
	}
}
