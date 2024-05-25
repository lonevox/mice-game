<script lang="ts">
	import { popup } from '@skeletonlabs/skeleton';
	import { resources } from '$lib/core/resource.svelte';
	import { formatDecimal, formatProduction, formatRatioAsPercentage } from '$lib/core/util.svelte';
</script>

<div class="space-y-1">
	<h4 class="h4">Resources</h4>
	<div class="mx-auto bg-surface-50-900-token table w-96 border-spacing-1">
		{#each Object.values(resources) as resource}
			<div class="table-row hover:bg-surface-100-800-token">
				<div class="table-cell px-1 max-w-16 truncate" style="color: {resource.rarity.color}" title={resource.name.toLowerCase()}>{resource.name.toLowerCase()}</div>
				<div class="table-cell px-1 min-w-10 text-surface-900-50-token">{formatDecimal(resource.amount)}</div>
				<div class="table-cell px-1 min-w-10 text-surface-400-500-token">/{formatDecimal(resource.maxAmount)}</div>
				<div class="table-cell px-1 min-w-10 text-surface-900-50-token" use:popup={{ event: 'hover', target: 'popupHover-' + resource.name, placement: 'right-start' }}>{formatProduction(resource.production)}</div>
			</div>
		{/each}
	</div>
	<!-- Popups. These are separate from the table rows because they interfere with the table spacing. -->
	{#each Object.values(resources) as resource}
		<div class="card p-4 w-72 shadow-xl space-y-2 z-10 duration-0" data-popup={"popupHover-" + resource.name}>
			<p>{resource.description}</p>
			<hr />
			<p>Production: {formatProduction(resource.linkedPropertyValues["production"].flat)}</p>
			<p>Ratio: {formatRatioAsPercentage(resource.linkedPropertyValues["production"].ratio)}</p>
		</div>
	{/each}
</div>
