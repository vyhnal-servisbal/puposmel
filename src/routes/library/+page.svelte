<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { library, type LibRow } from '$lib/libraryStore.svelte';
	import { cloud } from '$lib/cloud.svelte';
	import { TIER_COLORS, TIER_NAMES, raritySymbol } from '$lib/packs';
	import { eraColor } from '$lib/setLook';
	import { cachedSet, loadSet, preloadSets, type SetCard } from '$lib/setIndex';
	import Card from '$lib/components/Card.svelte';

	type Tab = 'recent' | 'sets' | 'packs';
	type SortKey = 'recent' | 'rarity' | 'price' | 'copies' | 'name';

	const RECENT_N = 30;

	let tab = $state<Tab>('recent');
	let query = $state('');
	let openSet = $state<string | null>(null);
	let sort = $state<SortKey>('recent');
	let picked = $state<LibRow | null>(null);
	// how many cards each set holds in total, filled in as the lists arrive
	let sizes = $state<Record<string, number>>({});
	let setCards = $state<SetCard[]>([]);
	let showMissing = $state(true);

	onMount(() => {
		// init first: load() filters by profile name and it is empty until then
		cloud.init().then(() => {
			library.load();
			library.watch();
		});
		return () => library.unwatch();
	});

	// Typing searches whatever is in front of you: the set list while you are
	// looking at sets, the cards of one set once you are inside it, and the whole
	// collection anywhere else.
	let searching = $derived(query.trim().length > 0);
	let setSearch = $derived(searching && tab === 'sets' && !openSet);
	let cardSearch = $derived(searching && !setSearch);

	let filteredSets = $derived.by(() => {
		const q = query.trim().toLowerCase();
		if (!q) return library.sets;
		return library.sets.filter(
			(s) =>
				s.name.toLowerCase().includes(q) ||
				s.id.toLowerCase().includes(q) ||
				(s.series ?? '').toLowerCase().includes(q)
		);
	});

	let shown = $derived.by(() => {
		const q = query.trim().toLowerCase();
		let out = library.rows;

		// inside a set the search never leaves it
		if (openSet) out = out.filter((r) => r.set_id === openSet);

		if (cardSearch) {
			out = out.filter(
				(r) =>
					(r.data?.name ?? '').toLowerCase().includes(q) ||
					(r.rarity ?? '').toLowerCase().includes(q) ||
					(r.data?.number ?? '').toLowerCase().includes(q) ||
					(r.data?.set ?? '').toLowerCase().includes(q) ||
					(r.set_id ?? '').toLowerCase().includes(q)
			);
		} else if (!openSet && tab === 'recent') {
			return library.recent.slice(0, RECENT_N);
		}

		const by: Record<SortKey, (a: LibRow, b: LibRow) => number> = {
			recent: (a, b) => b.last_at.localeCompare(a.last_at),
			rarity: (a, b) => b.tier - a.tier || (b.price ?? 0) - (a.price ?? 0),
			price: (a, b) => (b.price ?? 0) * b.copies - (a.price ?? 0) * a.copies,
			copies: (a, b) => b.copies - a.copies,
			name: (a, b) => (a.data?.name ?? '').localeCompare(b.data?.name ?? '')
		};
		return [...out].sort(by[sort]);
	});

	let shownValue = $derived(shown.reduce((n, r) => n + (r.price ?? 0) * r.copies, 0));
	let openSetName = $derived(library.sets.find((s) => s.id === openSet)?.name ?? '');

	// A card counts as collected whichever finish it came in, so this is keyed on
	// the card id alone: normal and reverse are two rows but one card in the set.
	let ownedBySet = $derived.by(() => {
		const by = new Map<string, Set<string>>();
		for (const r of library.rows) {
			const id = r.set_id ?? '';
			if (!id) continue;
			let s = by.get(id);
			if (!s) by.set(id, (s = new Set()));
			s.add(r.card_id);
		}
		return by;
	});

	function pct(setId: string): number {
		const total = sizes[setId];
		if (!total) return 0;
		return Math.min(100, Math.round(((ownedBySet.get(setId)?.size ?? 0) / total) * 100));
	}

	// the sets tab needs every set's size for its bars
	$effect(() => {
		if (tab !== 'sets') return;
		const ids = library.sets.map((s) => s.id);
		for (const id of ids) {
			const c = cachedSet(id);
			if (c) sizes[id] = c.length;
		}
		preloadSets(ids, (id, cards) => (sizes[id] = cards.length));
	});

	// the open set needs the list itself, to know what is not there
	$effect(() => {
		const id = openSet;
		if (!id) {
			setCards = [];
			return;
		}
		const have = cachedSet(id);
		if (have) {
			setCards = have;
			sizes[id] = have.length;
			return;
		}
		setCards = [];
		loadSet(id).then((cards) => {
			if (openSet !== id || !cards.length) return;
			setCards = cards;
			sizes[id] = cards.length;
		});
	});

	// The whole set in set order, each slot either a card you have or a gap. Rows
	// are merged per card so a normal and a reverse of the same one share a tile.
	let slots = $derived.by(() => {
		if (!openSet || !setCards.length) return [];
		const byCard = new Map<string, LibRow[]>();
		for (const r of library.rows) {
			if (r.set_id !== openSet) continue;
			const list = byCard.get(r.card_id);
			if (list) list.push(r);
			else byCard.set(r.card_id, [r]);
		}
		// a card you do not own has no rarity to match on, so the search here is by
		// name and number, which is all a shadow shows anyway
		const q = query.trim().toLowerCase();
		const list = q
			? setCards.filter(
					(c) => c.name.toLowerCase().includes(q) || c.number.toLowerCase().includes(q)
				)
			: setCards;
		return list.map((c) => {
			const rows = byCard.get(c.id) ?? [];
			let best: LibRow | null = null;
			let copies = 0;
			for (const r of rows) {
				copies += r.copies;
				if (!best || r.tier > best.tier) best = r;
			}
			return { card: c, row: best, copies };
		});
	});

	// the full set view only makes sense in set order, so sorting is for owned only
	let fullSet = $derived(!!openSet && showMissing && setCards.length > 0);

	function money(v: number, unit = 'EUR'): string {
		return v.toLocaleString('en-GB', {
			style: 'currency',
			currency: unit,
			maximumFractionDigits: 2
		});
	}
	function big(url?: string): string {
		return (url ?? '').replace('/low.webp', '/high.png');
	}
	function asCard(r: LibRow) {
		return {
			id: r.card_id,
			name: r.data?.name ?? r.card_id,
			rarity: r.rarity ?? '',
			set: r.data?.set,
			setId: r.set_id ?? undefined,
			series: r.data?.series,
			number: r.data?.number,
			image: big(r.data?.image)
		};
	}
	function when(iso: string): string {
		return new Date(iso).toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}
	function goSet(id: string) {
		openSet = id;
		query = '';
		tab = 'sets';
	}
</script>

<svelte:head><title>Card library</title></svelte:head>
<svelte:window onkeydown={(e) => e.key === 'Escape' && (picked ? (picked = null) : (openSet = null))} />

<!-- one tile, used by both the plain grid and the full set view -->
{#snippet tile(r: LibRow, copies: number)}
	<button
		class="cell"
		class:hit={r.tier >= 3}
		style="--c:{TIER_COLORS[r.tier] ?? '#8a83ad'}"
		onclick={() => (picked = r)}
	>
		<span class="art">
			{#if r.data?.image}
				<img src={r.data.image} alt={r.data?.name ?? ''} loading="lazy" />
			{/if}
			{#if copies > 1}<span class="copies">×{copies}</span>{/if}
			{#if r.reverse}<span class="rev">R</span>{/if}
		</span>
		<span class="meta">
			<b>{r.data?.name ?? r.card_id}</b>
			<i style="color:{TIER_COLORS[r.tier] ?? '#8a83ad'}">
				<em>{raritySymbol(r.rarity ?? undefined)}</em>
				{r.reverse ? 'Reverse holo' : (r.rarity ?? '')}
			</i>
			{#if r.price}<span class="price">{money(r.price, r.price_unit ?? 'EUR')}</span>{/if}
		</span>
	</button>
{/snippet}

<div class="wrap">
	<header class="pagehead">
		<div class="navrow">
			<a class="btn" href="/">← Binder</a>
			<a class="btn" href="/packs">📦 Open packs</a>
		</div>
		<h1>Card library</h1>
		<p class="sub">Everything {cloud.profileName || 'you'} has ever pulled.</p>

		<div class="stats">
			<div class="stat"><b>{library.uniqueCards}</b><span>unique</span></div>
			<div class="stat"><b>{library.totalCards}</b><span>cards</span></div>
			<div class="stat"><b>{library.totalPacks}</b><span>packs</span></div>
			<div class="stat"><b>{money(library.totalValue)}</b><span>value</span></div>
			<div class="stat"><b>{library.totalHits}</b><span>hits</span></div>
			{#if library.totalGods}
				<div class="stat god"><b>{library.totalGods}</b><span>god packs</span></div>
			{/if}
		</div>

		{#if library.writeError}
			<p class="err small">{library.writeError}</p>
		{/if}

		{#if library.bestEver?.best_card}
			{@const b = library.bestEver}
			<div class="trophy" style="--c:{TIER_COLORS[b.best_tier] ?? '#ffd166'}">
				{#if b.best_card?.image}
					<img src={b.best_card.image} alt="" />
				{/if}
				<div>
					<span class="tlabel">Best pull so far</span>
					<strong>{b.best_card?.name}</strong>
					<span class="trare">{b.best_card?.rarity} · {b.set_name ?? b.set_id}</span>
				</div>
				{#if b.best_card?.price}
					<span class="tprice">{money(b.best_card.price)}</span>
				{/if}
			</div>
		{/if}
	</header>

	{#if library.loading && !library.rows.length}
		<p class="note">Reading the library…</p>
	{:else if library.error}
		<p class="err">{library.error}</p>
	{:else if !library.rows.length}
		<div class="empty">
			<p>Nothing in here yet.</p>
			<a class="btn primary" href="/packs">Open a pack</a>
		</div>
	{:else}
		<div class="controls">
			<input
				class="search"
				placeholder={openSet
					? `Search in ${openSetName}...`
					: tab === 'sets'
						? 'Search sets...'
						: 'Search any card, set or rarity...'}
				bind:value={query}
			/>
			{#if query}
				<button class="clear" onclick={() => (query = '')}>✕</button>
			{/if}

			{#if !cardSearch}
				<div class="tabs">
					<button class:on={tab === 'recent' && !openSet} onclick={() => { tab = 'recent'; openSet = null; }}>
						Recent
					</button>
					<button class:on={tab === 'sets'} onclick={() => (tab = 'sets')}>
						Sets <i>{library.sets.length}</i>
					</button>
					<button class:on={tab === 'packs'} onclick={() => { tab = 'packs'; openSet = null; }}>
						Packs
					</button>
				</div>
			{/if}

			{#if !setSearch && !fullSet && (cardSearch || openSet || tab === 'recent')}
				<select bind:value={sort}>
					<option value="recent">Newest first</option>
					<option value="rarity">Rarest first</option>
					<option value="price">Most valuable</option>
					<option value="copies">Most copies</option>
					<option value="name">By name</option>
				</select>
			{/if}
			<span class="count">
				{#if setSearch}
					{filteredSets.length} set{filteredSets.length === 1 ? '' : 's'}
				{:else}
					{shown.length} · {money(shownValue)}
				{/if}
			</span>
		</div>

		{#if openSet}
			<div class="crumb">
				<button class="btn" onclick={() => (openSet = null)}>← All sets</button>
				<strong>{openSetName}</strong>
				{#if sizes[openSet]}
					{@const own = ownedBySet.get(openSet)?.size ?? 0}
					<span class="crumbprog" class:full={own >= sizes[openSet]}>
						<span class="track"><i style="width:{pct(openSet)}%"></i></span>
						<b>{own} / {sizes[openSet]}</b>
						<i>{pct(openSet)}%</i>
					</span>
				{/if}
				<button class="btn toggle" class:on={showMissing} onclick={() => (showMissing = !showMissing)}>
					{showMissing ? '👁 Missing shown' : 'Show missing'}
				</button>
			</div>
		{/if}

		{#if !cardSearch && tab === 'packs'}
			<div class="packlist" in:fade={{ duration: 140 }}>
				{#each library.opens as o (o.id)}
					<button class="prow" onclick={() => goSet(o.set_id)}>
						<span class="plogo">
							{#if o.logo}<img src={o.logo} alt="" loading="lazy" />{:else}<i>{o.set_id}</i>{/if}
						</span>
						<span class="pname">
							<b>{o.set_name ?? o.set_id}</b>
							<i>{o.cards} cards · first {when(o.first_at)}</i>
						</span>
						<span class="pnum"><b>{o.packs}</b><i>packs</i></span>
						{#if o.gods}<span class="pgod">{o.gods} god</span>{/if}
						{#if o.best_card}
							<span class="pbest" style="--c:{TIER_COLORS[o.best_tier] ?? '#8a83ad'}">
								{#if o.best_card.image}<img src={o.best_card.image} alt="" loading="lazy" />{/if}
								<i>{o.best_card.name}</i>
							</span>
						{/if}
						<span class="pval">{money(o.spent)}</span>
					</button>
				{/each}
			</div>
		{:else if tab === 'sets' && !openSet}
			<div class="setgrid" in:fade={{ duration: 140 }}>
				{#each filteredSets as s (s.id)}
					{@const meta = library.opens.find((o) => o.set_id === s.id)}
					{@const total = sizes[s.id]}
					{@const own = ownedBySet.get(s.id)?.size ?? 0}
					<button class="setcard" style="--e:{eraColor(s.series)}" onclick={() => goSet(s.id)}>
						<span class="slogo">
							{#if meta?.logo}<img src={meta.logo} alt="" loading="lazy" />{:else}<i>{s.id}</i>{/if}
						</span>
						<strong>{s.name}</strong>
						<span class="prog" class:full={!!total && own >= total}>
							<span class="track"><i style="width:{total ? pct(s.id) : 0}%"></i></span>
							<span class="ptext">
								{#if total}{own} / {total} · {pct(s.id)}%{:else}counting…{/if}
							</span>
						</span>
						<span class="smeta">{s.count} cards{meta ? ` · ${meta.packs} packs` : ''}</span>
						{#if meta?.best_card}
							<span class="sbest" style="--c:{TIER_COLORS[meta.best_tier] ?? '#8a83ad'}">
								{#if meta.best_card.image}
									<img src={meta.best_card.image} alt="" loading="lazy" />
								{/if}
								<i>{meta.best_card.name}</i>
							</span>
						{/if}
					</button>
				{/each}
				{#if !filteredSets.length}
					<p class="note">No set matches that.</p>
				{/if}
			</div>
		{:else if fullSet}
			<div class="grid" in:fade={{ duration: 140 }}>
				{#each slots as s (s.card.id)}
					{#if s.row}
						{@render tile(s.row, s.copies)}
					{:else}
						<!-- not collected: the card sits there as a shadow of itself, so a
						     hole in the set reads as a hole rather than as nothing -->
						<div class="cell miss" title="{s.card.name} · not collected yet">
							<span class="art">
								<img src={s.card.image} alt="" loading="lazy" />
								<span class="qm">?</span>
							</span>
							<span class="meta">
								<b>{s.card.name}</b>
								<i>#{s.card.number} · missing</i>
							</span>
						</div>
					{/if}
				{/each}
				{#if !slots.length}
					<p class="note">Nothing in this set matches that.</p>
				{/if}
			</div>
		{:else}
			<div class="grid" in:fade={{ duration: 140 }}>
				{#each shown as r (r.id)}
					{@render tile(r, r.copies)}
				{/each}
				{#if !shown.length}
					<p class="note">Nothing matches that.</p>
				{/if}
			</div>
		{/if}
	{/if}

	{#if picked}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="modal" onclick={() => (picked = null)} transition:fade={{ duration: 150 }}>
			<div class="sheet" onclick={(e) => e.stopPropagation()} in:fly={{ y: 12, duration: 180 }}>
				<Card card={asCard(picked)} forceHolo={picked.tier >= 2 || picked.reverse} />
				<dl>
					<div><dt>Set</dt><dd>{picked.data?.set ?? picked.set_id ?? '—'}</dd></div>
					<div>
						<dt>Rarity</dt>
						<dd style="color:{TIER_COLORS[picked.tier] ?? '#8a83ad'}">
							{raritySymbol(picked.rarity ?? undefined)}
							{picked.reverse ? 'Reverse holo' : (picked.rarity ?? '—')}
						</dd>
					</div>
					<div><dt>Tier</dt><dd>{TIER_NAMES[picked.tier] ?? '—'}</dd></div>
					<div><dt>Number</dt><dd>#{picked.data?.number ?? '—'}</dd></div>
					<div><dt>Copies</dt><dd>{picked.copies}</dd></div>
					<div>
						<dt>Price each</dt>
						<dd>{picked.price ? money(picked.price, picked.price_unit ?? 'EUR') : 'unknown'}</dd>
					</div>
					{#if picked.price && picked.copies > 1}
						<div>
							<dt>Total</dt>
							<dd>{money(picked.price * picked.copies, picked.price_unit ?? 'EUR')}</dd>
						</div>
					{/if}
					<div><dt>First pulled</dt><dd>{when(picked.first_at)}</dd></div>
				</dl>
				<button class="close" onclick={() => (picked = null)}>✕</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.wrap {
		min-height: 100dvh;
		padding: 1rem clamp(0.7rem, 3vw, 2rem) 3rem;
		color: #ddd8f2;
		background:
			radial-gradient(circle at 20% 0%, rgba(120, 80, 220, 0.18), transparent 45%),
			radial-gradient(circle at 85% 20%, rgba(40, 130, 200, 0.14), transparent 45%),
			linear-gradient(180deg, #08060f, #0b0818 55%, #06040d);
	}
	.pagehead {
		max-width: 1200px;
		margin: 0 auto 1.1rem;
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
	}
	h1 {
		margin: 0;
		font-size: clamp(1.6rem, 4.4vw, 2.4rem);
		font-weight: 700;
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

	.stats {
		display: flex;
		flex-wrap: wrap;
		gap: 0.55rem;
	}
	.stat {
		display: grid;
		gap: 0.1rem;
		padding: 0.55rem 0.95rem;
		border-radius: 14px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		background: rgba(255, 255, 255, 0.035);
		min-width: 86px;
	}
	.stat b {
		font-size: 1.2rem;
		font-variant-numeric: tabular-nums;
	}
	.stat span {
		font-size: 0.68rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: #8f88b4;
	}
	.stat.god {
		border-color: rgba(255, 224, 102, 0.5);
		background: rgba(255, 224, 102, 0.12);
	}
	.stat.god b {
		color: #ffe066;
	}

	.trophy {
		display: flex;
		align-items: center;
		gap: 0.9rem;
		margin-top: 0.8rem;
		padding: 0.6rem 1rem 0.6rem 0.6rem;
		border-radius: 16px;
		border: 1px solid color-mix(in srgb, var(--c) 55%, transparent);
		background:
			radial-gradient(90% 120% at 0% 50%, color-mix(in srgb, var(--c) 18%, transparent), transparent 70%),
			rgba(9, 6, 22, 0.6);
	}
	.trophy img {
		width: 46px;
		border-radius: 6px;
	}
	.tlabel {
		display: block;
		font-size: 0.66rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: #8f88b4;
	}
	.trophy strong {
		display: block;
		font-size: 1rem;
	}
	.trare {
		font-size: 0.76rem;
		color: var(--c);
	}
	.tprice {
		margin-left: auto;
		font-size: 1.05rem;
		font-weight: 700;
		color: #86e0b0;
		font-variant-numeric: tabular-nums;
	}

	.controls {
		max-width: 1200px;
		margin: 0 auto 0.9rem;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
	}
	.search,
	select {
		padding: 0.55rem 0.85rem;
		border-radius: 11px;
		border: 1px solid rgba(255, 255, 255, 0.12);
		background: rgba(255, 255, 255, 0.04);
		color: inherit;
		font-size: 0.85rem;
	}
	.search {
		flex: 1;
		min-width: 190px;
		max-width: 320px;
	}
	.clear {
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
		border: 1px solid rgba(255, 255, 255, 0.12);
		background: rgba(255, 255, 255, 0.05);
		color: #cfc9ea;
		cursor: pointer;
	}
	.tabs {
		display: flex;
		gap: 0.3rem;
	}
	.tabs button {
		padding: 0.5rem 0.9rem;
		border-radius: 999px;
		border: 1px solid rgba(255, 255, 255, 0.12);
		background: rgba(255, 255, 255, 0.04);
		color: #cfc9ea;
		cursor: pointer;
		font-size: 0.83rem;
	}
	.tabs button.on {
		border-color: rgba(255, 175, 95, 0.75);
		background: rgba(255, 150, 60, 0.16);
		color: #ffd6a8;
	}
	.tabs i {
		font-style: normal;
		opacity: 0.6;
		font-size: 0.75rem;
	}
	.controls .count {
		font-size: 0.8rem;
		color: #8f88b4;
		margin-left: auto;
		font-variant-numeric: tabular-nums;
	}

	.crumb {
		max-width: 1200px;
		margin: 0 auto 0.8rem;
		display: flex;
		align-items: center;
		gap: 0.7rem;
	}

	.setgrid {
		max-width: 1200px;
		margin: 0 auto;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(178px, 1fr));
		gap: 0.6rem;
	}
	.setcard {
		display: grid;
		justify-items: center;
		gap: 0.2rem;
		padding: 0.8rem 0.7rem;
		border-radius: 14px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		background: rgba(255, 255, 255, 0.035);
		color: inherit;
		cursor: pointer;
		text-align: center;
		transition:
			transform 0.16s,
			border-color 0.16s;
	}
	.setcard {
		border-color: color-mix(in srgb, var(--e) 26%, transparent);
	}
	.setcard strong {
		color: var(--e);
	}
	.setcard:hover {
		transform: translateY(-3px);
		border-color: var(--e);
	}
	.slogo {
		display: grid;
		place-items: center;
		height: 50px;
		width: 100%;
	}
	.slogo img {
		max-width: 100%;
		max-height: 50px;
		object-fit: contain;
	}
	.slogo i {
		font-style: normal;
		font-weight: 700;
		color: #8f88b4;
	}
	.setcard strong {
		font-size: 0.84rem;
	}
	.smeta {
		font-size: 0.71rem;
		color: #8f88b4;
	}

	/* how far through the set you are, in the set's own era colour */
	.prog {
		display: grid;
		gap: 0.2rem;
		width: 100%;
		margin: 0.25rem 0 0.1rem;
	}
	.track {
		display: block;
		height: 5px;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.08);
		overflow: hidden;
	}
	.track i {
		display: block;
		height: 100%;
		border-radius: 999px;
		background: linear-gradient(90deg, color-mix(in srgb, var(--e, #8a83ad) 55%, #000), var(--e, #8a83ad));
		transition: width 0.4s ease;
	}
	.ptext {
		font-size: 0.66rem;
		letter-spacing: 0.04em;
		color: #8f88b4;
		font-variant-numeric: tabular-nums;
	}
	.prog.full .track i {
		background: linear-gradient(90deg, #ffb454, #ffe066);
	}
	.prog.full .ptext {
		color: #ffe066;
	}

	/* the same bar again, laid out along the breadcrumb of the open set */
	.crumbprog {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		min-width: 160px;
		max-width: 320px;
		flex: 1;
	}
	.crumbprog .track {
		flex: 1;
	}
	.crumbprog .track i {
		background: linear-gradient(90deg, #6f5ad8, #9b8cff);
	}
	.crumbprog b,
	.crumbprog i {
		font-style: normal;
		font-size: 0.74rem;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}
	.crumbprog b {
		color: #ddd8f2;
	}
	.crumbprog i {
		color: #8f88b4;
	}
	.crumbprog.full .track i {
		background: linear-gradient(90deg, #ffb454, #ffe066);
	}
	.crumbprog.full b {
		color: #ffe066;
	}
	.toggle {
		margin-left: auto;
		white-space: nowrap;
	}
	.toggle.on {
		border-color: rgba(155, 140, 255, 0.6);
		background: rgba(111, 90, 216, 0.22);
		color: #d9d1ff;
	}
	.sbest {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		margin-top: 0.35rem;
		padding: 0.2rem 0.55rem 0.2rem 0.2rem;
		border-radius: 999px;
		border: 1px solid color-mix(in srgb, var(--c) 50%, transparent);
		max-width: 100%;
	}
	.sbest img {
		width: 20px;
		border-radius: 3px;
		flex: none;
	}
	.sbest i {
		font-style: normal;
		font-size: 0.68rem;
		color: var(--c);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.err.small {
		margin: 0.6rem 0 0;
		font-size: 0.78rem;
		text-align: left;
	}

	.packlist {
		max-width: 1200px;
		margin: 0 auto;
		display: grid;
		gap: 0.5rem;
	}
	.prow {
		display: flex;
		align-items: center;
		gap: 0.9rem;
		padding: 0.6rem 0.9rem;
		border-radius: 14px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		background: rgba(255, 255, 255, 0.035);
		color: inherit;
		cursor: pointer;
		text-align: left;
	}
	.prow:hover {
		border-color: rgba(178, 152, 255, 0.6);
	}
	.plogo {
		display: grid;
		place-items: center;
		width: 74px;
		height: 40px;
		flex: none;
	}
	.plogo img {
		max-width: 100%;
		max-height: 40px;
		object-fit: contain;
	}
	.plogo i {
		font-style: normal;
		font-size: 0.75rem;
		color: #8f88b4;
	}
	.pname {
		flex: 1;
		min-width: 0;
	}
	.pname b {
		display: block;
		font-size: 0.9rem;
	}
	.pname i {
		font-style: normal;
		font-size: 0.73rem;
		color: #8f88b4;
	}
	.pnum {
		text-align: center;
		flex: none;
	}
	.pnum b {
		display: block;
		font-size: 1.15rem;
		font-variant-numeric: tabular-nums;
	}
	.pnum i {
		font-style: normal;
		font-size: 0.66rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: #8f88b4;
	}
	.pgod {
		padding: 0.15rem 0.55rem;
		border-radius: 999px;
		background: rgba(255, 224, 102, 0.16);
		color: #ffe066;
		font-size: 0.73rem;
		flex: none;
	}
	.pbest {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		padding: 0.25rem 0.6rem 0.25rem 0.25rem;
		border-radius: 999px;
		border: 1px solid color-mix(in srgb, var(--c) 50%, transparent);
		flex: none;
		max-width: 210px;
	}
	.pbest img {
		width: 24px;
		border-radius: 4px;
	}
	.pbest i {
		font-style: normal;
		font-size: 0.75rem;
		color: var(--c);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.pval {
		flex: none;
		font-size: 0.85rem;
		color: #86e0b0;
		font-variant-numeric: tabular-nums;
		min-width: 62px;
		text-align: right;
	}
	@media (max-width: 780px) {
		.pbest,
		.pval {
			display: none;
		}
	}

	.grid {
		max-width: 1200px;
		margin: 0 auto;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(138px, 1fr));
		gap: 0.6rem;
	}
	.cell {
		position: relative;
		padding: 0;
		border-radius: 13px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		background: rgba(255, 255, 255, 0.03);
		color: inherit;
		cursor: pointer;
		overflow: hidden;
		text-align: left;
		transition:
			transform 0.16s,
			border-color 0.16s;
	}
	.cell:hover {
		transform: translateY(-3px);
		border-color: var(--c);
	}
	.cell.hit {
		border-color: color-mix(in srgb, var(--c) 60%, transparent);
		box-shadow: 0 0 16px color-mix(in srgb, var(--c) 40%, transparent);
	}
	.art {
		position: relative;
		display: block;
	}
	.art img {
		width: 100%;
		display: block;
		aspect-ratio: 63 / 88;
		object-fit: contain;
	}
	/* A card you do not have yet: dark enough to be a shape rather than a card,
	   bright enough on hover to see what you are chasing. */
	.cell.miss {
		cursor: default;
		border-style: dashed;
		border-color: rgba(255, 255, 255, 0.08);
		background: rgba(255, 255, 255, 0.012);
	}
	.cell.miss:hover {
		transform: none;
		border-color: rgba(255, 255, 255, 0.16);
	}
	.cell.miss img {
		filter: grayscale(1) brightness(0.17) contrast(1.3);
		transition: filter 0.25s ease;
	}
	.cell.miss:hover img {
		filter: grayscale(0.55) brightness(0.5) contrast(1.05);
	}
	.cell.miss .meta b {
		color: #6a648a;
	}
	.cell.miss .meta i {
		color: #57527a;
	}
	.qm {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		font-size: 2rem;
		font-weight: 800;
		color: rgba(255, 255, 255, 0.16);
		text-shadow: 0 2px 12px rgba(0, 0, 0, 0.8);
		pointer-events: none;
		transition: opacity 0.25s ease;
	}
	.cell.miss:hover .qm {
		opacity: 0;
	}

	.copies,
	.rev {
		position: absolute;
		top: 0.35rem;
		padding: 0.1rem 0.4rem;
		border-radius: 999px;
		font-size: 0.7rem;
		font-weight: 700;
		background: rgba(6, 4, 16, 0.85);
	}
	.copies {
		right: 0.35rem;
		color: #ffd08a;
	}
	.rev {
		left: 0.35rem;
		color: #9ecbff;
	}
	.meta {
		display: block;
		padding: 0.4rem 0.55rem 0.55rem;
	}
	.meta b {
		display: block;
		font-size: 0.79rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.meta i {
		display: block;
		font-style: normal;
		font-size: 0.7rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.meta em {
		font-style: normal;
		letter-spacing: 0.06em;
	}
	.price {
		display: block;
		margin-top: 0.15rem;
		font-size: 0.75rem;
		font-variant-numeric: tabular-nums;
		color: #86e0b0;
	}

	.empty {
		display: grid;
		place-items: center;
		gap: 0.8rem;
		margin-top: 3rem;
		color: #9a93bd;
	}
	.note,
	.err {
		text-align: center;
		margin-top: 2rem;
		color: #9a93bd;
		grid-column: 1 / -1;
	}
	.err {
		color: #ff9a8a;
	}

	.modal {
		position: fixed;
		inset: 0;
		z-index: 40;
		display: grid;
		place-items: center;
		padding: 1rem;
		background: rgba(3, 2, 8, 0.85);
	}
	.sheet {
		position: relative;
		display: grid;
		gap: 0.8rem;
		width: min(400px, 88vw, calc((100dvh - 11rem) * 0.63));
	}
	dl {
		margin: 0;
		display: grid;
		gap: 0.28rem;
		padding: 0.9rem 1rem;
		border-radius: 14px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		background: rgba(9, 6, 22, 0.7);
	}
	dl > div {
		display: flex;
		justify-content: space-between;
		gap: 0.7rem;
		font-size: 0.84rem;
	}
	dt {
		color: #948dba;
	}
	dd {
		margin: 0;
		font-variant-numeric: tabular-nums;
		text-align: right;
	}
	.close {
		position: absolute;
		top: -0.7rem;
		right: -0.7rem;
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
		border: 1px solid rgba(255, 255, 255, 0.18);
		background: #14102a;
		color: #fff;
		cursor: pointer;
	}
</style>
