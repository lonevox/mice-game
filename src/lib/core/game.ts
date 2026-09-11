import type { ModConfig } from '$lib/core/mod';
import { ModLoader } from '$lib/core/modLoader';
import { DataComponentRegistryImpl } from '$lib/core/registry/dataComponent';
import { DataComponentTypeCatalog } from '$lib/core/registry/dataComponentType';

export class Game {
	readonly registry = new DataComponentRegistryImpl();
	readonly typeCatalog = new DataComponentTypeCatalog();
	readonly modLoader = new ModLoader(this.registry, this.typeCatalog);

	private intervalId: ReturnType<typeof setInterval> | undefined;
	private lastUpdateTime = Date.now();

	loadMods(mods: ModConfig[]): void {
		this.modLoader.loadMods(mods);
	}

	start(intervalMilliseconds = 20): void {
		if (this.intervalId !== undefined) return;
		this.lastUpdateTime = Date.now();
		this.intervalId = setInterval(() => this.tick(), intervalMilliseconds);
	}

	stop(): void {
		if (this.intervalId === undefined) return;
		clearInterval(this.intervalId);
		this.intervalId = undefined;
	}

	private tick(): void {
		const now = Date.now();
		const deltaTime = (now - this.lastUpdateTime) / 1000;
		this.lastUpdateTime = now;

		for (const system of this.modLoader.getSystems()) {
			system.update(this.registry, deltaTime);
		}
	}
}
