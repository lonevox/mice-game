<script lang="ts">
	import { Tabs } from '@skeletonlabs/skeleton-svelte';
	import LocationTab from '$lib/base_game/components/LocationTab.svelte';
	import Resources from '$lib/base_game/components/Resources.svelte';
	import Log from '$lib/base_game/components/Log.svelte';
</script>

<div class="flex flex-row max-w-(--breakpoint-2xl) mx-auto mt-3 space-x-8">
	<div class="basis-1/4">
		<Resources />
	</div>
	<div class="basis-1/2">
		<Tabs defaultValue="tab1">
			<Tabs.List>
				<Tabs.Trigger value="tab1">Location</Tabs.Trigger>
				<Tabs.Trigger value="tab2">Society</Tabs.Trigger>
				<Tabs.Indicator />
			</Tabs.List>
			<Tabs.Content value="tab1">
				<LocationTab />
			</Tabs.Content>
			<Tabs.Content value="tab2">(tab panel 2 contents)</Tabs.Content>
		</Tabs>
	</div>
	<div class="basis-1/4">
		<Log />
	</div>
</div>
