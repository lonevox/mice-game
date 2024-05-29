import type { Link, LinkablePropertyValue } from '$lib/core/effect.svelte';
import { buildings } from '$lib/core/building.svelte';
import { computeLinks, getLinks, getLinksReversed } from '$lib/core/effect.svelte';
import { resources } from '$lib/core/resource.svelte';
import type { PropertyPairs } from '$lib/core/util.svelte';

/**
 * Configures the values for a GameObject.
 */
export type GameObjectConfig = {
	name: string,
	description?: string,
	linkablePropertyBaseValues?: Record<string, Partial<LinkablePropertyValue>>,
	links?: Link[],
}
export abstract class GameObject {
	/**
	 * Used as an identifier, so shouldn't be changed. Change displayName instead.
 	 */
	name: string;

	// State
	displayName = $state("");
	description = $state("");

	// Links that this GameObject creates
	links: Link[];

	incomingLinks = $derived<Link[]>(getLinks().filter(l => l.to.class === this.constructor.name && l.to.name === this.name));
	outgoingLinks = $derived<Link[]>(getLinks().filter(l => l.from.class === this.constructor.name && l.from.name === this.name));

	/**
	 * The values of change for properties that can be linked to. The change is determined by links to the property.
	 * This is automatically populated when you pass linkableProperties into the GameObject constructor.
	 */
	linkablePropertyChangeValues: Record<string, LinkablePropertyValue> = {};
	/**
	 * The base values of properties that can be linked to.
	 * This is automatically populated with default values when you pass linkableProperties into the GameObject
	 * constructor. The values can be overridden by passing config.linkablePropertyBaseValues into the GameObject
	 * constructor.
	 */
	linkablePropertyBaseValues = $state<Record<string, LinkablePropertyValue>>({});

	protected constructor(config: GameObjectConfig, linkableProperties: string[] = []) {
		this.name = config.name;
		this.displayName = this.name;
		this.description = config.description ?? "";
		this.links = config.links ?? [];
		this.createLinkableProperties(linkableProperties);
		// Overwrite linkable property base values with values from config
		if (config.linkablePropertyBaseValues !== undefined) {
			for (const [property, value] of Object.entries(config.linkablePropertyBaseValues)) {
				if (value.flat !== undefined) {
					this.linkablePropertyBaseValues[property].flat = value.flat;
				}
				if (value.ratio !== undefined) {
					this.linkablePropertyBaseValues[property].ratio = value.ratio;
				}
			}
		}
	}

	private createLinkableProperties(propertyNames: string[]) {
		const className = this.constructor.name;
		for (const propertyName of propertyNames) {
			// Create a property in this.linkablePropertyChangeValues that is derived from all the properties that link to the property.
			const valueFromLinks = $derived.by<LinkablePropertyValue>(() => {
				const fromProperties = getLinksToGameObjectProperty({
					class: className as GameObjectName,
					name: this.name,
					property: propertyName
				});
				return computeLinks(fromProperties);
			});
			Object.defineProperty(this.linkablePropertyChangeValues, propertyName, {
				get: () => { return valueFromLinks; },
			});

			// Create a property in this.linkablePropertyBaseValues with a default value.
			Object.defineProperty(this.linkablePropertyBaseValues, propertyName, {
				value: { flat: 0, ratio: 1 },
			});

			// Derive linkable property.
			const finalPropertyValue = $derived<number>(
				(this.linkablePropertyBaseValues[propertyName].flat + this.linkablePropertyChangeValues[propertyName].flat)
				* (this.linkablePropertyBaseValues[propertyName].ratio + this.linkablePropertyChangeValues[propertyName].ratio));
			Object.defineProperty(this, propertyName, {
				get: () => { return finalPropertyValue; }
			});
		}
	}

	getLinksToProperty(property: string): Link[] {
		return this.incomingLinks.filter(l => l.to.property === property);
	}
}

export type GameObjectName = "Building" | "Resource";
function isGameObjectName(candidate: string): candidate is GameObjectName {
	return candidate === "Building" || candidate === "Resource";
}

type GameObjectRecord<T> = Record<GameObjectName, T>;

/**
 * Represents a nested object of GameObject properties. Each property has a value of type T.
 * @example
 * {
 *   Building: { // GameObject class name
 *     "Burrow": { // GameObject instance name
 *       owned: T // GameObject property name and value
 *     }
 *   }
 * }
 */
export type PropertyTrios<T> = Partial<GameObjectRecord<PropertyPairs<T>>>;

export type GameObjectProperty = {
	class: GameObjectName,
	name: string,
	property: string,
};

export function gameObjectPropertyToString(gameObjectProperty: GameObjectProperty): string {
	return gameObjectProperty.class + "." + gameObjectProperty.name + "." + gameObjectProperty.property;
}

/**
 * Creates a GameObjectProperty from a string.
 * @param from String to create the GameObjectProperty from. The string must have the class, name,
 * and property split by full-stop characters. E.g. 'Building.Burrow.owned'.
 */
export function gameObjectProperty(from: string): GameObjectProperty {
	const split: string[] = from.split(".");
	if (split.length != 3) {
		throw new Error("Failed to create GameObjectProperty from string. The string must have" +
			" the class, name, and property split by full-stop characters. E.g. 'Building.Burrow.owned'.");
	}
	const className = split[0];
	if (isGameObjectName(className)) {
		return {
			class: className,
			name: split[1],
			property: split[2],
		};
	} else {
		throw new Error("Failed to create GameObjectProperty from string. '" + className +
			"' isn't a valid game object name.");
	}
}

export function getLinksToGameObjectProperty(gop: GameObjectProperty): PropertyTrios<Link> {
	const links = getLinksReversed()[gop.class]?.[gop.name]?.[gop.property] as PropertyTrios<Link> | undefined;
	if (links === undefined) {
		return {};
	}
	return links;
}

export function createDerivedFromGameObjectProperty(gop: GameObjectProperty): { readonly value: number } {
	switch (gop.class) {
		case "Building":
			const buildingPropertyValue = $derived(buildings[gop.name][gop.property]);
			return {
				get value() { return buildingPropertyValue; }
			};
		case "Resource":
			const resourcePropertyValue = $derived(resources[gop.name][gop.property]);
			return {
				get value() { return resourcePropertyValue; }
			};
		default:
			return gop.class satisfies never;
	}
}
