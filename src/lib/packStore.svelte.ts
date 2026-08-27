import { buildPack, modelFor, tierFor, configFor, type ModelKey, type OpenedPack, type PoolCard } from './packs';

const API = 'https://api.tcgdex.net/v2/en';
const LS = 'packpool:';
const LS_INDEX = 'packpool:index';
const KEEP = 6; // how many set pools stay cached
const CONC = 14;

type CachedPool = { at: number; model: ModelKey; cards: PoolCard[] };

// A set is 100-300 cards and each one needs its own request for the rarity, so
// this is the slow part: about a second and a half on a good line. It only ever
// happens once per set because the result is parked in localStorage.
function readCache(setId: string): CachedPool | null {
	try {
		const raw = localStorage.getItem(LS + setId);
		return raw ? (JSON.parse(raw) as CachedPool) : null;
	} catch {
		return null;
	}
}

function writeCache(setId: string, data: CachedPool) {
	try {
		localStorage.setItem(LS + setId, JSON.stringify(data));
		const idx: string[] = JSON.parse(localStorage.getItem(LS_INDEX) ?? '[]');
		const next = [setId, ...idx.filter((s) => s !== setId)];
		for (const old of next.slice(KEEP)) localStorage.removeItem(LS + old);
		localStorage.setItem(LS_INDEX, JSON.stringify(next.slice(0, KEEP)));
	} catch {
		/* quota or private mode: the pool just gets refetched next time */
	}
}

class PackStore {
	setId = $state('');
	setName = $state('');
	model = $state<ModelKey>('modern');
	pool = $state<PoolCard[]>([]);

	loading = $state(false);
	done = $state(0);
	total = $state(0);
	error = $state('');

	pack = $state<OpenedPack | null>(null);
	opened = $state(0);
	godCount = $state(0);
	best = $state<PoolCard | null>(null);

	get size(): number {
		return configFor(this.model).size;
	}
	get progress(): number {
		return this.total ? Math.round((this.done / this.total) * 100) : 0;
	}

	async load(setId: string, setName: string) {
		if (this.setId === setId && this.pool.length) return;
		this.setId = setId;
		this.setName = setName;
		this.pack = null;
		this.error = '';

		const cached = readCache(setId);
		if (cached?.cards?.length) {
			this.model = cached.model;
			this.pool = cached.cards;
			return;
		}

		this.loading = true;
		this.done = 0;
		this.total = 0;
		try {
			const head = await fetch(`${API}/sets/${encodeURIComponent(setId)}`);
			if (!head.ok) throw new Error('set ' + head.status);
			const set = await head.json();
			const model = modelFor(setId, set.releaseDate);
			this.model = model;

			const ids: string[] = (set.cards ?? []).filter((c: { image?: string }) => c.image).map((c: { id: string }) => c.id);
			this.total = ids.length;

			const out: PoolCard[] = [];
			let i = 0;
			const worker = async () => {
				while (i < ids.length) {
					const k = i++;
					try {
						const r = await fetch(`${API}/cards/${ids[k]}`);
						if (r.ok) {
							const c = await r.json();
							if (c.image) {
								const variants = {
									normal: !!c.variants?.normal,
									reverse: !!c.variants?.reverse,
									holo: !!c.variants?.holo
								};
								out.push({
									id: c.id,
									name: c.name,
									number: c.localId,
									set: set.name,
									setId,
									series: set.serie?.id,
									image: `${c.image}/low.webp`,
									rarity: c.rarity ?? 'None',
									tier: tierFor(c.rarity, variants, model),
									variants
								});
							}
						}
					} catch {
						/* one missing card does not spoil a 250 card pool */
					}
					this.done++;
				}
			};
			await Promise.all(Array.from({ length: CONC }, worker));

			if (!out.length) throw new Error('no cards with images');
			out.sort((a, b) => (a.number ?? '').localeCompare(b.number ?? '', undefined, { numeric: true }));
			this.pool = out;
			writeCache(setId, { at: Date.now(), model, cards: out });
		} catch (e) {
			this.error = e instanceof Error ? e.message : 'failed';
			this.pool = [];
		} finally {
			this.loading = false;
		}
	}

	open() {
		if (!this.pool.length) return;
		const p = buildPack(this.pool, this.setId, this.model);
		this.pack = p;
		this.opened++;
		if (p.god) this.godCount++;
		for (const c of p.cards) {
			if (!this.best || c.tier > this.best.tier) this.best = c;
		}
	}

	clear() {
		this.pack = null;
	}
}

export const packs = new PackStore();
