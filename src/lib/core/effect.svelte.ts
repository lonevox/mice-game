import type { GameObjectName, GameObjectProperty, PropertyTrios } from '$lib/core/gameObject.svelte';
import { gameObjectProperty, gameObjectPropertyToString, gameObjectPropertyValue } from '$lib/core/gameObject.svelte';
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
 * In the below example, 'Building.Burrow.owned' is linked to 'Resource.Mice.maxAmount'. The value
 * of 'owned' is multiplied by 6, then the resulting value is added to 'maxAmount'.
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
 *   operation: {
 *     operator: "*",
 *     argument: 6,
 *     type: "flat"
 *   }
 * }
 */
export type Link = {
	from: GameObjectProperty,
	to: GameObjectProperty,
	config: LinkConfig,
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
 * 						  operation: multiply(6) // For each Burrow you own you gain 6 max Mice.
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
 * 						  operation: multiply(20) // For each Mouse House you own you gain 20 max Mice.
 * 						}
 * 					},
 * 					"Rats": {
 * 					  maxAmount: {
 * 					    operation: multiply(4) // For each Mouse House you own you gain 4 max Rats.
 * 					  }
 * 					}
 * 				}
 * 			}
 * 		}
 * 	}
 * }
 */
export type Links = PropertyTrios<PropertyTrios<LinkConfig>>;

export function link(from: string, to: string, config: LinkConfig): Link {
	const fromGOP = gameObjectProperty(from);
	const toGOP = gameObjectProperty(to);
	return {
		from: fromGOP,
		to: toGOP,
		config: config,
	}
}

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
			outLinksToName[toProperty] = link.config;
		} else {
			throw new Error("Duplicate link: '" + gameObjectPropertyToString(link.from) +
				" -> " + gameObjectPropertyToString(link.to) + "'");
		}
	}
	return outLinks;
}

export function computeLinks(linkConfigs: PropertyTrios<LinkConfig>): LinkedPropertyValue {
	let out: LinkedPropertyValue = {
		flat: 0,
		ratio: 1,
	};
	// TODO: Operation recalculation should only happen when the value of the link.from property changes.
	for (const [className, propertyPairs] of Object.entries(linkConfigs)) {
		for (const [name, properties] of Object.entries(propertyPairs)) {
			for (const [property, linkConfig] of Object.entries(properties)) {
				const fromProperty: GameObjectProperty = {
					class: className as GameObjectName,
					name: name,
					property: property
				};
				const computedValue = computeOperation(fromProperty, linkConfig.operation);
				// Increment the correct property
				switch (linkConfig.alternativeType) {
					case undefined:
						out.flat += computedValue;
						break;
					case "ratio":
						out.ratio += computedValue;
						break;
					default:
						return linkConfig.alternativeType satisfies never;
				}
			}
		}
	}
	return out;
}

function computeOperation(fromProperty: GameObjectProperty, operation: Operation): number {
	const propertyValue = gameObjectPropertyValue(fromProperty);
	switch (operation.operator) {
		case "*":
			return propertyValue * operation.argument;
		case "+":
			return propertyValue + operation.argument;
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
	return combineLinks(links);
});
/**
 * This is useful for finding all properties that a property links to.
 * @example
 * {
 *   Building: {
 *     "Burrow": {
 *       owned: { // This property effects the following properties...
 *         Resource: {
 *           "Mice": {
 *             maxAmount: multiply(6)
 *           },
 *           "Rats": {
 *             maxAmount: multiply(2)
 *           }
 *         }
 *       }
 *     }
 *   }
 * }
 */
export function getLinks() {
	return links;
}

const linksReversed = $derived.by(() => {
	const reversedLinks: Link[] = [];
	const gameObjectCollections = [buildings, resources];
	for (const gameObjectCollection of gameObjectCollections) {
		for (const gameObject of Object.values(gameObjectCollection)) {
			for (const link of gameObject.links) {
				reversedLinks.push({
					from: link.to,
					to: link.from,
					config: link.config,
				});
			}
		}
	}
	return combineLinks(reversedLinks);
});
/**
 * This is useful for finding all properties that are linked to a property.
 * @example
 * {
 *   Resource: {
 *     "Mice": {
 *       maxAmount: { // This property is effected by the following...
 *         Building: {
 *           "Burrow": {
 *             owned: multiply(6)
 *           },
 *           "Mouse House": {
 *             owned: multiply(20)
 *           }
 *         }
 *       }
 *     }
 *   }
 * }
 */
export function getLinksReversed() {
	return linksReversed;
}
