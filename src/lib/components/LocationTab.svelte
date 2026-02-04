<script lang="ts">
	import { LocationService } from '$lib/base_game/data_components/location.js';
	import Building from '$lib/components/Building.svelte';

	const locations = $derived(LocationService.getUnlocked());
</script>

<div class="space-y-4">
	{#each locations as location (location.id)}
		<div>
			<h4 class="h4 ml-2 mb-2">{location.name}</h4>
			{#if location.buildings.length > 0}
				<div class="grid grid-cols-2 gap-x-6 gap-y-4">
					{#each location.buildings as building (building.id)}
						<Building {building} />
					{/each}
				</div>
			{:else}
				<p class="text-surface-500 ml-2">No buildings available</p>
			{/if}
		</div>
	{/each}
</div>
