<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { library, type LibRow } from '$lib/libraryStore.svelte';
	import { cloud } from '$lib/cloud.svelte';
	import { TIER_COLORS, TIER_NAMES, raritySymbol, tierOf } from '$lib/packs';
	import Card from '$lib/components/Card.svelte';

	type SortKey = 'recent' | 'rarity' | 'price' | 'copies' | 'name';

	let query = $state('');
	let setFilter = $state('');
	let sort = $state<SortKey>('recent');
	let picked = $state<LibRow | null>(null);

	onMount(() => {
		cloud.init();
		library.load();
		library.watch();
		return () => library.unwatch();
	});

	let shown = $derived.by(() => {
		const q = query.trim().toLowerCase();
		let out = library.rows.filter((r) => {
			if (setFilter && (r.data?.set ?? r.set_id) !== setFilter) return false;
			if (!q) return true;
			return (
				(r.data?.name ?? '').toLowerCase().includes(q) ||
				(r.rarity ?? '').toLowerCase().includes(q) ||
				(r.data?.set ?? '').toLowerCase().includes(q)
			);
		});
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

	function money(v: number, unit = 'EUR'): string {
		return v.toLocaleString('en-GB', { style: 'currency', currency: unit, maximumFractionDigits: 2 });
	}
	function big(r: LibRow): string {
		return (r.data?.image ?? '').replace('/low.webp', '/high.png');
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
			image: big(r)
		};
	}
	function when(iso: string): string {
		return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
	}
</script>

<svelte:head><title>Card library</title></svelte:head>
<svelte:window onkeydown={(e) => e.key === 'Escape' && (picked = null)} />

<div class="wrap">
	<header class="pagehead">
		<div class="navrow">
			<a class="btn" href="/">← Binder</a>
			<a class="btn" href="/packs">Open packs</a>
		</div>
		<h1>Card library</h1>
		<p class="sub">Every card {cloud.profileName || 'you'} has ever pulled.</p>

		<div class="stats">
			<div class="stat"><b>{library.uniqueCards}</b><span>unique</span></div>
			<div class="stat"><b>{library.totalCards}</b><span>cards</span></div>
			<div class="stat"><b>{money(library.totalValue)}</b><span>value</span></div>
			<div class="stat">
				<b>{library.rows.filter((r) => r.tier >= 3).length}</b><span>hits</span>
			</div>
		</div>
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
			<input class="search" placeholder="Search name, set or rarity..." bind:value={query} />
			<select bind:value={setFilter}>
				<option value="">All sets</option>
				{#each library.sets as s (s)}<option value={s}>{s}</option>{/each}
			</select>
			<select bind:value={sort}>
				<option value="recent">Newest first</option>
				<option value="rarity">Rarest first</option>
				<option value="price">Most valuable</option>
				<option value="copies">Most copies</option>
				<option value="name">By name</option>
			</select>
			<span class="count">
				{shown.length} shown · {money(shownValue)}
			</span>
		</div>

		<div class="grid">
			{#each shown as r (r.id)}
				<button
					class="cell"
					class:hit={r.tier >= 3}
					style="--c:{TIER_COLORS[r.tier] ?? '#8a83ad'}"
					onclick={() => (picked = r)}
					in:fade={{ duration: 140 }}
				>
					<span class="art">
						{#if r.data?.image}
							<img src={r.data.image} alt={r.data?.name ?? ''} loading="lazy" />
						{/if}
						{#if r.copies > 1}<span class="copies">×{r.copies}</span>{/if}
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
			{/each}
		</div>
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
		gap: 0.6rem;
	}
	.stat {
		display: grid;
		gap: 0.1rem;
		padding: 0.6rem 1rem;
		border-radius: 14px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		background: rgba(255, 255, 255, 0.035);
		min-width: 92px;
	}
	.stat b {
		font-size: 1.25rem;
		font-variant-numeric: tabular-nums;
	}
	.stat span {
		font-size: 0.7rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: #8f88b4;
	}

	.controls {
		max-width: 1200px;
		margin: 0 auto 1rem;
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
		min-width: 200px;
		max-width: 340px;
	}
	.controls .count {
		font-size: 0.8rem;
		color: #8f88b4;
		margin-left: auto;
	}

	.grid {
		max-width: 1200px;
		margin: 0 auto;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
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
