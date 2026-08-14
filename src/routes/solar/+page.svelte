<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import * as A from 'astronomy-engine';
	import { PLANETS, SUN, DEEP_SKY, type Planet, type DeepSky } from '$lib/solar';
	import { fmtNum } from '$lib/sky';

	let now = $state(new Date());
	let tab = $state<'system' | 'deep'>('system');
	let picked = $state<string>('Earth');
	let pickedDeep = $state<string | null>(null);
	let images = $state<Record<string, { url: string; title: string } | null>>({});

	onMount(() => {
		const t = setInterval(() => (now = new Date()), 60_000);
		return () => clearInterval(t);
	});

	// log spacing, otherwise Mercury sits on the Sun and Neptune leaves the page
	const RMIN = 14;
	const RMAX = 96;
	const lo = Math.log10(PLANETS[0].orbitAu * 10 + 1);
	const hi = Math.log10(PLANETS[PLANETS.length - 1].orbitAu * 10 + 1);
	function orbitR(au: number): number {
		const v = (Math.log10(au * 10 + 1) - lo) / (hi - lo);
		return RMIN + v * (RMAX - RMIN);
	}

	// real radii compressed hard, otherwise Jupiter is a blob and Pluto vanishes
	function bodyR(radiusKm: number): number {
		return Math.max(1.5, Math.pow(radiusKm, 0.32) * 0.141);
	}

	type Placed = {
		p: Planet;
		x: number;
		y: number;
		r: number;
		br: number;
		lon: number;
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
			const v = A.HelioVector(A.Body[p.key as keyof typeof A.Body] as A.Body, now);
			const lon = Math.atan2(v.y, v.x);
			const r = orbitR(p.orbitAu);
			const x = Math.cos(lon) * r;
			const y = -Math.sin(lon) * r;
			let earthAu = 0;
			try {
				const g = A.GeoVector(A.Body[p.key as keyof typeof A.Body] as A.Body, now, true);
				earthAu = Math.hypot(g.x, g.y, g.z);
			} catch {
				earthAu = 0;
			}
			// the lit limb has to face the Sun, so the gradient focus leans inward
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
			return {
				p,
				x,
				y,
				r,
				br: bodyR(p.radiusKm),
				lon,
				fx: 0.5 - (x / d) * 0.32,
				fy: 0.5 - (y / d) * 0.32,
				trail,
				sunAu: Math.hypot(v.x, v.y, v.z),
				earthAu
			};
		})
	);

	let current = $derived(placed.find((q) => q.p.key === picked) ?? null);
	let deep = $derived(DEEP_SKY.find((d) => d.key === pickedDeep) ?? null);

	async function loadImage(d: DeepSky) {
		if (d.key in images) return;
		images = { ...images, [d.key]: null };
		try {
			const r = await fetch(
				`https://images-api.nasa.gov/search?q=${encodeURIComponent(d.query)}&media_type=image`
			);
			const j = await r.json();
			const it = j?.collection?.items?.[0];
			const url = it?.links?.[0]?.href;
			if (url) images = { ...images, [d.key]: { url, title: it.data?.[0]?.title ?? d.name } };
		} catch {
			/* card just stays text only */
		}
	}

	function openDeep(d: DeepSky) {
		pickedDeep = d.key;
		loadImage(d);
	}
</script>

<svelte:head>
	<title>Solar system</title>
</svelte:head>

<div class="space">
	<header class="head">
		<a class="back" href="/sky">← Night sky</a>
		<h1>The neighbourhood</h1>
		<p>Planets are drawn where they actually are right now. Orbit spacing is logarithmic.</p>
		<div class="tabs">
			<button class:on={tab === 'system'} onclick={() => (tab = 'system')}>Solar system</button>
			<button class:on={tab === 'deep'} onclick={() => (tab = 'deep')}>Deep sky</button>
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
						<circle
							class="orbit"
							class:lit={picked === q.p.key || hovered === q.p.key}
							cx="0"
							cy="0"
							r={q.r}
						/>
					{/each}

					{#each placed as q (q.p.key)}
						{#each q.trail as t, i (i)}
							<line
								x1={t.x1}
								y1={t.y1}
								x2={t.x2}
								y2={t.y2}
								stroke={q.p.color}
								stroke-opacity={t.o}
								stroke-width={q.br * 0.34}
								stroke-linecap="round"
							/>
						{/each}
					{/each}

					<circle cx="0" cy="0" r="26" fill="url(#corona)" />
					<circle class="sunface" cx="0" cy="0" r="7.5" fill="url(#sunface)" />
					<circle
						class="sunhit"
						cx="0"
						cy="0"
						r="14"
						onclick={() => (picked = 'Sun')}
						role="button"
						tabindex="0"
						aria-label="Sun"
						onkeydown={(e) => e.key === 'Enter' && (picked = 'Sun')}
					/>

					{#each placed as q (q.p.key)}
						<g
							class="planet"
							class:sel={picked === q.p.key}
							transform="translate({q.x} {q.y})"
							onclick={() => (picked = q.p.key)}
							onkeydown={(e) => e.key === 'Enter' && (picked = q.p.key)}
							onmouseenter={() => (hovered = q.p.key)}
							onmouseleave={() => (hovered = null)}
							role="button"
							tabindex="0"
							aria-label={q.p.name}
						>
							<circle class="hit" r={Math.max(8, q.br + 5)} />
							<circle
								class="bloom"
								r={q.br * 2.4}
								fill={q.p.color}
								opacity={picked === q.p.key || hovered === q.p.key ? 0.28 : 0.13}
							/>
							{#if q.p.ring}
								<g transform="rotate(-16)">
									<ellipse
										class="ringback"
										rx={q.br * 2}
										ry={q.br * 0.62}
										stroke={q.p.color}
									/>
								</g>
							{/if}
							<circle r={q.br} fill="url(#g-{q.p.key})" />
							{#if q.p.ring}
								<g transform="rotate(-16)">
									<path
										class="ringfront"
										d="M {-q.br * 2} 0 A {q.br * 2} {q.br * 0.62} 0 0 0 {q.br * 2} 0"
										stroke={q.p.color}
									/>
								</g>
							{/if}
							{#if picked === q.p.key || hovered === q.p.key}
								<circle class="halo" r={q.br + 3.2} />
								<text y={-(q.br + 5.5)}>{q.p.name}</text>
							{/if}
						</g>
					{/each}
				</svg>
				<p class="stamp">
					{now.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
				</p>
			</div>

			<aside class="detail">
				{#if picked === 'Sun'}
					<span class="glyph" style="color:{SUN.color}">{SUN.glyph}</span>
					<h2>{SUN.name}</h2>
					<p class="tag">{SUN.tagline}</p>
					<dl>
						<div><dt>Radius</dt><dd>{fmtNum(SUN.radiusKm)} km</dd></div>
					</dl>
					<ul>
						{#each SUN.facts as f (f)}<li>{f}</li>{/each}
					</ul>
				{:else if current}
					{#key current.p.key}
						<div in:fly={{ y: 8, duration: 160 }}>
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
							<ul>
								{#each current.p.facts as f (f)}<li>{f}</li>{/each}
							</ul>
						</div>
					{/key}
				{/if}
			</aside>
		</div>
	{:else}
		<div class="deepgrid" in:fade={{ duration: 150 }}>
			{#each DEEP_SKY as d (d.key)}
				<button class="dcard" class:on={pickedDeep === d.key} onclick={() => openDeep(d)}>
					<strong>{d.name}</strong>
					<span class="kind">{d.kind}</span>
					<span class="tag">{d.tagline}</span>
				</button>
			{/each}
		</div>

		{#if deep}
			<section class="dpanel" in:fly={{ y: 10, duration: 180 }}>
				{#if images[deep.key]}
					<img src={images[deep.key]!.url} alt={images[deep.key]!.title} loading="lazy" />
				{/if}
				<div>
					<h2>{deep.name}</h2>
					<p class="tag">{deep.kind} · {deep.distance}</p>
					<ul>
						{#each deep.facts as f (f)}<li>{f}</li>{/each}
					</ul>
					{#if images[deep.key]}
						<p class="credit">Image: NASA · {images[deep.key]!.title}</p>
					{/if}
				</div>
			</section>
		{/if}
	{/if}
</div>

<style>
	.space {
		min-height: 100dvh;
		padding: 1.2rem clamp(0.8rem, 3vw, 2rem) 3rem;
		color: #d9d6ef;
		background:
			radial-gradient(1px 1px at 14% 26%, rgba(255, 255, 255, 0.7), transparent 60%),
			radial-gradient(1px 1px at 72% 16%, rgba(255, 255, 255, 0.55), transparent 60%),
			radial-gradient(1.3px 1.3px at 86% 68%, rgba(255, 255, 255, 0.6), transparent 60%),
			radial-gradient(1px 1px at 30% 82%, rgba(255, 255, 255, 0.45), transparent 60%),
			radial-gradient(circle at 80% 10%, rgba(120, 80, 220, 0.2), transparent 45%),
			linear-gradient(180deg, #06040f, #0a0716 55%, #05030c);
		background-attachment: fixed;
	}
	.head {
		max-width: 1200px;
		margin: 0 auto 1.2rem;
	}
	.back {
		display: inline-block;
		margin-bottom: 0.8rem;
		padding: 0.4rem 0.75rem;
		border-radius: 10px;
		border: 1px solid rgba(255, 255, 255, 0.12);
		background: rgba(255, 255, 255, 0.04);
		color: #cfc9ea;
		text-decoration: none;
		font-size: 0.85rem;
	}
	h1 {
		margin: 0;
		font-size: clamp(1.5rem, 4vw, 2.2rem);
	}
	.head p {
		margin: 0.25rem 0 0.9rem;
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
		border: 1px solid rgba(255, 255, 255, 0.09);
		background:
			radial-gradient(1px 1px at 18% 24%, rgba(255, 255, 255, 0.5), transparent 60%),
			radial-gradient(1px 1px at 76% 18%, rgba(255, 255, 255, 0.4), transparent 60%),
			radial-gradient(1px 1px at 62% 82%, rgba(255, 255, 255, 0.45), transparent 60%),
			radial-gradient(1px 1px at 28% 70%, rgba(255, 255, 255, 0.35), transparent 60%),
			radial-gradient(1px 1px at 88% 56%, rgba(255, 255, 255, 0.3), transparent 60%),
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
	/* back half sits under the globe, front half is drawn over it */
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
		border: 1px solid rgba(255, 255, 255, 0.09);
		background: rgba(255, 255, 255, 0.035);
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
		margin: 0 0 0.9rem;
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
	ul {
		margin: 0;
		padding: 0;
		list-style: none;
		display: grid;
		gap: 0.6rem;
	}
	li {
		position: relative;
		padding-left: 0.9rem;
		font-size: 0.86rem;
		line-height: 1.55;
		color: #bdb6dd;
	}
	li::before {
		content: '·';
		position: absolute;
		left: 0.2rem;
		color: #6f68a0;
	}

	.deepgrid {
		max-width: 1200px;
		margin: 0 auto 1rem;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: 0.7rem;
	}
	.dcard {
		text-align: left;
		display: grid;
		gap: 0.25rem;
		padding: 0.9rem 1rem;
		border-radius: 14px;
		border: 1px solid rgba(255, 255, 255, 0.09);
		background: rgba(255, 255, 255, 0.035);
		color: inherit;
		cursor: pointer;
	}
	.dcard:hover,
	.dcard.on {
		border-color: rgba(170, 150, 255, 0.6);
		background: rgba(140, 110, 240, 0.12);
	}
	.dcard .kind {
		font-size: 0.75rem;
		color: #8f88b4;
	}
	.dcard .tag {
		margin: 0.2rem 0 0;
		font-size: 0.82rem;
	}

	.dpanel {
		max-width: 1200px;
		margin: 0 auto;
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
		gap: 1rem;
		padding: 1.1rem;
		border-radius: 18px;
		border: 1px solid rgba(255, 255, 255, 0.09);
		background: rgba(255, 255, 255, 0.035);
	}
	@media (max-width: 860px) {
		.dpanel {
			grid-template-columns: 1fr;
		}
	}
	.dpanel img {
		width: 100%;
		border-radius: 12px;
	}
	.credit {
		margin: 0.8rem 0 0;
		font-size: 0.75rem;
		color: #7d769f;
	}
</style>
