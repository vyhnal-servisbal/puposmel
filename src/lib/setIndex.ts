// The library only knows what has been pulled. To show what is still missing it
// needs every card a set contains, which is one request per set and then kept,
// because a set that is out never changes again.

const API = 'https://api.tcgdex.net/v2/en';
const LS = 'setidx:';
const LS_INDEX = 'setidx:index';
const KEEP = 30;

export interface SetCard {
	id: string;
	number: string;
	name: string;
	image: string;
}

const mem = new Map<string, SetCard[]>();
const pending = new Map<string, Promise<SetCard[]>>();

function readCache(setId: string): SetCard[] | null {
	try {
		const raw = localStorage.getItem(LS + setId);
		const list = raw ? (JSON.parse(raw) as SetCard[]) : null;
		return list?.length ? list : null;
	} catch {
		return null;
	}
}

function writeCache(setId: string, cards: SetCard[]) {
	try {
		localStorage.setItem(LS + setId, JSON.stringify(cards));
		const idx: string[] = JSON.parse(localStorage.getItem(LS_INDEX) ?? '[]');
		const next = [setId, ...idx.filter((s) => s !== setId)];
		for (const old of next.slice(KEEP)) localStorage.removeItem(LS + old);
		localStorage.setItem(LS_INDEX, JSON.stringify(next.slice(0, KEEP)));
	} catch {
		/* quota or private mode: the set is simply fetched again next time */
	}
}

// what is already known, without waiting for anything
export function cachedSet(setId: string): SetCard[] | null {
	const m = mem.get(setId);
	if (m) return m;
	const c = readCache(setId);
	if (c) mem.set(setId, c);
	return c;
}

export function loadSet(setId: string): Promise<SetCard[]> {
	const have = cachedSet(setId);
	if (have) return Promise.resolve(have);

	const running = pending.get(setId);
	if (running) return running;

	const job = (async () => {
		try {
			const res = await fetch(`${API}/sets/${encodeURIComponent(setId)}`);
			if (!res.ok) return [];
			const set = await res.json();
			// cards without art cannot be shown as anything, shadow included, so they
			// stay out of the count as well as out of the grid
			const cards: SetCard[] = (set.cards ?? [])
				.filter((c: { image?: string }) => c.image)
				.map((c: { id: string; localId?: string; name: string; image: string }) => ({
					id: c.id,
					number: c.localId ?? '',
					name: c.name,
					image: `${c.image}/low.webp`
				}));
			cards.sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }));
			if (cards.length) {
				mem.set(setId, cards);
				writeCache(setId, cards);
			}
			return cards;
		} catch {
			return [];
		} finally {
			pending.delete(setId);
		}
	})();

	pending.set(setId, job);
	return job;
}

// A few at a time: opening the sets tab with thirty sets in the library should
// not put thirty requests on the wire at once.
export async function preloadSets(
	ids: string[],
	onOne: (setId: string, cards: SetCard[]) => void,
	conc = 4
): Promise<void> {
	const todo = ids.slice();
	const worker = async () => {
		for (let id = todo.shift(); id; id = todo.shift()) {
			const cards = await loadSet(id);
			if (cards.length) onOne(id, cards);
		}
	};
	await Promise.all(Array.from({ length: Math.min(conc, todo.length) }, worker));
}
