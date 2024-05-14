<script lang="ts">
	import { resources } from '$lib/core/resource.svelte';
	import { formatDecimal, formatProduction } from '$lib/core/util.svelte';
</script>

<div class="space-y-1">
	<h4 class="h4">Resources</h4>
	<div class="mx-auto bg-surface-900 table w-96 border-spacing-1">
		{#each Object.values(resources) as resource}
			<div class="table-row hover:bg-surface-800">
				<div class="table-cell px-1 max-w-16 truncate" style="color: {resource.rarity.color}" title={resource.name.toLowerCase()}>{resource.name.toLowerCase()}</div>
				<div class="table-cell px-1 min-w-10">{formatDecimal(resource.amount)}</div>
				<div class="table-cell px-1 min-w-10 text-surface-500">/{resource.maxAmount}</div>
				<div class="table-cell px-1 min-w-10">{formatProduction(resource.production.value)}</div>
			</div>
		{/each}
	</div>
</div>
