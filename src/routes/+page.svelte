<script lang="ts">
	import { Tabs } from '@skeletonlabs/skeleton-svelte';
	import LocationTab from '$lib/components/LocationTab.svelte';
	import Resources from '$lib/components/Resources.svelte';
	import { data } from '$lib/base_game/baseGame.js';
	import Log from '$lib/components/Log.svelte';
	import AppBar from '$lib/components/AppBar.svelte';
	import { Game } from '$lib/core/game';
	import { onDestroy, onMount } from 'svelte';

	Game.loadMods([data]);

	onMount(() => {
		Game.start();
	});

	onDestroy(() => {
		Game.stop();
	});
</script>

<AppBar />
<div class="flex flex-row max-w-(--breakpoint-2xl) mx-auto mt-3 space-x-8">
	<div class="basis-1/4">
		<Resources />
	</div>
	<div class="basis-1/2">
		<Tabs defaultValue="tab1">
			<Tabs.List>
				<Tabs.Trigger value="tab1" class="font-bold">Field</Tabs.Trigger>
				<Tabs.Trigger value="tab2" class="font-bold">Society</Tabs.Trigger>
			</Tabs.List>
			<Tabs.Content value="tab1">
				<LocationTab />
			</Tabs.Content>
			<Tabs.Content value="tab2">
				(tab panel 2 contents)
			</Tabs.Content>
		</Tabs>
	</div>
	<div class="basis-1/4">
		<Log />
	</div>
</div>
