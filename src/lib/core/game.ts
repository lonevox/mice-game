import { dataComponentRegistry } from '$lib/core/registry/dataComponent';
import { ModLoader } from '$lib/core/modLoader';
import type { ModConfig } from '$lib/core/mod';
import { ResourceService } from '$lib/base_game/data_components/resource';

export class Game {
	static readonly registry = dataComponentRegistry;
	static readonly modLoader = new ModLoader();

	private static animationId: number | null = null;
	private static lastFrameTime = Date.now();

	/**
	 * Load mods into the game. Mods are sorted by dependencies automatically.
	 */
	static loadMods(mods: ModConfig[]): void {
		this.modLoader.loadMods(mods);
	}

	/**
	 * Start the game loop. Call this after mods are loaded.
	 */
	static start(): void {
		if (this.animationId !== null) {
			console.warn('Game loop already running');
			return;
		}

		this.lastFrameTime = Date.now();
		this.tick();
	}

	/**
	 * Stop the game loop.
	 */
	static stop(): void {
		if (this.animationId !== null) {
			cancelAnimationFrame(this.animationId);
			this.animationId = null;
		}
	}

	private static tick(): void {
		const now = Date.now();
		const deltaTime = (now - this.lastFrameTime) / 1000;
		this.lastFrameTime = now;

		this.update(deltaTime);

		this.animationId = requestAnimationFrame(() => this.tick());
	}

	private static update(deltaTime: number): void {
		for (const resource of ResourceService.getAll()) {
			ResourceService.applyProduction(resource, deltaTime);
		}
	}
}
