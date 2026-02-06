// core/registry/reactiveRegistry.svelte.ts
import type { Link, LinkContribution, ValueBreakdown } from '../types';

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
		private registry: ReactiveRegistry<any, any, any>
	) {
		this.base = baseValue;
		registry.registerProperty(this);
	}

	computed = $derived.by(() => {
		let result = this.base;
		if (this.links.length === 0) return result;

		const adds: number[] = [];
		const multiplies: number[] = [];

		for (const link of this.links) {
			const sourceValue = this.registry.getPropertyValue(link.from);
			const coefficient = link.coefficient ?? 1;
			const effectiveValue = sourceValue * coefficient;

			switch (link.type) {
				case 'add':
					adds.push(effectiveValue);
					break;
				case 'subtract':
					adds.push(-effectiveValue);
					break;
				case 'multiply':
					multiplies.push(effectiveValue);
					break;
				case 'divide':
					if (effectiveValue !== 0) {
						multiplies.push(1 / effectiveValue);
					}
					break;
			}
		}

		for (const add of adds) result += add;
		for (const multiply of multiplies) result *= multiply;

		return result;
	});

	setLinks(links: Link[]) {
		this.links = links;
	}

	getLinks(): Link[] {
		return this.links;
	}
}

export interface TypeRegistryMap {
	// Will be augmented by specific registry instances
}

/**
 * A unified registry that stores DataComponents AND manages reactive properties/links.
 * This merges the functionality of the old Registry and ReactiveEngine.
 */
export class ReactiveRegistry<
	TBase,
	TRegistryKey extends keyof TypeRegistryMap,
	TRegistry extends Record<string, TBase> = TypeRegistryMap[TRegistryKey] extends Record<
		string,
		TBase
	>
		? TypeRegistryMap[TRegistryKey]
		: Record<string, TBase>
> {
	// DataComponent storage (by type, then by id)
	private instances = $state<Map<string, Map<string, TBase>>>(new Map());

	// Reactive property storage (flat, by property id)
	private properties = $state<Map<string, ReactiveProperty>>(new Map());

	// All links in the system
	private allLinks = $state<Link[]>([]);

	constructor(private registryKey: TRegistryKey) {}

	// ============ DataComponent Methods ============

	register<K extends keyof TRegistry>(type: K, id: string, instance: TRegistry[K]): void {
		if (!this.instances.has(type as string)) {
			this.instances.set(type as string, new Map());
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
			this.instances.set(type as string, new Map());
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
		return this.properties.get(id)?.computed ?? 0;
	}

	/**
	 * Get the base value of a property by ID.
	 */
	getPropertyBaseValue(id: string): number {
		return this.properties.get(id)?.base ?? 0;
	}

	/**
	 * Set the base value of a property.
	 */
	setPropertyValue(id: string, value: number): void {
		const property = this.properties.get(id);
		if (property) {
			property.base = value;
		}
	}

	/**
	 * Increment a property's base value.
	 */
	incrementProperty(id: string, amount: number = 1): void {
		const property = this.properties.get(id);
		if (property) {
			property.base += amount;
		}
	}

	// ============ Link Methods ============

	addLink(link: Link): void {
		this.allLinks = [...this.allLinks, link];
		this.rebuildLinksForProperty(link.to);
	}

	addLinks(links: Link[]): void {
		this.allLinks = [...this.allLinks, ...links];
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
		return [
			...new Set(this.allLinks.filter((link) => link.from === sourceId).map((link) => link.to))
		];
	}

	getDependencies(targetId: string): string[] {
		return [
			...new Set(this.allLinks.filter((link) => link.to === targetId).map((link) => link.from))
		];
	}

	// ============ Value Breakdown & Debugging ============

	getValueBreakdown(targetId: string): ValueBreakdown {
		const baseValue = this.getPropertyBaseValue(targetId);
		const totalValue = this.getPropertyValue(targetId);
		const links = this.getLinksTo(targetId);

		const contributions: LinkContribution[] = links
			.map((link) => {
				const sourceValue = this.getPropertyValue(link.from);
				const coefficient = link.coefficient ?? 1;

				let contribution = 0;
				switch (link.type) {
					case 'add':
						contribution = sourceValue * coefficient;
						break;
					case 'subtract':
						contribution = -(sourceValue * coefficient);
						break;
					case 'multiply':
						contribution = baseValue * (sourceValue * coefficient - 1);
						break;
					case 'divide':
						if (sourceValue !== 0) {
							contribution = baseValue * (1 - 1 / (sourceValue * coefficient));
						}
						break;
					case 'set':
						contribution = sourceValue * coefficient - baseValue;
						break;
					case 'max':
					case 'min':
						contribution = 0;
						break;
				}

				return {
					link,
					sourceValue,
					contribution,
					effectiveCoefficient: coefficient
				};
			})
			.filter((c): c is LinkContribution => c !== null);

		return {
			baseValue,
			totalValue,
			contributions
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
						`${sign}${contrib.contribution.toFixed(2)} from ${label} (${contrib.sourceValue.toFixed(2)} × ${contrib.effectiveCoefficient})`
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
		this.instances = new Map();
		this.properties = new Map();
		this.allLinks = [];
	}

	clearLinks(): void {
		this.allLinks = [];
		for (const property of this.properties.values()) {
			property.setLinks([]);
		}
	}
}
