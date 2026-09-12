import { flushSync, mount, unmount, type Component } from 'svelte';

export interface UiInjection {
	id: string;
	target: string;
	component: Component;
}

type MountTarget = Parameters<typeof mount>[1]['target'];

interface UiRoot {
	querySelector(selector: string): MountTarget | null;
}

/** Mounts UI contributions in order so later mods can target DOM created by their dependencies. */
export function mountUiInjections(injections: UiInjection[], root: UiRoot, context: Map<unknown, unknown>): () => void {
	const mounted: Record<string, unknown>[] = [];

	try {
		for (const injection of injections) {
			const target = root.querySelector(injection.target);
			if (!target) {
				throw new Error(`UI injection "${injection.id}" could not find target "${injection.target}".`);
			}
			mounted.push(mount(injection.component, { target, context }));
			flushSync();
		}
	} catch (error) {
		for (const component of mounted.reverse()) void unmount(component);
		throw error;
	}

	return () => {
		for (const component of mounted.reverse()) void unmount(component);
	};
}
