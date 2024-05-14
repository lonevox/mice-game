export type EffectValue = string | number | boolean;
export type Effect<T = EffectValue> = {
	value: T,
}
export type EffectRecord<T = EffectValue> = Record<string, Effect<T>>;

export function effect<T>(initial: T, apply: (value: T) => T) {
	let value = $state<T>(initial);
	return {
		get value() { return apply(value); },
		get initial() { return initial; },
		set value(v) { value = v; },
	}
}

export function evaluateNumericEffects(effects: Effect<number>[]): number {
	let out = 0;
	for (const effect of effects) {
		out += effect.value;
	}
	return out;
}
