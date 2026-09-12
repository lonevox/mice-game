<script lang="ts">
	import AppBar from '$lib/components/AppBar.svelte';
	import { getAllContexts, onMount } from 'svelte';
	import { useGame } from '$lib/core/gameContext';
	import { mountUiInjections } from '$lib/core/ui';

	const game = useGame();
	const context = getAllContexts();

	onMount(() => mountUiInjections(game.modLoader.getUiInjections(), document, context));
</script>

<AppBar />
<div id="game-body"></div>
