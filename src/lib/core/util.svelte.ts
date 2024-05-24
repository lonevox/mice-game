/**
 * Represents properties with T being their value type.
 * The shape of the type is:
 * @example
 * {
 *   objectName: {
 *     objectProperty: T
 *   }
 * }
 */
export type PropertyPairs<T> = Record<string, Record<string, T>>;

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

export function formatProduction(production: number): string {
	if (production > 0) {
		return "+" + formatDecimal(production) + "/s";
	}
	if (production < 0) {
		return "-" + formatDecimal(production) + "/s";
	}
	return "";
}

/**
 * Formats the ratio into a percentage string.
 *
 * Here's some example inputs and outputs:
 * - 1 -> ""
 * - 1.2 -> "+20%"
 * - 0.5 -> "-50%"
 * @param ratio The number to format.
 */
export function formatRatioAsPercentage(ratio: number): string {
	const percentageChange = (ratio * 100) - 100;
	if (percentageChange > 0) {
		return "+" + percentageChange.toFixed(0) + "%";
	}
	if (percentageChange < 0) {
		return "-" + percentageChange.toFixed(0) + "%";
	}
	return "";
}

/**
 * Formats seconds into a time left string.
 *
 * The resulting string is in the form "1d 1h 1m 1s". None of the numbers are decimals, unless there
 * is under 10 seconds left in which case the seconds are displayed with 1dp. If any values are 0,
 * they don't appear in the output (such as "1h 1m 1s" if the number of days is 0).
 * Will return an empty string if Infinity or NaN seconds are passed in.
 * @param seconds The number to format.
 */
export function formatTimeLeft(seconds: number): string {
		if (seconds === Infinity || isNaN(seconds)) {
			return "";
		}
		const d = Math.floor(seconds / (3600 * 24));
		const h = Math.floor(seconds % (3600 * 24) / 3600);
		const m = Math.floor(seconds % 3600 / 60);
		const s = seconds % 60;
		let out = "";
		if (d !== 0) {
			out += d + "d ";
		}
		if (h !== 0) {
			out += h + "h ";
		}
		if (m !== 0) {
			out += m + "m ";
		}
		if (m === 0 && s < 10) {
			return out + formatDecimal(s, 1) + "s";
		}
		return out + Math.floor(s) + "s";
}
