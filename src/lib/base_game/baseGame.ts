import type { ModConfig } from '$lib/core/mod';
import { ResourceService, resourceProductionSystem } from '$lib/base_game/data_components/resource';
import { BuildingService } from '$lib/base_game/data_components/building';
import { LocationService } from '$lib/base_game/data_components/location';
import { CelestialBodyService } from '$lib/base_game/data_components/celestialBody';
import BaseGame from '$lib/base_game/components/BaseGame.svelte';

export const data: ModConfig = {
	id: 'base_game',
	name: 'Base Game',
	description: 'The core content for Mice Game',
	dependencies: [],
	systems: [resourceProductionSystem],
	ui: [{ id: 'base_game.layout', target: '#game-body', component: BaseGame }],
	dataComponentTypes: {
		rarity: {},
		resource: {
			service: ResourceService,
		},
		building: {
			dependencies: ['resource', 'location'],
			service: BuildingService,
		},
		location: {
			dependencies: ['celestialBody'],
			service: LocationService,
		},
		celestialBody: {
			dependencies: ['celestialBodyClassification'],
			service: CelestialBodyService,
		},
		celestialBodyClassification: {},
	},
	dataComponents: {
		rarity: [
			{ id: 'common', name: 'Common', color: 'white' },
			{ id: 'uncommon', name: 'Uncommon', color: 'green' },
		],
		resource: [
			{
				id: 'grain',
				name: 'Grain',
				baseAmount: 50,
				baseMaxAmount: 100,
				baseProduction: 0,
				icon: '🌾',
			},
			{ id: 'wood', name: 'Wood', baseAmount: 50, baseMaxAmount: 50, baseProduction: 0, icon: '🪵' },
		],
		building: [
			{
				id: 'burrow',
				name: 'Burrow',
				description: 'A cozy home for mice',
				basePrice: [{ resourceId: 'wood', amount: 40 }],
				locationId: 'rath_forest',
				unlocked: true,
				basePriceScale: 1.5,
				icon: '🕳️',
			},
			{
				id: 'foraging_zone',
				name: 'Foraging Zone',
				description: 'Mice gather grain from the wild',
				basePrice: [{ resourceId: 'grain', amount: 10 }],
				locationId: 'rath_forest',
				unlocked: true,
				basePriceScale: 1.15,
				icon: '🌿',
			},
			{
				id: 'granary',
				name: 'Granary',
				description: 'Increases grain storage capacity',
				basePrice: [{ resourceId: 'wood', amount: 50 }],
				locationId: 'rath_forest',
				unlocked: true,
				basePriceScale: 1.2,
				icon: '🏠',
			},
			{
				id: 'launchpad',
				name: 'Launchpad',
				description: 'Allows you to go to space',
				basePrice: [{ resourceId: 'grain', amount: 40 }],
				locationId: 'rath_forest',
				basePriceScale: 1.2,
				icon: '🚀',
			},
		],
		celestialBodyClassification: [
			{ id: 'moon', name: 'Moon', symbol: '⏾' },
			{ id: 'planet', name: 'Planet', symbol: '⬤' },
			{ id: 'star', name: 'Star', symbol: '✸' },
			{ id: 'black_hole', name: 'Black Hole', symbol: '𖦹' },
		],
		celestialBody: [
			{
				id: 'maw',
				name: 'Maw',
				classificationId: 'black_hole',
				unlocked: true,
			},
			{
				id: 'pip',
				name: 'Pip',
				classificationId: 'star',
				orbitsId: 'maw',
				unlocked: true,
			},
			{
				id: 'rath',
				name: 'Rath',
				classificationId: 'planet',
				orbitsId: 'pip',
				unlocked: true,
			},
			{
				id: 'nib',
				name: 'Nib',
				classificationId: 'moon',
				orbitsId: 'rath',
				unlocked: true,
			},
			{
				id: 'fuzz',
				name: 'Fuzz',
				orbitsId: 'pip',
				unlocked: true,
				classificationId: 'planet',
			},
			{
				id: 'gnaw',
				name: 'Gnaw',
				classificationId: 'planet',
			},
			{
				id: 'squeak',
				name: 'Squeak',
				classificationId: 'planet',
			},
		],
		location: [
			{
				id: 'rath_forest',
				name: 'Forest',
				unlocked: true,
				celestialBodyId: 'rath',
			},
		],
	},
	links: [
		{
			from: 'foraging_zone_amount',
			to: 'grain_production',
			type: 'add',
			coefficient: 1,
			metadata: {
				label: 'Foraging Zones',
				description: 'Each Foraging Zone produces 1 grain per second',
			},
		},
		{
			from: 'granary_amount',
			to: 'grain_max_amount',
			type: 'add',
			coefficient: 50,
			metadata: {
				label: 'Granaries',
				description: 'Each Granary increases grain storage by 50',
			},
		},
	],
};
