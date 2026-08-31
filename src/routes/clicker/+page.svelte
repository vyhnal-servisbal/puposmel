<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { game, fmt, pretty, hpAt, isBossStage, PARTY, PERKS, ZONES } from '$lib/clicker/game.svelte';
	import { sceneOf, variantOf, HOURS, type Upgrade } from '$lib/clicker/data';
	import { spriteOf, aniOf, typeColor } from '$lib/dexStore.svelte';
	import { cloud } from '$lib/cloud.svelte';

	type Tab = 'party' | 'shop' | 'perks' | 'dex' | 'board';
	type Amount = 1 | 10 | 100 | 'max';
	type ShopFilter = 'all' | 'ready' | 'party' | 'global';

	let tab = $state<Tab>('party');
	let buyAmt = $state<Amount>(1);
	let shopFilter = $state<ShopFilter>('all');
	let confirming = $state(false);
	let broken = $state<Record<string, boolean>>({});

	onMount(() => {
		game.load().then(() => game.start());
		const bye = () => game.flush();
		window.addEventListener('beforeunload', bye);
		return () => window.removeEventListener('beforeunload', bye);
	});

	onDestroy(() => {
		game.stop();
		game.flush();
	});

	let foe = $derived(game.foe);
	let hpPct = $derived(foe ? Math.max(0, (foe.hp / foe.maxHp) * 100) : 0);
	let zone = $derived(game.zone);
	let accent = $derived(typeColor(zone.type));
	let scene = $derived(sceneOf(zone.type));
	let v = $derived(variantOf(game.save.stage));
	let hour = $derived(HOURS[v.hour]);

	let sceneVars = $derived(
		`--sky1:${scene.sky1};--sky2:${scene.sky2};--far:${scene.far};--near:${scene.near};` +
			`--ground:${scene.ground};--orb:${hour.orb ?? scene.orb};--glow:${hour.glow ?? scene.glow};` +
			`--fleck:${scene.fleck};` +
			`--shFar:${v.far};--shMid:${v.mid};--shNear:${v.near};--wash:${hour.wash};` +
			`--orbSize:${hour.orbSize}px;--orbTop:${hour.orbTop}%;--orbX:${v.orbX}%;--dim:${hour.dim}`
	);

	// Showdown has no animated sprite for every species, so a failed gif quietly
	// falls back to the still one rather than leaving a hole where the foe was.
	function art(name: string, id: number, shiny: boolean): string {
		return broken[name] ? spriteOf(id, shiny) : aniOf(name, shiny);
	}

	function hitFoe(e: MouseEvent) {
		const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
		game.tap(((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100);
	}

	// A held space repeats at whatever rate the OS feels like, which was landing
	// around forty taps a second. Capped to roughly what a hand can do.
	const KEY_GAP = 90;
	let lastKey = 0;
	function keyTap() {
		const now = performance.now();
		if (now - lastKey < KEY_GAP) return;
		lastKey = now;
		game.tap(50, 44);
	}

	// what a row will actually buy right now, which is never more than the money
	function willBuy(key: string): number {
		const can = game.affordable(key, buyAmt === 'max' ? 1000 : buyAmt);
		return buyAmt === 'max' ? can : Math.min(buyAmt, can);
	}

	function label(n: number): string {
		const m = Math.floor(n / 60);
		const s = Math.floor(n % 60);
		return m ? `${m}m ${s}s` : `${s}s`;
	}

	let dexAll = $derived.by(() => {
		const out: { id: number; name: string; boss: boolean }[] = [];
		const seen = new Set<number>();
		for (const z of ZONES) {
			for (const m of z.mons)
				if (!seen.has(m[0])) {
					seen.add(m[0]);
					out.push({ id: m[0], name: m[1], boss: false });
				}
			if (!seen.has(z.boss[0])) {
				seen.add(z.boss[0]);
				out.push({ id: z.boss[0], name: z.boss[1], boss: true });
			}
		}
		return out.sort((a, b) => a.id - b.id);
	});

	let nextStageHp = $derived(hpAt(game.save.stage + 1));

	let shopAll = $derived(game.shopList);
	let shopReady = $derived(shopAll.filter((u) => game.save.gold >= u.cost));
	let shopShown = $derived.by(() => {
		if (shopFilter === 'ready') return shopReady;
		if (shopFilter === 'party') return shopAll.filter((u) => u.member);
		if (shopFilter === 'global') return shopAll.filter((u) => !u.member);
		return shopAll;
	});

	function upIcon(u: Upgrade): number | null {
		const m = PARTY.find((p) => p.key === u.member);
		return m ? m.mon[0] : null;
	}
	function upType(u: Upgrade): string {
		return PARTY.find((p) => p.key === u.member)?.type ?? 'normal';
	}

	// the shelf is sorted cheapest first, so a cap hides only what you cannot buy
	const SHOP_MAX = 50;

	const FILTERS: [ShopFilter, string][] = [
		['all', 'All'],
		['ready', 'Affordable'],
		['party', 'Party'],
		['global', 'Everyone']
	];
</script>

<svelte:head><title>Pokemon Clicker</title></svelte:head>
<svelte:window
	onkeydown={(e) => {
		if (e.key === ' ') {
			e.preventDefault();
			keyTap();
		}
	}}
/>

<div class="pcwrap" style="--acc:{accent}">
	<header class="hud">
		<a class="pill nav" href="/">‹ Binder</a>

		<div class="gauges">
			<span class="gauge money"><i>money</i><b>₽ {fmt(game.save.gold)}</b></span>
			<span class="gauge dps"><i>party dps</i><b>{fmt(game.dps)}</b></span>
			<span class="gauge tap"><i>per tap</i><b>{fmt(game.tapDamage)}</b></span>
			<span class="gauge crit"><i>crit</i><b>{Math.round(game.critChance * 100)}%</b></span>
			{#if game.save.candy || game.save.rebirths}
				<span class="gauge candy"><i>candy</i><b>{fmt(game.save.candy)}</b></span>
			{/if}
		</div>

		<span class="trainer">
			<b>{cloud.profileName || 'Trainer'}</b>
			<i class="sync" class:on={game.saving === 'saved'} class:bad={game.saving === 'error'}>
				{game.saving === 'error' ? 'save failed' : game.saving === 'saving' ? 'saving' : 'synced'}
			</i>
		</span>
	</header>

	<div class="pcgrid">
		<section class="arena">
			<div class="screen" style={sceneVars}>
				<!-- Sky, sun, three silhouette bands and a floor, all cut from the stage
				     number, so every stage in a zone is its own place rather than the
				     same picture in a different colour. -->
				<div class="scene" aria-hidden="true" class:flipped={v.flip}>
					<span class="orb"></span>
					{#if hour.stars}<span class="stars"></span>{/if}
					<span class="band far"></span>
					<span class="band mid"></span>
					<span class="band near"></span>
					<span class="floor"></span>
					<span class="motes"></span>
					<span class="wash"></span>
					<span class="vignette"></span>
				</div>

				<div class="topbar">
					<button class="navb" onclick={() => game.goBack()} disabled={game.save.stage <= 1}>‹</button>
					<div class="stagemid">
						<strong>{zone.name}</strong>
						<span class="stagenum">
							Stage <b>{game.save.stage}</b><i>best {game.save.highest}</i>
						</span>
						<span class="killdots" class:blank={isBossStage(game.save.stage) && !game.farming}>
							{#each { length: 10 } as _, i}
								<b class:done={i < game.save.kills}></b>
							{/each}
						</span>
					</div>
					<button class="navb" onclick={() => game.goForward()} disabled={game.save.stage >= game.save.highest}>›</button>
				</div>

				<button
					class="farmb"
					class:on={game.farming}
					onclick={() => game.toggleFarm()}
					title="Stay on this stage instead of moving on"
				>
					{game.farming ? '🔒 Farming' : '🔓 Advancing'}
				</button>

				{#if foe}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div class="foeBtn" class:boss={foe.boss} class:shiny={foe.shiny} onclick={hitFoe} role="button" tabindex="0">
						<span class="shadow"></span>
						<img
							class="foeArt"
							src={art(foe.mon[1], foe.mon[0], foe.shiny)}
							alt=""
							draggable="false"
							onerror={() => (broken[foe.mon[1]] = true)}
						/>
						{#each game.hits as h (h.id)}
							<span class="dmg" class:crit={h.crit} style="left:{h.x}%; top:{h.y}%">
								{fmt(h.amount)}{h.crit ? '!' : ''}
							</span>
						{/each}
					</div>

					<div class="botbar">
						<div class="nameplate" class:bossplate={foe.boss}>
							<span class="npname">
								{#if foe.shiny}<em class="shinytag">✦</em>{/if}{pretty(foe.mon[1])}
							</span>
							<span class="typetag" style="--t:{typeColor(foe.type)}">{foe.type}</span>
							{#if foe.boss}<span class="bosstag">BOSS</span>{/if}
						</div>
						<div class="hpbar" class:bosshp={foe.boss}>
							<i style="width:{hpPct}%"></i>
							<span class="hptext">{fmt(Math.max(0, foe.hp))} / {fmt(foe.maxHp)}</span>
						</div>
						<div class="bosstimer" class:low={game.bossLeft < 8} class:blank={!foe.boss}>
							<i style="width:{(game.bossLeft / 30) * 100}%"></i>
							<span>{game.bossLeft.toFixed(1)}s</span>
						</div>
					</div>
				{/if}
			</div>

			<p class="hint">
				{#if game.farming}
					Locked on stage {game.save.stage}. Unlock to move on.
				{:else}
					Tap the Pokémon or hold Space · next stage is {fmt(nextStageHp)} HP
				{/if}
			</p>
		</section>

		<aside class="panel">
			<div class="tabbar">
				<button class:on={tab === 'party'} onclick={() => (tab = 'party')}>Party</button>
				<button class:on={tab === 'shop'} onclick={() => (tab = 'shop')}>
					Shop{#if shopReady.length}<i class="pip">{shopReady.length}</i>{/if}
				</button>
				<button class:on={tab === 'perks'} onclick={() => (tab = 'perks')}>
					Rebirth{#if game.candyGain > 0}<i class="pip">!</i>{/if}
				</button>
				<button class:on={tab === 'dex'} onclick={() => (tab = 'dex')}>Dex</button>
				<button class:on={tab === 'board'} onclick={() => (tab = 'board')}>Rank</button>
			</div>

			{#if tab === 'party'}
				<div class="chips">
					<span class="chiplabel">Buy</span>
					{#each [1, 10, 100, 'max'] as n (n)}
						<button class:on={buyAmt === n} onclick={() => (buyAmt = n as Amount)}>
							{n === 'max' ? 'MAX' : '×' + n}
						</button>
					{/each}
				</div>

				<div class="list">
				<button class="row tapup" onclick={() => game.buyTap()} disabled={game.save.gold < game.tapCost}>
					<span class="ricon glyph">👆</span>
					<span class="rmid">
						<b>Tap Power <u>lv {game.save.tapLevel}</u></b>
						<i>{fmt(game.tapDamage)} damage per tap</i>
					</span>
					<span class="rcost">₽ {fmt(game.tapCost)}</span>
				</button>

				{#each PARTY as m, i (m.key)}
					{@const lvl = game.memberLevel(m.key)}
					{@const n = willBuy(m.key)}
					{@const cost = game.memberCost(m.key, Math.max(1, n))}
					{@const locked = !lvl && i > 0 && !game.memberLevel(PARTY[i - 1].key)}
					{#if !locked}
						<button
							class="row"
							class:owned={lvl > 0}
							style="--t:{typeColor(m.type)}"
							onclick={() => game.buyMember(m.key, Math.max(1, n))}
							disabled={n < 1}
						>
							<span class="ricon"><img src={spriteOf(m.mon[0])} alt="" loading="lazy" /></span>
							<span class="rmid">
								<b>
									{pretty(m.mon[1])}
									{#if lvl}<u>lv {lvl}</u>{/if}
									{#if n > 1}<em class="plus">+{n}</em>{/if}
								</b>
								<i>
									{#if lvl}
										{fmt(game.memberDps(m.key))} dps{#if game.memberMult(m.key) > 1}
											· ×{game.memberMult(m.key)} items{/if}
									{:else}
										recruit · {m.type} type
									{/if}
								</i>
							</span>
							<span class="rcost">₽ {fmt(cost)}</span>
						</button>
					{/if}
				{/each}
				</div>
			{:else if tab === 'shop'}
				<div class="chips">
					{#each FILTERS as [k, name] (k)}
						<button class:on={shopFilter === k} onclick={() => (shopFilter = k)}>
							{name}
							{#if k === 'ready' && shopReady.length}<em>{shopReady.length}</em>{/if}
						</button>
					{/each}
				</div>
				<p class="note">{game.shopOwned} bought · {shopAll.length} left · a rebirth clears them</p>

				<div class="list">
				{#each shopShown.slice(0, SHOP_MAX) as u (u.key)}
					{@const ready = game.save.gold >= u.cost}
					<button
						class="row shopitem"
						class:ready
						style="--t:{u.member ? typeColor(upType(u)) : '#f0b429'}"
						onclick={() => game.buyUp(u.key)}
						disabled={!ready}
					>
						<span class="ricon">
							{#if upIcon(u)}
								<img src={spriteOf(upIcon(u) ?? 1)} alt="" loading="lazy" />
							{:else}
								<span class="glyphbig">{u.icon}</span>
							{/if}
						</span>
						<span class="rmid">
							<b>{u.icon} {u.name}</b>
							<i>{u.desc}</i>
						</span>
						<span class="rcost">₽ {fmt(u.cost)}</span>
					</button>
				{/each}
				{#if !shopShown.length}
					<p class="note">Nothing here. Level the party up to stock the shelves.</p>
				{:else if shopShown.length > SHOP_MAX}
					<p class="note">{shopShown.length - SHOP_MAX} pricier ones not listed yet.</p>
				{/if}
				</div>
			{:else if tab === 'perks'}
				<div class="rebirth">
					<span class="rbtitle">Professor's Reset</span>
					<p class="rbline">
						Wipe the run, keep candy, perks and the Dex. Worth <b>🍬 {fmt(game.candyGain)}</b> right now.
					</p>
					<p class="note">
						{#if game.save.candy > 0}
							Candy in hand is itself <b>+{Math.round((game.candyBonus - 1) * 100)}%</b> damage, so
							spending every last one is not always right.
						{:else}
							Candy buys the perks below, and every one you keep in hand is worth +2% damage on its
							own.
						{/if}
						Rebirths: {game.save.rebirths}.{#if game.startGold > 0}
							Restarts with ₽ {fmt(game.startGold)}.{/if}
					</p>
					{#if confirming}
						<div class="confirm">
							<button class="pill go" onclick={() => { game.rebirth(); confirming = false; tab = 'party'; }}>
								Yes, reset
							</button>
							<button class="pill" onclick={() => (confirming = false)}>Cancel</button>
						</div>
					{:else}
						<button class="pill go wide" onclick={() => (confirming = true)} disabled={game.candyGain <= 0}>
							{game.candyGain > 0 ? `Rebirth for ${fmt(game.candyGain)} candy` : 'Push further first'}
						</button>
					{/if}
				</div>

				<div class="list">
				{#each PERKS as p (p.key)}
					{@const lvl = game.save.perks[p.key] ?? 0}
					{@const cost = game.perkCost(p.key)}
					<button
						class="row perk"
						onclick={() => game.buyPerk(p.key)}
						disabled={game.save.candy < cost || lvl >= p.max}
					>
						<span class="ricon glyph">{p.icon}</span>
						<span class="rmid">
							<b>{p.name} {#if lvl}<u>lv {lvl}/{p.max}</u>{/if}</b>
							<i>{p.desc}</i>
						</span>
						<span class="rcost candycost">{lvl >= p.max ? 'MAX' : `🍬 ${fmt(cost)}`}</span>
					</button>
				{/each}
				</div>
			{:else if tab === 'dex'}
				<div class="dexhead">
					<span><b>{game.dexCount}</b>/{dexAll.length} seen</span>
					<span><b>{game.shinyCount}</b> shiny</span>
					<span><b>{fmt(game.save.clicks)}</b> taps</span>
				</div>
				<div class="dexgrid">
					{#each dexAll as d (d.id)}
						{@const row = game.save.dex[d.id]}
						<div class="dexcell" class:got={!!row} class:bossmon={d.boss} title={pretty(d.name)}>
							<img src={spriteOf(d.id, !!row?.s)} alt="" loading="lazy" />
							{#if row}
								<span class="dexn">{row.n > 999 ? '999+' : row.n}</span>
								{#if row.s}<span class="dexs">✦</span>{/if}
							{/if}
						</div>
					{/each}
				</div>
			{:else}
				<p class="note">Highest stage wins. Refreshes every half minute.</p>
				<div class="boardlist">
					{#each game.board as b, i (b.profile_name)}
						<div class="brow" class:me={b.profile_name === cloud.profileName} class:first={i === 0}>
							<span class="bpos">{i + 1}</span>
							<span class="bname">
								<b>{b.profile_name}</b>
								<i>{b.rebirths} rebirths · 🍬 {fmt(b.candy)}</i>
							</span>
							<span class="bstage"><b>{b.highest}</b><i>stage</i></span>
						</div>
					{/each}
					{#if !game.board.length}
						<p class="note">Nothing here yet.</p>
					{/if}
				</div>
			{/if}
		</aside>
	</div>

	{#if game.offlineGold > 0}
		<div class="modal" transition:fade={{ duration: 150 }}>
			<div class="sheet" in:fly={{ y: 14, duration: 200 }}>
				<h2>Your party kept working</h2>
				<p>Away for {label(game.offlineSeconds)}. They farmed <b>₽ {fmt(game.offlineGold)}</b>.</p>
				<p class="note">Offline rate is {Math.round(game.idleRate * 100)}%, capped at 12 hours.</p>
				<button class="pill go" onclick={() => game.dismissOffline()}>Nice</button>
			</div>
		</div>
	{/if}

	{#if game.error}<p class="err">{game.error}</p>{/if}
</div>

<style>
	/* Pokedex furniture: cream panels with a hard navy outline and a chunky bottom
	   edge, red for the frame, blue for what is selected. Deliberately nothing like
	   the dark glass the rest of the app uses. */
	.pcwrap {
		--ink: #1c2b3a;
		--cream: #fdfaf2;
		--card: #ffffff;
		--line: #22303f;
		--red: #e3350d;
		--blue: #2a75bb;
		--sun: #ffcb05;
		--muted: #6b7c8c;

		min-height: 100dvh;
		padding: 0.7rem clamp(0.5rem, 2vw, 1.4rem) 1.6rem;
		color: var(--ink);
		font-family: ui-rounded, 'Segoe UI Rounded', 'Nunito', 'Trebuchet MS', system-ui, sans-serif;
		font-variant-numeric: tabular-nums;
		background:
			radial-gradient(90% 60% at 50% -15%, color-mix(in srgb, var(--acc) 45%, transparent), transparent 70%),
			linear-gradient(180deg, #eaf2f7, #dce8f0 55%, #cfdde8);
	}

	.pill {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.4rem 0.85rem;
		border-radius: 999px;
		border: 2px solid var(--line);
		border-bottom-width: 4px;
		background: var(--card);
		color: var(--ink);
		text-decoration: none;
		font-size: 0.82rem;
		font-weight: 800;
		cursor: pointer;
		transition: transform 0.07s;
	}
	.pill:active:not(:disabled) {
		transform: translateY(2px);
		border-bottom-width: 2px;
	}
	.pill:disabled {
		opacity: 0.45;
		cursor: default;
	}
	.pill.go {
		background: var(--red);
		border-color: #8f1c06;
		color: #fff;
	}
	.pill.wide {
		width: 100%;
	}

	.hud {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		max-width: 1320px;
		margin: 0 auto 0.7rem;
		flex-wrap: wrap;
	}
	.gauges {
		display: flex;
		flex: 1;
		flex-wrap: wrap;
		gap: 0.4rem;
	}
	.gauge {
		display: grid;
		gap: 0.02rem;
		padding: 0.25rem 0.75rem;
		min-width: 94px;
		border-radius: 12px;
		border: 2px solid var(--line);
		border-bottom-width: 4px;
		background: var(--card);
	}
	.gauge i {
		font-style: normal;
		font-size: 0.56rem;
		font-weight: 800;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--muted);
	}
	.gauge b {
		font-size: 1rem;
		line-height: 1.15;
		color: var(--c);
	}
	.money {
		--c: #b8860b;
	}
	.dps {
		--c: #0f8f7a;
	}
	.tap {
		--c: #d2601a;
	}
	.crit {
		--c: #c2185b;
	}
	.candy {
		--c: #8e24aa;
	}

	.trainer {
		display: grid;
		justify-items: end;
		gap: 0.05rem;
	}
	.trainer b {
		font-size: 0.88rem;
	}
	.sync {
		font-style: normal;
		font-size: 0.58rem;
		font-weight: 800;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--muted);
	}
	.sync.on {
		color: #1e8e4a;
	}
	.sync.bad {
		color: var(--red);
	}

	.pcgrid {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(320px, 400px);
		gap: 0.8rem;
		max-width: 1320px;
		margin: 0 auto;
		align-items: start;
	}
	@media (max-width: 960px) {
		.pcgrid {
			grid-template-columns: minmax(0, 1fr);
		}
	}

	.arena {
		display: grid;
		gap: 0.5rem;
		padding: 0.6rem;
		border-radius: 20px;
		border: 3px solid var(--line);
		border-bottom-width: 6px;
		background: var(--cream);
	}
	/* Fixed rows and a floor under the height: sprites vary wildly and the boss
	   timer used to appear from nowhere every fifth stage, which shoved the page
	   around. Nothing in here resizes any more. */
	.screen {
		position: relative;
		display: grid;
		grid-template-rows: auto auto 1fr auto;
		justify-items: center;
		align-items: center;
		gap: 0.45rem;
		height: clamp(520px, 64vh, 640px);
		padding: 0.7rem;
		border-radius: 13px;
		border: 3px solid var(--line);
		overflow: hidden;
		isolation: isolate;
	}
	.screen > *:not(.scene) {
		position: relative;
		z-index: 1;
	}

	.scene {
		position: absolute;
		inset: 0;
		z-index: 0;
		background: linear-gradient(180deg, var(--sky1), var(--sky2));
	}
	.scene.flipped {
		transform: scaleX(-1);
	}
	.scene span {
		position: absolute;
		display: block;
	}
	.orb {
		top: var(--orbTop);
		left: var(--orbX);
		width: var(--orbSize);
		height: var(--orbSize);
		border-radius: 50%;
		background: var(--orb);
		box-shadow: 0 0 70px 26px var(--glow);
		opacity: 0.92;
	}
	.stars {
		inset: 0 0 45% 0;
		background-image:
			radial-gradient(1.5px 1.5px at 8% 22%, #fff, transparent),
			radial-gradient(1.2px 1.2px at 21% 48%, #fff, transparent),
			radial-gradient(1.6px 1.6px at 37% 15%, #fff, transparent),
			radial-gradient(1.2px 1.2px at 52% 38%, #fff, transparent),
			radial-gradient(1.5px 1.5px at 66% 20%, #fff, transparent),
			radial-gradient(1.2px 1.2px at 79% 44%, #fff, transparent),
			radial-gradient(1.6px 1.6px at 91% 26%, #fff, transparent),
			radial-gradient(1.2px 1.2px at 14% 60%, #fff, transparent),
			radial-gradient(1.4px 1.4px at 45% 58%, #fff, transparent),
			radial-gradient(1.3px 1.3px at 72% 62%, #fff, transparent);
		opacity: 0.85;
		animation: pctwinkle 4s ease-in-out infinite;
	}
	/* three silhouette bands, each cut by a shape picked from the stage number */
	.band {
		left: -8%;
		width: 116%;
	}
	/* Aerial perspective: the far ridge is mixed toward the sky so it reads as
	   distance, the middle one is the zone colour, the near one is darker. Before
	   this the far and middle bands were the same colour at two opacities and the
	   whole thing looked like one flat shape. */
	.band.far {
		bottom: 25%;
		height: 48%;
		background: color-mix(in srgb, var(--far) 55%, var(--sky2));
		clip-path: var(--shFar);
	}
	.band.mid {
		bottom: 19%;
		height: 42%;
		background: var(--far);
		clip-path: var(--shMid);
	}
	.band.near {
		bottom: 16%;
		height: 32%;
		background: var(--near);
		clip-path: var(--shNear);
	}
	.floor {
		left: 0;
		right: 0;
		bottom: 0;
		height: 18%;
		background: linear-gradient(180deg, var(--ground), color-mix(in srgb, var(--ground) 55%, #000));
	}
	.motes {
		inset: 0;
		background-image:
			radial-gradient(2px 2px at 12% 30%, var(--fleck), transparent),
			radial-gradient(2px 2px at 34% 62%, var(--fleck), transparent),
			radial-gradient(1.6px 1.6px at 58% 22%, var(--fleck), transparent),
			radial-gradient(2px 2px at 76% 54%, var(--fleck), transparent),
			radial-gradient(1.4px 1.4px at 90% 34%, var(--fleck), transparent),
			radial-gradient(1.6px 1.6px at 22% 78%, var(--fleck), transparent);
		opacity: 0.7;
		animation: pcdrift 9s linear infinite;
	}
	/* the hour of the day, laid over whatever the zone painted */
	.wash {
		inset: 0;
		background: var(--wash);
	}
	.vignette {
		inset: 0;
		background: radial-gradient(80% 65% at 50% 45%, transparent 45%, rgba(6, 10, 20, calc(0.24 + var(--dim))));
	}

	.topbar {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.3rem 0.45rem;
		border-radius: 12px;
		border: 2px solid var(--line);
		background: rgba(253, 250, 242, 0.94);
	}
	.navb {
		width: 1.8rem;
		height: 1.8rem;
		border-radius: 8px;
		border: 2px solid var(--line);
		background: var(--card);
		color: var(--ink);
		font-size: 1rem;
		font-weight: 800;
		line-height: 1;
		cursor: pointer;
	}
	.navb:disabled {
		opacity: 0.28;
		cursor: default;
	}
	.stagemid {
		display: grid;
		justify-items: center;
		gap: 0.08rem;
		min-width: 208px;
	}
	.stagemid strong {
		font-size: 0.92rem;
		font-weight: 900;
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}
	.stagenum {
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--muted);
	}
	.stagenum b {
		font-size: 0.92rem;
		color: var(--red);
	}
	.stagenum i {
		font-style: normal;
		margin-left: 0.4rem;
	}
	.killdots {
		display: flex;
		gap: 3px;
	}
	.killdots.blank {
		visibility: hidden;
	}
	.killdots b {
		width: 13px;
		height: 5px;
		border-radius: 2px;
		border: 1px solid var(--line);
		background: #fff;
	}
	.killdots b.done {
		background: var(--sun);
	}

	.farmb {
		justify-self: end;
		padding: 0.25rem 0.7rem;
		border-radius: 999px;
		border: 2px solid var(--line);
		background: rgba(253, 250, 242, 0.94);
		color: var(--ink);
		font-size: 0.72rem;
		font-weight: 800;
		cursor: pointer;
	}
	.farmb.on {
		background: var(--sun);
		border-color: #8a6d00;
	}

	.foeBtn {
		position: relative;
		width: min(320px, 68vw);
		height: min(320px, 68vw);
		display: grid;
		place-items: center;
		cursor: pointer;
		user-select: none;
		-webkit-user-select: none;
	}
	.foeBtn:active .foeArt {
		transform: translateY(3px) scale(0.95);
	}
	.foeArt {
		width: 74%;
		height: 74%;
		max-width: 74%;
		max-height: 74%;
		object-fit: contain;
		image-rendering: pixelated;
		filter: drop-shadow(0 10px 16px rgba(0, 0, 0, 0.5));
		transition: transform 0.08s ease;
		pointer-events: none;
		animation: pcbob 2.8s ease-in-out infinite;
	}
	.shadow {
		position: absolute;
		bottom: 13%;
		width: 40%;
		height: 7%;
		border-radius: 50%;
		background: rgba(0, 0, 0, 0.35);
		filter: blur(5px);
		pointer-events: none;
	}
	.foeBtn.boss .foeArt {
		filter: drop-shadow(0 0 18px rgba(255, 90, 90, 0.75)) drop-shadow(0 10px 16px rgba(0, 0, 0, 0.5));
		animation-duration: 1.4s;
	}
	.foeBtn.shiny .foeArt {
		filter: drop-shadow(0 0 20px rgba(255, 224, 102, 0.9)) drop-shadow(0 10px 16px rgba(0, 0, 0, 0.5));
	}

	.dmg {
		position: absolute;
		transform: translate(-50%, -50%);
		font-weight: 900;
		font-size: 1.15rem;
		color: #fff;
		-webkit-text-stroke: 3px rgba(20, 28, 40, 0.9);
		paint-order: stroke fill;
		pointer-events: none;
		animation: pcfloat 0.7s ease-out forwards;
	}
	.dmg.crit {
		font-size: 1.8rem;
		color: var(--sun);
	}

	.botbar {
		display: grid;
		justify-items: center;
		gap: 0.3rem;
		width: min(440px, 96%);
	}
	.nameplate {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		min-width: 250px;
		min-height: 1.9rem;
		padding: 0.2rem 0.8rem;
		border-radius: 999px;
		border: 2px solid var(--line);
		background: rgba(253, 250, 242, 0.95);
	}
	.nameplate.bossplate {
		border-color: var(--red);
	}
	.npname {
		font-size: 0.92rem;
		font-weight: 900;
	}
	.typetag {
		padding: 0.06rem 0.5rem;
		border-radius: 999px;
		border: 1px solid rgba(0, 0, 0, 0.25);
		font-size: 0.58rem;
		font-weight: 900;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		background: var(--t);
		color: #fff;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
	}
	.bosstag {
		padding: 0.06rem 0.5rem;
		border-radius: 999px;
		font-size: 0.58rem;
		font-weight: 900;
		letter-spacing: 0.12em;
		background: var(--red);
		color: #fff;
	}
	.shinytag {
		font-style: normal;
		margin-right: 0.2rem;
		color: #c8a200;
	}

	.hpbar {
		position: relative;
		width: 100%;
		height: 19px;
		border-radius: 999px;
		border: 2px solid var(--line);
		background: #fdfaf2;
		overflow: hidden;
	}
	.hpbar i {
		display: block;
		height: 100%;
		background: linear-gradient(180deg, #7ee08a, #2f9c46);
		transition: width 0.1s linear;
	}
	.hpbar.bosshp i {
		background: linear-gradient(180deg, #ff8a7a, #d8443f);
	}
	.hptext {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		font-size: 0.68rem;
		font-weight: 800;
		color: var(--ink);
	}
	.bosstimer {
		position: relative;
		width: 100%;
		height: 14px;
		border-radius: 999px;
		border: 2px solid var(--line);
		background: #fdfaf2;
		overflow: hidden;
	}
	.bosstimer.blank {
		visibility: hidden;
	}
	.bosstimer i {
		display: block;
		height: 100%;
		background: linear-gradient(180deg, #6fc0ff, var(--blue));
		transition: width 0.1s linear;
	}
	.bosstimer.low i {
		background: linear-gradient(180deg, #ff8a5a, #d84a4a);
	}
	.bosstimer span {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		font-size: 0.6rem;
		font-weight: 800;
	}

	.hint {
		margin: 0;
		min-height: 1.05rem;
		text-align: center;
		font-size: 0.74rem;
		font-weight: 600;
		color: var(--muted);
	}

	.panel {
		display: grid;
		gap: 0.35rem;
		align-content: start;
		padding: 0.5rem;
		border-radius: 20px;
		border: 3px solid var(--line);
		border-bottom-width: 6px;
		background: var(--cream);
	}
	.tabbar {
		display: flex;
		gap: 3px;
		position: sticky;
		top: -0.5rem;
		z-index: 2;
		padding: 4px;
		margin: -0.5rem -0.5rem 0.2rem;
		border-radius: 14px;
		background: var(--red);
	}
	.tabbar button {
		flex: 1;
		min-width: 0;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.2rem;
		padding: 0.4rem 0.15rem;
		border: 2px solid transparent;
		border-radius: 10px;
		background: rgba(255, 255, 255, 0.22);
		color: #fff;
		font-size: 0.72rem;
		font-weight: 800;
		cursor: pointer;
	}
	.tabbar button.on {
		background: var(--card);
		border-color: var(--line);
		color: var(--ink);
	}
	.pip {
		font-style: normal;
		min-width: 15px;
		height: 15px;
		padding: 0 3px;
		display: grid;
		place-items: center;
		border-radius: 999px;
		background: var(--sun);
		color: #4a3800;
		font-size: 0.6rem;
		font-weight: 900;
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.25rem;
	}
	.chiplabel {
		font-size: 0.64rem;
		font-weight: 800;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--muted);
	}
	.chips button {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.22rem 0.6rem;
		border-radius: 999px;
		border: 2px solid var(--line);
		background: var(--card);
		color: var(--ink);
		font-size: 0.72rem;
		font-weight: 800;
		cursor: pointer;
	}
	.chips button.on {
		background: var(--blue);
		border-color: #17527f;
		color: #fff;
	}
	.chips em {
		font-style: normal;
		padding: 0 0.3rem;
		border-radius: 999px;
		background: var(--sun);
		color: #4a3800;
		font-size: 0.62rem;
	}

	/* Eight rows and then a scrollbar. The panel used to run off the bottom of the
	   page once the shop had a hundred things in it. The sliver of a ninth row is
	   deliberate: it is what tells you there is more below. */
	.list {
		display: grid;
		gap: 0.35rem;
		max-height: calc(8 * (44px + 0.7rem) + 7 * 0.35rem + 0.9rem);
		overflow-y: auto;
		scrollbar-gutter: stable;
		padding-right: 2px;
	}
	.list::-webkit-scrollbar {
		width: 8px;
	}
	.list::-webkit-scrollbar-track {
		background: #e8eef4;
		border-radius: 99px;
	}
	.list::-webkit-scrollbar-thumb {
		background: var(--line);
		border-radius: 99px;
	}

	.row {
		display: grid;
		grid-template-columns: 40px minmax(0, 1fr) auto;
		align-items: center;
		gap: 0.5rem;
		padding: 0.35rem 0.6rem 0.35rem 0.35rem;
		border-radius: 13px;
		border: 2px solid var(--line);
		border-left-width: 7px;
		border-left-color: var(--t, var(--blue));
		background: var(--card);
		color: var(--ink);
		text-align: left;
		cursor: pointer;
		transition:
			transform 0.07s,
			background 0.12s;
	}
	.row:hover:not(:disabled) {
		background: #f3f8fd;
	}
	.row:active:not(:disabled) {
		transform: translateY(1px);
	}
	.row:disabled {
		opacity: 0.42;
		cursor: default;
	}
	.row.owned {
		background: linear-gradient(90deg, color-mix(in srgb, var(--t) 18%, #fff), #fff 55%);
	}
	.row.shopitem.ready {
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--sun) 70%, transparent);
	}
	.ricon {
		display: grid;
		place-items: center;
		width: 40px;
		height: 40px;
	}
	.ricon img {
		width: 100%;
		image-rendering: pixelated;
	}
	.ricon.glyph,
	.glyphbig {
		font-size: 1.35rem;
	}
	.rmid {
		display: grid;
		gap: 0.05rem;
		min-width: 0;
	}
	.rmid b {
		font-size: 0.83rem;
		font-weight: 800;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.rmid u {
		text-decoration: none;
		color: var(--blue);
		font-size: 0.74rem;
	}
	.plus {
		font-style: normal;
		margin-left: 0.3rem;
		padding: 0.02rem 0.32rem;
		border-radius: 5px;
		background: #2f9c46;
		color: #fff;
		font-size: 0.66rem;
		font-weight: 900;
	}
	.rmid i {
		font-style: normal;
		font-size: 0.7rem;
		color: var(--muted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.rcost {
		font-size: 0.78rem;
		font-weight: 900;
		color: #a06a00;
		white-space: nowrap;
	}
	.candycost {
		color: #8e24aa;
	}
	.tapup {
		border-left-color: #d2601a;
	}
	.perk {
		border-left-color: #8e24aa;
	}

	.rebirth {
		display: grid;
		gap: 0.35rem;
		padding: 0.7rem;
		border-radius: 14px;
		border: 2px solid #8e24aa;
		background: #f9effc;
	}
	.rbtitle {
		font-size: 0.64rem;
		font-weight: 900;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: #8e24aa;
	}
	.rbline {
		margin: 0;
		font-size: 0.84rem;
		font-weight: 600;
	}
	.rbline b {
		color: #8e24aa;
	}
	.confirm {
		display: flex;
		gap: 0.35rem;
	}
	.note {
		margin: 0.1rem 0;
		font-size: 0.71rem;
		font-weight: 600;
		color: var(--muted);
	}
	.note b {
		color: var(--ink);
	}

	.dexhead {
		display: flex;
		gap: 0.5rem;
		font-size: 0.64rem;
		font-weight: 800;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--muted);
	}
	.dexhead b {
		font-size: 0.86rem;
		letter-spacing: 0;
		color: var(--ink);
	}
	.dexgrid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(46px, 1fr));
		gap: 3px;
		max-height: 26rem;
		overflow-y: auto;
		scrollbar-gutter: stable;
	}
	.dexcell {
		position: relative;
		aspect-ratio: 1;
		display: grid;
		place-items: center;
		border-radius: 9px;
		border: 2px solid #d4dee7;
		background: #eef4f9;
	}
	.dexcell img {
		width: 92%;
		image-rendering: pixelated;
		filter: brightness(0) opacity(0.22);
	}
	.dexcell.got {
		border-color: var(--line);
		background: var(--card);
	}
	.dexcell.got img {
		filter: none;
	}
	.dexcell.bossmon {
		border-color: var(--red);
	}
	.dexn {
		position: absolute;
		right: 2px;
		bottom: 0;
		font-size: 0.58rem;
		font-weight: 900;
		color: var(--ink);
	}
	.dexs {
		position: absolute;
		left: 2px;
		top: 0;
		font-size: 0.6rem;
		color: #c8a200;
	}

	.boardlist {
		display: grid;
		gap: 0.3rem;
		max-height: 26rem;
		overflow-y: auto;
		scrollbar-gutter: stable;
	}
	.brow {
		display: grid;
		grid-template-columns: 1.5rem minmax(0, 1fr) auto;
		align-items: center;
		gap: 0.5rem;
		padding: 0.4rem 0.6rem;
		border-radius: 12px;
		border: 2px solid var(--line);
		background: var(--card);
	}
	.brow.first {
		background: #fff8dd;
		border-color: #b58900;
	}
	.brow.me {
		border-color: var(--blue);
	}
	.bpos {
		font-weight: 900;
		color: var(--muted);
	}
	.bname {
		display: grid;
		gap: 0.02rem;
		min-width: 0;
	}
	.bname b {
		font-size: 0.85rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.bname i {
		font-style: normal;
		font-size: 0.66rem;
		color: var(--muted);
	}
	.bstage {
		display: grid;
		justify-items: end;
	}
	.bstage b {
		font-size: 1.05rem;
		color: var(--red);
	}
	.bstage i {
		font-style: normal;
		font-size: 0.56rem;
		font-weight: 800;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--muted);
	}

	.modal {
		position: fixed;
		inset: 0;
		z-index: 40;
		display: grid;
		place-items: center;
		padding: 1rem;
		background: rgba(20, 30, 40, 0.6);
	}
	.sheet {
		display: grid;
		gap: 0.5rem;
		justify-items: center;
		text-align: center;
		width: min(420px, 92vw);
		padding: 1.3rem;
		border-radius: 20px;
		border: 3px solid var(--line);
		border-bottom-width: 6px;
		background: var(--cream);
	}
	.sheet h2 {
		margin: 0;
		font-size: 1.1rem;
	}
	.sheet p {
		margin: 0;
		font-size: 0.86rem;
	}
	.sheet b {
		color: #a06a00;
	}

	.err {
		max-width: 1320px;
		margin: 0.7rem auto 0;
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--red);
	}

	@keyframes pcbob {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-7px);
		}
	}
	@keyframes pctwinkle {
		0%,
		100% {
			opacity: 0.55;
		}
		50% {
			opacity: 0.95;
		}
	}
	@keyframes pcdrift {
		0% {
			transform: translate3d(0, 0, 0);
			opacity: 0.25;
		}
		50% {
			opacity: 0.75;
		}
		100% {
			transform: translate3d(-14px, 22px, 0);
			opacity: 0.25;
		}
	}
	@keyframes pcfloat {
		0% {
			opacity: 1;
			transform: translate(-50%, -50%) scale(0.85);
		}
		100% {
			opacity: 0;
			transform: translate(-50%, -190%) scale(1.2);
		}
	}
</style>
