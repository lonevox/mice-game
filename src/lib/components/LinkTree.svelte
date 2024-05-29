<script lang="ts">
	import { camelCaseToTitleCase, formatRatioAsPercentageChanged } from '$lib/core/util.svelte';
	import type { Resource } from '$lib/core/resource.svelte';
	import type { GameObjectName } from '$lib/core/gameObject.svelte';
	import type { Link } from '$lib/core/effect.svelte';

	type Props = {
		resource: Resource,
		property: string,
		propertyFormatter: (propertyValue: number) => string
	}
	let { resource = $bindable(), property, propertyFormatter = v => v }: Props = $props();

	type LinkTreeBranch = { totalValue: number, links: Link[] };
	type LinkTree = Partial<Record<GameObjectName | "Base", LinkTreeBranch>>;
	function createLinkTree(links: Link[]): LinkTree {
		let out: LinkTree = {};
		for (const link of links) {
			if (!out.hasOwnProperty(link.from.class)) {
				out[link.from.class] = { totalValue: 0, links: [] };
			}
			const treeBranch = out[link.from.class] as LinkTreeBranch;
			treeBranch.totalValue += link.value;
			treeBranch.links.push(link);
		}
		return out;
	}

	const baseValueFlat = $derived(resource.linkablePropertyBaseValues[property].flat);
	const baseValueRatio = $derived(resource.linkablePropertyBaseValues[property].ratio);

	const nonZeroLinksToProperty: Link[] = $derived(resource.getLinksToProperty(property).filter(l => l.value !== 0));
	const flatLinksTree: LinkTree = $derived(createLinkTree(nonZeroLinksToProperty.filter(l => l.config.alternativeType === undefined)));
	const ratioLinksTree: LinkTree = $derived(createLinkTree(nonZeroLinksToProperty.filter(l => l.config.alternativeType === "ratio")));
</script>

<!-- Flat tree -->
<div class="grid grid-cols-[repeat(2,minmax(0,auto))] gap-x-4">
	<p>{camelCaseToTitleCase(property)}</p>
	<p class:text-error-400={resource.linkablePropertyChangeValues[property].flat < 0}>{propertyFormatter(resource.linkablePropertyChangeValues[property].flat + baseValueFlat)}</p>
	{#if baseValueFlat !== 0}
		<p class="text-surface-500-400-token text-sm leading-none ml-2">
			<span class="font-mono">{Object.keys(flatLinksTree).length === 0 ? "┗" : "┣"}</span> <span class="font-bold">Base</span>
		</p>
		<p class="text-sm leading-none font-bold {baseValueFlat < 0 ? 'text-error-400' : 'text-surface-500-400-token'}">{propertyFormatter(baseValueFlat)}</p>
	{/if}
	{#each Object.entries(flatLinksTree) as [gameObjectName, treeBranch], i}
		<p class="text-surface-500-400-token text-sm leading-none ml-2">
			<span class="font-mono">{i === Object.keys(flatLinksTree).length - 1 ? "┗" : "┣"}</span> <span class="font-bold">{gameObjectName}</span>
		</p>
		<p class="text-sm leading-none font-bold {treeBranch.totalValue < 0 ? 'text-error-400' : 'text-surface-500-400-token'}">{propertyFormatter(treeBranch.totalValue)}</p>
		{#each treeBranch.links as link, j}
			<p class="text-surface-500-400-token text-sm leading-none ml-2 whitespace-pre-wrap">
				<span class="font-mono">{i === Object.keys(flatLinksTree).length - 1 ? " " : "┃"} {j === treeBranch.links.length - 1 ? "└" : "├"}</span> {link.from.name}
			</p>
			<p class="text-sm leading-none {link.value < 0 ? 'text-error-400' : 'text-surface-500-400-token'}">{propertyFormatter(link.value)}</p>
		{/each}
	{/each}
</div>

<!-- Ratio tree -->
{#if Object.keys(ratioLinksTree).length > 0}
	<div class="grid grid-cols-[repeat(2,minmax(0,auto))] gap-x-4">
		<p>{camelCaseToTitleCase(property)} Ratio</p>
		<p class:text-error-400={resource.linkablePropertyChangeValues[property].ratio < 1}>{formatRatioAsPercentageChanged(resource.linkablePropertyChangeValues[property].ratio + baseValueRatio)}</p>
		{#if baseValueRatio !== 1}
			<p class="text-surface-500-400-token text-sm leading-none ml-2">
				<span class="font-mono">{Object.keys(ratioLinksTree).length === 0 ? "┗" : "┣"}</span> <span class="font-bold">Base</span>
			</p>
			<p class="text-sm leading-none font-bold {baseValueRatio < 1 ? 'text-error-400' : 'text-surface-500-400-token'}">{formatRatioAsPercentageChanged(baseValueRatio)}</p>
		{/if}
		{#each Object.entries(ratioLinksTree) as [gameObjectName, treeBranch], i}
			<p class="text-surface-500-400-token text-sm leading-none ml-2">
				<span class="font-mono">{i === Object.keys(ratioLinksTree).length - 1 ? "┗" : " ┣"}</span> <span class="font-bold">{gameObjectName}</span>
			</p>
			<p class="text-sm leading-none font-bold {treeBranch.totalValue < 0 ? 'text-error-400' : 'text-surface-500-400-token'}">{formatRatioAsPercentageChanged(treeBranch.totalValue + 1)}</p>
			{#each treeBranch.links as link, j}
				<p class="text-surface-500-400-token text-sm leading-none ml-2 whitespace-pre-wrap">
					<span class="font-mono">{i === Object.keys(ratioLinksTree).length - 1 ? " " : "┃"} {j === treeBranch.links.length - 1 ? "└" : "├"}</span> {link.from.name}
				</p>
				<p class="text-sm leading-none {link.value < 0 ? 'text-error-400' : 'text-surface-500-400-token'}">{formatRatioAsPercentageChanged(link.value + 1)}</p>
			{/each}
		{/each}
	</div>
{/if}
