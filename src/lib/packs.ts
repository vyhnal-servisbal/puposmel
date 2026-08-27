// Pack simulation. TCGdex knows every card's rarity and which variants exist,
// which is everything needed to build a real booster; what it cannot tell us is
// how often each one shows up, because The Pokemon Company has never published
// pull rates for anything. Every number below is therefore a community figure,
// and they are all gathered here so they stay easy to argue with.

import type { PokemonCard } from './types';

export interface Variants {
	normal: boolean;
	reverse: boolean;
	holo: boolean;
}

export interface PoolCard extends PokemonCard {
	rarity: string;
	tier: number;
	variants: Variants;
}

export interface PackCard extends PoolCard {
	slot: number;
	asReverse: boolean;
	hit: boolean;
}

export type ModelKey = 'pocket' | 'modern' | 'classic';

export interface OpenedPack {
	cards: PackCard[];
	god: boolean;
	model: ModelKey;
	setId: string;
}

// 0 filler, 6 chase. Every rarity TCGdex reports is mapped, across all eras and
// both games, so an unknown set still produces a sane pack instead of crashing.
export const TIERS: Record<string, number> = {
	None: 0,
	Common: 0,
	'One Diamond': 0,

	Uncommon: 1,
	'Two Diamond': 1,

	Rare: 2,
	'Rare Holo': 2,
	'Holo Rare': 2,
	'Three Diamond': 2,
	Promo: 2,
	'Classic Collection': 2,

	'Double rare': 3,
	'Ultra Rare': 3,
	'Holo Rare V': 3,
	'Holo Rare VMAX': 3,
	'Holo Rare VSTAR': 3,
	'Rare Holo LV.X': 3,
	'Rare PRIME': 3,
	LEGEND: 3,
	'Four Diamond': 3,
	'ACE SPEC Rare': 3,
	'Amazing Rare': 3,
	'Radiant Rare': 3,
	'Full Art Trainer': 3,

	'Illustration rare': 4,
	'One Star': 4,
	'Shiny rare': 4,
	'Shiny rare V': 4,
	'Shiny rare VMAX': 4,
	'Black White Rare': 4,
	'One Shiny': 4,

	'Special illustration rare': 5,
	'Two Star': 5,
	'Shiny Ultra Rare': 5,
	'Secret Rare': 5,
	'Two Shiny': 5,

	'Hyper rare': 6,
	'Mega Hyper Rare': 6,
	Crown: 6,
	'Three Star': 6
};

export function tierOf(rarity?: string): number {
	if (!rarity) return 0;
	return TIERS[rarity] ?? 2;
}

// Old sets do not name their holos. TCGdex files every Base Set rare as plain
// "Rare" and only the variants flag separates Charizard from Ninetales, so for
// classic sets the holo flag is what makes a card a hit. Modern sets print a
// holo variant of almost everything, so there the flag means nothing.
export function tierFor(rarity: string | undefined, variants: Variants, model: ModelKey): number {
	const base = tierOf(rarity);
	if (model === 'classic' && variants.holo) return Math.max(base, 3);
	return base;
}

export const TIER_NAMES = [
	'Common',
	'Uncommon',
	'Rare',
	'Ultra',
	'Illustration',
	'Special',
	'Chase'
];

export const TIER_COLORS = [
	'#8a83ad',
	'#6fd3a8',
	'#5aa9e6',
	'#c07bff',
	'#ff8ad1',
	'#ffb454',
	'#ffe066'
];

// TCG Pocket set ids look like A1, A1a, A2b, P-A. Everything else is physical.
const POCKET = /^(A\d+[a-z]?|P-A)$/;

export function modelFor(setId: string, releaseDate?: string): ModelKey {
	if (POCKET.test(setId)) return 'pocket';
	// Scarlet & Violet onward uses the 4/3/2/1 configuration
	const year = releaseDate ? Number(releaseDate.slice(0, 4)) : 0;
	if (setId.startsWith('sv') || year >= 2023) return 'modern';
	return 'classic';
}

type Weights = Record<string, number>;

// Pocket rates are datamined and each column sums to exactly 100, which is a
// good sign they are the real table rather than someone guessing.
const POCKET_SLOT4: Weights = {
	'Two Diamond': 90,
	'Three Diamond': 5,
	'Four Diamond': 1.666,
	'One Star': 2.572,
	'Two Star': 0.5,
	'Three Star': 0.222,
	Crown: 0.04
};
const POCKET_SLOT5: Weights = {
	'Two Diamond': 60,
	'Three Diamond': 20,
	'Four Diamond': 6.664,
	'One Star': 10.288,
	'Two Star': 2,
	'Three Star': 0.888,
	Crown: 0.16
};

// Physical rates are community aggregates and genuinely differ set to set
// (Temporal Forces was far harsher than average), so treat these as a baseline.
const MODERN_HIT: Weights = {
	'Double rare': 13.54,
	'Ultra Rare': 6.0,
	'ACE SPEC Rare': 4.0,
	'Hyper rare': 1.85,
	Rare: 74.61
};

// Base Set era: one rare per pack, holo in roughly one pack in three.
const CLASSIC_HOLO_CHANCE = 1 / 3;

// Illustration rares land in the second reverse slot, not the hit slot.
const MODERN_REVERSE2: Weights = {
	'Illustration rare': 7.52,
	'Special illustration rare': 3.01,
	__reverse: 89.47
};

export const GOD_CHANCE: Record<ModelKey, number> = {
	pocket: 0.0005,
	modern: 0.003,
	classic: 0.001
};

export interface PackConfig {
	model: ModelKey;
	size: number;
	godChance: number;
}

export function configFor(model: ModelKey): PackConfig {
	if (model === 'pocket') return { model, size: 5, godChance: GOD_CHANCE.pocket };
	if (model === 'modern') return { model, size: 10, godChance: GOD_CHANCE.modern };
	return { model, size: 10, godChance: GOD_CHANCE.classic };
}

function pickWeighted(w: Weights): string {
	const total = Object.values(w).reduce((a, b) => a + b, 0);
	let r = Math.random() * total;
	for (const [k, v] of Object.entries(w)) {
		r -= v;
		if (r <= 0) return k;
	}
	return Object.keys(w)[0];
}

function byRarity(pool: PoolCard[]): Record<string, PoolCard[]> {
	const out: Record<string, PoolCard[]> = {};
	for (const c of pool) {
		if (!out[c.rarity]) out[c.rarity] = [];
		out[c.rarity].push(c);
	}
	return out;
}

function one<T>(list: T[]): T | null {
	return list.length ? list[Math.floor(Math.random() * list.length)] : null;
}

// Falls back down the rarity ladder rather than returning nothing, because
// plenty of sets do not contain every rarity the weight table mentions.
function drawRarity(
	groups: Record<string, PoolCard[]>,
	want: string,
	pool: PoolCard[]
): PoolCard | null {
	const exact = one(groups[want] ?? []);
	if (exact) return exact;
	const target = tierOf(want);
	for (let t = target; t >= 0; t--) {
		const cands = pool.filter((c) => c.tier === t);
		if (cands.length) return one(cands);
	}
	return one(pool);
}

function drawTier(pool: PoolCard[], min: number): PoolCard | null {
	const cands = pool.filter((c) => c.tier >= min);
	if (cands.length) return one(cands);
	const lower = pool.filter((c) => c.tier >= min - 1);
	return lower.length ? one(lower) : one(pool);
}

export function buildPack(pool: PoolCard[], setId: string, model: ModelKey): OpenedPack {
	const cfg = configFor(model);
	const groups = byRarity(pool);
	const god = Math.random() < cfg.godChance;
	const picked: { card: PoolCard; asReverse: boolean }[] = [];

	const take = (c: PoolCard | null, asReverse = false) => {
		if (c) picked.push({ card: c, asReverse });
	};

	if (god) {
		// Pocket god packs are one star and above; physical ones are "all hits",
		// which in practice means ultra and above.
		const min = model === 'pocket' ? 4 : 3;
		for (let i = 0; i < cfg.size; i++) take(drawTier(pool, min));
	} else if (model === 'pocket') {
		for (let i = 0; i < 3; i++) take(drawRarity(groups, 'One Diamond', pool));
		take(drawRarity(groups, pickWeighted(POCKET_SLOT4), pool));
		take(drawRarity(groups, pickWeighted(POCKET_SLOT5), pool));
	} else if (model === 'modern') {
		for (let i = 0; i < 4; i++) take(drawRarity(groups, 'Common', pool));
		for (let i = 0; i < 3; i++) take(drawRarity(groups, 'Uncommon', pool));

		const reversible = pool.filter((c) => c.variants.reverse);
		take(one(reversible.length ? reversible : pool), true);

		const second = pickWeighted(MODERN_REVERSE2);
		if (second === '__reverse') take(one(reversible.length ? reversible : pool), true);
		else take(drawRarity(groups, second, pool));

		take(drawRarity(groups, pickWeighted(MODERN_HIT), pool));
	} else {
		for (let i = 0; i < 6; i++) take(drawRarity(groups, 'Common', pool));
		for (let i = 0; i < 3; i++) take(drawRarity(groups, 'Uncommon', pool));
		// one rare per pack, holo roughly every third pack, which is what people
		// remember from opening Base Set
		const holos = pool.filter((c) => c.variants.holo);
		const plain = pool.filter((c) => !c.variants.holo && c.tier >= 2);
		const wantHolo = holos.length > 0 && Math.random() < CLASSIC_HOLO_CHANCE;
		const from = wantHolo ? holos : plain.length ? plain : holos;
		take(one(from.length ? from : pool));
	}

	const cards: PackCard[] = picked.map((p, i) => ({
		...p.card,
		slot: i,
		asReverse: p.asReverse,
		hit: p.card.tier >= 3
	}));

	return { cards, god, model, setId };
}
