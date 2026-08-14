<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import Cosmos from '$lib/components/Cosmos.svelte';
	import { sky, SUN_IMG, AURORA_IMG } from '$lib/skyStore.svelte';
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

<Cosmos />

<div class="space">
	<header class="head">
		<div class="navrow">
			<a class="back" href="/">← Binder</a>
			<a class="back solar" href="/solar">Solar system →</a>
		</div>
		<h1>Night sky</h1>
		<p class="where">
			{PLACE.name}, {PLACE.region} · {PLACE.lat.toFixed(4)}° N {PLACE.lon.toFixed(4)}° E
		</p>
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
				<img class="shot" src="{AURORA_IMG}?t={sky.stamp}" alt="NOAA aurora forecast, northern hemisphere" loading="lazy" />
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
			<h2>The Sun, near live</h2>
			<img class="shot" src="{SUN_IMG}?t={sky.stamp}" alt="Solar Dynamics Observatory, 193 Å" loading="lazy" />
			<p class="note">
				SDO in the 193 Å band, which shows the million degree corona. Refreshes every few
				minutes.
			</p>
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
			<section class="card apod hero" in:fade={{ duration: 200 }}>
				<h2>Picture of the day</h2>
				<div class="apodrow">
					<div class="apodpic">
						{#if sky.apod.media_type === 'image'}
							<img src={sky.apod.url} alt={sky.apod.title} loading="lazy" />
						{:else}
							<a class="vid" href={sky.apod.url} target="_blank" rel="noreferrer"
								>Watch today's video →</a
							>
						{/if}
					</div>
					<div class="apodtext">
						<strong>{sky.apod.title}</strong>
						{#if sky.apod.copyright}<span class="stamp">© {sky.apod.copyright.trim()}</span>{/if}
						<p class="expl">{sky.apod.explanation}</p>
					</div>
				</div>
			</section>
		{:else if sky.errors.apod}
			<section class="card wide"><h2>Picture of the day</h2>
				<p class="err">NASA unreachable: {sky.errors.apod}</p></section>
		{/if}

		{#if sky.epic}
			<section class="card" in:fade={{ duration: 200 }}>
				<h2>Earth from a million miles</h2>
				<img class="shot" src={sky.epic.url} alt="EPIC full disc Earth" loading="lazy" />
				<p class="note">
					DSCOVR sits between us and the Sun and photographs the whole daylit face. Taken
					{sky.epic.date.replace('T', ' ')} UTC.
				</p>
			</section>
		{/if}
	</div>
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
		margin: 0 auto 1.4rem;
	}
	.navrow {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 0.9rem;
	}
	.solar {
		border-color: rgba(170, 150, 255, 0.45);
	}
	.where {
		margin: 0.25rem 0 0;
		font-size: 0.85rem;
		color: #9a93bd;
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
		font-size: clamp(1.7rem, 4.4vw, 2.6rem);
		font-weight: 700;
		letter-spacing: 0.01em;
		background: linear-gradient(100deg, #fff 10%, #cfc0ff 55%, #8ec7ff);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
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

	/* cards hug their content and dense packing fills the holes that leaves,
	   otherwise short panels stretch and the page turns into empty boxes */
	.grid {
		max-width: 1280px;
		margin: 0 auto;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(272px, 1fr));
		grid-auto-flow: dense;
		align-items: start;
		gap: 0.9rem;
	}
	.card {
		min-width: 0;
		padding: 1.05rem 1.15rem 1.15rem;
		border-radius: 18px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		background:
			radial-gradient(120% 80% at 0% 0%, rgba(140, 110, 240, 0.13), transparent 60%),
			rgba(9, 6, 22, 0.66);
		box-shadow:
			0 16px 40px rgba(0, 0, 0, 0.42),
			inset 0 1px 0 rgba(255, 255, 255, 0.06);
		transition:
			border-color 0.2s,
			transform 0.2s;
	}
	.card:hover {
		border-color: rgba(178, 152, 255, 0.42);
		transform: translateY(-2px);
	}
	.shot {
		width: 100%;
		border-radius: 12px;
		display: block;
		background: rgba(255, 255, 255, 0.04);
	}
	.wide {
		grid-column: span 2;
	}
	.hero {
		grid-column: 1 / -1;
	}
	@media (max-width: 620px) {
		.wide {
			grid-column: span 1;
		}
	}
	h2 {
		margin: 0 0 0.85rem;
		padding-left: 0.6rem;
		font-size: 0.74rem;
		text-transform: uppercase;
		letter-spacing: 0.14em;
		color: #a49cca;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		position: relative;
	}
	h2::before {
		content: '';
		position: absolute;
		left: 0;
		top: 50%;
		transform: translateY(-50%);
		width: 2px;
		height: 0.72rem;
		border-radius: 2px;
		background: linear-gradient(180deg, #ffc98a, #b98cff);
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
		font-size: 3.2rem;
		line-height: 1;
		filter: drop-shadow(0 0 14px rgba(200, 210, 255, 0.45));
	}
	.moonrow strong {
		display: block;
		font-size: 1.08rem;
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

	.apodrow {
		display: grid;
		grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
		gap: 1.2rem;
		align-items: start;
	}
	@media (max-width: 780px) {
		.apodrow {
			grid-template-columns: 1fr;
		}
	}
	.apodpic img {
		width: 100%;
		border-radius: 14px;
		display: block;
	}
	.apodtext strong {
		display: block;
		font-size: 1.15rem;
		margin-bottom: 0.15rem;
	}
	.vid {
		display: inline-block;
		margin-bottom: 0.6rem;
		color: #9ecbff;
	}
	.expl {
		margin: 0.6rem 0 0;
		font-size: 0.86rem;
		line-height: 1.65;
		color: #b0a9d2;
		text-wrap: pretty;
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
</style>
