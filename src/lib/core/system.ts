import type { DataComponentRegistryImpl } from '$lib/core/registry/dataComponent';

export interface GameSystem {
	id: string;
	update: (registry: DataComponentRegistryImpl, deltaTime: number) => void;
}
