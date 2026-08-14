<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import BlackHole from '$lib/components/BlackHole.svelte';
	import { sky } from '$lib/skyStore.svelte';
	import { PLACE, kpVerdict, fmtTime, fmtDate, fmtNum } from '$lib/sky';

	onMount(() => sky.start());

	let s = $derived(sky.sky);
	let verdict = $derived(sky.kp ? kpVerdict(sky.kp.value) : null);
	let upNow = $derived(s.planets.filter((p) => p.alt > 5));

	function compass(az: number): string {
		const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
		return dirs[Math.round(az / 45) % 8];
	}
</script>

<svelte:head>
	<title>Night sky over {PLACE.name}</title>
</svelte:head>

<div class="space">
	<header class="head">
		<a class="back" href="/">← Binder</a>
		<div class="title">
			<BlackHole size={92} />
			<div>
				<h1>Night sky</h1>
				<p>{PLACE.name}, {PLACE.region} · {PLACE.lat.toFixed(4)}° N {PLACE.lon.toFixed(4)}° E</p>
			</div>
		</div>
	</header>

	{#if sky.alert}
		<div class="alert" transition:fly={{ y: -8, duration: 200 }}>
			<span>🌌</span>
			<p>{sky.alert}</p>
			<button onclick={() => (sky.alert = null)}>✕</button>
		</div>
	{/if}

	<div class="grid">
		<section class="card moon">
			<h2>Moon</h2>
			<div class="moonrow">
				<span class="bigmoon">{s.moon.emoji}</span>
				<div>
					<strong>{s.moon.name}</strong>
					<span class="lit">{s.moon.lit.toFixed(0)}% lit</span>
				</div>
			</div>
			<dl>
				<div><dt>Moonrise</dt><dd>{fmtTime(s.moon.rise)}</dd></div>
				<div><dt>Moonset</dt><dd>{fmtTime(s.moon.set)}</dd></div>
				<div><dt>Distance</dt><dd>{fmtNum(s.moon.distanceKm)} km</dd></div>
				<div>
					<dt>{s.moon.nextQuarter.name}</dt>
					<dd>{fmtDate(s.moon.nextQuarter.at)}</dd>
				</div>
			</dl>
		</section>

		<section class="card">
			<h2>Darkness tonight</h2>
			<dl>
				<div><dt>Sunset</dt><dd>{fmtTime(s.sunset)}</dd></div>
				<div><dt>Sunrise</dt><dd>{fmtTime(s.sunrise)}</dd></div>
				<div><dt>Full dark from</dt><dd>{fmtTime(s.darkFrom)}</dd></div>
				<div><dt>Full dark until</dt><dd>{fmtTime(s.darkTo)}</dd></div>
			</dl>
			{#if !s.trueDark}
				<p class="note">
					The sun stays above −18° all night at this latitude right now, so it never gets
					astronomically dark. Best viewing is still around local midnight.
				</p>
			{:else}
				<p class="note">Darkest around {fmtTime(s.best)}. That is when the list below is measured.</p>
			{/if}
		</section>

		<section class="card wide">
			<h2>Planets {#if upNow.length}<span class="pill">{upNow.length} up</span>{/if}</h2>
			<ul class="planets">
				{#each s.planets as p (p.name)}
					<li class:up={p.alt > 5}>
						<span class="glyph">{p.glyph}</span>
						<span class="pname">
							{p.name}
							{#if !p.naked}<em>telescope</em>{/if}
						</span>
						<span class="alt">
							{#if p.alt > 5}
								{p.alt.toFixed(0)}° above {compass(p.az)}
							{:else}
								below horizon
							{/if}
						</span>
						<span class="mag">mag {p.mag.toFixed(1)}</span>
						<span class="rs">{fmtTime(p.rise)} → {fmtTime(p.set)}</span>
					</li>
				{/each}
			</ul>
		</section>

		<section class="card">
			<h2>Aurora watch</h2>
			{#if sky.kp && verdict}
				<div class="kp {verdict.tone}">
					<span class="kpval">{sky.kp.value}</span>
					<div>
						<strong>Kp {verdict.label}</strong>
						<span class="stamp">measured {fmtTime(sky.kp.at)}</span>
					</div>
				</div>
				<div class="bars">
					{#each sky.kp.history as v, i (i)}
						<span style="height:{Math.max(6, (v / 9) * 100)}%" class:hot={v >= 5}></span>
					{/each}
				</div>
				<p class="note">{verdict.text}</p>
			{:else if sky.errors.kp}
				<p class="err">NOAA unreachable: {sky.errors.kp}</p>
			{:else}
				<p class="note">Reading NOAA…</p>
			{/if}
		</section>

		<section class="card">
			<h2>Meteor showers</h2>
			<ul class="showers">
				{#each s.showers.slice(0, 5) as w (w.shower.name)}
					<li class:live={w.active}>
						<span class="sname">{w.shower.name}</span>
						<span class="szhr">{w.shower.zhr}/h</span>
						<span class="speak">
							{#if w.active && w.daysToPeak === 0}
								peaks tonight
							{:else if w.active && w.daysToPeak > 0}
								active · peaks in {w.daysToPeak}d
							{:else if w.active}
								active · past peak
							{:else}
								from {fmtDate(w.from)}
							{/if}
						</span>
					</li>
				{/each}
			</ul>
		</section>

		<section class="card">
			<h2>Next eclipses</h2>
			<dl>
				{#if s.lunarEclipse}
					<div>
						<dt>Lunar · {s.lunarEclipse.kind}</dt>
						<dd>{fmtDate(s.lunarEclipse.at)}</dd>
					</div>
				{/if}
				{#if s.solarEclipse}
					<div>
						<dt>Solar · {s.solarEclipse.kind}</dt>
						<dd>{fmtDate(s.solarEclipse.at)}</dd>
					</div>
				{/if}
			</dl>
			<p class="note">Dates are global; visibility from Rychnov is a separate question.</p>
		</section>

		<section class="card">
			<h2>ISS right now</h2>
			{#if sky.iss}
				<dl>
					<div><dt>Latitude</dt><dd>{sky.iss.lat.toFixed(2)}°</dd></div>
					<div><dt>Longitude</dt><dd>{sky.iss.lon.toFixed(2)}°</dd></div>
					<div><dt>Altitude</dt><dd>{fmtNum(sky.iss.altKm)} km</dd></div>
					<div><dt>Speed</dt><dd>{fmtNum(sky.iss.speedKmh)} km/h</dd></div>
				</dl>
				<p class="note">
					Currently in {sky.iss.visibility === 'daylight' ? 'sunlight' : "Earth's shadow"}.
				</p>
			{:else if sky.errors.iss}
				<p class="err">Tracker unreachable: {sky.errors.iss}</p>
			{:else}
				<p class="note">Locating…</p>
			{/if}
		</section>

		<section class="card wide">
			<h2>Close approaches</h2>
			{#if sky.neo.length}
				<ul class="neo">
					{#each sky.neo as n (n.name + n.date)}
						<li class:danger={n.hazardous}>
							<span class="nname">{n.name}</span>
							<span>{fmtNum(n.diameterM)} m</span>
							<span>{fmtNum(n.missKm)} km</span>
							<span>{fmtNum(n.speedKmh)} km/h</span>
							<span class="ndate">{n.date}</span>
						</li>
					{/each}
				</ul>
			{:else if sky.errors.neo}
				<p class="err">NASA unreachable: {sky.errors.neo}</p>
			{:else}
				<p class="note">Asking NASA…</p>
			{/if}
		</section>

		{#if sky.apod}
			<section class="card apod wide" in:fade={{ duration: 200 }}>
				<h2>Picture of the day</h2>
				{#if sky.apod.media_type === 'image'}
					<img src={sky.apod.url} alt={sky.apod.title} loading="lazy" />
				{:else}
					<a class="vid" href={sky.apod.url} target="_blank" rel="noreferrer">Watch today's video →</a>
				{/if}
				<strong>{sky.apod.title}</strong>
				{#if sky.apod.copyright}<span class="stamp">© {sky.apod.copyright.trim()}</span>{/if}
				<p class="expl">{sky.apod.explanation}</p>
			</section>
		{:else if sky.errors.apod}
			<section class="card wide"><h2>Picture of the day</h2>
				<p class="err">NASA unreachable: {sky.errors.apod}</p></section>
		{/if}
	</div>

	{#if sky.usingDemoKey}
		<p class="foot">
			Running on NASA's shared DEMO_KEY, which is rate limited. Put your own free key in
			<code>PUBLIC_NASA_KEY</code> to stop the picture and asteroid panels dropping out.
		</p>
	{/if}
</div>

<style>
	.space {
		min-height: 100dvh;
		padding: 1.2rem clamp(0.8rem, 3vw, 2rem) 3rem;
		color: #d9d6ef;
		background:
			radial-gradient(1px 1px at 12% 22%, rgba(255, 255, 255, 0.75), transparent 60%),
			radial-gradient(1px 1px at 68% 12%, rgba(255, 255, 255, 0.6), transparent 60%),
			radial-gradient(1.4px 1.4px at 82% 64%, rgba(255, 255, 255, 0.65), transparent 60%),
			radial-gradient(1px 1px at 34% 78%, rgba(255, 255, 255, 0.5), transparent 60%),
			radial-gradient(1.2px 1.2px at 48% 42%, rgba(255, 255, 255, 0.45), transparent 60%),
			radial-gradient(circle at 78% 8%, rgba(120, 80, 220, 0.22), transparent 45%),
			radial-gradient(circle at 8% 88%, rgba(40, 130, 200, 0.18), transparent 45%),
			linear-gradient(180deg, #06040f, #0a0716 55%, #05030c);
		background-attachment: fixed;
	}

	.head {
		max-width: 1200px;
		margin: 0 auto 1.4rem;
	}
	.back {
		display: inline-block;
		margin-bottom: 0.9rem;
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
	.title {
		display: flex;
		align-items: center;
		gap: 1.1rem;
	}
	h1 {
		margin: 0;
		font-size: clamp(1.6rem, 4vw, 2.4rem);
		letter-spacing: 0.02em;
	}
	.title p {
		margin: 0.25rem 0 0;
		font-size: 0.85rem;
		color: #9a93bd;
	}

	.alert {
		max-width: 1200px;
		margin: 0 auto 1rem;
		display: flex;
		align-items: center;
		gap: 0.7rem;
		padding: 0.75rem 1rem;
		border-radius: 12px;
		border: 1px solid rgba(255, 160, 70, 0.5);
		background: rgba(255, 140, 40, 0.14);
	}
	.alert p {
		margin: 0;
		flex: 1;
		font-size: 0.9rem;
	}
	.alert button {
		border: 0;
		background: transparent;
		color: inherit;
		cursor: pointer;
		font-size: 1rem;
	}

	.grid {
		max-width: 1200px;
		margin: 0 auto;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: 0.9rem;
	}
	.card {
		min-width: 0;
		padding: 1rem 1.1rem 1.1rem;
		border-radius: 16px;
		border: 1px solid rgba(255, 255, 255, 0.09);
		background: rgba(255, 255, 255, 0.035);
	}
	.wide {
		grid-column: span 2;
	}
	@media (max-width: 620px) {
		.wide {
			grid-column: span 1;
		}
	}
	h2 {
		margin: 0 0 0.8rem;
		font-size: 0.78rem;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: #8f88b4;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.pill {
		padding: 0.1rem 0.45rem;
		border-radius: 999px;
		background: rgba(255, 170, 80, 0.18);
		color: #ffc98a;
		letter-spacing: 0;
	}

	dl {
		margin: 0;
		display: grid;
		gap: 0.35rem;
	}
	dl > div {
		display: flex;
		justify-content: space-between;
		gap: 0.6rem;
		font-size: 0.88rem;
	}
	dt {
		color: #948dba;
	}
	dd {
		margin: 0;
		font-variant-numeric: tabular-nums;
	}

	.moonrow {
		display: flex;
		align-items: center;
		gap: 0.8rem;
		margin-bottom: 0.8rem;
	}
	.bigmoon {
		font-size: 2.6rem;
		line-height: 1;
	}
	.moonrow strong {
		display: block;
		font-size: 1rem;
	}
	.lit {
		font-size: 0.82rem;
		color: #948dba;
	}

	.planets {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.3rem;
	}
	.planets li {
		display: grid;
		grid-template-columns: 1.4rem 1fr auto auto auto;
		align-items: center;
		gap: 0.6rem;
		padding: 0.4rem 0.5rem;
		border-radius: 9px;
		font-size: 0.85rem;
		opacity: 0.45;
	}
	.planets li.up {
		opacity: 1;
		background: rgba(255, 255, 255, 0.04);
	}
	.glyph {
		font-size: 1.05rem;
		text-align: center;
	}
	.pname em {
		font-style: normal;
		font-size: 0.7rem;
		color: #8a83ad;
		margin-left: 0.35rem;
	}
	.alt,
	.mag,
	.rs {
		font-variant-numeric: tabular-nums;
		color: #a8a1c9;
		white-space: nowrap;
	}
	@media (max-width: 620px) {
		.planets li {
			grid-template-columns: 1.4rem 1fr auto;
		}
		.mag,
		.rs {
			display: none;
		}
	}

	.kp {
		display: flex;
		align-items: center;
		gap: 0.8rem;
		margin-bottom: 0.7rem;
	}
	.kpval {
		width: 2.6rem;
		height: 2.6rem;
		display: grid;
		place-items: center;
		border-radius: 12px;
		font-size: 1.3rem;
		font-weight: 700;
		background: rgba(255, 255, 255, 0.06);
	}
	.kp.calm .kpval {
		color: #86e0b0;
	}
	.kp.watch .kpval {
		color: #ffd479;
	}
	.kp.alert .kpval {
		color: #ff9a6a;
		background: rgba(255, 120, 50, 0.18);
	}
	.kp strong {
		display: block;
		font-size: 0.92rem;
	}
	.stamp {
		font-size: 0.75rem;
		color: #8a83ad;
	}
	.bars {
		display: flex;
		align-items: flex-end;
		gap: 2px;
		height: 34px;
		margin-bottom: 0.6rem;
	}
	.bars span {
		flex: 1;
		border-radius: 2px 2px 0 0;
		background: rgba(140, 200, 255, 0.35);
	}
	.bars span.hot {
		background: #ff8a4a;
	}

	.showers,
	.neo {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.3rem;
	}
	.showers li {
		display: grid;
		grid-template-columns: 1fr auto auto;
		gap: 0.6rem;
		align-items: center;
		padding: 0.4rem 0.5rem;
		border-radius: 9px;
		font-size: 0.85rem;
		opacity: 0.55;
	}
	.showers li.live {
		opacity: 1;
		background: rgba(120, 200, 255, 0.09);
	}
	.szhr,
	.speak {
		color: #a8a1c9;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}

	.neo li {
		display: grid;
		grid-template-columns: 1fr repeat(4, auto);
		gap: 0.7rem;
		align-items: center;
		padding: 0.4rem 0.5rem;
		border-radius: 9px;
		font-size: 0.82rem;
		background: rgba(255, 255, 255, 0.03);
		font-variant-numeric: tabular-nums;
	}
	.neo li.danger {
		border: 1px solid rgba(255, 110, 90, 0.45);
	}
	.nname {
		font-variant-numeric: normal;
	}
	.ndate {
		color: #8a83ad;
	}
	@media (max-width: 620px) {
		.neo li {
			grid-template-columns: 1fr auto;
		}
		.neo li span:nth-child(3),
		.neo li span:nth-child(4) {
			display: none;
		}
	}

	.apod img {
		width: 100%;
		border-radius: 12px;
		margin-bottom: 0.6rem;
	}
	.apod strong {
		display: block;
		margin-bottom: 0.2rem;
	}
	.vid {
		display: inline-block;
		margin-bottom: 0.6rem;
		color: #9ecbff;
	}
	.expl {
		margin: 0.5rem 0 0;
		font-size: 0.84rem;
		line-height: 1.55;
		color: #a8a1c9;
		max-height: 8.5rem;
		overflow: auto;
	}

	.note {
		margin: 0.6rem 0 0;
		font-size: 0.8rem;
		line-height: 1.5;
		color: #8a83ad;
	}
	.err {
		margin: 0;
		font-size: 0.82rem;
		color: #ff9a8a;
	}
	.foot {
		max-width: 1200px;
		margin: 1.2rem auto 0;
		font-size: 0.78rem;
		color: #7d769f;
	}
	code {
		padding: 0.05rem 0.3rem;
		border-radius: 5px;
		background: rgba(255, 255, 255, 0.07);
	}
</style>
