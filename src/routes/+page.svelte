<script lang="ts">
	import { Tab, TabGroup } from '@skeletonlabs/skeleton';
	import LocationTab from '$lib/components/LocationTab.svelte';
	import Resources from '$lib/components/Resources.svelte';

	let tabSet = $state<number>(0);
</script>

<div class="flex flex-row max-w-screen-2xl mx-auto space-x-8">
	<div class="basis-1/4">
		<Resources />
	</div>
	<div class="basis-1/2">
		<TabGroup>
			<Tab bind:group={tabSet} name="tab1" value={0} class="font-bold">Field</Tab>
			<Tab bind:group={tabSet} name="tab2" value={1} class="font-bold">Society</Tab>
			<svelte:fragment slot="panel">
				{#if tabSet === 0}
					<LocationTab />
				{:else if tabSet === 1}
					(tab panel 2 contents)
				{/if}
			</svelte:fragment>
		</TabGroup>
	</div>
	<div class="basis-1/4">
		<h4 class="h4">Log</h4>
	</div>
</div>
