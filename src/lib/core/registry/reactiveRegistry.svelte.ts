// core/registry/reactiveRegistry.svelte.ts
import type { Link, LinkContribution, ValueBreakdown } from '../types';
import { SvelteMap } from 'svelte/reactivity';

interface ReactivePropertyRegistry {
	registerProperty(property: ReactiveProperty): void;
	evaluateLinks(baseValue: number, links: Link[]): number;
}

/**
 * A reactive property that can be linked to other properties.
 * Lives directly on DataComponents rather than in a separate engine.
 */
export class ReactiveProperty {
	base = $state(0);
	private links = $state<Link[]>([]);

	constructor(
		public readonly id: string,
		baseValue: number,
		private registry: ReactivePropertyRegistry,
	) {
		this.base = baseValue;
		registry.registerProperty(this);
	}

	computed = $derived.by(() => {
		return this.registry.evaluateLinks(this.base, this.links);
	});

	setLinks(links: Link[]) {
		this.links = links;
	}

	getLinks(): Link[] {
		return this.links;
	}
}

// An empty declaration is intentional: concrete registries augment this map.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TypeRegistryMap {
	// Will be augmented by specific registry instances
}

export type ReactiveRegistryCheckpoint<TBase> = {
	instances: Map<string, Map<string, TBase>>;
	properties: Map<string, ReactiveProperty>;
	links: Link[];
};

/**
 * A unified registry that stores DataComponents AND manages reactive properties/links.
 * This merges the functionality of the old Registry and ReactiveEngine.
 */
export class ReactiveRegistry<
	TBase,
	TRegistryKey extends keyof TypeRegistryMap,
	TRegistry extends Record<string, TBase> = TypeRegistryMap[TRegistryKey] extends Record<string, TBase>
		? TypeRegistryMap[TRegistryKey]
		: Record<string, TBase>,
> {
	// SvelteMap makes registrations and removals visible to derived UI queries.
	private instances = new SvelteMap<string, SvelteMap<string, TBase>>();
	private properties = new SvelteMap<string, ReactiveProperty>();

	// All links in the system
	private allLinks = $state<Link[]>([]);

	constructor(private registryKey: TRegistryKey) {}

	// ============ DataComponent Methods ============

	register<K extends keyof TRegistry>(type: K, id: string, instance: TRegistry[K]): void {
		if (!this.instances.has(type as string)) {
			this.instances.set(type as string, new SvelteMap());
		}
		if (this.instances.get(type as string)!.has(id)) {
			throw new Error(`Duplicate ${String(type)} DataComponent ID: "${id}".`);
		}
		this.instances.get(type as string)!.set(id, instance);
	}

	replace<K extends keyof TRegistry>(type: K, id: string, instance: TRegistry[K]): void {
		if (!this.instances.get(type as string)?.has(id)) {
			throw new Error(`Cannot replace missing ${String(type)} DataComponent "${id}".`);
		}
		this.instances.get(type as string)!.set(id, instance);
	}

	get<K extends keyof TRegistry>(type: K, id: string): TRegistry[K] | undefined {
		return this.instances.get(type as string)?.get(id) as TRegistry[K] | undefined;
	}

	getAll<K extends keyof TRegistry>(type: K): TRegistry[K][] {
		const typeMap = this.instances.get(type as string);
		return typeMap ? (Array.from(typeMap.values()) as TRegistry[K][]) : [];
	}

	getIds<K extends keyof TRegistry>(type: K): string[] {
		const typeMap = this.instances.get(type as string);
		return typeMap ? Array.from(typeMap.keys()) : [];
	}

	delete<K extends keyof TRegistry>(type: K, id: string): boolean {
		return this.instances.get(type as string)?.delete(id) ?? false;
	}

	has<K extends keyof TRegistry>(type: K, id: string): boolean {
		return this.instances.get(type as string)?.has(id) ?? false;
	}

	clear<K extends keyof TRegistry>(type: K): void {
		this.instances.get(type as string)?.clear();
	}

	count<K extends keyof TRegistry>(type: K): number {
		return this.instances.get(type as string)?.size ?? 0;
	}

	/**
	 * Check if a type has been initialized in the registry.
	 */
	hasType<K extends keyof TRegistry>(type: K): boolean {
		return this.instances.has(type as string);
	}

	/**
	 * Initialize a type in the registry. Call this before registering instances of that type.
	 */
	initializeType<K extends keyof TRegistry>(type: K): void {
		if (!this.instances.has(type as string)) {
			this.instances.set(type as string, new SvelteMap());
		}
	}

	/**
	 * Get all registered type names.
	 */
	getRegisteredTypes(): (keyof TRegistry)[] {
		return Array.from(this.instances.keys()) as (keyof TRegistry)[];
	}

	getAllInstances(): TBase[] {
		const results: TBase[] = [];
		for (const typeMap of this.instances.values()) {
			results.push(...Array.from(typeMap.values()));
		}
		return results;
	}

	// ============ Reactive Property Methods ============

	/**
	 * Register a reactive property. Called automatically by ReactiveProperty constructor.
	 */
	registerProperty(property: ReactiveProperty): void {
		if (this.properties.has(property.id)) {
			throw new Error(`Duplicate ReactiveProperty ID: "${property.id}".`);
		}
		this.properties.set(property.id, property);
		this.rebuildLinksForProperty(property.id);
	}

	/**
	 * Create and register a new reactive property in one step.
	 */
	createProperty(id: string, baseValue: number = 0): ReactiveProperty {
		return new ReactiveProperty(id, baseValue, this);
	}

	/**
	 * Get a reactive property by its ID.
	 */
	getProperty(id: string): ReactiveProperty | undefined {
		return this.properties.get(id);
	}

	/**
	 * Get the computed value of a property by ID.
	 */
	getPropertyValue(id: string): number {
		const property = this.properties.get(id);
		if (!property) throw new Error(`ReactiveProperty "${id}" does not exist.`);
		return property.computed;
	}

	/**
	 * Get the base value of a property by ID.
	 */
	getPropertyBaseValue(id: string): number {
		const property = this.properties.get(id);
		if (!property) throw new Error(`ReactiveProperty "${id}" does not exist.`);
		return property.base;
	}

	/**
	 * Set the base value of a property.
	 */
	setPropertyValue(id: string, value: number): void {
		const property = this.properties.get(id);
		if (!property) throw new Error(`ReactiveProperty "${id}" does not exist.`);
		property.base = value;
	}

	/**
	 * Increment a property's base value.
	 */
	incrementProperty(id: string, amount: number = 1): void {
		const property = this.properties.get(id);
		if (!property) throw new Error(`ReactiveProperty "${id}" does not exist.`);
		property.base += amount;
	}

	// ============ Link Methods ============

	addLink(link: Link): void {
		this.addLinks([link]);
	}

	addLinks(links: Link[]): void {
		const nextLinks = [...this.allLinks, ...links];
		this.validateLinks(nextLinks);
		this.allLinks = nextLinks;
		const affectedTargets = new Set(links.map((l) => l.to));
		for (const target of affectedTargets) {
			this.rebuildLinksForProperty(target);
		}
	}

	removeLink(from: string, to: string): void {
		this.allLinks = this.allLinks.filter((l) => !(l.from === from && l.to === to));
		this.rebuildLinksForProperty(to);
	}

	private rebuildLinksForProperty(propertyId: string): void {
		const property = this.properties.get(propertyId);
		if (property) {
			const linksForProperty = this.allLinks.filter((l) => l.to === propertyId);
			property.setLinks(linksForProperty);
		}
	}

	private validateLinks(links: Link[]): void {
		const keys = new Set<string>();
		const dependents = new Map<string, string[]>();

		for (const link of links) {
			if (!this.properties.has(link.from)) {
				throw new Error(`Link source ReactiveProperty "${link.from}" does not exist.`);
			}
			if (!this.properties.has(link.to)) {
				throw new Error(`Link target ReactiveProperty "${link.to}" does not exist.`);
			}
			if (link.coefficient !== undefined && !Number.isFinite(link.coefficient)) {
				throw new Error(`Link from "${link.from}" to "${link.to}" has an invalid coefficient.`);
			}

			const key = `${link.from}\u0000${link.to}\u0000${link.type}`;
			if (keys.has(key)) {
				throw new Error(`Duplicate ${link.type} link from "${link.from}" to "${link.to}".`);
			}
			keys.add(key);
			dependents.set(link.from, [...(dependents.get(link.from) ?? []), link.to]);
		}

		const visited = new Set<string>();
		const visiting = new Set<string>();
		const visit = (propertyId: string, path: string[]): void => {
			if (visited.has(propertyId)) return;
			if (visiting.has(propertyId)) {
				const cycleStart = path.indexOf(propertyId);
				throw new Error(`ReactiveProperty link cycle: ${[...path.slice(cycleStart), propertyId].join(' -> ')}.`);
			}
			visiting.add(propertyId);
			for (const dependent of dependents.get(propertyId) ?? []) visit(dependent, [...path, propertyId]);
			visiting.delete(propertyId);
			visited.add(propertyId);
		};

		for (const propertyId of this.properties.keys()) visit(propertyId, []);
	}

	evaluateLinks(baseValue: number, links: Link[]): number {
		// Link order is significant, allowing set/min/max to compose predictably.
		let result = baseValue;
		for (const link of links) {
			const effectiveValue = this.getPropertyValue(link.from) * (link.coefficient ?? 1);
			switch (link.type) {
				case 'add':
					result += effectiveValue;
					break;
				case 'subtract':
					result -= effectiveValue;
					break;
				case 'multiply':
					result *= effectiveValue;
					break;
				case 'divide':
					if (effectiveValue === 0) {
						throw new Error(`Cannot divide ReactiveProperty "${link.to}" by zero.`);
					}
					result /= effectiveValue;
					break;
				case 'set':
					result = effectiveValue;
					break;
				case 'max':
					result = Math.max(result, effectiveValue);
					break;
				case 'min':
					result = Math.min(result, effectiveValue);
					break;
			}
		}
		return result;
	}

	// ============ Link Query Methods ============

	getLinksTo(targetId: string): Link[] {
		return this.allLinks.filter((link) => link.to === targetId);
	}

	getLinksFrom(sourceId: string): Link[] {
		return this.allLinks.filter((link) => link.from === sourceId);
	}

	getLinksBetween(fromId: string, toId: string): Link[] {
		return this.allLinks.filter((link) => link.from === fromId && link.to === toId);
	}

	getDependents(sourceId: string): string[] {
		return [...new Set(this.allLinks.filter((link) => link.from === sourceId).map((link) => link.to))];
	}

	getDependencies(targetId: string): string[] {
		return [...new Set(this.allLinks.filter((link) => link.to === targetId).map((link) => link.from))];
	}

	// ============ Value Breakdown & Debugging ============

	getValueBreakdown(targetId: string): ValueBreakdown {
		const baseValue = this.getPropertyBaseValue(targetId);
		const links = this.getLinksTo(targetId);
		let runningValue = baseValue;
		const contributions: LinkContribution[] = links.map((link) => {
			const sourceValue = this.getPropertyValue(link.from);
			const nextValue = this.evaluateLinks(runningValue, [link]);
			const contribution = nextValue - runningValue;
			runningValue = nextValue;
			return {
				link,
				sourceValue,
				contribution,
				effectiveCoefficient: link.coefficient ?? 1,
			};
		});

		return {
			baseValue,
			totalValue: runningValue,
			contributions,
		};
	}

	explainValue(targetId: string): string {
		const breakdown = this.getValueBreakdown(targetId);

		if (breakdown.contributions.length === 0) {
			return `Base value: ${breakdown.baseValue.toFixed(2)}`;
		}

		const lines: string[] = [];
		lines.push(`Base: ${breakdown.baseValue.toFixed(2)}`);

		for (const contrib of breakdown.contributions) {
			const label = contrib.link.metadata?.label ?? contrib.link.from;
			const sign = contrib.contribution >= 0 ? '+' : '';

			switch (contrib.link.type) {
				case 'add':
				case 'subtract':
					lines.push(
						`${sign}${contrib.contribution.toFixed(2)} from ${label} (${contrib.sourceValue.toFixed(2)} × ${contrib.effectiveCoefficient})`,
					);
					break;
				case 'multiply':
					lines.push(`×${contrib.effectiveCoefficient} from ${label}`);
					break;
				case 'divide':
					lines.push(`÷${contrib.effectiveCoefficient} from ${label}`);
					break;
			}
		}

		lines.push(`= ${breakdown.totalValue.toFixed(2)}`);
		return lines.join('\n');
	}

	// ============ Reset & Cleanup ============

	clearAll(): void {
		this.instances.clear();
		this.properties.clear();
		this.allLinks = [];
	}

	clearLinks(): void {
		this.allLinks = [];
		for (const property of this.properties.values()) {
			property.setLinks([]);
		}
	}

	checkpoint(): ReactiveRegistryCheckpoint<TBase> {
		return {
			instances: new Map(Array.from(this.instances, ([type, values]) => [type, new Map(values)] as const)),
			properties: new Map(this.properties),
			links: [...this.allLinks],
		};
	}

	restore(checkpoint: ReactiveRegistryCheckpoint<TBase>): void {
		this.instances.clear();
		for (const [type, values] of checkpoint.instances) {
			this.instances.set(type, new SvelteMap(values));
		}
		this.properties.clear();
		for (const [id, property] of checkpoint.properties) this.properties.set(id, property);
		this.allLinks = [...checkpoint.links];
		for (const property of this.properties.values()) this.rebuildLinksForProperty(property.id);
	}
}
