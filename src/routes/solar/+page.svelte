<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import * as A from 'astronomy-engine';
	import { PLANETS, SUN, type Planet } from '$lib/solar';
	import { CATEGORIES, type SkyObject } from '$lib/deepsky';
	import Cosmos from '$lib/components/Cosmos.svelte';
	import { fmtNum } from '$lib/sky';

	let now = $state(new Date());
	let tab = $state<'system' | 'deep'>('system');
	let picked = $state<string>('Earth');
	let factIndex = $state(0);

	let openCat = $state<string | null>(null);
	let pickedObj = $state<SkyObject | null>(null);
	let objFact = $state(0);

	type Shot = { url: string; title: string };
	let shots = $state<Record<string, Shot | null>>({});
	let loadingCat = $state<string | null>(null);

	onMount(() => {
		const t = setInterval(() => (now = new Date()), 60_000);
		return () => clearInterval(t);
	});

	const RMIN = 14;
	const RMAX = 96;
	const lo = Math.log10(PLANETS[0].orbitAu * 10 + 1);
	const hi = Math.log10(PLANETS[PLANETS.length - 1].orbitAu * 10 + 1);
	function orbitR(au: number): number {
		return RMIN + ((Math.log10(au * 10 + 1) - lo) / (hi - lo)) * (RMAX - RMIN);
	}
	function bodyR(radiusKm: number): number {
		return Math.max(1.5, Math.pow(radiusKm, 0.32) * 0.141);
	}

	type Placed = {
		p: Planet;
		x: number;
		y: number;
		r: number;
		br: number;
		fx: number;
		fy: number;
		trail: { x1: number; y1: number; x2: number; y2: number; o: number }[];
		sunAu: number;
		earthAu: number;
	};

	const TRAIL_SEGS = 14;
	const TRAIL_ARC = 0.62;
	let hovered = $state<string | null>(null);

	let placed = $derived.by((): Placed[] =>
		PLANETS.map((p) => {
			const body = A.Body[p.key as keyof typeof A.Body] as A.Body;
			const v = A.HelioVector(body, now);
			const lon = Math.atan2(v.y, v.x);
			const r = orbitR(p.orbitAu);
			const x = Math.cos(lon) * r;
			const y = -Math.sin(lon) * r;
			let earthAu = 0;
			try {
				const g = A.GeoVector(body, now, true);
				earthAu = Math.hypot(g.x, g.y, g.z);
			} catch {
				earthAu = 0;
			}
			const d = Math.hypot(x, y) || 1;
			const trail = [];
			for (let i = 0; i < TRAIL_SEGS; i++) {
				const a1 = lon - (TRAIL_ARC * (i + 1)) / TRAIL_SEGS;
				const a2 = lon - (TRAIL_ARC * i) / TRAIL_SEGS;
				trail.push({
					x1: Math.cos(a1) * r,
					y1: -Math.sin(a1) * r,
					x2: Math.cos(a2) * r,
					y2: -Math.sin(a2) * r,
					o: Math.pow(i / TRAIL_SEGS, 1.7) * 0.75
				});
			}
			return { p, x, y, r, br: bodyR(p.radiusKm), fx: 0.5 - (x / d) * 0.32, fy: 0.5 - (y / d) * 0.32, trail, sunAu: Math.hypot(v.x, v.y, v.z), earthAu };
		})
	);

	let current = $derived(placed.find((q) => q.p.key === picked) ?? null);
	let facts = $derived(picked === 'Sun' ? SUN.facts : (current?.p.facts ?? []));

	function pick(key: string) {
		picked = key;
		factIndex = 0;
	}
	function step(by: number) {
		if (!facts.length) return;
		factIndex = (factIndex + by + facts.length) % facts.length;
	}
	function stepObj(by: number) {
		if (!pickedObj) return;
		objFact = (objFact + by + pickedObj.facts.length) % pickedObj.facts.length;
	}

	// One request per object, and only when its section is opened. page_size=1
	// matters more than the image itself: the default search reply is 201 kB of
	// JSON for one URL, this is 3 kB. NASA has no variant smaller than ~small,
	// so everything else has to come from simply not asking.
	async function fetchShot(key: string, query: string) {
		if (key in shots) return;
		shots = { ...shots, [key]: null };
		try {
			const r = await fetch(
				`https://images-api.nasa.gov/search?q=${encodeURIComponent(query)}&media_type=image&page_size=1`
			);
			const j = await r.json();
			const it = j?.collection?.items?.[0];
			const url = it?.links?.[0]?.href;
			if (url) shots = { ...shots, [key]: { url, title: it.data?.[0]?.title ?? '' } };
		} catch {
			/* the card just stays text only */
		}
	}

	async function toggleCat(key: string) {
		if (openCat === key) {
			openCat = null;
			return;
		}
		openCat = key;
		pickedObj = null;
		const cat = CATEGORIES.find((c) => c.key === key);
		if (!cat) return;
		loadingCat = key;
		await Promise.all(cat.items.map((i) => fetchShot(i.key, i.query)));
		loadingCat = null;
	}

	function openObj(o: SkyObject) {
		pickedObj = pickedObj?.key === o.key ? null : o;
		objFact = 0;
	}
</script>

<svelte:head>
	<title>Solar system</title>
</svelte:head>

<Cosmos />

<div class="space">
	<header class="head">
		<div class="navrow">
			<a class="back" href="/">← Binder</a>
			<a class="back" href="/sky">← Night sky</a>
		</div>
		<h1>Solar system</h1>
		<p class="sub">Everything is drawn where it actually is right now. Orbit spacing is logarithmic.</p>
		<div class="tabs">
			<button class:on={tab === 'system'} onclick={() => (tab = 'system')}>Planets</button>
			<button class:on={tab === 'deep'} onclick={() => (tab = 'deep')}>Everything else</button>
		</div>
	</header>

	{#if tab === 'system'}
		<div class="split" in:fade={{ duration: 150 }}>
			<div class="orrery">
				<svg viewBox="-108 -108 216 216" role="img" aria-label="Live map of the solar system">
					<defs>
						<radialGradient id="corona">
							<stop offset="0%" stop-color="#fff6d8" stop-opacity="0.95" />
							<stop offset="22%" stop-color="#ffc85a" stop-opacity="0.5" />
							<stop offset="55%" stop-color="#ff9420" stop-opacity="0.16" />
							<stop offset="100%" stop-color="#ff7a00" stop-opacity="0" />
						</radialGradient>
						<radialGradient id="sunface" fx="0.42" fy="0.38">
							<stop offset="0%" stop-color="#fffdf2" />
							<stop offset="55%" stop-color="#ffd45c" />
							<stop offset="100%" stop-color="#ff9d21" />
						</radialGradient>
						<radialGradient id="deepspace">
							<stop offset="0%" stop-color="#161033" stop-opacity="0.85" />
							<stop offset="55%" stop-color="#0a0720" stop-opacity="0.5" />
							<stop offset="100%" stop-color="#04030c" stop-opacity="0" />
						</radialGradient>
						{#each placed as q (q.p.key)}
							<radialGradient id="g-{q.p.key}" fx={q.fx} fy={q.fy}>
								<stop offset="0%" stop-color="#ffffff" stop-opacity="0.85" />
								<stop offset="28%" stop-color={q.p.color} />
								<stop offset="100%" stop-color="#0a0616" />
							</radialGradient>
						{/each}
					</defs>

					<circle cx="0" cy="0" r="104" fill="url(#deepspace)" />

					{#each placed as q (q.p.key)}
						<circle class="orbit" class:lit={picked === q.p.key || hovered === q.p.key} cx="0" cy="0" r={q.r} />
					{/each}

					{#each placed as q (q.p.key)}
						{#each q.trail as t, i (i)}
							<line x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke={q.p.color} stroke-opacity={t.o} stroke-width={q.br * 0.34} stroke-linecap="round" />
						{/each}
					{/each}

					<circle cx="0" cy="0" r="26" fill="url(#corona)" />
					<circle cx="0" cy="0" r="7.5" fill="url(#sunface)" />
					<circle class="sunhit" cx="0" cy="0" r="14" onclick={() => pick('Sun')} role="button" tabindex="0" aria-label="Sun" onkeydown={(e) => e.key === 'Enter' && pick('Sun')} />

					{#each placed as q (q.p.key)}
						<g
							class="planet"
							class:sel={picked === q.p.key}
							transform="translate({q.x} {q.y})"
							onclick={() => pick(q.p.key)}
							onkeydown={(e) => e.key === 'Enter' && pick(q.p.key)}
							onmouseenter={() => (hovered = q.p.key)}
							onmouseleave={() => (hovered = null)}
							role="button"
							tabindex="0"
							aria-label={q.p.name}
						>
							<circle class="hit" r={Math.max(8, q.br + 5)} />
							<circle class="bloom" r={q.br * 2.4} fill={q.p.color} opacity={picked === q.p.key || hovered === q.p.key ? 0.28 : 0.13} />
							{#if q.p.ring}
								<g transform="rotate(-16)"><ellipse class="ringback" rx={q.br * 2} ry={q.br * 0.62} stroke={q.p.color} /></g>
							{/if}
							<circle r={q.br} fill="url(#g-{q.p.key})" />
							{#if q.p.ring}
								<g transform="rotate(-16)"><path class="ringfront" d="M {-q.br * 2} 0 A {q.br * 2} {q.br * 0.62} 0 0 0 {q.br * 2} 0" stroke={q.p.color} /></g>
							{/if}
							{#if picked === q.p.key || hovered === q.p.key}
								<circle class="halo" r={q.br + 3.2} />
								<text y={-(q.br + 5.5)}>{q.p.name}</text>
							{/if}
						</g>
					{/each}
				</svg>
				<p class="stamp">{now.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</p>
			</div>

			<aside class="detail">
				{#key picked}
					<div in:fly={{ y: 8, duration: 160 }}>
						{#if picked === 'Sun'}
							<span class="glyph" style="color:{SUN.color}">{SUN.glyph}</span>
							<h2>{SUN.name}</h2>
							<p class="tag">{SUN.tagline}</p>
							<dl><div><dt>Radius</dt><dd>{fmtNum(SUN.radiusKm)} km</dd></div></dl>
						{:else if current}
							<span class="glyph" style="color:{current.p.color}">{current.p.glyph}</span>
							<h2>{current.p.name}</h2>
							<p class="tag">{current.p.tagline}</p>
							<dl>
								<div><dt>From the Sun now</dt><dd>{current.sunAu.toFixed(2)} AU</dd></div>
								<div><dt>From Earth now</dt><dd>{current.earthAu.toFixed(2)} AU</dd></div>
								<div><dt>Radius</dt><dd>{fmtNum(current.p.radiusKm)} km</dd></div>
								<div><dt>Day</dt><dd>{current.p.dayLength}</dd></div>
								<div><dt>Year</dt><dd>{current.p.yearLength}</dd></div>
								<div><dt>Moons</dt><dd>{current.p.moons}</dd></div>
							</dl>
						{/if}
					</div>
				{/key}

				{#if facts.length}
					<div class="carousel">
						<button class="side" onclick={() => step(-1)} aria-label="Previous fact">‹</button>
						<div class="cbody">
							<span class="cnum">{String(factIndex + 1).padStart(2, '0')} <i>/ {facts.length}</i></span>
							{#key factIndex}
								<p class="fact" in:fade={{ duration: 150 }}>{facts[factIndex]}</p>
							{/key}
							<div class="pips">
								{#each facts as _, i (i)}
									<button class="pip" class:on={i === factIndex} onclick={() => (factIndex = i)} aria-label="Fact {i + 1}"></button>
								{/each}
							</div>
						</div>
						<button class="side" onclick={() => step(1)} aria-label="Next fact">›</button>
					</div>
				{/if}
			</aside>
		</div>
	{:else}
		<div class="sections" in:fade={{ duration: 150 }}>
			{#each CATEGORIES as cat (cat.key)}
				<section class="cat" class:open={openCat === cat.key}>
					<button class="cathead" onclick={() => toggleCat(cat.key)} aria-expanded={openCat === cat.key}>
						<span class="caticon">{cat.icon}</span>
						<span class="cattext">
							<strong>{cat.name}</strong>
							<em>{cat.blurb}</em>
						</span>
						<span class="count">{cat.items.length}</span>
						<span class="chev" class:up={openCat === cat.key}>▾</span>
					</button>

					{#if openCat === cat.key}
						<div class="catbody" transition:fly={{ y: -6, duration: 160 }}>
							<div class="gallery">
								{#each cat.items as it (it.key)}
									<button class="tile" class:on={pickedObj?.key === it.key} onclick={() => openObj(it)}>
										{#if shots[it.key]}
											<img src={shots[it.key]!.url} alt={it.name} loading="lazy" width="320" height="200" />
										{:else}
											<span class="ph">{loadingCat === cat.key ? '…' : '—'}</span>
										{/if}
										<span class="tname">{it.name}</span>
									</button>
								{/each}
							</div>

							{#if pickedObj && cat.items.some((i) => i.key === pickedObj?.key)}
								<div class="objpanel" transition:fly={{ y: 8, duration: 160 }}>
									<div class="objhead">
										<h3>{pickedObj.name}</h3>
										<span class="objkind">{pickedObj.kind} · {pickedObj.distance}</span>
										<p class="tag">{pickedObj.tagline}</p>
									</div>
									<div class="carousel">
										<button class="side" onclick={() => stepObj(-1)} aria-label="Previous fact">‹</button>
										<div class="cbody">
											<span class="cnum">{String(objFact + 1).padStart(2, '0')} <i>/ {pickedObj.facts.length}</i></span>
											{#key objFact}
												<p class="fact" in:fade={{ duration: 150 }}>{pickedObj.facts[objFact]}</p>
											{/key}
											<div class="pips">
												{#each pickedObj.facts as _, i (i)}
													<button class="pip" class:on={i === objFact} onclick={() => (objFact = i)} aria-label="Fact {i + 1}"></button>
												{/each}
											</div>
										</div>
										<button class="side" onclick={() => stepObj(1)} aria-label="Next fact">›</button>
									</div>
									{#if shots[pickedObj.key]?.title}
										<p class="credit">Image: NASA · {shots[pickedObj.key]!.title}</p>
									{/if}
								</div>
							{/if}
						</div>
					{/if}
				</section>
			{/each}
		</div>
	{/if}
</div>

<style>
	.space {
		position: relative;
		z-index: 1;
		min-height: 100dvh;
		padding: 1.2rem clamp(0.8rem, 3vw, 2rem) 3rem;
		color: #d9d6ef;
	}
	.head {
		max-width: 1200px;
		margin: 0 auto 1.2rem;
	}
	.navrow {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 0.8rem;
	}
	.back {
		display: inline-block;
		padding: 0.4rem 0.75rem;
		border-radius: 10px;
		border: 1px solid rgba(255, 255, 255, 0.12);
		background: rgba(255, 255, 255, 0.04);
		color: #cfc9ea;
		text-decoration: none;
		font-size: 0.85rem;
	}
	.back:hover {
		border-color: rgba(255, 170, 90, 0.6);
	}
	h1 {
		margin: 0;
		font-size: clamp(1.6rem, 4.4vw, 2.5rem);
		font-weight: 700;
		letter-spacing: 0.01em;
		background: linear-gradient(100deg, #fff 10%, #cfc0ff 55%, #8ec7ff);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
	}
	.sub {
		margin: 0.3rem 0 1rem;
		font-size: 0.85rem;
		color: #9a93bd;
	}
	.tabs {
		display: flex;
		gap: 0.4rem;
	}
	.tabs button {
		padding: 0.45rem 0.9rem;
		border-radius: 999px;
		border: 1px solid rgba(255, 255, 255, 0.12);
		background: rgba(255, 255, 255, 0.04);
		color: #cfc9ea;
		cursor: pointer;
		font-size: 0.85rem;
	}
	.tabs button.on {
		border-color: rgba(255, 175, 95, 0.7);
		background: rgba(255, 150, 60, 0.14);
		color: #ffd6a8;
	}

	.split {
		max-width: 1200px;
		margin: 0 auto;
		display: grid;
		grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
		gap: 1rem;
		align-items: start;
	}
	@media (max-width: 860px) {
		.split {
			grid-template-columns: 1fr;
		}
	}

	.orrery {
		padding: 0.6rem;
		border-radius: 18px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		box-shadow:
			0 18px 46px rgba(0, 0, 0, 0.45),
			inset 0 1px 0 rgba(255, 255, 255, 0.06);
		background:
			radial-gradient(1px 1px at 18% 24%, rgba(255, 255, 255, 0.5), transparent 60%),
			radial-gradient(1px 1px at 76% 18%, rgba(255, 255, 255, 0.4), transparent 60%),
			radial-gradient(1px 1px at 62% 82%, rgba(255, 255, 255, 0.45), transparent 60%),
			radial-gradient(1px 1px at 28% 70%, rgba(255, 255, 255, 0.35), transparent 60%),
			radial-gradient(circle at 50% 50%, rgba(60, 40, 120, 0.18), transparent 62%),
			rgba(6, 4, 16, 0.72);
	}
	svg {
		width: 100%;
		height: auto;
		display: block;
	}
	.orbit {
		fill: none;
		stroke: rgba(190, 200, 255, 0.09);
		stroke-width: 0.3;
		transition:
			stroke 0.25s,
			stroke-width 0.25s;
	}
	.orbit.lit {
		stroke: rgba(210, 220, 255, 0.42);
		stroke-width: 0.5;
	}
	.sunhit {
		fill: transparent;
		cursor: pointer;
	}
	.planet {
		cursor: pointer;
	}
	.planet:focus-visible {
		outline: none;
	}
	.hit {
		fill: transparent;
	}
	.bloom {
		transition: opacity 0.25s;
	}
	.halo {
		fill: none;
		stroke: rgba(255, 255, 255, 0.75);
		stroke-width: 0.45;
	}
	.ringback,
	.ringfront {
		fill: none;
		stroke-width: 0.7;
		stroke-opacity: 0.75;
	}
	.ringfront {
		stroke-opacity: 0.95;
	}
	.planet text {
		font-size: 4.2px;
		font-weight: 600;
		letter-spacing: 0.06em;
		fill: #fff;
		text-anchor: middle;
		pointer-events: none;
		paint-order: stroke;
		stroke: rgba(4, 2, 12, 0.9);
		stroke-width: 1.1;
	}
	.stamp {
		margin: 0.4rem 0 0;
		text-align: center;
		font-size: 0.75rem;
		color: #7d769f;
	}

	.detail {
		padding: 1.1rem 1.2rem 1.2rem;
		border-radius: 18px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		background:
			radial-gradient(110% 70% at 0% 0%, rgba(150, 110, 255, 0.14), transparent 62%),
			rgba(9, 6, 22, 0.62);
		box-shadow:
			0 18px 46px rgba(0, 0, 0, 0.45),
			inset 0 1px 0 rgba(255, 255, 255, 0.06);
	}
	.glyph {
		font-size: 2rem;
		line-height: 1;
	}
	h2 {
		margin: 0.3rem 0 0.2rem;
		font-size: 1.35rem;
	}
	.tag {
		margin: 0 0 0.9rem;
		font-size: 0.88rem;
		color: #b3abd6;
	}
	dl {
		margin: 0;
		display: grid;
		gap: 0.3rem;
	}
	dl > div {
		display: flex;
		justify-content: space-between;
		gap: 0.6rem;
		font-size: 0.85rem;
	}
	dt {
		color: #948dba;
	}
	dd {
		margin: 0;
		font-variant-numeric: tabular-nums;
	}

	/* tall flanking buttons, same shape language as the binder page arrows */
	.carousel {
		margin-top: 1.1rem;
		display: grid;
		grid-template-columns: 42px minmax(0, 1fr) 42px;
		gap: 0.6rem;
		align-items: stretch;
	}
	.side {
		border-radius: 14px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		background: linear-gradient(180deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.02));
		color: #cfc9ea;
		cursor: pointer;
		font-size: 1.5rem;
		line-height: 1;
		transition:
			border-color 0.2s,
			background 0.2s,
			color 0.2s;
	}
	.side:hover {
		border-color: rgba(255, 178, 100, 0.75);
		background: linear-gradient(180deg, rgba(255, 160, 70, 0.18), rgba(255, 120, 40, 0.05));
		color: #fff;
	}
	.side:active {
		transform: translateY(1px);
	}
	.cbody {
		min-width: 0;
		padding: 0.85rem 1rem 0.9rem;
		border-radius: 14px;
		border: 1px solid rgba(255, 255, 255, 0.09);
		background:
			radial-gradient(120% 80% at 0% 0%, rgba(140, 110, 240, 0.12), transparent 60%),
			rgba(8, 5, 20, 0.55);
	}
	.cnum {
		display: block;
		margin-bottom: 0.45rem;
		font-size: 1.05rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		color: #ffc180;
		font-variant-numeric: tabular-nums;
	}
	.cnum i {
		font-style: normal;
		font-size: 0.72rem;
		font-weight: 500;
		letter-spacing: 0.1em;
		color: #7d769f;
	}
	.fact {
		margin: 0;
		min-height: 5.1rem;
		font-size: 0.95rem;
		line-height: 1.65;
		color: #e4dffa;
		text-wrap: pretty;
	}
	.pips {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		margin-top: 0.8rem;
	}
	.pip {
		width: 18px;
		height: 3px;
		border: 0;
		padding: 0;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.14);
		cursor: pointer;
		transition:
			background 0.2s,
			box-shadow 0.2s;
	}
	.pip:hover {
		background: rgba(255, 255, 255, 0.32);
	}
	.pip.on {
		background: linear-gradient(90deg, #ffd08a, #ff9d3c);
		box-shadow: 0 0 8px rgba(255, 160, 70, 0.65);
	}

	.sections {
		max-width: 1200px;
		margin: 0 auto;
		display: grid;
		gap: 0.7rem;
	}
	.cat {
		border-radius: 18px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		background:
			radial-gradient(120% 100% at 0% 0%, rgba(140, 110, 240, 0.1), transparent 58%),
			rgba(9, 6, 22, 0.58);
		box-shadow:
			0 14px 34px rgba(0, 0, 0, 0.38),
			inset 0 1px 0 rgba(255, 255, 255, 0.05);
		overflow: hidden;
		transition:
			border-color 0.2s,
			box-shadow 0.2s;
	}
	.cat.open {
		border-color: rgba(178, 152, 255, 0.55);
		box-shadow:
			0 18px 46px rgba(0, 0, 0, 0.5),
			0 0 0 1px rgba(150, 110, 255, 0.18),
			inset 0 1px 0 rgba(255, 255, 255, 0.07);
	}
	.cathead {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 0.9rem;
		padding: 1rem 1.1rem;
		border: 0;
		background: transparent;
		color: inherit;
		cursor: pointer;
		text-align: left;
	}
	.cathead:hover {
		background: rgba(255, 255, 255, 0.03);
	}
	.caticon {
		font-size: 1.5rem;
	}
	.cattext {
		flex: 1;
		min-width: 0;
	}
	.cattext strong {
		display: block;
		font-size: 1.05rem;
	}
	.cattext em {
		font-style: normal;
		font-size: 0.82rem;
		color: #8f88b4;
	}
	.count {
		padding: 0.12rem 0.5rem;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.07);
		font-size: 0.75rem;
		color: #b3abd6;
	}
	.chev {
		transition: transform 0.2s;
		color: #8f88b4;
	}
	.chev.up {
		transform: rotate(180deg);
	}

	.catbody {
		padding: 0 1.1rem 1.1rem;
	}
	.gallery {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 0.6rem;
	}
	.tile {
		position: relative;
		padding: 0;
		border-radius: 12px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		background: rgba(0, 0, 0, 0.35);
		overflow: hidden;
		cursor: pointer;
		color: inherit;
	}
	.tile:hover,
	.tile.on {
		border-color: rgba(255, 175, 95, 0.75);
	}
	.tile img {
		display: block;
		width: 100%;
		height: 108px;
		object-fit: cover;
	}
	.ph {
		display: grid;
		place-items: center;
		height: 108px;
		color: #6f68a0;
	}
	.tname {
		display: block;
		padding: 0.45rem 0.6rem;
		font-size: 0.8rem;
		text-align: left;
	}

	.objpanel {
		margin-top: 0.9rem;
		padding: 1rem 1.1rem 1.1rem;
		border-radius: 14px;
		border: 1px solid rgba(255, 255, 255, 0.09);
		background: rgba(10, 6, 22, 0.55);
	}
	.objhead h3 {
		margin: 0;
		font-size: 1.15rem;
	}
	.objkind {
		font-size: 0.78rem;
		color: #8f88b4;
	}
	.objpanel .tag {
		margin: 0.4rem 0 0;
	}
	.objpanel .carousel {
		margin-top: 0.8rem;
	}
	.credit {
		margin: 0.8rem 0 0;
		font-size: 0.75rem;
		color: #7d769f;
	}
</style>
