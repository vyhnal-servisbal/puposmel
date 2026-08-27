// Everything about how a set looks in the pack screen.
//
// The wrapper is tinted from the set logo itself rather than from a hand picked
// palette, because 218 sets is far too many to colour by hand and the logo is
// the one asset that always matches the real product. The asset CDN sends
// Access-Control-Allow-Origin: *, so the pixels can actually be read back.

export type Look = { base: string; accent: string; ink: string };

const cache = new Map<string, Look>();
const pending = new Map<string, Promise<Look | null>>();

// Sets whose cards carry no image at all, so a pack would come out blank. Baked
// in from a sweep of every set, which beats making the browser discover it by
// loading 218 set manifests.
export const NO_ART = new Set([
	'2011bw', '2012bw', '2014xy', '2015xy', '2016xy', '2017sm', '2018sm', '2019sm',
	'2021swsh', '2022swsh', '2023sv', '2024sv', 'B2a', 'bog', 'cel25cc', 'ex5.5',
	'exu', 'jumbo', 'mee', 'mep', 'mfb', 'miscp', 'rc', 'sm3.5', 'sm7.5', 'sp',
	'sve', 'swsh10tg', 'swsh11tg', 'swsh12.5gg', 'swsh12tg', 'swsh4.5sv', 'swsh9tg',
	'tk-bw-e', 'tk-bw-z', 'tk-dp-l', 'tk-dp-m', 'tk-ex-latia', 'tk-ex-latio',
	'tk-ex-m', 'tk-ex-p', 'tk-hs-g', 'tk-hs-r', 'tk-sm-l', 'tk-sm-r', 'tk-xy-b',
	'tk-xy-latia', 'tk-xy-latio', 'tk-xy-n', 'tk-xy-p', 'tk-xy-su', 'tk-xy-sy',
	'tk-xy-w', 'wp', 'xya'
]);

// 61 sets have no logo anywhere, so the era colour is the only thing left
export const ERA_COLOR: Record<string, string> = {
	base: '#e8c15a',
	gym: '#c98b4b',
	neo: '#8fd4c4',
	lc: '#d8b36a',
	ecard: '#7fb2e0',
	ex: '#6fd3a8',
	pop: '#e58fb8',
	tk: '#9aa3c4',
	dp: '#8fa9e6',
	pl: '#b9a6e8',
	hgss: '#e0b46a',
	col: '#d6d0a8',
	bw: '#a8b4c4',
	mc: '#e6a24b',
	xy: '#5aa9e6',
	sm: '#ff9d5c',
	swsh: '#7fd4ff',
	sv: '#ff7a6a',
	tcgp: '#ffd166',
	me: '#c07bff',
	misc: '#8a83ad'
};

export function eraColor(series?: string): string {
	return ERA_COLOR[series ?? ''] ?? '#8a83ad';
}

function hsl(r: number, g: number, b: number) {
	const max = Math.max(r, g, b) / 255;
	const min = Math.min(r, g, b) / 255;
	const l = (max + min) / 2;
	const d = max - min;
	let h = 0;
	const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
	if (d !== 0) {
		const rr = r / 255, gg = g / 255, bb = b / 255;
		if (max === rr) h = ((gg - bb) / d) % 6;
		else if (max === gg) h = (bb - rr) / d + 2;
		else h = (rr - gg) / d + 4;
		h *= 60;
		if (h < 0) h += 360;
	}
	return { h, s, l };
}

function css(h: number, s: number, l: number) {
	return `hsl(${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%)`;
}

// Buckets pixels by hue and takes the most represented one that is actually
// colourful. Transparent, near-black and near-white pixels are skipped, since
// most logos are mostly outline and empty space.
function extract(data: Uint8ClampedArray): Look | null {
	const bins = new Array(24).fill(0);
	const sat = new Array(24).fill(0);
	const lum = new Array(24).fill(0);
	let counted = 0;

	for (let i = 0; i < data.length; i += 4) {
		const a = data[i + 3];
		if (a < 160) continue;
		const { h, s, l } = hsl(data[i], data[i + 1], data[i + 2]);
		if (s < 0.25 || l < 0.14 || l > 0.92) continue;
		const b = Math.min(23, Math.floor(h / 15));
		bins[b]++;
		sat[b] += s;
		lum[b] += l;
		counted++;
	}
	if (counted < 40) return null;

	let best = 0;
	for (let i = 1; i < bins.length; i++) if (bins[i] > bins[best]) best = i;
	if (!bins[best]) return null;

	const h = best * 15 + 7.5;
	const s = Math.min(0.82, Math.max(0.42, sat[best] / bins[best]));
	const l = lum[best] / bins[best];

	return {
		base: css(h, s * 0.85, Math.min(0.3, Math.max(0.16, l * 0.42))),
		accent: css(h, Math.min(0.9, s + 0.1), Math.min(0.72, Math.max(0.55, l * 1.25))),
		ink: css(h, Math.min(0.85, s + 0.15), 0.74)
	};
}

export function lookOf(setId: string): Look | null {
	return cache.get(setId) ?? null;
}

// Draws the logo small on an offscreen canvas and reads the pixels back. Any
// failure just leaves the caller on the era colour.
export async function loadLook(setId: string, logoUrl?: string): Promise<Look | null> {
	if (cache.has(setId)) return cache.get(setId)!;
	if (!logoUrl) return null;
	const running = pending.get(setId);
	if (running) return running;

	const job = new Promise<Look | null>((resolve) => {
		const img = new Image();
		img.crossOrigin = 'anonymous';
		img.onload = () => {
			try {
				const w = 64;
				const h = Math.max(1, Math.round((img.naturalHeight / img.naturalWidth) * w)) || 64;
				const cv = document.createElement('canvas');
				cv.width = w;
				cv.height = h;
				const ctx = cv.getContext('2d', { willReadFrequently: true });
				if (!ctx) return resolve(null);
				ctx.drawImage(img, 0, 0, w, h);
				const look = extract(ctx.getImageData(0, 0, w, h).data);
				if (look) cache.set(setId, look);
				resolve(look);
			} catch {
				resolve(null);
			}
		};
		img.onerror = () => resolve(null);
		img.src = logoUrl;
	}).finally(() => pending.delete(setId));

	pending.set(setId, job);
	return job;
}
