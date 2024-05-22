import type { GameObjectName, GameObjectProperty, PropertyTrios } from '$lib/core/gameObject.svelte';
import { gameObjectProperty, gameObjectPropertyToString, gameObjectPropertyValue } from '$lib/core/gameObject.svelte';

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
// TODO: unsure if it is better to use linkConfigDefaults when making links or if
//  it is more clear
// export const linkConfigDefaults: LinkConfig = {
// 	operation: {
// 		operator: "*",
// 		argument: 1,
// 	},
// 	type: "flat",
// }

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
