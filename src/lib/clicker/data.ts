// Everything the clicker knows about the world, kept apart from the rules that
// use it. Species are baked in rather than pulled from PokeAPI, because a zone
// wants a hand picked cast, not a random draw out of a thousand.

// [national dex id, api name]. The name is what the animated sprite is keyed on,
// so nothing hyphenated goes in here: Showdown spells those differently and the
// gif would quietly 404 down to the still sprite.
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
			[16, 'pidgey'], [19, 'rattata'], [10, 'caterpie'], [13, 'weedle'],
			[161, 'sentret'], [263, 'zigzagoon'], [399, 'bidoof'], [504, 'patrat'],
			[21, 'spearow'], [52, 'meowth'], [133, 'eevee'], [293, 'whismur'],
			[506, 'lillipup'], [659, 'bunnelby']
		],
		boss: [143, 'snorlax']
	},
	{
		name: 'Viridian Forest',
		type: 'bug',
		mons: [
			[11, 'metapod'], [14, 'kakuna'], [12, 'butterfree'], [15, 'beedrill'],
			[46, 'paras'], [48, 'venonat'], [204, 'pineco'], [265, 'wurmple'],
			[127, 'pinsir'], [167, 'spinarak'], [193, 'yanma'], [266, 'silcoon'],
			[401, 'kricketot'], [540, 'sewaddle']
		],
		boss: [123, 'scyther']
	},
	{
		name: 'Mt. Moon',
		type: 'rock',
		mons: [
			[74, 'geodude'], [41, 'zubat'], [35, 'clefairy'], [27, 'sandshrew'],
			[95, 'onix'], [304, 'aron'], [524, 'roggenrola'], [744, 'rockruff'],
			[111, 'rhyhorn'], [138, 'omanyte'], [140, 'kabuto'], [345, 'lileep'],
			[688, 'binacle'], [837, 'rolycoly']
		],
		boss: [76, 'golem']
	},
	{
		name: 'Seafoam Shore',
		type: 'water',
		mons: [
			[54, 'psyduck'], [60, 'poliwag'], [72, 'tentacool'], [120, 'staryu'],
			[129, 'magikarp'], [278, 'wingull'], [418, 'buizel'], [767, 'wimpod'],
			[79, 'slowpoke'], [90, 'shellder'], [116, 'horsea'], [118, 'goldeen'],
			[170, 'chinchou'], [550, 'basculin']
		],
		boss: [130, 'gyarados']
	},
	{
		name: 'Power Plant',
		type: 'electric',
		mons: [
			[100, 'voltorb'], [81, 'magnemite'], [125, 'electabuzz'], [25, 'pikachu'],
			[179, 'mareep'], [311, 'plusle'], [403, 'shinx'], [522, 'blitzle'],
			[82, 'magneton'], [101, 'electrode'], [239, 'elekid'], [309, 'electrike'],
			[587, 'emolga'], [694, 'helioptile']
		],
		boss: [145, 'zapdos']
	},
	{
		name: 'Lavender Tower',
		type: 'ghost',
		mons: [
			[92, 'gastly'], [93, 'haunter'], [200, 'misdreavus'], [353, 'shuppet'],
			[355, 'duskull'], [425, 'drifloon'], [607, 'litwick'], [708, 'phantump'],
			[562, 'yamask'], [622, 'golett'], [710, 'pumpkaboo'], [769, 'sandygast'],
			[854, 'sinistea'], [478, 'froslass']
		],
		boss: [94, 'gengar']
	},
	{
		name: 'Cinnabar Volcano',
		type: 'fire',
		mons: [
			[37, 'vulpix'], [58, 'growlithe'], [77, 'ponyta'], [126, 'magmar'],
			[218, 'slugma'], [322, 'numel'], [390, 'chimchar'], [324, 'torkoal'],
			[136, 'flareon'], [155, 'cyndaquil'], [228, 'houndour'], [240, 'magby'],
			[513, 'pansear'], [636, 'larvesta']
		],
		boss: [146, 'moltres']
	},
	{
		name: 'Ice Path',
		type: 'ice',
		mons: [
			[86, 'seel'], [124, 'jynx'], [220, 'swinub'], [361, 'snorunt'],
			[363, 'spheal'], [459, 'snover'], [582, 'vanillite'], [613, 'cubchoo'],
			[225, 'delibird'], [238, 'smoochum'], [471, 'glaceon'], [615, 'cryogonal'],
			[712, 'bergmite'], [872, 'snom']
		],
		boss: [144, 'articuno']
	},
	{
		name: 'Sky Pillar',
		type: 'dragon',
		mons: [
			[147, 'dratini'], [148, 'dragonair'], [371, 'bagon'], [333, 'swablu'],
			[443, 'gible'], [714, 'noibat'], [633, 'deino'], [610, 'axew'],
			[142, 'aerodactyl'], [334, 'altaria'], [621, 'druddigon'], [691, 'dragalge'],
			[776, 'turtonator'], [840, 'applin']
		],
		boss: [149, 'dragonite']
	},
	{
		name: 'Rocket Hideout',
		type: 'dark',
		mons: [
			[23, 'ekans'], [109, 'koffing'], [88, 'grimer'], [198, 'murkrow'],
			[215, 'sneasel'], [261, 'poochyena'], [509, 'purrloin'], [827, 'nickit'],
			[24, 'arbok'], [89, 'muk'], [302, 'sableye'], [434, 'stunky'],
			[624, 'pawniard'], [859, 'impidimp']
		],
		boss: [150, 'mewtwo']
	},
	{
		name: 'Sunny Meadow',
		type: 'grass',
		mons: [
			[43, 'oddish'], [69, 'bellsprout'], [187, 'hoppip'], [280, 'ralts'],
			[406, 'budew'], [546, 'cottonee'], [420, 'cherubi'], [755, 'morelull'],
			[102, 'exeggcute'], [114, 'tangela'], [191, 'sunkern'], [273, 'seedot'],
			[315, 'roselia'], [548, 'petilil']
		],
		boss: [3, 'venusaur']
	},
	{
		name: 'Battle Colosseum',
		type: 'fighting',
		mons: [
			[56, 'mankey'], [106, 'hitmonlee'], [107, 'hitmonchan'], [296, 'makuhita'],
			[307, 'meditite'], [447, 'riolu'], [532, 'timburr'], [619, 'mienfoo'],
			[67, 'machoke'], [236, 'tyrogue'], [453, 'croagunk'], [538, 'throh'],
			[539, 'sawk'], [701, 'hawlucha']
		],
		boss: [68, 'machamp']
	},
	{
		name: 'Steel Foundry',
		type: 'steel',
		mons: [
			[227, 'skarmory'], [303, 'mawile'], [374, 'beldum'], [436, 'bronzor'],
			[599, 'klink'], [679, 'honedge'], [777, 'togedemaru'], [808, 'meltan'],
			[205, 'forretress'], [208, 'steelix'], [437, 'bronzong'], [597, 'ferroseed'],
			[632, 'durant'], [878, 'cufant']
		],
		boss: [376, 'metagross']
	},
	{
		name: 'Distortion World',
		type: 'psychic',
		mons: [
			[63, 'abra'], [96, 'drowzee'], [177, 'natu'], [325, 'spoink'],
			[433, 'chingling'], [517, 'munna'], [677, 'espurr'], [856, 'hatenna'],
			[64, 'kadabra'], [97, 'hypno'], [196, 'espeon'], [281, 'kirlia'],
			[561, 'sigilyph'], [605, 'elgyem']
		],
		boss: [487, 'giratina']
	},
	{
		name: 'Hall of Fame',
		type: 'dragon',
		mons: [
			[372, 'shelgon'], [329, 'vibrava'], [444, 'gabite'], [611, 'fraxure'],
			[705, 'sliggoo'], [885, 'dreepy'], [996, 'frigibax'], [246, 'larvitar'],
			[780, 'drampa'], [880, 'dracozolt'], [881, 'arctozolt'], [882, 'dracovish'],
			[883, 'arctovish'], [621, 'druddigon']
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

export function itemSprite(name: string): string {
	return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${name}.png`;
}

// ---------------------------------------------------------------------------
// The backdrop. Drawn entirely from these colours by the page, so a new zone is
// a palette and not an image to download. Every value has to stay far enough
// from its neighbours to read as a separate layer: the first draft had the dark
// zones within a few percent of each other and they came out as one black slab.

export interface Scene {
	sky1: string;
	sky2: string;
	far: string;
	near: string;
	ground: string;
	orb: string;
	glow: string;
	fleck: string;
	roof?: boolean; // indoors: a ceiling comes down instead of an open sky
}

export const SCENES: Record<string, Scene> = {
	normal: { sky1: '#5fb8ea', sky2: '#d8efff', far: '#6fae76', near: '#3f7a4d', ground: '#356b41', orb: '#fff4c2', glow: 'rgba(255,240,190,0.5)', fleck: 'rgba(255,255,255,0.5)' },
	bug: { sky1: '#2f7a4e', sky2: '#a8dc92', far: '#3d8a58', near: '#1d4a30', ground: '#163823', orb: '#e8ffc0', glow: 'rgba(180,255,150,0.35)', fleck: 'rgba(210,255,170,0.6)' },
	rock: { sky1: '#2a211d', sky2: '#7d6353', far: '#6a5040', near: '#3a2a22', ground: '#241a15', orb: '#ffd9a0', glow: 'rgba(255,200,140,0.35)', fleck: 'rgba(255,220,180,0.4)', roof: true },
	water: { sky1: '#2f7fc4', sky2: '#b6e9f8', far: '#4a94c8', near: '#1d5f8d', ground: '#124063', orb: '#fff6d0', glow: 'rgba(180,235,255,0.45)', fleck: 'rgba(210,245,255,0.7)' },
	electric: { sky1: '#1b2140', sky2: '#5566a0', far: '#3d4576', near: '#232848', ground: '#141833', orb: '#ffe45c', glow: 'rgba(255,228,92,0.5)', fleck: 'rgba(255,238,130,0.9)', roof: true },
	ghost: { sky1: '#1d1436', sky2: '#6b4392', far: '#4a2f70', near: '#26183f', ground: '#150d26', orb: '#dcd0ff', glow: 'rgba(190,150,255,0.45)', fleck: 'rgba(210,180,255,0.65)' },
	fire: { sky1: '#2e1210', sky2: '#c2461c', far: '#8a2c14', near: '#4a1810', ground: '#2a0c08', orb: '#ffb057', glow: 'rgba(255,120,50,0.55)', fleck: 'rgba(255,170,80,0.9)', roof: true },
	ice: { sky1: '#6aa8d6', sky2: '#f0fbff', far: '#c2e2f2', near: '#7fa8c4', ground: '#5d84a0', orb: '#ffffff', glow: 'rgba(220,245,255,0.65)', fleck: 'rgba(255,255,255,0.95)' },
	dragon: { sky1: '#2b2a6b', sky2: '#a596e8', far: '#5348a0', near: '#312a68', ground: '#1e1848', orb: '#ffe9a8', glow: 'rgba(180,160,255,0.45)', fleck: 'rgba(220,210,255,0.7)' },
	dark: { sky1: '#141322', sky2: '#453a5e', far: '#33284d', near: '#1d1834', ground: '#0f0b1c', orb: '#ff6b6b', glow: 'rgba(255,80,80,0.35)', fleck: 'rgba(255,120,120,0.5)', roof: true },
	grass: { sky1: '#5cc0ea', sky2: '#e8f8cc', far: '#8ed268', near: '#57993f', ground: '#417a32', orb: '#fff3b0', glow: 'rgba(255,245,180,0.5)', fleck: 'rgba(255,230,140,0.8)' },
	fighting: { sky1: '#7a5433', sky2: '#f0cd9c', far: '#a87a4c', near: '#5e4229', ground: '#443019', orb: '#ffd9a0', glow: 'rgba(255,200,130,0.45)', fleck: 'rgba(255,220,170,0.4)' },
	steel: { sky1: '#232833', sky2: '#67758c', far: '#4a5568', near: '#262c38', ground: '#171b24', orb: '#ffab5c', glow: 'rgba(255,150,70,0.4)', fleck: 'rgba(255,190,110,0.85)', roof: true },
	psychic: { sky1: '#3d1257', sky2: '#d873b0', far: '#7a2c96', near: '#451858', ground: '#2a0d35', orb: '#ffd2f0', glow: 'rgba(255,140,220,0.45)', fleck: 'rgba(255,190,240,0.7)', roof: true }
};

export function sceneOf(type: string): Scene {
	return SCENES[type] ?? SCENES.normal;
}

// One palette per zone was not enough: eight stages in a row looked identical.
// The silhouettes, the hour of the day and the thing in the foreground are all
// drawn from the stage number as well, so no two stages in a zone match.

const RIDGE_FAR = [
	'polygon(0 62%,9% 40%,18% 55%,28% 28%,38% 48%,50% 22%,61% 47%,71% 32%,82% 52%,92% 38%,100% 58%,100% 100%,0 100%)',
	'polygon(0 55%,14% 30%,26% 52%,40% 24%,55% 50%,68% 28%,80% 46%,90% 34%,100% 50%,100% 100%,0 100%)',
	'polygon(0 68%,10% 52%,22% 62%,33% 38%,45% 58%,58% 34%,70% 56%,84% 40%,100% 62%,100% 100%,0 100%)',
	'polygon(0 45%,12% 58%,24% 36%,36% 54%,48% 30%,60% 52%,72% 34%,86% 56%,100% 42%,100% 100%,0 100%)',
	'polygon(0 58%,8% 34%,20% 60%,30% 26%,44% 56%,56% 30%,66% 58%,78% 24%,90% 54%,100% 36%,100% 100%,0 100%)',
	// rolling, so not every place is all peaks
	'ellipse(72% 46% at 30% 100%)',
	'ellipse(85% 40% at 70% 100%)'
];

const RIDGE_MID = [
	'polygon(0 70%,8% 48%,16% 66%,24% 44%,32% 62%,42% 40%,52% 60%,62% 42%,72% 64%,84% 46%,94% 62%,100% 50%,100% 100%,0 100%)',
	'polygon(0 60%,7% 74%,14% 54%,21% 70%,29% 50%,37% 68%,46% 52%,55% 72%,64% 54%,74% 70%,84% 52%,93% 68%,100% 56%,100% 100%,0 100%)',
	'polygon(0 66%,12% 50%,24% 68%,35% 46%,48% 64%,58% 44%,70% 66%,84% 48%,100% 68%,100% 100%,0 100%)',
	'polygon(0 52%,10% 68%,20% 50%,32% 66%,44% 48%,56% 70%,68% 50%,80% 66%,92% 48%,100% 62%,100% 100%,0 100%)',
	'ellipse(60% 52% at 22% 100%)',
	'ellipse(66% 48% at 78% 100%)'
];

// the foreground band: what the fight is actually standing among
export const DECOR = [
	{
		key: 'trees',
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
	{ key: 'dunes', shape: 'polygon(0 88%,18% 74%,38% 86%,58% 72%,78% 86%,100% 76%,100% 100%,0 100%)' },
	{
		key: 'grass',
		shape:
			'polygon(0 100%,2% 78%,5% 100%,8% 72%,11% 100%,15% 80%,18% 100%,22% 70%,25% 100%,29% 78%,32% 100%,36% 74%,39% 100%,43% 80%,46% 100%,50% 70%,53% 100%,57% 78%,60% 100%,64% 72%,67% 100%,71% 80%,74% 100%,78% 70%,81% 100%,85% 78%,88% 100%,92% 74%,95% 100%,98% 80%,100% 100%)'
	}
];

// stalactites, for the zones that happen under a roof
export const ROOF_SHAPE =
	'polygon(0 0,100% 0,100% 34%,95% 60%,90% 30%,84% 52%,78% 26%,71% 48%,64% 22%,57% 46%,50% 20%,43% 44%,36% 24%,29% 50%,22% 28%,15% 46%,8% 24%,3% 44%,0 26%)';

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

// ---------------------------------------------------------------------------
// The party. Cost and damage step by the same factor down the whole list, so a
// recruit is always worth about the same per coin as the one before it. The
// first draft let cost outrun damage and the run walled at stage 20 with nothing
// left to buy. Gear sits on the same ladder: it is not a Pokemon, it has no type
// to be strong or weak against, and it pulls its weight in every zone.

export interface Member {
	key: string;
	label: string;
	mon?: Mon;
	item?: string;
	type: string; // 'none' for gear, which is neutral against everything
	cost: number;
	dps: number;
}

const LADDER: [string, string, string | null, Mon | null, string][] = [
	['bulbasaur', 'Bulbasaur', null, [1, 'bulbasaur'], 'grass'],
	['pokeball', 'Poke Ball', 'poke-ball', null, 'none'],
	['charmander', 'Charmander', null, [4, 'charmander'], 'fire'],
	['squirtle', 'Squirtle', null, [7, 'squirtle'], 'water'],
	['greatball', 'Great Ball', 'great-ball', null, 'none'],
	['pikachu', 'Pikachu', null, [25, 'pikachu'], 'electric'],
	['machop', 'Machop', null, [66, 'machop'], 'fighting'],
	['ultraball', 'Ultra Ball', 'ultra-ball', null, 'none'],
	['gengar', 'Gengar', null, [94, 'gengar'], 'ghost'],
	['snorlax', 'Snorlax', null, [143, 'snorlax'], 'normal'],
	['expshare', 'Exp. Share', 'exp-share', null, 'none'],
	['gyarados', 'Gyarados', null, [130, 'gyarados'], 'water'],
	['dragonite', 'Dragonite', null, [149, 'dragonite'], 'dragon'],
	['macho', 'Macho Brace', 'macho-brace', null, 'none'],
	['tyranitar', 'Tyranitar', null, [248, 'tyranitar'], 'rock'],
	['metagross', 'Metagross', null, [376, 'metagross'], 'steel'],
	['choice', 'Choice Band', 'choice-band', null, 'none'],
	['garchomp', 'Garchomp', null, [445, 'garchomp'], 'dragon'],
	['mewtwo', 'Mewtwo', null, [150, 'mewtwo'], 'psychic'],
	['lifeorb', 'Life Orb', 'life-orb', null, 'none'],
	['rayquaza', 'Rayquaza', null, [384, 'rayquaza'], 'dragon'],
	['masterball', 'Master Ball', 'master-ball', null, 'none']
];

const STEP = 11;
const DPS_PER_COIN = 0.55;

export const PARTY: Member[] = LADDER.map(([key, label, item, mon, type], i) => {
	const cost = 10 * Math.pow(STEP, i);
	return {
		key,
		label,
		mon: mon ?? undefined,
		item: item ?? undefined,
		type,
		cost,
		dps: cost * DPS_PER_COIN
	};
});

// Levels where a party member can be doubled again. These used to fire for free
// the moment you hit the level, which meant the middle of a run had nothing to
// decide; now each one is an item in the shop that you choose to buy.
export const MILESTONES = [10, 25, 50, 100, 200, 400, 800, 1600];

// ---------------------------------------------------------------------------
// The shop. Bought with money, wiped by a rebirth, unlike the candy perks.

export interface Upgrade {
	key: string;
	member?: string;
	name: string;
	desc: string;
	sprite: string; // a real item sprite, so the shop is not a wall of emoji
	need: number;
	cost: number;
	kind: 'member' | 'tap' | 'gold' | 'crit' | 'all';
	value: number;
}

// four flavoured items per type, then the four late ones everybody shares
const TYPE_ITEMS: Record<string, [string, string][]> = {
	grass: [['Miracle Seed', 'miracle-seed'], ['Leaf Stone', 'leaf-stone'], ['Meadow Plate', 'meadow-plate'], ['Rose Incense', 'rose-incense']],
	fire: [['Charcoal', 'charcoal'], ['Fire Stone', 'fire-stone'], ['Flame Plate', 'flame-plate'], ['Expert Belt', 'expert-belt']],
	water: [['Mystic Water', 'mystic-water'], ['Water Stone', 'water-stone'], ['Splash Plate', 'splash-plate'], ['Sea Incense', 'sea-incense']],
	electric: [['Magnet', 'magnet'], ['Thunder Stone', 'thunder-stone'], ['Zap Plate', 'zap-plate'], ['Electirizer', 'electirizer']],
	fighting: [['Black Belt', 'black-belt'], ['Focus Band', 'focus-band'], ['Fist Plate', 'fist-plate'], ['Protector', 'protector']],
	ghost: [['Spell Tag', 'spell-tag'], ['Dusk Stone', 'dusk-stone'], ['Spooky Plate', 'spooky-plate'], ['Reaper Cloth', 'reaper-cloth']],
	normal: [['Silk Scarf', 'silk-scarf'], ['Leftovers', 'leftovers'], ['Muscle Band', 'muscle-band'], ['Cheri Berry', 'cheri-berry']],
	dragon: [['Dragon Fang', 'dragon-fang'], ['Dragon Scale', 'dragon-scale'], ['Draco Plate', 'draco-plate'], ['Adamant Orb', 'adamant-orb']],
	rock: [['Hard Stone', 'hard-stone'], ['Rock Incense', 'rock-incense'], ['Stone Plate', 'stone-plate'], ['Everstone', 'everstone']],
	steel: [['Metal Coat', 'metal-coat'], ['Iron Plate', 'iron-plate'], ['Shiny Stone', 'shiny-stone'], ['Assault Vest', 'assault-vest']],
	psychic: [['Twisted Spoon', 'twisted-spoon'], ['Dawn Stone', 'dawn-stone'], ['Mind Plate', 'mind-plate'], ['Odd Keystone', 'odd-keystone']],
	none: [['Silver Powder', 'silver-powder'], ['Soft Sand', 'soft-sand'], ['Sharp Beak', 'sharp-beak'], ['Poison Barb', 'poison-barb']]
};

const LATE_ITEMS: [string, string][] = [
	['Razor Fang', 'razor-fang'],
	["King's Rock", 'kings-rock'],
	['Scope Lens', 'scope-lens'],
	['Rare Candy', 'rare-candy']
];

function buildUpgrades(): Upgrade[] {
	const out: Upgrade[] = [];

	for (const m of PARTY) {
		const items = TYPE_ITEMS[m.type] ?? TYPE_ITEMS.normal;
		MILESTONES.forEach((need, i) => {
			const [name, sprite] = i < 4 ? items[i] : LATE_ITEMS[i - 4];
			out.push({
				key: `${m.key}.${i}`,
				member: m.key,
				name,
				desc: `${m.label} deals double damage`,
				sprite,
				need,
				// about thirty more levels' worth at the point it appears, so it is a
				// real decision against just buying more levels
				cost: m.cost * Math.pow(1.07, need) * 30,
				kind: 'member',
				value: 2
			});
		});
	}

	const globals: [string, string, string, string, Upgrade['kind'], number, number][] = [
		['glove1', 'Trainer Gloves', 'Tap damage doubled', 'black-glasses', 'tap', 2, 6e3],
		['coin1', 'Amulet Coin', 'Money +50%', 'amulet-coin', 'gold', 1.5, 2.5e4],
		['egg1', 'Lucky Egg', 'Crit chance +8%', 'lucky-egg', 'crit', 0.08, 1.8e5],
		['share1', 'Wide Lens', 'Whole party x1.4', 'wide-lens', 'all', 1.4, 3.5e6],
		['glove2', 'Power Gloves', 'Tap damage doubled', 'quick-claw', 'tap', 2, 5e7],
		['coin2', 'Gold Pass', 'Money +50%', 'nugget', 'gold', 1.5, 8e8],
		['egg2', 'Golden Egg', 'Crit chance +8%', 'lucky-punch', 'crit', 0.08, 4e9],
		['share2', 'Rare Candy Box', 'Whole party x1.5', 'rare-candy', 'all', 1.5, 6e10],
		['glove3', 'Champion Gloves', 'Tap damage doubled', 'muscle-band', 'tap', 2, 9e11],
		['coin3', 'Bottle Cap', 'Money +50%', 'gold-bottle-cap', 'gold', 1.5, 7e12],
		['share3', 'Master Medal', 'Whole party x1.6', 'shiny-stone', 'all', 1.6, 1e14]
	];

	for (const [key, name, desc, sprite, kind, value, cost] of globals) {
		out.push({ key, name, desc, sprite, need: 0, cost, kind, value });
	}

	return out;
}

export const UPGRADES: Upgrade[] = buildUpgrades();

// ---------------------------------------------------------------------------
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
// a bad one into a wall. Gear has no type at all and is always neutral.
export function effect(attacker: string, defender: string): number {
	if (STRONG[attacker]?.includes(defender)) return 1.5;
	if (WEAK[attacker]?.includes(defender)) return 0.7;
	return 1;
}

// ---------------------------------------------------------------------------
// What the candy from a rebirth buys. Permanent, never reset.

export interface Perk {
	key: string;
	name: string;
	desc: string;
	icon: string;
	max: number;
	base: number;
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
	{ key: 'head', name: 'Head Start', desc: 'begin each run richer', icon: '🪽', max: 60, base: 3 },

	// The deep end of the tree. A late bank runs to numbers the first six perks
	// cannot absorb, so these have high ceilings and steep prices, and they buy
	// things money cannot: cheaper levels, an auto tapper, better shinies.
	{ key: 'auto', name: 'Auto Tapper', desc: '+1 tap per second, hands free', icon: '🤖', max: 30, base: 25 },
	{ key: 'bargain', name: 'Haggle', desc: 'party levels get cheaper', icon: '🏷️', max: 20, base: 60 },
	{ key: 'stab', name: 'Type Master', desc: '+5% when the type is right', icon: '📘', max: 100, base: 20 },
	{ key: 'critdmg', name: 'Sharp Fang', desc: 'crits hit one step harder', icon: '🦷', max: 200, base: 20 },
	{ key: 'bossgold', name: 'Trophy Case', desc: '+25% money from bosses', icon: '🏆', max: 200, base: 15 },
	{ key: 'shiny', name: 'Shiny Charm', desc: 'shinies turn up more often', icon: '✨', max: 12, base: 80 },
	{ key: 'jar', name: 'Candy Jar', desc: '+5% candy from a rebirth', icon: '🫙', max: 100, base: 120 }
];
