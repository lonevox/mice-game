import type { Link, LinkConfig, LinkedPropertyValue } from '$lib/core/effect.svelte';
import { buildings } from '$lib/core/building.svelte';
import { computeLinks, getLinksReversed } from '$lib/core/effect.svelte';
import { resources } from '$lib/core/resource.svelte';
import type { PropertyPairs } from '$lib/core/util.svelte';

export abstract class GameObject {
	/**
	 * Used as an identifier, so shouldn't be changed. Change displayName instead.
 	 */
	name: string;

	// State
	displayName = $state("");
	description = $state("");

	// Links that this GameObject creates
	links: Link[] = [];

	/**
	 * The values of properties that can be linked to.
	 * This is automatically populated when you pass linkedProperties into the GameObject constructor.
	 */
	linkedPropertyValues: Record<string, LinkedPropertyValue> = {};

	protected constructor(name: string, description: string = "", links: Link[] = [], linkedProperties: string[] = []) {
		this.name = name;
		this.displayName = this.name;
		this.description = description;
		this.links = links;
		this.createLinkedProperties(linkedProperties);
	}

	private createLinkedProperties(propertyNames: string[]) {
		const className = this.constructor.name;
		for (const propertyName of propertyNames) {
			// Create a property in this.linkedPropertyValues that is derived from all the properties that link to it.
			const value = $derived.by<LinkedPropertyValue>(() => {
				const fromProperties = getLinksReversed()[className]?.[this.name]?.[propertyName] as PropertyTrios<LinkConfig> | undefined;
				if (fromProperties !== undefined) {
					return computeLinks(fromProperties);
				}
				return { flat: 0, ratio: 1 };
			});
			Object.defineProperty(this.linkedPropertyValues, propertyName, {
				get: () => { return value; },
			});
		}
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

export function gameObjectPropertyValue(gop: GameObjectProperty) {
	switch (gop.class) {
		case "Building":
			return buildings[gop.name][gop.property];
		case "Resource":
			return resources[gop.name][gop.property];
		default:
			return gop.class satisfies never;
	}
}
