<script lang="ts">
	import { type Building, BuildingService } from '$lib/base_game/data_components/building.js';
	import { formatDecimal, formatTimeLeft } from '$lib/core/util/stringFormatting.js';
	import { Portal, Tooltip } from '@skeletonlabs/skeleton-svelte';
	import { Game } from '$lib/core/game';

	interface Props {
		building: Building;
	}

	let { building }: Props = $props();

	const canAfford = $derived(BuildingService.canAfford(building));

	function formatBuildingText(building: Building): string {
		if (building.amount.computed > 0) {
			return `${building.name} (${building.amount.computed})`;
		}
		return building.name;
	}

	function formatResourcePrice(resourceAmount: number, resourceProduction: number, price: number): string {
		if (resourceAmount >= price) {
			return formatDecimal(price);
		}
		if (resourceProduction <= 0) {
			return `${formatDecimal(resourceAmount)} / ${formatDecimal(price)}`;
		}
		const secondsLeft = (price - resourceAmount) / resourceProduction;
		const timeLeft = formatTimeLeft(secondsLeft);
		if (timeLeft === '') {
			return `${formatDecimal(resourceAmount)} / ${formatDecimal(price)}`;
		}
		return `${formatDecimal(resourceAmount)} / ${formatDecimal(price)} (${timeLeft})`;
	}

	function handleBuy() {
		BuildingService.buy(building);
	}

	function handleSell() {
		BuildingService.sell(building);
		console.log('sell');
	}
</script>

<Tooltip positioning={{ placement: 'right-start' }} openDelay={0} closeDelay={0} closeOnClick={false}
				 closeOnPointerDown={false} closeOnEscape={false} closeOnScroll={false}>
	<Tooltip.Trigger class="w-full">
		<div class="preset-tonal border border-surface-500 w-full flex">
			<button
				class="preset-filled-surface-500 flex-1 px-3 py-2"
				class:opacity-50={!canAfford}
				class:cursor-default={!canAfford}
				onclick={handleBuy}
			>
				{formatBuildingText(building)}
			</button>
			{#if building.amount.computed > 0}
				<button class="btn" onclick={handleSell}>Sell</button>
			{/if}
		</div>
	</Tooltip.Trigger>
	<Portal>
		<Tooltip.Positioner>
			<Tooltip.Content class="card bg-surface-100-900 p-4 w-72 shadow-xl space-y-2 z-10">
				<!-- Description -->
				{#if building.description}
					<p>{building.description}</p>
					<hr class="opacity-50" />
				{/if}

				<!-- Costs -->
				<p class="font-bold text-sm">Cost</p>
				{#each building.basePrice as cost}
					{@const scaledPrice = BuildingService.getScaledPrice(building, cost)}
					{@const resourceAmount = cost.resource.amount.computed}
					{@const resourceProduction = cost.resource.production.computed}
					<div class="flex justify-between">
						<span>{cost.resource.icon} {cost.resource.name.toLowerCase()}</span>
						<span
							class:text-error-400={resourceAmount < scaledPrice}
						>
              {formatResourcePrice(resourceAmount, resourceProduction, scaledPrice)}
            </span>
					</div>
				{/each}

				<!-- Effects -->
				{@const linksFrom = Game.registry.getLinksFrom(building.amount.id)}
				{#if linksFrom.length > 0}
					<hr class="opacity-50" />
					<p class="font-bold text-sm">Effects (per building)</p>
					{#each linksFrom as link}
						{@const label = link.metadata?.label ?? link.to}
						{@const description = link.metadata?.description}
						<div class="text-surface-400 text-sm">
							{#if link.type === 'add'}
								<span>+{link.coefficient ?? 1} {label}</span>
							{:else if link.type === 'multiply'}
								<span>×{link.coefficient ?? 1} {label}</span>
							{:else}
								<span>{link.type} {link.coefficient ?? 1} {label}</span>
							{/if}
							{#if description}
								<p class="text-xs text-surface-500">{description}</p>
							{/if}
						</div>
					{/each}
				{/if}
			</Tooltip.Content>
		</Tooltip.Positioner>
	</Portal>
</Tooltip>
