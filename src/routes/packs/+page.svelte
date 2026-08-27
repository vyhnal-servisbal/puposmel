<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly, scale } from 'svelte/transition';
	import { listSets, type CardSet } from '$lib/cardApi';
	import { packs } from '$lib/packStore.svelte';
	import { TIER_COLORS, TIER_NAMES, type PackCard } from '$lib/packs';

	let sets = $state<CardSet[]>([]);
	let query = $state('');
	let mode = $state<'stack' | 'instant'>('stack');
	let idx = $state(0);
	let leaving = $state(false);
	let preview = $state<PackCard | null>(null);
	let flash = $state<number>(-1);

	onMount(async () => {
		sets = await listSets();
		const saved = localStorage.getItem('packmode');
		if (saved === 'instant' || saved === 'stack') mode = saved;
	});

	$effect(() => {
		localStorage.setItem('packmode', mode);
	});

	// A handful of sets are a single promo card, which cannot make a pack of ten,
	// so they are shown but marked rather than quietly dropped.
	const MIN_POOL = 20;

	// one colour per era, so the picker reads as a timeline rather than 218 identical tiles
	const ERA: Record<string, string> = {
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
	function eraColor(id?: string): string {
		return ERA[id ?? ''] ?? '#8a83ad';
	}

	let filtered = $derived.by(() => {
		const q = query.trim().toLowerCase();
		if (!q) return sets;
		return sets.filter((s) => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q));
	});

	let pack = $derived(packs.pack);
	let cards = $derived(pack?.cards ?? []);
	let remaining = $derived(cards.slice(idx));
	let finished = $derived(!!pack && (mode === 'instant' || idx >= cards.length));

	function choose(s: CardSet) {
		packs.load(s.id, s.name);
	}

	// idle -> tearing (the crimp rips off) -> revealing (cards come out)
	let phase = $state<'idle' | 'tearing' | 'revealing'>('idle');
	const TEAR_MS = 760; // rip 440ms, then the wrapper is tossed away by 760ms

	function open() {
		if (phase !== 'idle') return;
		phase = 'tearing';
		setTimeout(() => {
			packs.open();
			idx = 0;
			leaving = false;
			phase = 'revealing';
			const best = Math.max(0, ...(packs.pack?.cards ?? []).map((c) => c.tier));
			if (packs.pack?.god) flashNow(6);
			else if (mode === 'instant' && best >= 4) flashNow(best);
			else if (mode === 'stack') {
				const first = packs.pack?.cards[0];
				if (first && first.tier >= 4) flashNow(first.tier);
			}
		}, TEAR_MS);
	}

	function again() {
		packs.clear();
		phase = 'idle';
	}

	function flashNow(t: number) {
		flash = t;
		setTimeout(() => (flash = -1), 900);
	}

	// the top card flies off, then the index moves so the next one flips in
	function next() {
		if (leaving || idx >= cards.length) return;
		leaving = true;
		setTimeout(() => {
			idx++;
			leaving = false;
			const c = cards[idx];
			if (c && c.tier >= 4) flashNow(c.tier);
		}, 260);
	}

	function bigImage(c: PackCard): string {
		return (c.image ?? '').replace('/low.webp', '/high.png');
	}

	function tierLabel(t: number): string {
		return TIER_NAMES[t] ?? 'Card';
	}
</script>

<svelte:head><title>Pack opening</title></svelte:head>

<svelte:window
	onkeydown={(e) => {
		if (preview && e.key === 'Escape') preview = null;
		else if (e.key === ' ' && pack && !finished) {
			e.preventDefault();
			next();
		}
	}}
/>

<div class="wrap">
	{#if flash >= 0}
		<div class="flash" style="--c:{TIER_COLORS[flash]}" transition:fade={{ duration: 220 }}></div>
	{/if}

	<header class="pagehead">
		<div class="navrow">
			<a class="btn" href="/">← Binder</a>
			<a class="btn" href="/game">Unboxing</a>
		</div>

		<div class="bar">
			<div class="modes">
				<button class:on={mode === 'stack'} onclick={() => (mode = 'stack')}>🂠 One by one</button>
				<button class:on={mode === 'instant'} onclick={() => (mode = 'instant')}>⚡ All at once</button>
			</div>
			{#if packs.setId}
				<span class="chip">{packs.setName}</span>
				<span class="chip">{packs.model} · {packs.size} cards</span>
				<span class="chip">{packs.opened} opened</span>
				{#if packs.godCount}<span class="chip god">{packs.godCount} god</span>{/if}
				<button class="btn ghost" onclick={() => { packs.setId = ''; packs.pool = []; packs.pack = null; }}>
					Change set
				</button>
			{/if}
		</div>
	</header>

	{#if !packs.setId}
		<section class="picker" in:fade={{ duration: 150 }}>
			<h1>Pick a set</h1>
			<p class="sub">
				Real rarity pools straight from the card database. Pack structure and pull rates follow the
				community numbers for that era, because official ones have never been published.
			</p>
			<div class="searchrow">
				<input class="search" placeholder="Search sets..." bind:value={query} />
				<span class="tally">
					{filtered.length}{filtered.length !== sets.length ? ' / ' + sets.length : ''} sets
				</span>
			</div>
			<div class="setgrid">
				{#each filtered as s (s.id)}
					<button
						class="setbtn"
						class:small={(s.total ?? 0) < MIN_POOL}
						style="--e:{eraColor(s.series)}"
						onclick={() => choose(s)}
					>
						<span class="logowrap">
							{#if s.logo}
								<img src={s.logo} alt="" loading="lazy" decoding="async" draggable="false" />
							{:else}
								<span class="noLogo">{s.id}</span>
							{/if}
						</span>
						<strong>{s.name}</strong>
						<span class="setmeta">{s.id} · {s.total ?? '?'} cards</span>
						{#if (s.total ?? 0) < MIN_POOL}<em>tiny pool</em>{/if}
					</button>
				{/each}
			</div>
			{#if !filtered.length}
				<p class="note">Nothing matches that.</p>
			{/if}
		</section>
	{:else if packs.loading}
		<section class="mid" in:fade={{ duration: 150 }}>
			<div class="loader">
				<div class="ring"></div>
				<strong>Reading {packs.setName}</strong>
				<span>{packs.done} / {packs.total} cards</span>
				<div class="pbar"><i style="width:{packs.progress}%"></i></div>
				<p class="note">Every card is checked once for its rarity, then the set is cached.</p>
			</div>
		</section>
	{:else if packs.error}
		<section class="mid"><p class="err">Could not load that set: {packs.error}</p></section>
	{:else if !pack}
		<section class="mid" in:fade={{ duration: 150 }}>
			<button class="pack" class:tearing={phase === 'tearing'} onclick={open} disabled={phase !== 'idle'}>
				<span class="crimp crimp-a"></span>
				<span class="foil">
					{#if packs.hero?.image}
						<span class="art" style="background-image:url({packs.hero.image})"></span>
					{/if}
					<span class="tint"></span>
					<span class="shine"></span>
					<span class="face">
						{#if packs.logo}
							<img class="plogo" src={packs.logo} alt={packs.setName} draggable="false" />
						{:else}
							<span class="plabel">{packs.setName}</span>
						{/if}
					</span>
					<span class="foot">
						{#if packs.symbol}
							<img class="psym" src={packs.symbol} alt="" draggable="false" />
						{/if}
						<span class="pcount">{packs.size} cards</span>
					</span>
				</span>
				<span class="crimp crimp-b"></span>
			</button>
			<p class="tap">{phase === 'tearing' ? 'Tearing...' : 'Click to open'}</p>
			{#if packs.best}
				<p class="bestline">
					Best so far: <b style="color:{TIER_COLORS[packs.best.tier]}">{packs.best.name}</b>
					· {packs.best.rarity}
				</p>
			{/if}
		</section>
	{:else if mode === 'stack' && !finished}
		<section class="table" in:fade={{ duration: 150 }}>
			<div class="counter">{idx + 1} <i>/ {cards.length}</i></div>

			<!-- the wrapper is gone by now; cards come out of where it was, so they
			     arrive from the right and are drawn up and to the left -->
			<div class="slot">
				{#each remaining.slice(0, 3).reverse() as c, i (c.slot)}
					{@const depth = Math.min(remaining.length, 3) - 1 - i}
					{@const isTop = depth === 0}
					<button
						class="card"
						class:top={isTop}
						class:leaving={isTop && leaving}
						class:hit={c.hit}
						style="--c:{TIER_COLORS[c.tier]}; --d:{depth}; z-index:{i}"
						onclick={() => isTop && next()}
						disabled={!isTop}
					>
						<img src={c.image} alt={c.name} draggable="false" />
						{#if c.hit}<span class="beam"></span>{/if}
					</button>
				{/each}
			</div>

			<p class="tap">
				{#if remaining[0]?.asReverse}<b class="revtag">reverse holo</b> ·{/if}
				Click the card, or press Space
			</p>
		</section>
	{:else}
		<section class="summary" in:fade={{ duration: 180 }}>
			{#if pack.god}
				<div class="godbar" in:scale={{ duration: 300 }}>GOD PACK</div>
			{/if}
			<div class="grid">
				{#each cards as c, i (c.slot)}
					<button
						class="cell"
						class:hit={c.hit}
						style="--c:{TIER_COLORS[c.tier]}"
						in:fly={{ y: 14, duration: 220, delay: mode === 'instant' ? i * 55 : 0 }}
						onclick={() => (preview = c)}
					>
						<img src={c.image} alt={c.name} loading="lazy" />
						<span class="meta">
							<b>{c.name}</b>
							<i style="color:{TIER_COLORS[c.tier]}">{c.rarity}</i>
						</span>
						{#if c.hit}<span class="corner" style="background:{TIER_COLORS[c.tier]}"></span>{/if}
					</button>
				{/each}
			</div>
			<div class="again">
				<button class="btn primary" onclick={again}>Open another</button>
				<span class="tally">
					{cards.filter((c) => c.hit).length} hit{cards.filter((c) => c.hit).length === 1 ? '' : 's'}
					· best {tierLabel(Math.max(...cards.map((c) => c.tier)))}
				</span>
			</div>
		</section>
	{/if}

	{#if preview}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="modal" onclick={() => (preview = null)} transition:fade={{ duration: 150 }}>
			<div class="sheet" onclick={(e) => e.stopPropagation()}>
				<img src={bigImage(preview)} alt={preview.name} />
				<div class="info">
					<strong>{preview.name}</strong>
					<span style="color:{TIER_COLORS[preview.tier]}">{preview.rarity}</span>
					<span class="dim">#{preview.number} · {preview.set}</span>
				</div>
				<button class="close" onclick={() => (preview = null)}>✕</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.wrap {
		position: relative;
		min-height: 100dvh;
		padding: 1rem clamp(0.7rem, 3vw, 2rem) 3rem;
		color: #ddd8f2;
		background:
			radial-gradient(circle at 20% 0%, rgba(120, 80, 220, 0.18), transparent 45%),
			radial-gradient(circle at 85% 20%, rgba(40, 130, 200, 0.14), transparent 45%),
			linear-gradient(180deg, #08060f, #0b0818 55%, #06040d);
	}

	.flash {
		position: fixed;
		inset: 0;
		z-index: 30;
		pointer-events: none;
		background: radial-gradient(circle at 50% 45%, var(--c), transparent 62%);
		opacity: 0.5;
	}

	.pagehead {
		max-width: 1100px;
		margin: 0 auto 1.2rem;
	}
	.navrow {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 0.8rem;
	}
	.btn {
		padding: 0.42rem 0.8rem;
		border-radius: 10px;
		border: 1px solid rgba(255, 255, 255, 0.12);
		background: rgba(255, 255, 255, 0.05);
		color: #cfc9ea;
		text-decoration: none;
		font-size: 0.85rem;
		cursor: pointer;
	}
	.btn:hover {
		border-color: rgba(255, 175, 95, 0.7);
	}
	.btn.primary {
		background: linear-gradient(180deg, rgba(255, 170, 80, 0.25), rgba(255, 120, 40, 0.12));
		border-color: rgba(255, 175, 95, 0.75);
		color: #fff;
		font-weight: 600;
	}
	.bar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.45rem;
	}
	.modes {
		display: flex;
		gap: 0.3rem;
		margin-right: 0.4rem;
	}
	.modes button {
		padding: 0.42rem 0.8rem;
		border-radius: 999px;
		border: 1px solid rgba(255, 255, 255, 0.12);
		background: rgba(255, 255, 255, 0.04);
		color: #cfc9ea;
		cursor: pointer;
		font-size: 0.83rem;
	}
	.modes button.on {
		border-color: rgba(255, 175, 95, 0.75);
		background: rgba(255, 150, 60, 0.16);
		color: #ffd6a8;
	}
	.chip {
		padding: 0.24rem 0.6rem;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.06);
		font-size: 0.78rem;
		color: #b3abd6;
	}
	.chip.god {
		background: rgba(255, 224, 102, 0.16);
		color: #ffe066;
	}

	.picker {
		max-width: 1100px;
		margin: 0 auto;
	}
	h1 {
		margin: 0;
		font-size: clamp(1.5rem, 4vw, 2.2rem);
		background: linear-gradient(100deg, #fff 10%, #cfc0ff 55%, #8ec7ff);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
	}
	.sub {
		margin: 0.35rem 0 1rem;
		max-width: 62ch;
		font-size: 0.86rem;
		line-height: 1.6;
		color: #9a93bd;
	}
	.searchrow {
		display: flex;
		align-items: center;
		gap: 0.7rem;
		margin-bottom: 1rem;
	}
	.search {
		flex: 1;
		max-width: 420px;
		padding: 0.6rem 0.9rem;
		border-radius: 12px;
		border: 1px solid rgba(255, 255, 255, 0.12);
		background: rgba(255, 255, 255, 0.04);
		color: inherit;
	}
	.searchrow .tally {
		font-size: 0.8rem;
		color: #8f88b4;
		white-space: nowrap;
	}
	.setbtn.small {
		opacity: 0.62;
	}
	.setbtn em {
		font-style: normal;
		font-size: 0.66rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #d38a6a;
	}
	.setgrid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(168px, 1fr));
		gap: 0.6rem;
	}
	.setbtn {
		display: grid;
		gap: 0.2rem;
		justify-items: center;
		text-align: center;
		padding: 0.7rem 0.7rem 0.75rem;
		border-radius: 14px;
		border: 1px solid color-mix(in srgb, var(--e) 26%, transparent);
		background:
			radial-gradient(120% 70% at 50% 0%, color-mix(in srgb, var(--e) 16%, transparent), transparent 70%),
			rgba(255, 255, 255, 0.03);
		color: inherit;
		cursor: pointer;
		transition:
			border-color 0.18s,
			transform 0.18s;
	}
	.setbtn:hover {
		border-color: var(--e);
		transform: translateY(-2px);
	}
	/* logos vary wildly in aspect, so a fixed box keeps the grid even */
	.logowrap {
		display: grid;
		place-items: center;
		width: 100%;
		height: 52px;
		margin-bottom: 0.15rem;
	}
	.logowrap img {
		max-width: 100%;
		max-height: 52px;
		object-fit: contain;
		filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.5));
	}
	.noLogo {
		font-size: 0.9rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		color: var(--e);
	}
	.setbtn strong {
		font-size: 0.85rem;
		color: var(--e);
		line-height: 1.25;
	}
	.setmeta {
		font-size: 0.7rem;
		color: #8f88b4;
	}

	.mid {
		max-width: 1100px;
		margin: 2rem auto 0;
		display: grid;
		place-items: center;
		gap: 1rem;
	}
	.loader {
		display: grid;
		place-items: center;
		gap: 0.5rem;
		text-align: center;
	}
	.ring {
		width: 42px;
		height: 42px;
		border-radius: 50%;
		border: 3px solid rgba(255, 255, 255, 0.12);
		border-top-color: #ffb45f;
		animation: spin 0.9s linear infinite;
	}
	.pbar {
		width: min(320px, 70vw);
		height: 5px;
		border-radius: 99px;
		background: rgba(255, 255, 255, 0.1);
		overflow: hidden;
	}
	.pbar i {
		display: block;
		height: 100%;
		background: linear-gradient(90deg, #ffd08a, #ff9d3c);
		transition: width 0.2s;
	}
	.note {
		margin: 0.3rem 0 0;
		font-size: 0.78rem;
		color: #7d769f;
	}
	.err {
		color: #ff9a8a;
	}

	/* foil wrapper: crimped strip, body, crimped strip. The top one is what tears. */
	.pack {
		position: relative;
		width: min(268px, 72vw);
		padding: 0;
		border: 0;
		background: transparent;
		cursor: pointer;
		display: grid;
		grid-template-rows: 26px 1fr 18px;
		aspect-ratio: 63 / 96;
		filter: drop-shadow(0 22px 46px rgba(0, 0, 0, 0.55));
		transition: transform 0.18s;
	}
	.pack:hover:not(:disabled) {
		transform: translateY(-5px) scale(1.02);
	}
	.pack:disabled {
		cursor: default;
	}
	.crimp {
		position: relative;
		background:
			repeating-linear-gradient(90deg, rgba(0, 0, 0, 0.35) 0 3px, transparent 3px 7px),
			linear-gradient(180deg, #6a5ac4, #3b2f78);
		z-index: 2;
	}
	.crimp-a {
		border-radius: 9px 9px 2px 2px;
		box-shadow: inset 0 -3px 6px rgba(0, 0, 0, 0.45);
		transform-origin: left bottom;
	}
	.crimp-b {
		border-radius: 2px 2px 9px 9px;
		box-shadow: inset 0 3px 6px rgba(0, 0, 0, 0.45);
	}
	.foil {
		position: relative;
		display: grid;
		grid-template-rows: 1fr auto;
		overflow: hidden;
		background: linear-gradient(165deg, #3b2a78, #241a4e 55%, #140d2c);
	}
	/* the chase card of the set stands in for the artwork a real wrapper carries;
	   blown up and offset so only the illustration area shows, never the frame */
	.art {
		position: absolute;
		inset: 0;
		background-size: 210%;
		background-position: 50% 20%;
		background-repeat: no-repeat;
		opacity: 0.92;
	}
	.tint {
		position: absolute;
		inset: 0;
		background:
			linear-gradient(180deg, rgba(10, 6, 26, 0.72), rgba(10, 6, 26, 0.12) 38%, rgba(8, 5, 22, 0.9)),
			radial-gradient(70% 40% at 50% 12%, rgba(255, 214, 150, 0.28), transparent 65%);
	}
	.shine {
		position: absolute;
		inset: -40% -120%;
		background: linear-gradient(
			70deg,
			transparent 42%,
			rgba(255, 255, 255, 0.28) 50%,
			transparent 58%
		);
		animation: sweep 3.4s ease-in-out infinite;
		pointer-events: none;
	}
	.face {
		position: relative;
		display: grid;
		place-items: center;
		padding: 1rem 0.8rem 0;
	}
	/* percentage max-height against an auto sized row collapses the logo to a
	   sliver, which is what made it tiny; a fixed cap does not have that problem */
	.plogo {
		width: 86%;
		max-height: 120px;
		object-fit: contain;
		filter: drop-shadow(0 4px 14px rgba(0, 0, 0, 0.7));
	}
	.plabel {
		font-size: 1.15rem;
		font-weight: 700;
		text-align: center;
		text-shadow: 0 2px 10px rgba(0, 0, 0, 0.8);
		color: #fff;
	}
	.foot {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0 0 0.9rem;
	}
	.psym {
		width: 1.15rem;
		opacity: 0.85;
	}
	.pcount {
		font-size: 0.72rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: #d8cff5;
		text-shadow: 0 1px 6px rgba(0, 0, 0, 0.8);
	}

	/* the rip, then the wrapper itself is tossed to the right and gone, so the
	   cards are never sharing the screen with an empty husk */
	.pack.tearing .crimp-a {
		animation: rip 0.44s cubic-bezier(0.3, 0.1, 0.2, 1) forwards;
	}
	.pack.tearing .foil,
	.pack.tearing .crimp-b {
		animation: toss 0.46s cubic-bezier(0.4, 0, 0.7, 1) 0.3s forwards;
	}
	.pack.tearing {
		pointer-events: none;
	}
	.bestline {
		margin: 0;
		font-size: 0.85rem;
		color: #9a93bd;
	}

	.table {
		max-width: 1100px;
		margin: 1.4rem auto 0;
		display: grid;
		justify-items: center;
		gap: 0.7rem;
	}
	.counter {
		font-size: 1.3rem;
		font-weight: 700;
		color: #ffc180;
		font-variant-numeric: tabular-nums;
	}
	.counter i {
		font-style: normal;
		font-size: 0.8rem;
		color: #7d769f;
	}

	.slot {
		position: relative;
		width: min(300px, 76vw);
		aspect-ratio: 63 / 88;
	}

	.card {
		position: absolute;
		inset: 0;
		padding: 0;
		border: 0;
		border-radius: 14px;
		background: transparent;
		overflow: visible;
		transform: translate(calc(var(--d) * 9px), calc(var(--d) * 5px))
			scale(calc(1 - var(--d) * 0.04));
		transition:
			transform 0.26s ease,
			opacity 0.26s ease;
	}
	.card img {
		width: 100%;
		height: 100%;
		object-fit: contain;
		border-radius: 12px;
		display: block;
	}
	/* slides out of the pack, so it arrives from the right and travels up-left */
	.card.top {
		cursor: pointer;
		animation: draw 0.36s cubic-bezier(0.18, 0.7, 0.24, 1) both;
	}
	.card.leaving {
		transform: translate(-62%, -34%) rotate(-11deg) scale(0.94);
		opacity: 0;
	}
	.card.hit img {
		box-shadow:
			0 0 0 2px var(--c),
			0 0 34px var(--c);
	}
	.revtag {
		color: #9ecbff;
		font-weight: 600;
	}
	.beam {
		position: absolute;
		inset: -14%;
		border-radius: 50%;
		background: radial-gradient(circle, var(--c), transparent 62%);
		opacity: 0.35;
		pointer-events: none;
		animation: pulse 1.6s ease-in-out infinite;
	}
	.tap {
		margin: 0.8rem 0 0;
		font-size: 0.8rem;
		color: #7d769f;
	}

	.summary {
		max-width: 1100px;
		margin: 0 auto;
	}
	.godbar {
		margin: 0 auto 1rem;
		width: max-content;
		padding: 0.5rem 1.6rem;
		border-radius: 999px;
		font-weight: 800;
		letter-spacing: 0.22em;
		color: #1a1206;
		background: linear-gradient(90deg, #ffe066, #ffb454, #ffe066);
		box-shadow: 0 0 30px rgba(255, 210, 90, 0.55);
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(132px, 1fr));
		gap: 0.6rem;
	}
	.cell {
		position: relative;
		padding: 0;
		border-radius: 12px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		background: rgba(255, 255, 255, 0.03);
		color: inherit;
		cursor: pointer;
		overflow: hidden;
		text-align: left;
	}
	.cell img {
		width: 100%;
		display: block;
		aspect-ratio: 63 / 88;
		object-fit: contain;
	}
	.cell.hit {
		border-color: var(--c);
		box-shadow: 0 0 18px color-mix(in srgb, var(--c) 55%, transparent);
	}
	.meta {
		display: block;
		padding: 0.4rem 0.5rem 0.5rem;
	}
	.meta b {
		display: block;
		font-size: 0.78rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.meta i {
		font-style: normal;
		font-size: 0.7rem;
	}
	.corner {
		position: absolute;
		top: 0;
		right: 0;
		width: 0.85rem;
		height: 0.85rem;
		border-bottom-left-radius: 10px;
	}
	.again {
		display: flex;
		align-items: center;
		gap: 0.8rem;
		margin-top: 1.1rem;
	}
	.tally {
		font-size: 0.82rem;
		color: #9a93bd;
	}

	.modal {
		position: fixed;
		inset: 0;
		z-index: 40;
		display: grid;
		place-items: center;
		padding: 1rem;
		background: rgba(3, 2, 8, 0.82);
	}
	.sheet {
		position: relative;
		display: grid;
		gap: 0.7rem;
		max-width: min(420px, 92vw);
	}
	.sheet img {
		width: 100%;
		border-radius: 14px;
	}
	.info {
		display: grid;
		gap: 0.15rem;
		text-align: center;
	}
	.info strong {
		font-size: 1.05rem;
	}
	.dim {
		font-size: 0.78rem;
		color: #8f88b4;
	}
	.close {
		position: absolute;
		top: -0.6rem;
		right: -0.6rem;
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
		border: 1px solid rgba(255, 255, 255, 0.18);
		background: #14102a;
		color: #fff;
		cursor: pointer;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
	@keyframes sweep {
		0%,
		100% {
			transform: translateX(-40%);
		}
		50% {
			transform: translateX(40%);
		}
	}
	@keyframes draw {
		from {
			transform: translate(58%, 26%) rotate(7deg) scale(0.88);
			opacity: 0;
		}
		60% {
			opacity: 1;
		}
		to {
			transform: translate(0, 0) rotate(0) scale(1);
			opacity: 1;
		}
	}
	@keyframes rip {
		0% {
			transform: translate(0, 0) rotate(0);
			opacity: 1;
		}
		35% {
			transform: translate(4%, -14%) rotate(-7deg);
			opacity: 1;
		}
		100% {
			transform: translate(70%, -150%) rotate(38deg);
			opacity: 0;
		}
	}
	@keyframes toss {
		0% {
			transform: translate(0, 0) rotate(0);
			opacity: 1;
		}
		100% {
			transform: translate(150%, 18%) rotate(16deg);
			opacity: 0;
		}
	}
	@keyframes pulse {
		0%,
		100% {
			opacity: 0.25;
		}
		50% {
			opacity: 0.5;
		}
	}
</style>
