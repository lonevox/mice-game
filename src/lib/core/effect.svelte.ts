import type { GameObjectProperty, PropertyTrios } from '$lib/core/gameObject.svelte';
import { gameObjectProperty, gameObjectPropertyToString, createDerivedFromGameObjectProperty } from '$lib/core/gameObject.svelte';
import { buildings } from '$lib/core/building.svelte';
import { resources } from '$lib/core/resource.svelte';

export type Operation = {
	operator: "*" | "+",
	argument: number,
}

export function multiply(argument: number): Operation {
	return {
		operator: "*",
		argument: argument,
	}
}

/**
 * Represents a link between two GameObject properties. The operation determines how the value of
 * the 'from' property effects the value of the 'to' property.
 *
 * In the below example, 'Building.Burrow.owned' is linked to 'Resource.Mice.maxAmount'. 'value' is
 * set to the value of 'owned' multiplied by 6. Later, in {@link computeLinks}, 'value' is added to
 * 'maxAmount'.
 * @example
 * {
 *   from: {
 *     class: "Building",
 *     name: "Burrow",
 *     property: "owned"
 *   },
 *   to: {
 *     class: "Resource",
 *     name: "Mice",
 *     property: "maxAmount"
 *   },
 *   config: {
 *     operation: {
 *       operator: "*",
 *       argument: 6,
 *     }
 *   },
 *   value: 0,
 * }
 */
export class Link {
	from: GameObjectProperty;
	to: GameObjectProperty;
	config: LinkConfig;
	private fromValue: { readonly value: number };
	value = $derived(computeOperation(this.fromValue.value, this.config.operation));

	constructor(from: GameObjectProperty, to: GameObjectProperty, config: LinkConfig) {
		this.from = from;
		this.to = to;
		this.config = config;
		this.fromValue = createDerivedFromGameObjectProperty(this.from);
	}

	static of(from: string, to: string, config: LinkConfig): Link {
		const fromGOP = gameObjectProperty(from);
		const toGOP = gameObjectProperty(to);
		return new Link(fromGOP, toGOP, config);
	}
}
/**
 * alternativeType:
 *
 * By default, the output value of the operation represents an additive change from the 'from' property
 * to the 'to' property. However, if alternativeType is set, the output value represents something
 * else. If alternativeType is 'ratio', then the value of the operation represents a ratio
 * change of the value of 'to' (default ratio is 1).
 */
export type LinkConfig = {
	operation: Operation,
	alternativeType?: "ratio",
	cap?: number,
}
export type LinkedPropertyValue = {
	flat: number,
	ratio: number,
}

/**
 * Represents a deeply nested object containing many links. The nesting means that parts of the
 * object tree can be looped through to find all properties that a property is linked to, among
 * other things.
 * @example
 * {
 * 	Building: {
 * 		"Burrow": {
 * 			owned: {
 * 				Resource: {
 * 					"Mice": {
 * 						maxAmount: {
 * 						  operation: Link {...} // For each Burrow you own you gain X max Mice.
 * 						}
 * 					}
 * 				}
 * 			}
 * 		},
 * 		"Mouse House": {
 * 			owned: {
 * 				Resource: {
 * 					"Mice": {
 * 						maxAmount: {
 * 						  operation: Link {...} // For each Mouse House you own you gain X max Mice.
 * 						}
 * 					},
 * 					"Rats": {
 * 					  maxAmount: {
 * 					    operation: Link {...} // For each Mouse House you own you gain X max Rats.
 * 					  }
 * 					}
 * 				}
 * 			}
 * 		}
 * 	}
 * }
 */
export type Links = PropertyTrios<PropertyTrios<Link>>;

/**
 * Combines links into a deep Links object.
 * @param links
 */
export function combineLinks(links: Link[]): Links {
	const outLinks: Links = {};
	for (const link of links) {
		const fromClass = link.from.class;
		if (!outLinks.hasOwnProperty(fromClass)) {
			outLinks[fromClass] = {};
		}
		const fromName = link.from.name;
		const outLinksFromClass = outLinks[fromClass]!;
		if (!outLinksFromClass.hasOwnProperty(fromName)) {
			outLinksFromClass[fromName] = {};
		}
		const fromProperty = link.from.property;
		const outLinksFromName = outLinksFromClass[fromName];
		if (!outLinksFromName.hasOwnProperty(fromProperty)) {
			outLinksFromName[fromProperty] = {};
		}
		const toClass = link.to.class;
		const outLinksFromProperty = outLinksFromName[fromProperty];
		if (!outLinksFromProperty.hasOwnProperty(toClass)) {
			outLinksFromProperty[toClass] = {};
		}
		const toName = link.to.name;
		const outLinksToClass = outLinksFromProperty[toClass]!;
		if (!outLinksToClass.hasOwnProperty(toName)) {
			outLinksToClass[toName] = {};
		}
		const toProperty = link.to.property;
		const outLinksToName = outLinksToClass[toName];
		if (!outLinksToName.hasOwnProperty(toProperty)) {
			outLinksToName[toProperty] = link;
		} else {
			throw new Error("Duplicate link: '" + gameObjectPropertyToString(link.from) +
				" -> " + gameObjectPropertyToString(link.to) + "'");
		}
	}
	return outLinks;
}

/**
 * Combines links into a deep Links object, but reversed so that the object structure is to->from->
 * value instead of from->to->value.
 * @param links
 */
export function combineLinksReversed(links: Link[]): Links {
	const outLinks: Links = {};
	for (const link of links) {
		const toClass = link.to.class;
		if (!outLinks.hasOwnProperty(toClass)) {
			outLinks[toClass] = {};
		}
		const toName = link.to.name;
		const outLinksFromClass = outLinks[toClass]!;
		if (!outLinksFromClass.hasOwnProperty(toName)) {
			outLinksFromClass[toName] = {};
		}
		const toProperty = link.to.property;
		const outLinksFromName = outLinksFromClass[toName];
		if (!outLinksFromName.hasOwnProperty(toProperty)) {
			outLinksFromName[toProperty] = {};
		}
		const fromClass = link.from.class;
		const outLinksFromProperty = outLinksFromName[toProperty];
		if (!outLinksFromProperty.hasOwnProperty(fromClass)) {
			outLinksFromProperty[fromClass] = {};
		}
		const fromName = link.from.name;
		const outLinksToClass = outLinksFromProperty[fromClass]!;
		if (!outLinksToClass.hasOwnProperty(fromName)) {
			outLinksToClass[fromName] = {};
		}
		const fromProperty = link.from.property;
		const outLinksToName = outLinksToClass[fromName];
		if (!outLinksToName.hasOwnProperty(fromProperty)) {
			outLinksToName[fromProperty] = link;
		} else {
			throw new Error("Duplicate link: '" + gameObjectPropertyToString(link.from) +
				" -> " + gameObjectPropertyToString(link.to) + "'");
		}
	}
	return outLinks;
}

export function computeLinks(links: PropertyTrios<Link>): LinkedPropertyValue {
	let out: LinkedPropertyValue = {
		flat: 0,
		ratio: 1,
	};
	for (const propertyPairs of Object.values(links)) {
		for (const properties of Object.values(propertyPairs)) {
			for (const link of Object.values(properties)) {
				// Increment the correct property
				switch (link.config.alternativeType) {
					case undefined:
						out.flat += link.value;
						break;
					case "ratio":
						out.ratio += link.value;
						break;
					default:
						return link.config.alternativeType satisfies never;
				}
			}
		}
	}
	return out;
}

function computeOperation(value: number, operation: Operation): number {
	switch (operation.operator) {
		case "*":
			return value * operation.argument;
		case "+":
			return value + operation.argument;
		default:
			return operation.operator satisfies never;
	}
}

const links = $derived.by(() => {
	const links: Link[] = [];
	const gameObjectCollections = [buildings, resources];
	for (const gameObjectCollection of gameObjectCollections) {
		for (const gameObject of Object.values(gameObjectCollection)) {
			links.push(...gameObject.links);
		}
	}
	return links;
});
export function getLinks() {
	return links;
}

const linksDeep = $derived(combineLinks(links));
/**
 * This is useful for finding all properties that a property links to.
 * @example
 * {
 *   Building: {
 *     "Burrow": {
 *       owned: { // This property effects the following properties...
 *         Resource: {
 *           "Mice": {
 *             maxAmount: Link {...}
 *           },
 *           "Rats": {
 *             maxAmount: Link {...}
 *           }
 *         }
 *       }
 *     }
 *   }
 * }
 */
export function getLinksDeep() {
	return linksDeep;
}

const linksDeepReversed = $derived(combineLinksReversed(links));
/**
 * This is useful for finding all properties that are linked to a property.
 * @example
 * {
 *   Resource: {
 *     "Mice": {
 *       maxAmount: { // This property is effected by the following...
 *         Building: {
 *           "Burrow": {
 *             owned: Link {...}
 *           },
 *           "Mouse House": {
 *             owned: Link {...}
 *           }
 *         }
 *       }
 *     }
 *   }
 * }
 */
export function getLinksReversed() {
	return linksDeepReversed;
}
