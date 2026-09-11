import { getContext, setContext } from 'svelte';
import type { Game } from '$lib/core/game';

const gameContextKey = Symbol('mice-game');

export function provideGame(game: Game): Game {
	setContext(gameContextKey, game);
	return game;
}

export function useGame(): Game {
	const game = getContext<Game | undefined>(gameContextKey);
	if (!game) throw new Error('Game context has not been initialized.');
	return game;
}
