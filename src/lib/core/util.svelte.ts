/**
 * Returns a getter for the result of a derived function.
 * The getter always returns the most recently computed value. This is useful if you want to have a
 * property with a derived value, as the {@link $derived} rune can only be applied to variable declarations.
 * @param fn
 */
export function derived<T>(fn: () => T) {
	let value = $derived.by<T>(fn);
	return {
		get value() { return value; }
	}
}

/**
 * Formats a number into a string with a given number of decimal places. Unlike {@link Number.toFixed},
 * if the input is a whole number then it won't be formatted with decimal places.
 * @param input The number to format.
 * @param decimalPlaces The number of decimal places to format the input to. Defaults to 2.
 */
export function formatDecimal(input: number, decimalPlaces: number = 2): string {
	if (Number.isInteger(input)) {
		return input.toString();
	}
	return input.toFixed(decimalPlaces);
}
