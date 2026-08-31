import { supabase, hasSupabase } from '../supabase';
import { cloud } from '../cloud.svelte';
import { PARTY, PERKS, UPGRADES, ZONES, effect, zoneOf, type Mon, type Upgrade, type Zone } from './data';

// The whole game: numbers, the tick that moves them, and the two places a save
// lives. Nothing here touches the DOM, so the page is only a view of this.

const LS = 'pc_save';
const SAVE_EVERY = 30_000; // to the cloud; localStorage is written far more often
const OFFLINE_CAP = 12 * 3600; // seconds of away time that still pay out
const SHINY_ODDS = 512;
const BOSS_EVERY = 5;
const BOSS_SECONDS = 30;
const KILLS_PER_STAGE = 10;
const TICK = 100;

export interface DexRow {
	n: number; // times defeated
	s: number; // times it turned up shiny
	first: number; // stage it first showed up on
}

export interface Save {
	v: number;
	stage: number;
	highest: number;
	kills: number;
	gold: number;
	tapLevel: number;
	party: Record<string, number>;
	ups: Record<string, 1>;
	candy: number;
	perks: Record<string, number>;
	rebirths: number;
	dex: Record<number, DexRow>;
	clicks: number;
	playtime: number;
	lastSeen: number;
}

export interface BoardRow {
	profile_name: string;
	highest: number;
	rebirths: number;
	candy: number;
	clicks: number;
	updated_at: string;
}

function emptySave(): Save {
	return {
		v: 1,
		stage: 1,
		highest: 1,
		kills: 0,
		gold: 0,
		tapLevel: 1,
		party: {},
		ups: {},
		candy: 0,
		perks: {},
		rebirths: 0,
		dex: {},
		clicks: 0,
		playtime: 0,
		lastSeen: Date.now()
	};
}

// Numbers in an idle game outgrow anything Intl will do, so they get their own
// short scale suffixes and fall back to exponent notation past a trillion vigin.
const SUF = [
	'', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc',
	'Ud', 'Dd', 'Td', 'Qad', 'Qid', 'Sxd', 'Spd', 'Ocd', 'Nod', 'Vg'
];

export function fmt(n: number): string {
	if (!isFinite(n)) return '∞';
	if (n < 0) return '-' + fmt(-n);
	if (n < 1000) return n < 10 ? String(Math.round(n * 10) / 10) : String(Math.floor(n));
	const e = Math.floor(Math.log10(n) / 3);
	const s = SUF[e];
	if (!s) return n.toExponential(2).replace('e+', 'e');
	return (n / Math.pow(1000, e)).toFixed(2) + s;
}

export function pretty(name: string): string {
	return name
		.split('-')
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(' ');
}

// The two curves everything else hangs off, both settled by simulating whole
// sessions rather than by eye. At 1.55 a run walled at stage 20 and no amount of
// rebirthing moved it; at 1.28 the first session runs out around stage 160 and
// each rebirth after that pushes the wall a good chunk further.
export function hpAt(stage: number): number {
	return 10 * Math.pow(1.28, stage - 1);
}
export function goldAt(stage: number): number {
	return hpAt(stage) * 0.06;
}
export function isBossStage(stage: number): boolean {
	return stage % BOSS_EVERY === 0;
}

export interface Foe {
	mon: Mon;
	type: string;
	boss: boolean;
	shiny: boolean;
	maxHp: number;
	hp: number;
}

export interface Hit {
	id: number;
	amount: number;
	crit: boolean;
	x: number;
	y: number;
}

class Game {
	save = $state<Save>(emptySave());
	foe = $state<Foe | null>(null);
	bossLeft = $state(0);
	hits = $state<Hit[]>([]);
	board = $state<BoardRow[]>([]);
	offlineGold = $state(0);
	offlineSeconds = $state(0);
	loaded = $state(false);
	saving = $state<'idle' | 'saving' | 'saved' | 'error'>('idle');
	error = $state('');

	private timer: ReturnType<typeof setInterval> | undefined;
	private cloudTimer: ReturnType<typeof setInterval> | undefined;
	private boardTimer: ReturnType<typeof setInterval> | undefined;
	private hitId = 0;
	private dirty = false;
	private rng = Math.random;

	// ---- derived numbers -------------------------------------------------

	get zone(): Zone {
		return zoneOf(this.save.stage);
	}

	get perkLevel(): (key: string) => number {
		return (key: string) => this.save.perks[key] ?? 0;
	}

	// Candy you are holding is itself a multiplier, so cashing out every last one
	// on perks is a real decision and not just always right.
	get candyBonus(): number {
		return 1 + this.save.candy * 0.02;
	}
	// Everything the shop is currently doing, worked out once per read rather than
	// per party member, because memberDps is called fourteen times a tick.
	private shop(kind: Upgrade['kind']): number {
		let mul = 1;
		for (const u of UPGRADES) if (u.kind === kind && this.save.ups[u.key]) mul *= u.value;
		return mul;
	}
	private shopSum(kind: Upgrade['kind']): number {
		let add = 0;
		for (const u of UPGRADES) if (u.kind === kind && this.save.ups[u.key]) add += u.value;
		return add;
	}

	get powerBonus(): number {
		return Math.pow(1.15, this.save.perks.power ?? 0) * this.candyBonus * this.shop('all');
	}
	get goldBonus(): number {
		return Math.pow(1.2, this.save.perks.gold ?? 0) * this.shop('gold');
	}
	get critChance(): number {
		return Math.min(0.75, 0.05 + (this.save.perks.crit ?? 0) * 0.03 + this.shopSum('crit'));
	}
	get critMult(): number {
		return 5;
	}
	get idleRate(): number {
		return Math.min(1, 0.35 + (this.save.perks.idle ?? 0) * 0.08);
	}
	// A run begins with the money a stage that deep would pay, not at that stage
	// itself: money always converts into damage, a stage skip only strands you.
	get startGold(): number {
		const n = this.save.perks.head ?? 0;
		if (!n) return 0;
		const g = 10 * goldAt(1 + 5 * n) * this.goldBonus;
		return isFinite(g) ? g : 0;
	}

	memberLevel(key: string): number {
		return this.save.party[key] ?? 0;
	}

	// every item bought for that member doubles it again
	memberMult(key: string): number {
		let m = 1;
		for (const u of UPGRADES) if (u.member === key && this.save.ups[u.key]) m *= u.value;
		return m;
	}

	memberDps(key: string): number {
		const m = PARTY.find((p) => p.key === key);
		const lvl = this.memberLevel(key);
		if (!m || !lvl) return 0;
		const type = this.foe?.type ?? this.zone.type;
		return m.dps * lvl * this.memberMult(key) * this.powerBonus * effect(m.type, type);
	}

	get dps(): number {
		let sum = 0;
		for (const m of PARTY) sum += this.memberDps(m.key);
		return sum;
	}

	// Tap damage is a flat base plus a slice of the party's output, so clicking
	// still matters at stage 300 without ever being the whole game.
	get tapDamage(): number {
		const flat = 10 * this.save.tapLevel;
		const share = this.dps * 0.12;
		return (
			(flat + share) * this.powerBonus * Math.pow(1.25, this.save.perks.tap ?? 0) * this.shop('tap')
		);
	}

	// Closed form for the geometric run rather than a loop, because the party list
	// re-prices itself ten times a second and x100 would mean 1400 multiplies a tick.
	memberCost(key: string, count = 1): number {
		const m = PARTY.find((p) => p.key === key);
		if (!m || count < 1) return Infinity;
		const k = 1.07;
		const first = m.cost * Math.pow(k, this.memberLevel(key));
		return (first * (Math.pow(k, count) - 1)) / (k - 1);
	}

	get tapCost(): number {
		return 25 * Math.pow(1.15, this.save.tapLevel);
	}

	perkCost(key: string): number {
		const p = PERKS.find((x) => x.key === key);
		if (!p) return Infinity;
		return Math.ceil(p.base * Math.pow(1.35, this.save.perks[key] ?? 0));
	}

	// What a rebirth would hand you right now. Everything earned so far is
	// already in the bank, so only the difference is new.
	// Doubling every 14 stages. Slower and a rebirth buys nothing, faster and the
	// holding bonus runs away into numbers the rest of the game cannot answer.
	candyFor(highest: number): number {
		if (highest <= 35) return 0;
		const c = Math.floor(Math.pow(2, (highest - 35) / 14));
		return isFinite(c) ? c : 0;
	}
	get candyGain(): number {
		return Math.max(0, this.candyFor(this.save.highest) - this.lifetimeCandy);
	}
	get lifetimeCandy(): number {
		let spent = 0;
		for (const p of PERKS) {
			const lvl = this.save.perks[p.key] ?? 0;
			for (let i = 0; i < lvl; i++) spent += Math.ceil(p.base * Math.pow(1.35, i));
		}
		return this.save.candy + spent;
	}

	get dexCount(): number {
		return Object.keys(this.save.dex).length;
	}
	get shinyCount(): number {
		let n = 0;
		for (const k of Object.keys(this.save.dex)) n += this.save.dex[Number(k)].s;
		return n;
	}

	// ---- the loop --------------------------------------------------------

	start() {
		if (this.timer) return;
		this.spawn();
		this.timer = setInterval(() => this.tick(), TICK);
		this.cloudTimer = setInterval(() => this.pushCloud(), SAVE_EVERY);
		this.boardTimer = setInterval(() => this.loadBoard(), 30_000);
	}

	stop() {
		clearInterval(this.timer);
		clearInterval(this.cloudTimer);
		clearInterval(this.boardTimer);
		this.timer = undefined;
		this.cloudTimer = undefined;
		this.boardTimer = undefined;
	}

	private tick() {
		const f = this.foe;
		if (!f) return;
		const dt = TICK / 1000;
		this.save.playtime += dt;

		const dmg = this.dps * dt;
		if (dmg > 0) {
			f.hp -= dmg;
			if (f.hp <= 0) return this.kill();
		}

		if (f.boss) {
			this.bossLeft -= dt;
			if (this.bossLeft <= 0) {
				// Drop back a stage rather than re-hanging the same boss. Standing on
				// a boss you cannot kill earns nothing at all, so the run would have
				// no way to ever get stronger.
				if (this.save.stage > 1) {
					this.save.stage--;
					this.save.kills = 0;
				}
				this.spawn();
			}
		}

		this.dirty = true;
		if (Math.random() < 0.02) this.writeLocal();
	}

	spawn() {
		const stage = this.save.stage;
		const zone = zoneOf(stage);
		const boss = isBossStage(stage);
		const mon = boss ? zone.boss : zone.mons[Math.floor(this.rng() * zone.mons.length)];
		const shiny = this.rng() * SHINY_ODDS < 1;
		const maxHp = hpAt(stage) * (boss ? 10 : 1);
		this.foe = { mon, type: zone.type, boss, shiny, maxHp, hp: maxHp };
		this.bossLeft = boss ? BOSS_SECONDS : 0;
	}

	tap(x = 50, y = 50) {
		const f = this.foe;
		if (!f) return;
		const crit = this.rng() < this.critChance;
		const dmg = this.tapDamage * (crit ? this.critMult : 1);
		f.hp -= dmg;
		this.save.clicks++;
		this.pushHit(dmg, crit, x, y);
		if (f.hp <= 0) this.kill();
		this.dirty = true;
	}

	private pushHit(amount: number, crit: boolean, x: number, y: number) {
		const id = ++this.hitId;
		this.hits = [...this.hits, { id, amount, crit, x, y }];
		setTimeout(() => (this.hits = this.hits.filter((h) => h.id !== id)), 700);
	}

	private kill() {
		const f = this.foe;
		if (!f) return;
		const stage = this.save.stage;

		let gold = goldAt(stage) * this.goldBonus;
		if (f.boss) gold *= 15;
		if (f.shiny) gold *= 3;
		this.save.gold += gold;

		const row = this.save.dex[f.mon[0]] ?? { n: 0, s: 0, first: stage };
		row.n++;
		if (f.shiny) row.s++;
		this.save.dex[f.mon[0]] = row;

		if (f.boss) {
			this.advance();
		} else {
			this.save.kills++;
			if (this.save.kills >= KILLS_PER_STAGE) this.advance();
		}
		this.spawn();
		this.writeLocal();
	}

	private advance() {
		this.save.kills = 0;
		this.save.stage++;
		if (this.save.stage > this.save.highest) this.save.highest = this.save.stage;
	}

	// walking back is free, so a boss you cannot beat is not the end of a session
	goBack() {
		if (this.save.stage <= 1) return;
		this.save.stage--;
		this.save.kills = 0;
		this.spawn();
	}
	goForward() {
		if (this.save.stage >= this.save.highest) return;
		this.save.stage++;
		this.save.kills = 0;
		this.spawn();
	}

	// ---- spending --------------------------------------------------------

	buyMember(key: string, count = 1) {
		const cost = this.memberCost(key, count);
		if (this.save.gold < cost) return;
		this.save.gold -= cost;
		this.save.party[key] = this.memberLevel(key) + count;
		this.dirty = true;
		this.writeLocal();
	}

	// How many levels the money on hand actually covers. x10 used to grey the whole
	// row out when ten was one too many, which read as a dead button; now the row
	// buys what it can and says so.
	affordable(key: string, cap = 1000): number {
		const m = PARTY.find((p) => p.key === key);
		if (!m) return 0;
		const k = 1.07;
		const first = m.cost * Math.pow(k, this.memberLevel(key));
		if (!isFinite(first) || first <= 0) return 0;
		const n = Math.log((this.save.gold * (k - 1)) / first + 1) / Math.log(k);
		if (!isFinite(n) || n < 1) return 0;
		return Math.min(cap, Math.floor(n));
	}

	// only what this run can actually reach: bought items drop off the list, and a
	// member's item stays hidden until that member is deep enough
	get shopList(): Upgrade[] {
		const out: Upgrade[] = [];
		for (const u of UPGRADES) {
			if (this.save.ups[u.key]) continue;
			if (u.member && this.memberLevel(u.member) < u.need) continue;
			out.push(u);
		}
		return out.sort((a, b) => a.cost - b.cost);
	}
	get shopOwned(): number {
		return Object.keys(this.save.ups).length;
	}

	buyUp(key: string) {
		const u = UPGRADES.find((x) => x.key === key);
		if (!u || this.save.ups[key] || this.save.gold < u.cost) return;
		this.save.gold -= u.cost;
		this.save.ups[key] = 1;
		this.dirty = true;
		this.writeLocal();
	}

	buyTap() {
		if (this.save.gold < this.tapCost) return;
		this.save.gold -= this.tapCost;
		this.save.tapLevel++;
		this.dirty = true;
		this.writeLocal();
	}

	buyPerk(key: string) {
		const p = PERKS.find((x) => x.key === key);
		if (!p) return;
		const lvl = this.save.perks[key] ?? 0;
		if (lvl >= p.max) return;
		const cost = this.perkCost(key);
		if (this.save.candy < cost) return;
		this.save.candy -= cost;
		this.save.perks[key] = lvl + 1;
		this.dirty = true;
		this.writeLocal();
	}

	// Keeps candy, perks, the dex and the record. Loses the run.
	rebirth() {
		const gain = this.candyGain;
		if (gain <= 0) return;
		this.save.candy += gain;
		this.save.rebirths++;
		this.save.party = {};
		this.save.ups = {};
		this.save.tapLevel = 1;
		this.save.kills = 0;
		this.save.stage = 1;
		this.save.gold = this.startGold;
		this.spawn();
		this.dirty = true;
		this.writeLocal();
		this.pushCloud();
	}

	// ---- persistence -----------------------------------------------------

	private writeLocal() {
		try {
			this.save.lastSeen = Date.now();
			localStorage.setItem(LS, JSON.stringify(this.save));
		} catch {
			/* private mode: the cloud copy is still the real one */
		}
	}

	private merge(raw: unknown): Save {
		const base = emptySave();
		if (!raw || typeof raw !== 'object') return base;
		return { ...base, ...(raw as Save) };
	}

	async load() {
		let local: Save | null = null;
		try {
			const raw = localStorage.getItem(LS);
			if (raw) local = this.merge(JSON.parse(raw));
		} catch {
			local = null;
		}

		let remote: Save | null = null;
		if (hasSupabase) {
			try {
				await cloud.init();
				const { data, error } = await supabase
					.from('clicker_saves')
					.select('state, updated_at')
					.eq('profile_name', cloud.profileName || 'Unknown')
					.maybeSingle();
				if (error) this.error = error.message;
				else if (data?.state) remote = this.merge(data.state);
			} catch (e) {
				this.error = e instanceof Error ? e.message : 'load failed';
			}
		}

		// Whichever got further wins. Comparing timestamps would hand the game to
		// whichever tab was closed last, which is how progress disappears.
		let pick = local;
		if (remote && (!local || remote.highest > local.highest || (remote.highest === local.highest && remote.lastSeen > local.lastSeen))) {
			pick = remote;
		}
		this.save = pick ?? emptySave();

		this.claimOffline();
		this.loaded = true;
		this.loadBoard();
	}

	// What the party farmed while the tab was shut. It pays in money only: letting
	// it push stages would send you somewhere you cannot actually fight.
	private claimOffline() {
		const away = Math.min(OFFLINE_CAP, Math.max(0, (Date.now() - (this.save.lastSeen ?? Date.now())) / 1000));
		if (away < 60) return;
		const dps = this.dps;
		if (dps <= 0) return;
		const perKill = hpAt(this.save.stage);
		const kills = (dps * away * this.idleRate) / perKill;
		const gold = kills * goldAt(this.save.stage) * this.goldBonus;
		if (gold <= 0) return;
		this.save.gold += gold;
		this.offlineGold = gold;
		this.offlineSeconds = away;
	}

	dismissOffline() {
		this.offlineGold = 0;
	}

	async pushCloud() {
		if (!hasSupabase || !this.loaded || !this.dirty) return;
		this.dirty = false;
		this.saving = 'saving';
		this.save.lastSeen = Date.now();
		const { error } = await supabase.from('clicker_saves').upsert(
			{
				profile_name: cloud.profileName || 'Unknown',
				state: this.save,
				highest: this.save.highest,
				rebirths: this.save.rebirths,
				candy: this.save.candy,
				clicks: this.save.clicks,
				updated_at: new Date().toISOString()
			},
			{ onConflict: 'profile_name' }
		);
		if (error) {
			this.saving = 'error';
			this.error = error.message;
			this.dirty = true;
		} else {
			this.saving = 'saved';
			setTimeout(() => (this.saving = 'idle'), 1200);
		}
	}

	async loadBoard() {
		if (!hasSupabase) return;
		const { data, error } = await supabase
			.from('clicker_saves')
			.select('profile_name, highest, rebirths, candy, clicks, updated_at')
			.order('highest', { ascending: false })
			.limit(20);
		if (!error && data) this.board = data as BoardRow[];
	}

	// leaving the page is the one moment a save must not be skipped
	flush() {
		this.writeLocal();
		this.pushCloud();
	}
}

export const game = new Game();
export { PARTY, PERKS, UPGRADES, ZONES };
