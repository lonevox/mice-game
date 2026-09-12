<script lang="ts">
	import { ResourceService } from '$lib/base_game/data_components/resource.js';
	import { formatDecimal, formatPerSecondNumber } from '$lib/core/util/stringFormatting.js';
	import LinkTree from '$lib/components/LinkTree.svelte';
	import { Popover, Portal } from '@skeletonlabs/skeleton-svelte';
	import { useGame } from '$lib/core/gameContext';

	const game = useGame();
	const resources = $derived(ResourceService.getAll(game.registry));
</script>

<div class="space-y-1">
	<h4 class="h4">Resources</h4>
	<div
		class="mx-auto w-96 grid grid-cols-[minmax(0,auto)_4.5rem_5rem_6rem] gap-x-2 gap-y-1 border-4 rounded-md border-surface-50-950 bg-surface-50-950"
	>
		{#each resources as resource (resource.id)}
			<!-- Name -->
			<Popover positioning={{ placement: 'right' }}>
				<Popover.Trigger class="truncate text-left hover:bg-surface-100-900">
					{resource.name.toLowerCase()}
				</Popover.Trigger>
				<Portal>
					<Popover.Positioner>
						<Popover.Content class="card p-3 shadow-xl space-y-2 z-10">
							<p class="font-bold">{resource.name}</p>
						</Popover.Content>
					</Popover.Positioner>
				</Portal>
			</Popover>

			<!-- Amount -->
			<div class="text-surface-950-50">
				{formatDecimal(resource.amount.computed)}
			</div>

			<!-- Max amount -->
			<Popover positioning={{ placement: 'right' }}>
				<Popover.Trigger class="text-left text-surface-500 hover:bg-surface-100-900">
					/{formatDecimal(resource.maxAmount.computed)}
				</Popover.Trigger>
				<Portal>
					<Popover.Positioner>
						<Popover.Content class="card p-3 shadow-xl space-y-2 z-10">
							<LinkTree property={resource.maxAmount} propertyName="Max {resource.name}" />
						</Popover.Content>
					</Popover.Positioner>
				</Portal>
			</Popover>

			<!-- Production -->
			<Popover positioning={{ placement: 'right' }}>
				<Popover.Trigger class="text-left text-surface-950-50 hover:bg-surface-100-900">
					{formatPerSecondNumber(resource.production.computed)}
				</Popover.Trigger>
				<Portal>
					<Popover.Positioner>
						<Popover.Content class="card p-3 shadow-xl space-y-2 z-10">
							<LinkTree
								property={resource.production}
								propertyName="{resource.name} Production"
								valueFormatter={formatPerSecondNumber}
							/>
						</Popover.Content>
					</Popover.Positioner>
				</Portal>
			</Popover>
		{/each}
	</div>
</div>
