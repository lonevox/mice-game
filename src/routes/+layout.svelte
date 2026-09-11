<script lang="ts">
	import '../app.css';
	import { onDestroy, onMount } from 'svelte';
	import { data as baseGame } from '$lib/base_game/baseGame';
	import { Game } from '$lib/core/game';
	import { provideGame } from '$lib/core/gameContext';

	let { children } = $props();

	const game = provideGame(new Game());
	game.loadMods([baseGame]);

	onMount(() => game.start());
	onDestroy(() => game.stop());
</script>

{@render children()}
