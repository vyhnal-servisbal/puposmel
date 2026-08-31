// Everything the clicker knows about the world, kept apart from the rules that
// use it. Species are baked in rather than pulled from PokeAPI, because a zone
// wants a hand picked cast, not a random draw out of a thousand.

// [national dex id, api name]. The name is what the animated sprite is keyed on.
export type Mon = [number, string];

export interface Zone {
	name: string;
	type: string;
	mons: Mon[];
	boss: Mon;
}

export const ZONES: Zone[] = [
	{
		name: 'Route 1',
		type: 'normal',
		mons: [
			[16, 'pidgey'],
			[19, 'rattata'],
			[10, 'caterpie'],
			[13, 'weedle'],
			[161, 'sentret'],
			[263, 'zigzagoon'],
			[399, 'bidoof'],
			[504, 'patrat']
		],
		boss: [143, 'snorlax']
	},
	{
		name: 'Viridian Forest',
		type: 'bug',
		mons: [
			[11, 'metapod'],
			[14, 'kakuna'],
			[12, 'butterfree'],
			[15, 'beedrill'],
			[46, 'paras'],
			[48, 'venonat'],
			[204, 'pineco'],
			[265, 'wurmple']
		],
		boss: [123, 'scyther']
	},
	{
		name: 'Mt. Moon',
		type: 'rock',
		mons: [
			[74, 'geodude'],
			[41, 'zubat'],
			[35, 'clefairy'],
			[27, 'sandshrew'],
			[95, 'onix'],
			[304, 'aron'],
			[524, 'roggenrola'],
			[744, 'rockruff']
		],
		boss: [76, 'golem']
	},
	{
		name: 'Seafoam Shore',
		type: 'water',
		mons: [
			[54, 'psyduck'],
			[60, 'poliwag'],
			[72, 'tentacool'],
			[120, 'staryu'],
			[129, 'magikarp'],
			[278, 'wingull'],
			[418, 'buizel'],
			[767, 'wimpod']
		],
		boss: [130, 'gyarados']
	},
	{
		name: 'Power Plant',
		type: 'electric',
		mons: [
			[100, 'voltorb'],
			[81, 'magnemite'],
			[125, 'electabuzz'],
			[25, 'pikachu'],
			[179, 'mareep'],
			[311, 'plusle'],
			[403, 'shinx'],
			[522, 'blitzle']
		],
		boss: [145, 'zapdos']
	},
	{
		name: 'Lavender Tower',
		type: 'ghost',
		mons: [
			[92, 'gastly'],
			[93, 'haunter'],
			[200, 'misdreavus'],
			[353, 'shuppet'],
			[355, 'duskull'],
			[425, 'drifloon'],
			[607, 'litwick'],
			[708, 'phantump']
		],
		boss: [94, 'gengar']
	},
	{
		name: 'Cinnabar Volcano',
		type: 'fire',
		mons: [
			[37, 'vulpix'],
			[58, 'growlithe'],
			[77, 'ponyta'],
			[126, 'magmar'],
			[218, 'slugma'],
			[322, 'numel'],
			[390, 'chimchar'],
			[324, 'torkoal']
		],
		boss: [146, 'moltres']
	},
	{
		name: 'Ice Path',
		type: 'ice',
		mons: [
			[86, 'seel'],
			[124, 'jynx'],
			[220, 'swinub'],
			[361, 'snorunt'],
			[363, 'spheal'],
			[459, 'snover'],
			[582, 'vanillite'],
			[613, 'cubchoo']
		],
		boss: [144, 'articuno']
	},
	{
		name: 'Sky Pillar',
		type: 'dragon',
		mons: [
			[147, 'dratini'],
			[148, 'dragonair'],
			[371, 'bagon'],
			[333, 'swablu'],
			[443, 'gible'],
			[714, 'noibat'],
			[633, 'deino'],
			[610, 'axew']
		],
		boss: [149, 'dragonite']
	},
	{
		name: 'Rocket Hideout',
		type: 'dark',
		mons: [
			[23, 'ekans'],
			[109, 'koffing'],
			[88, 'grimer'],
			[198, 'murkrow'],
			[215, 'sneasel'],
			[261, 'poochyena'],
			[509, 'purrloin'],
			[827, 'nickit']
		],
		boss: [150, 'mewtwo']
	},
	{
		name: 'Sunny Meadow',
		type: 'grass',
		mons: [
			[43, 'oddish'],
			[69, 'bellsprout'],
			[187, 'hoppip'],
			[280, 'ralts'],
			[406, 'budew'],
			[546, 'cottonee'],
			[420, 'cherubi'],
			[755, 'morelull']
		],
		boss: [3, 'venusaur']
	},
	{
		name: 'Battle Colosseum',
		type: 'fighting',
		mons: [
			[56, 'mankey'],
			[106, 'hitmonlee'],
			[107, 'hitmonchan'],
			[296, 'makuhita'],
			[307, 'meditite'],
			[447, 'riolu'],
			[532, 'timburr'],
			[619, 'mienfoo']
		],
		boss: [68, 'machamp']
	},
	{
		name: 'Steel Foundry',
		type: 'steel',
		mons: [
			[227, 'skarmory'],
			[303, 'mawile'],
			[374, 'beldum'],
			[436, 'bronzor'],
			[599, 'klink'],
			[679, 'honedge'],
			[777, 'togedemaru'],
			[808, 'meltan']
		],
		boss: [376, 'metagross']
	},
	{
		name: 'Distortion World',
		type: 'psychic',
		mons: [
			[63, 'abra'],
			[96, 'drowzee'],
			[177, 'natu'],
			[325, 'spoink'],
			[433, 'chingling'],
			[517, 'munna'],
			[677, 'espurr'],
			[856, 'hatenna']
		],
		boss: [487, 'giratina']
	},
	{
		name: 'Hall of Fame',
		type: 'dragon',
		mons: [
			[372, 'shelgon'],
			[329, 'vibrava'],
			[444, 'gabite'],
			[611, 'fraxure'],
			[705, 'sliggoo'],
			[885, 'dreepy'],
			[996, 'frigibax'],
			[246, 'larvitar']
		],
		boss: [384, 'rayquaza']
	}
];

// How many stages you spend in a zone before the next one. After the last zone
// the tour starts over, which is what keeps stage 400 possible.
export const STAGES_PER_ZONE = 8;

export function zoneOf(stage: number): Zone {
	const i = Math.floor((stage - 1) / STAGES_PER_ZONE) % ZONES.length;
	return ZONES[i];
}

// The party. Cost and dps both climb about an order of magnitude a slot, which
// is what makes a new recruit feel like a jump rather than a rounding error.
export interface Member {
	key: string;
	mon: Mon;
	type: string;
	cost: number;
	dps: number;
}

// Cost and damage step by the same factor down the whole list, so a recruit is
// always worth about the same per coin as the one before it. The first draft let
// cost outrun damage and the run walled at stage 20 with nothing left to buy.
export const PARTY: Member[] = [
	{ key: 'bulbasaur', mon: [1, 'bulbasaur'], type: 'grass', cost: 10, dps: 6 },
	{ key: 'charmander', mon: [4, 'charmander'], type: 'fire', cost: 110, dps: 60 },
	{ key: 'squirtle', mon: [7, 'squirtle'], type: 'water', cost: 1.2e3, dps: 660 },
	{ key: 'pikachu', mon: [25, 'pikachu'], type: 'electric', cost: 1.33e4, dps: 7.3e3 },
	{ key: 'machop', mon: [66, 'machop'], type: 'fighting', cost: 1.46e5, dps: 8e4 },
	{ key: 'gengar', mon: [94, 'gengar'], type: 'ghost', cost: 1.61e6, dps: 8.9e5 },
	{ key: 'snorlax', mon: [143, 'snorlax'], type: 'normal', cost: 1.77e7, dps: 9.7e6 },
	{ key: 'gyarados', mon: [130, 'gyarados'], type: 'water', cost: 1.95e8, dps: 1.07e8 },
	{ key: 'dragonite', mon: [149, 'dragonite'], type: 'dragon', cost: 2.14e9, dps: 1.18e9 },
	{ key: 'tyranitar', mon: [248, 'tyranitar'], type: 'rock', cost: 2.36e10, dps: 1.3e10 },
	{ key: 'metagross', mon: [376, 'metagross'], type: 'steel', cost: 2.59e11, dps: 1.43e11 },
	{ key: 'garchomp', mon: [445, 'garchomp'], type: 'dragon', cost: 2.85e12, dps: 1.57e12 },
	{ key: 'mewtwo', mon: [150, 'mewtwo'], type: 'psychic', cost: 3.14e13, dps: 1.73e13 },
	{ key: 'rayquaza', mon: [384, 'rayquaza'], type: 'dragon', cost: 3.45e14, dps: 1.9e14 }
];

// Levels where a party member doubles its own output. Something to aim at
// between recruits, so the middle of a run is not just holding a button.
export const MILESTONES = [10, 25, 50, 100, 200, 400, 800, 1600];

// Only what beats or bounces off what; anything unlisted is neutral. Immunities
// are left out on purpose, a wall you cannot hit is not fun in a clicker.
export const STRONG: Record<string, string[]> = {
	normal: [],
	fire: ['grass', 'ice', 'bug', 'steel'],
	water: ['fire', 'ground', 'rock'],
	electric: ['water', 'flying'],
	grass: ['water', 'ground', 'rock'],
	ice: ['grass', 'ground', 'flying', 'dragon'],
	fighting: ['normal', 'ice', 'rock', 'dark', 'steel'],
	poison: ['grass', 'fairy'],
	ground: ['fire', 'electric', 'poison', 'rock', 'steel'],
	flying: ['grass', 'fighting', 'bug'],
	psychic: ['fighting', 'poison'],
	bug: ['grass', 'psychic', 'dark'],
	rock: ['fire', 'ice', 'flying', 'bug'],
	ghost: ['psychic', 'ghost'],
	dragon: ['dragon'],
	dark: ['psychic', 'ghost'],
	steel: ['ice', 'rock', 'fairy'],
	fairy: ['fighting', 'dragon', 'dark']
};

export const WEAK: Record<string, string[]> = {
	normal: ['rock', 'steel'],
	fire: ['fire', 'water', 'rock', 'dragon'],
	water: ['water', 'grass', 'dragon'],
	electric: ['electric', 'grass', 'dragon'],
	grass: ['fire', 'grass', 'poison', 'flying', 'bug', 'dragon', 'steel'],
	ice: ['fire', 'water', 'ice', 'steel'],
	fighting: ['poison', 'flying', 'psychic', 'bug', 'fairy'],
	poison: ['poison', 'ground', 'rock', 'ghost'],
	ground: ['grass', 'bug'],
	flying: ['electric', 'rock', 'steel'],
	psychic: ['psychic', 'steel'],
	bug: ['fire', 'fighting', 'poison', 'flying', 'ghost', 'steel', 'fairy'],
	rock: ['fighting', 'ground', 'steel'],
	ghost: ['dark'],
	dragon: ['steel'],
	dark: ['fighting', 'dark', 'fairy'],
	steel: ['fire', 'water', 'electric', 'steel'],
	fairy: ['fire', 'poison', 'steel']
};

// 1.5 rather than the real 2.0: a clicker should reward a good party, not punish
// a bad one into a wall.
export function effect(attacker: string, defender: string): number {
	if (STRONG[attacker]?.includes(defender)) return 1.5;
	if (WEAK[attacker]?.includes(defender)) return 0.7;
	return 1;
}

// What the candy from a rebirth buys. Permanent, never reset.
export interface Perk {
	key: string;
	name: string;
	desc: string;
	icon: string;
	max: number;
	base: number; // candy cost of the first level
}

// Head Start hands you money rather than stages. A stage skip sounds better and
// is a trap: it drops you on foes you have no party for and no way to earn one,
// and the run is simply frozen.
export const PERKS: Perk[] = [
	{ key: 'power', name: 'Power Band', desc: '+15% to all damage', icon: '💪', max: 200, base: 1 },
	{ key: 'tap', name: 'Quick Claw', desc: '+25% tap damage', icon: '👆', max: 120, base: 1 },
	{ key: 'gold', name: 'Amulet Coin', desc: '+20% money', icon: '💰', max: 120, base: 1 },
	{ key: 'crit', name: 'Scope Lens', desc: '+3% crit chance', icon: '🎯', max: 18, base: 2 },
	{ key: 'idle', name: 'Lazy Berry', desc: '+8% offline rate', icon: '😴', max: 25, base: 2 },
	{ key: 'head', name: 'Head Start', desc: 'begin each run richer', icon: '🪽', max: 60, base: 3 }
];
