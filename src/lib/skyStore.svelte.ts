import * as A from 'astronomy-engine';
import { env } from '$env/dynamic/public';
import { PLACE, showerCalendar, moonName, moonEmoji, type ShowerWindow } from './sky';

const NASA_KEY = env.PUBLIC_NASA_KEY || 'DEMO_KEY';
const KP_URL = 'https://services.swpc.noaa.gov/json/planetary_k_index_1m.json';
const ISS_URL = 'https://api.wheretheiss.at/v1/satellites/25544';
const AU_KM = 149597870.7;

const obs = new A.Observer(PLACE.lat, PLACE.lon, PLACE.elevation);

const PLANETS: { body: A.Body; name: string; glyph: string; naked: boolean }[] = [
	{ body: A.Body.Mercury, name: 'Mercury', glyph: '☿', naked: true },
	{ body: A.Body.Venus, name: 'Venus', glyph: '♀', naked: true },
	{ body: A.Body.Mars, name: 'Mars', glyph: '♂', naked: true },
	{ body: A.Body.Jupiter, name: 'Jupiter', glyph: '♃', naked: true },
	{ body: A.Body.Saturn, name: 'Saturn', glyph: '♄', naked: true },
	{ body: A.Body.Uranus, name: 'Uranus', glyph: '♅', naked: false },
	{ body: A.Body.Neptune, name: 'Neptune', glyph: '♆', naked: false }
];

export type PlanetView = {
	name: string;
	glyph: string;
	naked: boolean;
	alt: number;
	az: number;
	mag: number;
	rise: Date | null;
	set: Date | null;
};

export type SkyNow = {
	sunset: Date | null;
	sunrise: Date | null;
	darkFrom: Date | null;
	darkTo: Date | null;
	trueDark: boolean;
	best: Date;
	moon: {
		phaseAngle: number;
		name: string;
		emoji: string;
		lit: number;
		distanceKm: number;
		rise: Date | null;
		set: Date | null;
		nextQuarter: { name: string; at: Date };
	};
	planets: PlanetView[];
	lunarEclipse: { kind: string; at: Date } | null;
	solarEclipse: { kind: string; at: Date } | null;
	showers: ShowerWindow[];
};

const QUARTERS = ['New moon', 'First quarter', 'Full moon', 'Last quarter'];

function riseSet(body: A.Body, from: Date): { rise: Date | null; set: Date | null } {
	const r = A.SearchRiseSet(body, obs, +1, from, 2);
	const s = A.SearchRiseSet(body, obs, -1, from, 2);
	return { rise: r ? r.date : null, set: s ? s.date : null };
}

export function computeSky(now: Date): SkyNow {
	const sunset = A.SearchRiseSet(A.Body.Sun, obs, -1, now, 2);
	const sunrise = A.SearchRiseSet(A.Body.Sun, obs, +1, now, 2);
	// at 50°N the sun never reaches -18° around midsummer, so this is nullable
	const darkFrom = A.SearchAltitude(A.Body.Sun, obs, -1, now, 2, -18);
	const darkTo = A.SearchAltitude(A.Body.Sun, obs, +1, now, 2, -18);

	let best = now;
	if (darkFrom && darkTo) {
		best =
			+darkTo.date > +darkFrom.date
				? new Date((+darkFrom.date + +darkTo.date) / 2)
				: new Date((+now + +darkTo.date) / 2);
	} else if (sunset) {
		best = new Date(+sunset.date + 2 * 3600e3);
	}

	const phaseAngle = A.MoonPhase(now);
	const ill = A.Illumination(A.Body.Moon, now);
	const mrs = riseSet(A.Body.Moon, now);
	const q = A.SearchMoonQuarter(now);

	const planets: PlanetView[] = PLANETS.map((p) => {
		const eq = A.Equator(p.body, best, obs, true, true);
		const hz = A.Horizon(best, obs, eq.ra, eq.dec, 'normal');
		const rs = riseSet(p.body, now);
		return {
			name: p.name,
			glyph: p.glyph,
			naked: p.naked,
			alt: hz.altitude,
			az: hz.azimuth,
			mag: A.Illumination(p.body, best).mag,
			rise: rs.rise,
			set: rs.set
		};
	}).sort((a, b) => b.alt - a.alt);

	let lunarEclipse: SkyNow['lunarEclipse'] = null;
	let solarEclipse: SkyNow['solarEclipse'] = null;
	try {
		const le = A.SearchLunarEclipse(now);
		lunarEclipse = { kind: String(le.kind), at: le.peak.date };
	} catch {
		/* leave null */
	}
	try {
		const se = A.SearchGlobalSolarEclipse(now);
		solarEclipse = { kind: String(se.kind), at: se.peak.date };
	} catch {
		/* leave null */
	}

	return {
		sunset: sunset ? sunset.date : null,
		sunrise: sunrise ? sunrise.date : null,
		darkFrom: darkFrom ? darkFrom.date : null,
		darkTo: darkTo ? darkTo.date : null,
		trueDark: !!(darkFrom && darkTo),
		best,
		moon: {
			phaseAngle,
			name: moonName(phaseAngle),
			emoji: moonEmoji(phaseAngle),
			lit: ill.phase_fraction * 100,
			distanceKm: ill.geo_dist * AU_KM,
			rise: mrs.rise,
			set: mrs.set,
			nextQuarter: { name: QUARTERS[q.quarter] ?? 'Moon', at: q.time.date }
		},
		planets,
		lunarEclipse,
		solarEclipse,
		showers: showerCalendar(now)
	};
}

export type Kp = { value: number; at: Date; history: number[] };
export type Apod = {
	title: string;
	explanation: string;
	url: string;
	hdurl?: string;
	media_type: string;
	date: string;
	copyright?: string;
};
export type Neo = {
	name: string;
	date: string;
	missKm: number;
	speedKmh: number;
	diameterM: number;
	hazardous: boolean;
};
export type Iss = { lat: number; lon: number; altKm: number; speedKmh: number; visibility: string };

class SkyStore {
	now = $state(new Date());
	sky = $derived(computeSky(this.now));

	kp = $state<Kp | null>(null);
	apod = $state<Apod | null>(null);
	neo = $state<Neo[]>([]);
	iss = $state<Iss | null>(null);

	errors = $state<Record<string, string>>({});
	alert = $state<string | null>(null);
	usingDemoKey = NASA_KEY === 'DEMO_KEY';

	private timers: ReturnType<typeof setInterval>[] = [];
	private lastKp = -1;

	private fail(key: string, e: unknown) {
		this.errors = { ...this.errors, [key]: e instanceof Error ? e.message : 'unavailable' };
	}
	private ok(key: string) {
		if (!(key in this.errors)) return;
		const next = { ...this.errors };
		delete next[key];
		this.errors = next;
	}

	async loadKp() {
		try {
			const r = await fetch(KP_URL);
			if (!r.ok) throw new Error('NOAA ' + r.status);
			const j = (await r.json()) as { time_tag: string; estimated_kp: number; kp_index: number }[];
			if (!j.length) throw new Error('NOAA sent nothing');
			const last = j[j.length - 1];
			const value = Number(last.estimated_kp ?? last.kp_index);
			// NOAA stamps UTC without a zone, so it must be spelled out
			const at = new Date(last.time_tag + 'Z');
			const step = Math.max(1, Math.floor(j.length / 48));
			const history: number[] = [];
			for (let i = 0; i < j.length; i += step)
				history.push(Number(j[i].estimated_kp ?? j[i].kp_index));

			if (this.lastKp >= 0 && value >= 5 && value > this.lastKp)
				this.alert = `Geomagnetic storm: Kp ${value}. Aurora may be visible from Rychnov.`;
			this.lastKp = value;
			this.kp = { value, at, history };
			this.ok('kp');
		} catch (e) {
			this.fail('kp', e);
		}
	}

	async loadApod() {
		try {
			const r = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${NASA_KEY}`);
			if (!r.ok) throw new Error('NASA ' + r.status);
			this.apod = (await r.json()) as Apod;
			this.ok('apod');
		} catch (e) {
			this.fail('apod', e);
		}
	}

	async loadNeo() {
		try {
			const start = new Date().toISOString().slice(0, 10);
			const end = new Date(Date.now() + 2 * 86400e3).toISOString().slice(0, 10);
			const r = await fetch(
				`https://api.nasa.gov/neo/rest/v1/feed?start_date=${start}&end_date=${end}&api_key=${NASA_KEY}`
			);
			if (!r.ok) throw new Error('NASA ' + r.status);
			const j = await r.json();
			const out: Neo[] = [];
			for (const day of Object.values(j.near_earth_objects ?? {}) as any[]) {
				for (const o of day) {
					const ca = o.close_approach_data?.[0];
					if (!ca) continue;
					const d = o.estimated_diameter?.meters;
					out.push({
						name: String(o.name).replace(/[()]/g, ''),
						date: ca.close_approach_date_full ?? ca.close_approach_date,
						missKm: Number(ca.miss_distance?.kilometers ?? 0),
						speedKmh: Number(ca.relative_velocity?.kilometers_per_hour ?? 0),
						diameterM: d ? (d.estimated_diameter_min + d.estimated_diameter_max) / 2 : 0,
						hazardous: !!o.is_potentially_hazardous_asteroid
					});
				}
			}
			this.neo = out.sort((a, b) => a.missKm - b.missKm).slice(0, 6);
			this.ok('neo');
		} catch (e) {
			this.fail('neo', e);
		}
	}

	async loadIss() {
		try {
			const r = await fetch(ISS_URL);
			if (!r.ok) throw new Error('ISS ' + r.status);
			const j = await r.json();
			this.iss = {
				lat: j.latitude,
				lon: j.longitude,
				altKm: j.altitude,
				speedKmh: j.velocity,
				visibility: j.visibility
			};
			this.ok('iss');
		} catch (e) {
			this.fail('iss', e);
		}
	}

	// Nothing here pushes, so "live" is a set of timers sized to how fast each
	// source actually changes. Everything pauses while the tab is hidden.
	start() {
		this.now = new Date();
		this.loadKp();
		this.loadApod();
		this.loadNeo();
		this.loadIss();

		const add = (fn: () => void, ms: number) => this.timers.push(setInterval(fn, ms));
		add(() => (this.now = new Date()), 30_000);
		add(() => this.loadKp(), 5 * 60_000);
		add(() => this.loadIss(), 15_000);
		add(() => {
			this.loadApod();
			this.loadNeo();
		}, 60 * 60_000);

		const vis = () => {
			if (document.visibilityState !== 'visible') return;
			this.now = new Date();
			this.loadKp();
			this.loadIss();
		};
		document.addEventListener('visibilitychange', vis);

		return () => {
			this.timers.forEach(clearInterval);
			this.timers = [];
			document.removeEventListener('visibilitychange', vis);
		};
	}
}

export const sky = new SkyStore();
