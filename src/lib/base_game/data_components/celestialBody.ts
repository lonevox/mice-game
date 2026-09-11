import { type DataComponent, dataComponentRegistry } from '$lib/core/registry/dataComponent';
import type { CelestialBodyClassification } from '$lib/base_game/data_components/celestialBodyClassification';

export interface CelestialBody extends DataComponent {
	unlocked: boolean;
	classification: CelestialBodyClassification;
	orbits?: CelestialBody;
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
	private static pendingOrbits = new Map<string, string>();

	static create(config: CelestialBodyConfig): CelestialBody {
		const classification = dataComponentRegistry.get(
			'celestialBodyClassification',
			config.classificationId
		);
		if (!classification) {
			throw new Error(
				`Error creating Celestial Body: '${config.classificationId}' is not a valid Celestial Body Classification ID.`
			);
		}

		const celestialBody: CelestialBody = {
			id: config.id,
			name: config.name,
			unlocked: config.unlocked ?? false,
			classification
		};
		if (config.orbitsId) {
			this.pendingOrbits.set(celestialBody.id, config.orbitsId);
		}
		dataComponentRegistry.register('celestialBody', celestialBody.id, celestialBody);
		return celestialBody;
	}

	static finalize(): void {
		for (const [bodyId, parentId] of this.pendingOrbits) {
			const celestialBody = dataComponentRegistry.get('celestialBody', bodyId);
			const parent = dataComponentRegistry.get('celestialBody', parentId);

			if (!celestialBody) {
				throw new Error(`Error resolving Celestial Body orbit: '${bodyId}' does not exist.`);
			}
			if (!parent) {
				throw new Error(
					`Error resolving Celestial Body '${bodyId}': '${parentId}' is not a valid Celestial Body ID.`
				);
			}

			celestialBody.orbits = parent;
		}

		this.validateOrbitHierarchy();
		this.pendingOrbits.clear();
	}

	private static validateOrbitHierarchy(): void {
		const visited = new Set<string>();
		const visiting = new Set<string>();
		const path: CelestialBody[] = [];

		const visit = (body: CelestialBody): void => {
			if (visited.has(body.id)) return;
			if (visiting.has(body.id)) {
				const cycleStart = path.findIndex((candidate) => candidate.id === body.id);
				const cycle = [...path.slice(cycleStart), body]
					.map((candidate) => candidate.id)
					.join(' -> ');
				throw new Error(`Invalid Celestial Body orbit cycle: ${cycle}.`);
			}

			visiting.add(body.id);
			path.push(body);
			if (body.orbits) visit(body.orbits);
			path.pop();
			visiting.delete(body.id);
			visited.add(body.id);
		};

		for (const celestialBody of this.getAll()) {
			visit(celestialBody);
		}
	}

	static getAll(): CelestialBody[] {
		return dataComponentRegistry.getAll('celestialBody');
	}

	static getUnlocked(): CelestialBody[] {
		return this.getAll().filter((celestialBody) => celestialBody.unlocked);
	}
}
