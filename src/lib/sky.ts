// The fixed half of the sky page. The observing site never moves, and no free
// API serves a meteor shower calendar, so the table lives here; the dates drift
// by a day at most between years.

export const PLACE = {
	name: 'Rychnov nad Kněžnou',
	region: 'Královéhradecký kraj, CZ',
	lat: 50.1633,
	lon: 16.2748,
	elevation: 320
};

export type Shower = {
	name: string;
	from: [number, number];
	peak: [number, number];
	to: [number, number];
	zhr: number;
	parent: string;
};

export const SHOWERS: Shower[] = [
	{ name: 'Quadrantids', from: [12, 28], peak: [1, 3], to: [1, 12], zhr: 110, parent: '2003 EH1' },
	{ name: 'Lyrids', from: [4, 16], peak: [4, 22], to: [4, 25], zhr: 18, parent: 'Thatcher' },
	{ name: 'Eta Aquariids', from: [4, 19], peak: [5, 6], to: [5, 28], zhr: 50, parent: 'Halley' },
	{
		name: 'Delta Aquariids',
		from: [7, 12],
		peak: [7, 30],
		to: [8, 23],
		zhr: 25,
		parent: '96P/Machholz'
	},
	{ name: 'Perseids', from: [7, 17], peak: [8, 12], to: [8, 24], zhr: 100, parent: 'Swift-Tuttle' },
	{ name: 'Orionids', from: [10, 2], peak: [10, 21], to: [11, 7], zhr: 20, parent: 'Halley' },
	{ name: 'Southern Taurids', from: [9, 10], peak: [11, 5], to: [11, 20], zhr: 5, parent: 'Encke' },
	{ name: 'Leonids', from: [11, 6], peak: [11, 17], to: [11, 30], zhr: 15, parent: 'Tempel-Tuttle' },
	{ name: 'Geminids', from: [12, 4], peak: [12, 14], to: [12, 17], zhr: 150, parent: '3200 Phaethon' },
	{ name: 'Ursids', from: [12, 17], peak: [12, 22], to: [12, 26], zhr: 10, parent: '8P/Tuttle' }
];

export type ShowerWindow = {
	shower: Shower;
	from: Date;
	peak: Date;
	to: Date;
	active: boolean;
	daysToPeak: number;
};

function at(year: number, md: [number, number]): Date {
	return new Date(year, md[0] - 1, md[1], 21, 0, 0);
}

const DAY = 86400000;

// The Quadrantids open in December and close in January, so every shower is
// resolved against three years and the window that actually contains "now" wins.
function windowsFor(s: Shower, year: number): ShowerWindow[] {
	const out: ShowerWindow[] = [];
	for (const y of [year - 1, year, year + 1]) {
		const wraps = s.from[0] > s.to[0];
		const from = at(y, s.from);
		const to = at(wraps ? y + 1 : y, s.to);
		const peak = at(wraps && s.peak[0] < s.from[0] ? y + 1 : y, s.peak);
		out.push({ shower: s, from, peak, to, active: false, daysToPeak: 0 });
	}
	return out;
}

export function showerCalendar(now: Date): ShowerWindow[] {
	const all: ShowerWindow[] = [];
	for (const s of SHOWERS) {
		for (const w of windowsFor(s, now.getFullYear())) {
			if (+w.to < +now) continue;
			w.active = +now >= +w.from && +now <= +w.to;
			w.daysToPeak = Math.round((+w.peak - +now) / DAY);
			all.push(w);
		}
	}
	all.sort((a, b) => {
		if (a.active !== b.active) return a.active ? -1 : 1;
		return +a.peak - +b.peak;
	});
	// one entry per shower, the soonest still-relevant window
	const seen = new Set<string>();
	return all.filter((w) => {
		if (seen.has(w.shower.name)) return false;
		seen.add(w.shower.name);
		return true;
	});
}

export const MOON_NAMES = [
	'New moon',
	'Waxing crescent',
	'First quarter',
	'Waxing gibbous',
	'Full moon',
	'Waning gibbous',
	'Last quarter',
	'Waning crescent'
];

export function moonName(phaseAngle: number): string {
	const i = Math.floor(((phaseAngle + 22.5) % 360) / 45);
	return MOON_NAMES[i] ?? 'Moon';
}

export function moonEmoji(phaseAngle: number): string {
	const e = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];
	return e[Math.floor(((phaseAngle + 22.5) % 360) / 45)] ?? '🌙';
}

// NOAA publishes Kp 0-9; from 50°N the aurora only ever reaches the horizon in
// the upper half of that range, so the wording is tuned for this latitude.
export function kpVerdict(kp: number): { label: string; tone: 'calm' | 'watch' | 'alert'; text: string } {
	if (kp >= 7)
		return {
			label: 'Severe storm',
			tone: 'alert',
			text: 'Aurora is genuinely possible from Rychnov. Look north, away from town lights.'
		};
	if (kp >= 5)
		return {
			label: 'Storm',
			tone: 'alert',
			text: 'Geomagnetic storm in progress. A faint glow low on the northern horizon is possible.'
		};
	if (kp >= 4)
		return { label: 'Unsettled', tone: 'watch', text: 'Active field, but still too far north to see from here.' };
	return { label: 'Quiet', tone: 'calm', text: 'Nothing happening. The field is calm.' };
}

export function fmtTime(d: Date | null | undefined): string {
	if (!d) return '--:--';
	return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export function fmtDate(d: Date | null | undefined): string {
	if (!d) return '--';
	return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function fmtNum(n: number, digits = 0): string {
	return n.toLocaleString('en-GB', { maximumFractionDigits: digits });
}
