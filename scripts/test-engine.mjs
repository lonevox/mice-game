import assert from 'node:assert/strict';
import { createServer } from 'vite';

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });

try {
	const { Game } = await server.ssrLoadModule('/src/lib/core/game.ts');
	const { data: baseGame } = await server.ssrLoadModule('/src/lib/base_game/baseGame.ts');

	const game = new Game();
	game.loadMods([baseGame]);

	assert.equal(game.registry.get('celestialBody', 'rath')?.orbitsId, 'pip');
	assert.equal(game.registry.get('location', 'rath_forest')?.celestialBodyId, 'rath');
	assert.equal(game.registry.count('building'), 4);
	assert.equal(game.modLoader.getSystems().length, 1);

	game.loadMods([baseGame]);
	assert.equal(game.registry.count('building'), 4, 'loading the same mod should be idempotent');
	assert.equal(game.registry.getLinksTo('grain_production').length, 1);

	const orderedIndependently = {
		id: 'test_order_independence',
		name: 'Order Independence Test',
		dependencies: ['base_game'],
		dataComponents: {
			celestialBody: [
				{ id: 'test_child', name: 'Child', classificationId: 'moon', orbitsId: 'test_parent' },
				{ id: 'test_parent', name: 'Parent', classificationId: 'planet', orbitsId: 'maw' },
			],
		},
	};
	game.loadMods([orderedIndependently]);
	assert.equal(game.registry.get('celestialBody', 'test_child')?.orbitsId, 'test_parent');

	const countBeforeInvalidMod = game.registry.count('celestialBody');
	const invalidMod = {
		id: 'test_invalid_reference',
		name: 'Invalid Reference Test',
		dependencies: ['base_game'],
		dataComponents: {
			celestialBody: [{ id: 'test_orphan', name: 'Orphan', classificationId: 'moon', orbitsId: 'missing' }],
		},
	};
	assert.throws(() => game.loadMods([invalidMod]), /orbits missing body/);
	assert.equal(game.registry.count('celestialBody'), countBeforeInvalidMod, 'failed loads must roll back');
	assert.equal(game.modLoader.isLoaded(invalidMod.id), false);

	const cycleMod = {
		id: 'test_cycle',
		name: 'Cycle Test',
		dependencies: ['base_game'],
		dataComponents: {
			celestialBody: [
				{ id: 'test_cycle_a', name: 'A', classificationId: 'moon', orbitsId: 'test_cycle_b' },
				{ id: 'test_cycle_b', name: 'B', classificationId: 'moon', orbitsId: 'test_cycle_a' },
			],
		},
	};
	assert.throws(() => game.loadMods([cycleMod]), /orbit cycle/);
	assert.equal(game.registry.count('celestialBody'), countBeforeInvalidMod);

	const resourceCountBeforeInvalidLink = game.registry.count('resource');
	const invalidLinkMod = {
		id: 'test_invalid_link',
		name: 'Invalid Link Test',
		dependencies: ['base_game'],
		dataComponents: {
			resource: [{ id: 'test_resource', name: 'Test Resource', baseMaxAmount: 10 }],
		},
		links: [{ from: 'missing_property', to: 'test_resource_amount', type: 'add' }],
	};
	assert.throws(() => game.loadMods([invalidLinkMod]), /Link source ReactiveProperty/);
	assert.equal(game.registry.count('resource'), resourceCountBeforeInvalidLink);
	assert.equal(game.registry.getProperty('test_resource_amount'), undefined);

	const invalidTypeMod = {
		id: 'test_invalid_type',
		name: 'Invalid Type Test',
		dependencies: ['base_game'],
		dataComponentTypes: { test_type: { dependencies: ['missing_type'] } },
	};
	assert.throws(() => game.loadMods([invalidTypeMod]), /depends on undefined type/);
	assert.equal(game.typeCatalog.has('test_type'), false);

	const source = game.registry.createProperty('test_source', 2);
	const target = game.registry.createProperty('test_target', 10);
	game.registry.addLinks([
		{ from: source.id, to: target.id, type: 'add', coefficient: 3 },
		{ from: source.id, to: target.id, type: 'max', coefficient: 10 },
		{ from: source.id, to: target.id, type: 'min', coefficient: 8 },
		{ from: source.id, to: target.id, type: 'set', coefficient: 4 },
	]);
	assert.equal(target.computed, 8, 'all declared link operations should be evaluated in order');
	assert.throws(() => game.registry.addLink({ from: target.id, to: source.id, type: 'add' }), /link cycle/);

	console.log('Engine architecture checks passed.');
} finally {
	await server.close();
}
