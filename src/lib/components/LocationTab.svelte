<script lang="ts">
	import { locations } from '$lib/core/building.svelte';
	import Building from '$lib/components/Building.svelte';
</script>

{#each Object.values(locations) as location}
	<h4 class="h4">{location.name}</h4>
	<div class="grid grid-cols-2 gap-2">
		{#each location.buildings as building, i}
			<Building bind:building={location.buildings[i]} />
		{/each}
	</div>
{/each}
