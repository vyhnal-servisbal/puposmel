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

// The backdrop each zone is fought against. Drawn entirely from these colours by
// the page, so a new zone is a palette and not an image to download.
export interface Scene {
	sky1: string;
	sky2: string;
	far: string;
	near: string;
	ground: string;
	orb: string; // sun, moon or whatever is glowing back there
	glow: string;
	fleck: string; // drifting motes: snow, embers, sparks
}

export const SCENES: Record<string, Scene> = {
	normal: { sky1: '#79c6f2', sky2: '#cfeaff', far: '#5c9c6a', near: '#3f7a4d', ground: '#2f5e3b', orb: '#fff4c2', glow: 'rgba(255,240,190,0.5)', fleck: 'rgba(255,255,255,0.5)' },
	bug: { sky1: '#2f6a48', sky2: '#7fbf7a', far: '#245239', near: '#173b28', ground: '#122c1e', orb: '#d6ffb0', glow: 'rgba(180,255,150,0.35)', fleck: 'rgba(210,255,170,0.6)' },
	rock: { sky1: '#3b2f2b', sky2: '#6b5347', far: '#4a3a31', near: '#33261f', ground: '#211815', orb: '#ffd9a0', glow: 'rgba(255,200,140,0.3)', fleck: 'rgba(255,220,180,0.35)' },
	water: { sky1: '#2f7fc4', sky2: '#a8e2f5', far: '#2b6fa8', near: '#1d4f7d', ground: '#143a5c', orb: '#fff6d0', glow: 'rgba(180,235,255,0.45)', fleck: 'rgba(210,245,255,0.7)' },
	electric: { sky1: '#1b2140', sky2: '#3d4a7a', far: '#2a2f52', near: '#1a1d38', ground: '#101226', orb: '#ffe45c', glow: 'rgba(255,228,92,0.45)', fleck: 'rgba(255,238,130,0.85)' },
	ghost: { sky1: '#1a1230', sky2: '#4a2f66', far: '#2a1c47', near: '#1a1130', ground: '#100a1e', orb: '#dcd0ff', glow: 'rgba(190,150,255,0.4)', fleck: 'rgba(210,180,255,0.6)' },
	fire: { sky1: '#2a1010', sky2: '#a03418', far: '#5c1d12', near: '#3a120c', ground: '#240a07', orb: '#ffb057', glow: 'rgba(255,120,50,0.5)', fleck: 'rgba(255,170,80,0.9)' },
	ice: { sky1: '#7fb6de', sky2: '#e6f6ff', far: '#a8cfe6', near: '#7fa8c4', ground: '#5d84a0', orb: '#ffffff', glow: 'rgba(220,245,255,0.6)', fleck: 'rgba(255,255,255,0.95)' },
	dragon: { sky1: '#2b2a6b', sky2: '#8f7fd8', far: '#3b3480', near: '#282158', ground: '#1a1540', orb: '#ffe9a8', glow: 'rgba(180,160,255,0.4)', fleck: 'rgba(220,210,255,0.7)' },
	dark: { sky1: '#0e0d16', sky2: '#2a2436', far: '#1a1724', near: '#110f18', ground: '#0a0810', orb: '#ff6b6b', glow: 'rgba(255,80,80,0.3)', fleck: 'rgba(255,120,120,0.5)' },
	grass: { sky1: '#66c2e8', sky2: '#dff3c4', far: '#7cc45c', near: '#57993f', ground: '#3d7030', orb: '#fff3b0', glow: 'rgba(255,245,180,0.5)', fleck: 'rgba(255,230,140,0.8)' },
	fighting: { sky1: '#6b4a2f', sky2: '#e0b483', far: '#8a6440', near: '#5e4229', ground: '#402c1b', orb: '#ffd9a0', glow: 'rgba(255,200,130,0.4)', fleck: 'rgba(255,220,170,0.4)' },
	steel: { sky1: '#232833', sky2: '#4e5a6e', far: '#333b4a', near: '#222833', ground: '#161a22', orb: '#ffab5c', glow: 'rgba(255,150,70,0.35)', fleck: 'rgba(255,190,110,0.8)' },
	psychic: { sky1: '#3a1250', sky2: '#c05a9e', far: '#5b2170', near: '#3a1349', ground: '#250c30', orb: '#ffd2f0', glow: 'rgba(255,140,220,0.4)', fleck: 'rgba(255,190,240,0.7)' }
};

export function sceneOf(type: string): Scene {
	return SCENES[type] ?? SCENES.normal;
}

// ---------------------------------------------------------------------------
// One palette per zone was not enough: eight stages in a row looked identical.
// The silhouettes, the hour of the day and the thing in the foreground are all
// drawn from the stage number as well, so no two stages in a zone match.

const RIDGE_FAR = [
	'polygon(0 62%,9% 40%,18% 55%,28% 28%,38% 48%,50% 22%,61% 47%,71% 32%,82% 52%,92% 38%,100% 58%,100% 100%,0 100%)',
	'polygon(0 55%,14% 30%,26% 52%,40% 24%,55% 50%,68% 28%,80% 46%,90% 34%,100% 50%,100% 100%,0 100%)',
	'polygon(0 68%,10% 52%,22% 62%,33% 38%,45% 58%,58% 34%,70% 56%,84% 40%,100% 62%,100% 100%,0 100%)',
	'polygon(0 45%,12% 58%,24% 36%,36% 54%,48% 30%,60% 52%,72% 34%,86% 56%,100% 42%,100% 100%,0 100%)',
	'polygon(0 58%,8% 34%,20% 60%,30% 26%,44% 56%,56% 30%,66% 58%,78% 24%,90% 54%,100% 36%,100% 100%,0 100%)'
];

const RIDGE_MID = [
	'polygon(0 70%,8% 48%,16% 66%,24% 44%,32% 62%,42% 40%,52% 60%,62% 42%,72% 64%,84% 46%,94% 62%,100% 50%,100% 100%,0 100%)',
	'polygon(0 60%,7% 74%,14% 54%,21% 70%,29% 50%,37% 68%,46% 52%,55% 72%,64% 54%,74% 70%,84% 52%,93% 68%,100% 56%,100% 100%,0 100%)',
	'polygon(0 66%,12% 50%,24% 68%,35% 46%,48% 64%,58% 44%,70% 66%,84% 48%,100% 68%,100% 100%,0 100%)',
	'polygon(0 52%,10% 68%,20% 50%,32% 66%,44% 48%,56% 70%,68% 50%,80% 66%,92% 48%,100% 62%,100% 100%,0 100%)'
];

// the foreground band: what the fight is actually standing among
export const DECOR = [
	{
		key: 'trees',
		// a saw of narrow triangles reads as a treeline at this size
		shape:
			'polygon(0 100%,3% 52%,6% 100%,10% 44%,14% 100%,18% 56%,22% 100%,26% 40%,30% 100%,34% 58%,38% 100%,43% 46%,47% 100%,51% 60%,55% 100%,60% 42%,64% 100%,68% 56%,72% 100%,77% 48%,81% 100%,85% 58%,89% 100%,94% 44%,97% 100%,100% 56%,100% 100%)'
	},
	{
		key: 'rocks',
		shape:
			'polygon(0 100%,4% 74%,10% 66%,16% 78%,24% 62%,32% 76%,40% 64%,48% 80%,56% 66%,64% 76%,72% 60%,80% 78%,88% 66%,95% 76%,100% 68%,100% 100%)'
	},
	{
		key: 'crystals',
		shape:
			'polygon(0 100%,5% 40%,9% 100%,15% 30%,20% 100%,28% 46%,33% 100%,41% 26%,46% 100%,54% 44%,59% 100%,67% 32%,72% 100%,80% 48%,85% 100%,93% 34%,98% 100%,100% 100%)'
	},
	{
		key: 'waves',
		shape:
			'polygon(0 82%,8% 74%,16% 84%,24% 74%,32% 84%,40% 74%,48% 84%,56% 74%,64% 84%,72% 74%,80% 84%,88% 74%,96% 84%,100% 76%,100% 100%,0 100%)'
	},
	{
		key: 'towers',
		shape:
			'polygon(0 100%,0 78%,7% 78%,7% 46%,15% 46%,15% 78%,26% 78%,26% 34%,36% 34%,36% 78%,48% 78%,48% 54%,58% 54%,58% 78%,70% 78%,70% 40%,80% 40%,80% 78%,92% 78%,92% 60%,100% 60%,100% 100%)'
	},
	{
		key: 'dunes',
		shape: 'polygon(0 88%,18% 74%,38% 86%,58% 72%,78% 86%,100% 76%,100% 100%,0 100%)'
	}
];

export type Hour = 'day' | 'sunset' | 'night' | 'dawn';

// The wash and the vignette both darken, so they have to be read together. The
// first pass had night on 0.62 wash plus a 0.77 vignette and a dark zone like the
// volcano came out as one flat black rectangle.
export const HOURS: Record<
	Hour,
	{ wash: string; orbSize: number; orbTop: number; dim: number; stars: boolean; orb?: string; glow?: string }
> = {
	day: { wash: 'transparent', orbSize: 74, orbTop: 12, dim: 0, stars: false },
	sunset: {
		wash: 'linear-gradient(180deg, rgba(255,138,52,0.26), rgba(255,86,120,0.15) 45%, rgba(60,20,50,0.16))',
		orbSize: 104,
		orbTop: 46,
		dim: 0.06,
		stars: false
	},
	night: {
		wash: 'linear-gradient(180deg, rgba(14,22,62,0.4), rgba(8,14,42,0.28))',
		orbSize: 54,
		orbTop: 10,
		dim: 0.16,
		stars: true,
		// a moon, not whatever the zone had hanging up there in daylight
		orb: '#e9eeff',
		glow: 'rgba(190,205,255,0.35)'
	},
	dawn: {
		wash: 'linear-gradient(180deg, rgba(255,178,206,0.24), rgba(255,224,150,0.12) 50%, transparent)',
		orbSize: 84,
		orbTop: 30,
		dim: 0.03,
		stars: false
	}
};

const HOUR_KEYS: Hour[] = ['day', 'day', 'sunset', 'night', 'dawn'];

// deterministic, so walking back to stage 41 shows the same place you left
function hash(n: number): number {
	const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
	return x - Math.floor(x);
}

export interface Variant {
	far: string;
	mid: string;
	near: string;
	decor: string;
	hour: Hour;
	orbX: number;
	flip: boolean;
}

export function variantOf(stage: number): Variant {
	const d = DECOR[Math.floor(hash(stage * 3.7 + 19) * DECOR.length)];
	return {
		far: RIDGE_FAR[Math.floor(hash(stage) * RIDGE_FAR.length)],
		mid: RIDGE_MID[Math.floor(hash(stage * 2.13 + 7) * RIDGE_MID.length)],
		near: d.shape,
		decor: d.key,
		// the very first stages are always daylight, a pitch black opening is a poor
		// first look at the game
		hour: stage <= 2 ? 'day' : HOUR_KEYS[Math.floor(hash(stage * 5.1 + 3) * HOUR_KEYS.length)],
		orbX: 10 + Math.floor(hash(stage * 7.7 + 41) * 74),
		flip: hash(stage * 11.3 + 5) > 0.5
	};
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

// Levels where a party member can be doubled again. These used to fire for free
// the moment you hit the level, which meant the middle of a run had nothing to
// decide; now each one is an item in the shop that you choose to buy.
export const MILESTONES = [10, 25, 50, 100, 200, 400, 800, 1600];

// ---------------------------------------------------------------------------
// The shop. Bought with money, wiped by a rebirth, unlike the candy perks.

export interface Upgrade {
	key: string;
	member?: string; // whose damage it doubles; absent means it hits everything
	name: string;
	desc: string;
	icon: string;
	need: number; // party member level it unlocks at
	cost: number;
	kind: 'member' | 'tap' | 'gold' | 'crit' | 'all';
	value: number;
}

// four flavoured items per type, then the four late ones everybody shares
const TYPE_ITEMS: Record<string, string[]> = {
	grass: ['Miracle Seed', 'Leaf Stone', 'Meadow Plate', 'Rose Incense'],
	fire: ['Charcoal', 'Fire Stone', 'Flame Plate', 'Blaze Band'],
	water: ['Mystic Water', 'Water Stone', 'Splash Plate', 'Sea Incense'],
	electric: ['Magnet', 'Thunder Stone', 'Zap Plate', 'Electirizer'],
	fighting: ['Black Belt', 'Focus Band', 'Fist Plate', 'Protector'],
	ghost: ['Spell Tag', 'Dusk Stone', 'Spooky Plate', 'Reaper Cloth'],
	normal: ['Silk Scarf', 'Lucky Punch', 'Flat Plate', 'Cheri Berry'],
	dragon: ['Dragon Fang', 'Dragon Scale', 'Draco Plate', 'Adamant Orb'],
	rock: ['Hard Stone', 'Rock Incense', 'Stone Plate', 'Everstone'],
	steel: ['Metal Coat', 'Steel Alloy', 'Iron Plate', 'Shiny Stone'],
	psychic: ['Twisted Spoon', 'Dawn Stone', 'Mind Plate', 'Odd Keystone']
};
const LATE_ITEMS = ['Mega Stone', 'Z-Crystal', 'Dynamax Band', 'Terastal Orb'];
const LATE_ICONS = ['🔶', '💠', '🔴', '🔷'];
const ITEM_ICONS = ['🪨', '💎', '🛡️', '🎁'];

function nameOf(key: string): string {
	return key.charAt(0).toUpperCase() + key.slice(1);
}

function buildUpgrades(): Upgrade[] {
	const out: Upgrade[] = [];

	for (const m of PARTY) {
		const items = TYPE_ITEMS[m.type] ?? TYPE_ITEMS.normal;
		MILESTONES.forEach((need, i) => {
			out.push({
				key: `${m.key}.${i}`,
				member: m.key,
				name: i < 4 ? items[i] : LATE_ITEMS[i - 4],
				desc: `${nameOf(m.key)} deals double damage`,
				icon: i < 4 ? ITEM_ICONS[i] : LATE_ICONS[i - 4],
				need,
				// about thirty more levels' worth at the point it appears, so it is a
				// real decision against just buying more levels
				cost: m.cost * Math.pow(1.07, need) * 30,
				kind: 'member',
				value: 2
			});
		});
	}

	const globals: Upgrade[] = [
		{ key: 'glove1', name: 'Trainer Gloves', desc: 'Tap damage doubled', icon: '🧤', need: 0, cost: 6e3, kind: 'tap', value: 2 },
		{ key: 'coin1', name: 'Amulet Coin', desc: 'Money +50%', icon: '🪙', need: 0, cost: 2.5e4, kind: 'gold', value: 1.5 },
		{ key: 'egg1', name: 'Lucky Egg', desc: 'Crit chance +8%', icon: '🥚', need: 0, cost: 1.8e5, kind: 'crit', value: 0.08 },
		{ key: 'share1', name: 'Exp Share', desc: 'Whole party ×1.4', icon: '📡', need: 0, cost: 3.5e6, kind: 'all', value: 1.4 },
		{ key: 'glove2', name: 'Power Gloves', desc: 'Tap damage doubled', icon: '🥊', need: 0, cost: 5e7, kind: 'tap', value: 2 },
		{ key: 'coin2', name: 'Gold Pass', desc: 'Money +50%', icon: '💳', need: 0, cost: 8e8, kind: 'gold', value: 1.5 },
		{ key: 'egg2', name: 'Golden Egg', desc: 'Crit chance +8%', icon: '🍳', need: 0, cost: 4e9, kind: 'crit', value: 0.08 },
		{ key: 'share2', name: 'Rare Candy Box', desc: 'Whole party ×1.5', icon: '🍬', need: 0, cost: 6e10, kind: 'all', value: 1.5 },
		{ key: 'glove3', name: 'Champion Gloves', desc: 'Tap damage doubled', icon: '🏆', need: 0, cost: 9e11, kind: 'tap', value: 2 },
		{ key: 'coin3', name: 'Golden Bottle Cap', desc: 'Money +50%', icon: '🧴', need: 0, cost: 7e12, kind: 'gold', value: 1.5 },
		{ key: 'share3', name: 'Master Ball', desc: 'Whole party ×1.6', icon: '🟣', need: 0, cost: 1e14, kind: 'all', value: 1.6 }
	];

	return [...out, ...globals];
}

export const UPGRADES: Upgrade[] = buildUpgrades();

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
