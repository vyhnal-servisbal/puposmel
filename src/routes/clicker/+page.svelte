<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { fade, fly, scale } from 'svelte/transition';
	import { game, fmt, pretty, hpAt, isBossStage, PARTY, PERKS, ZONES } from '$lib/clicker/game.svelte';
	import type { Upgrade } from '$lib/clicker/data';
	import { sceneOf } from '$lib/clicker/data';
	import { spriteOf, aniOf, typeColor } from '$lib/dexStore.svelte';
	import { cloud } from '$lib/cloud.svelte';

	type Tab = 'party' | 'shop' | 'perks' | 'dex' | 'board';
	type Amount = 1 | 10 | 100 | 'max';

	let tab = $state<Tab>('party');
	let buyAmt = $state<Amount>(1);
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
	let sceneVars = $derived(
		`--sky1:${scene.sky1};--sky2:${scene.sky2};--far:${scene.far};--near:${scene.near};` +
			`--ground:${scene.ground};--orb:${scene.orb};--glow:${scene.glow};--fleck:${scene.fleck}`
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

	// every species the tour can throw at you, bosses included
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

	// what the shop can sell right now, cheapest first, and how many of those are
	// actually within reach so the tab can badge itself
	let shopList = $derived(game.shopList);
	let affordableUps = $derived(shopList.filter((u) => game.save.gold >= u.cost).length);

	function upOwner(u: Upgrade): string {
		return u.member ? pretty(u.member) : 'Everyone';
	}
	const AMOUNTS: Amount[] = [1, 10, 100, 'max'];
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
		<a class="chip nav" href="/">‹ Binder</a>

		<div class="gauges">
			<span class="gauge money">
				<i>money</i>
				<b>₽ {fmt(game.save.gold)}</b>
			</span>
			<span class="gauge dps">
				<i>party dps</i>
				<b>{fmt(game.dps)}</b>
			</span>
			<span class="gauge tap">
				<i>per tap</i>
				<b>{fmt(game.tapDamage)}</b>
			</span>
			<span class="gauge crit">
				<i>crit</i>
				<b>{Math.round(game.critChance * 100)}%</b>
			</span>
			{#if game.save.candy || game.save.rebirths}
				<span class="gauge candy">
					<i>candy</i>
					<b>{fmt(game.save.candy)}</b>
				</span>
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
		<section class="arena" style={sceneVars}>
			<!-- the whole backdrop is drawn from the zone palette: sky, a glow, two
			     silhouette ridges and a floor. No images, so switching zones costs
			     nothing but a handful of custom properties. -->
			<div class="scene" aria-hidden="true">
				<span class="orb"></span>
				<span class="ridge far"></span>
				<span class="ridge near"></span>
				<span class="floor"></span>
				<span class="motes"></span>
				<span class="vignette"></span>
			</div>

			<div class="stagebar">
				<button class="navb" onclick={() => game.goBack()} disabled={game.save.stage <= 1}>‹</button>
				<div class="stagemid">
					<strong>{zone.name}</strong>
					<span class="stagenum">
						Stage <b>{game.save.stage}</b>
						<i>best {game.save.highest}</i>
					</span>
					<!-- always rendered, hidden on boss stages: toggling it moved the
					     whole arena every fifth stage and the page jumped -->
					<span class="killdots" class:blank={isBossStage(game.save.stage)}>
						{#each { length: 10 } as _, i}
							<b class:done={i < game.save.kills}></b>
						{/each}
					</span>
				</div>
				<button class="navb" onclick={() => game.goForward()} disabled={game.save.stage >= game.save.highest}>›</button>
			</div>

			{#if foe}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class="foeBtn"
					class:boss={foe.boss}
					class:shiny={foe.shiny}
					onclick={hitFoe}
					role="button"
					tabindex="0"
				>
					<span class="shadow"></span>
					{#key foe.mon[1] + String(foe.shiny)}
						<img
							class="foeArt"
							src={art(foe.mon[1], foe.mon[0], foe.shiny)}
							alt={pretty(foe.mon[1])}
							draggable="false"
							onerror={() => (broken[foe.mon[1]] = true)}
							in:scale={{ duration: 220, start: 0.75 }}
						/>
					{/key}

					{#each game.hits as h (h.id)}
						<span class="dmg" class:crit={h.crit} style="left:{h.x}%; top:{h.y}%">
							{fmt(h.amount)}{h.crit ? '!' : ''}
						</span>
					{/each}
				</div>

				<div class="nameplate" class:bossplate={foe.boss}>
					<span class="npname">
						{#if foe.shiny}<em class="shinytag">✦</em>{/if}
						{pretty(foe.mon[1])}
					</span>
					<span class="typetag" style="--t:{typeColor(foe.type)}">{foe.type}</span>
					{#if foe.boss}<span class="bosstag">BOSS</span>{/if}
				</div>

				<div class="hpwrap">
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

			<p class="hint">Tap the Pokémon or hold Space · next stage is {fmt(nextStageHp)} HP</p>
		</section>

		<aside class="panel">
			<div class="tabbar">
				<button class:on={tab === 'party'} onclick={() => (tab = 'party')}>Party</button>
				<button class:on={tab === 'shop'} onclick={() => (tab = 'shop')}>
					Shop{#if affordableUps > 0}<i class="pip">{affordableUps}</i>{/if}
				</button>
				<button class:on={tab === 'perks'} onclick={() => (tab = 'perks')}>
					Rebirth{#if game.candyGain > 0}<i class="pip">!</i>{/if}
				</button>
				<button class:on={tab === 'dex'} onclick={() => (tab = 'dex')}>Dex</button>
				<button class:on={tab === 'board'} onclick={() => (tab = 'board')}>Board</button>
			</div>

			{#if tab === 'party'}
				<div class="amounts">
					<span>Buy</span>
					{#each AMOUNTS as n (n)}
						<button class:on={buyAmt === n} onclick={() => (buyAmt = n)}>
							{n === 'max' ? 'MAX' : '×' + n}
						</button>
					{/each}
				</div>

				<button class="rowbtn tapup" onclick={() => game.buyTap()} disabled={game.save.gold < game.tapCost}>
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
							class="rowbtn"
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
			{:else if tab === 'shop'}
				<p class="shopnote">
					{game.shopOwned} owned · {shopList.length} on the shelf. Wiped by a rebirth, unlike perks.
				</p>
				{#each shopList.slice(0, 40) as u (u.key)}
					<button
						class="rowbtn shopitem"
						class:member={!!u.member}
						onclick={() => game.buyUp(u.key)}
						disabled={game.save.gold < u.cost}
					>
						<span class="ricon glyph">{u.icon}</span>
						<span class="rmid">
							<b>{u.name}</b>
							<i>{u.desc}</i>
						</span>
						<span class="rcost">
							₽ {fmt(u.cost)}
							<em class="owner">{upOwner(u)}</em>
						</span>
					</button>
				{/each}
				{#if !shopList.length}
					<p class="shopnote">Sold out. Level the party up for more.</p>
				{/if}
			{:else if tab === 'perks'}
				<div class="rebirth">
					<span class="rbtitle">Professor's Reset</span>
					<p class="rbline">
						Wipe the run, keep candy, perks and the Dex. Worth
						<b>🍬 {fmt(game.candyGain)}</b> right now.
					</p>
					<p class="rbsmall">
						Candy you are holding is itself <b>+{Math.round((game.candyBonus - 1) * 100)}%</b> damage,
						so spending every last one is not always right. Rebirths: {game.save.rebirths}.
						{#if game.startGold > 0}Restarts with ₽ {fmt(game.startGold)}.{/if}
					</p>
					{#if confirming}
						<div class="confirm">
							<button class="chip go" onclick={() => { game.rebirth(); confirming = false; tab = 'party'; }}>
								Yes, reset
							</button>
							<button class="chip" onclick={() => (confirming = false)}>Cancel</button>
						</div>
					{:else}
						<button class="chip go wide" onclick={() => (confirming = true)} disabled={game.candyGain <= 0}>
							{game.candyGain > 0 ? `Rebirth for ${fmt(game.candyGain)} candy` : 'Push further first'}
						</button>
					{/if}
				</div>

				{#each PERKS as p (p.key)}
					{@const lvl = game.save.perks[p.key] ?? 0}
					{@const cost = game.perkCost(p.key)}
					<button
						class="rowbtn perk"
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
				<p class="boardnote">Highest stage wins. Refreshes every half minute.</p>
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
						<p class="boardnote">Nothing here yet.</p>
					{/if}
				</div>
			{/if}
		</aside>
	</div>

	{#if game.offlineGold > 0}
		<div class="modal" transition:fade={{ duration: 150 }}>
			<div class="sheet" in:fly={{ y: 14, duration: 200 }}>
				<h2>Your party kept working</h2>
				<p>
					Away for {label(game.offlineSeconds)}. They farmed <b>₽ {fmt(game.offlineGold)}</b>.
				</p>
				<p class="rbsmall">Offline rate is {Math.round(game.idleRate * 100)}%, capped at 12 hours.</p>
				<button class="chip go" onclick={() => game.dismissOffline()}>Nice</button>
			</div>
		</div>
	{/if}

	{#if game.error}
		<p class="err">{game.error}</p>
	{/if}
</div>

<style>
	/* A deliberately different look from the rest of the app: chunky bevelled
	   panels, hard edges and tabular numbers, so it reads as a game screen rather
	   than another page of the binder. */
	.pcwrap {
		min-height: 100dvh;
		padding: 0.7rem clamp(0.5rem, 2vw, 1.4rem) 1.6rem;
		color: #e2f1f5;
		background:
			radial-gradient(85% 55% at 50% -12%, color-mix(in srgb, var(--acc) 20%, transparent), transparent 72%),
			radial-gradient(55% 45% at 100% 105%, rgba(0, 170, 175, 0.1), transparent 70%),
			linear-gradient(180deg, #04121a, #072029 46%, #020a0f);
		font-variant-numeric: tabular-nums;
	}
	/* a very faint scanline, just enough to read as a screen rather than a page */
	.pcwrap::after {
		content: '';
		position: fixed;
		inset: 0;
		z-index: 60;
		pointer-events: none;
		background: repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.016) 0 1px, transparent 1px 3px);
	}

	/* ---- status bar ---- */
	.hud {
		display: flex;
		align-items: stretch;
		gap: 0.5rem;
		max-width: 1320px;
		margin: 0 auto 0.7rem;
		flex-wrap: wrap;
	}
	.chip {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.45rem 0.85rem;
		border-radius: 10px;
		border: 1px solid rgba(255, 255, 255, 0.14);
		border-bottom-width: 3px;
		background: linear-gradient(180deg, rgba(255, 255, 255, 0.09), rgba(255, 255, 255, 0.03));
		color: #c9e4ea;
		text-decoration: none;
		font-size: 0.82rem;
		font-weight: 600;
		cursor: pointer;
		transition: transform 0.08s, border-color 0.15s;
	}
	.chip:hover:not(:disabled) {
		border-color: var(--acc);
	}
	.chip:active:not(:disabled) {
		transform: translateY(2px);
		border-bottom-width: 1px;
	}
	.chip:disabled {
		opacity: 0.4;
		cursor: default;
	}
	.chip.go {
		border-color: rgba(255, 190, 110, 0.75);
		background: linear-gradient(180deg, #ffb457, #e07a2a);
		color: #26150a;
		text-shadow: 0 1px 0 rgba(255, 255, 255, 0.3);
	}
	.chip.wide {
		width: 100%;
	}

	.gauges {
		display: flex;
		flex: 1;
		flex-wrap: wrap;
		gap: 0.4rem;
	}
	/* each readout is its own lit segment, coloured by what it measures */
	.gauge {
		display: grid;
		gap: 0.05rem;
		padding: 0.3rem 0.8rem;
		min-width: 92px;
		border-radius: 10px;
		border: 1px solid color-mix(in srgb, var(--c) 45%, transparent);
		border-bottom-width: 3px;
		background:
			linear-gradient(180deg, color-mix(in srgb, var(--c) 16%, transparent), transparent),
			rgba(3, 14, 20, 0.6);
	}
	.gauge i {
		font-style: normal;
		font-size: 0.58rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: color-mix(in srgb, var(--c) 65%, #6f97a1);
	}
	.gauge b {
		font-size: 1rem;
		line-height: 1.1;
		color: var(--c);
		text-shadow: 0 0 12px color-mix(in srgb, var(--c) 40%, transparent);
	}
	.money {
		--c: #ffd066;
	}
	.dps {
		--c: #5fe0c8;
	}
	.tap {
		--c: #ff9f6b;
	}
	.crit {
		--c: #ff6b8f;
	}
	.candy {
		--c: #ff9ecb;
	}

	.trainer {
		display: grid;
		align-content: center;
		justify-items: end;
		gap: 0.1rem;
		padding: 0 0.3rem;
	}
	.trainer b {
		font-size: 0.86rem;
	}
	.sync {
		font-style: normal;
		font-size: 0.6rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: #4d747d;
	}
	.sync.on {
		color: #86d7a2;
	}
	.sync.bad {
		color: #ff8a7a;
	}

	.pcgrid {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(310px, 390px);
		gap: 0.8rem;
		max-width: 1320px;
		margin: 0 auto;
		align-items: start;
	}
	@media (max-width: 940px) {
		.pcgrid {
			grid-template-columns: minmax(0, 1fr);
		}
	}

	/* ---- the arena and its painted backdrop ---- */
	/* Fixed rows and a floor under the height. Sprites vary wildly and the boss
	   timer used to appear from nowhere every fifth stage, which shoved the whole
	   page around. Nothing in here resizes any more. */
	.arena {
		position: relative;
		display: grid;
		grid-template-rows: auto minmax(0, 1fr) auto auto auto;
		justify-items: center;
		align-content: start;
		min-height: 620px;
		gap: 0.55rem;
		padding: 0.9rem 0.9rem 1.1rem;
		border-radius: 18px;
		border: 2px solid rgba(255, 255, 255, 0.1);
		overflow: hidden;
		isolation: isolate;
	}
	.scene {
		position: absolute;
		inset: 0;
		z-index: 0;
		background: linear-gradient(180deg, var(--sky1), var(--sky2));
	}
	.scene span {
		position: absolute;
		display: block;
	}
	.orb {
		top: 12%;
		right: 16%;
		width: 74px;
		height: 74px;
		border-radius: 50%;
		background: var(--orb);
		box-shadow: 0 0 70px 30px var(--glow);
		opacity: 0.9;
	}
	/* two ridges, the far one lighter and higher, which is enough to read as depth */
	.ridge {
		left: -10%;
		width: 120%;
		background: var(--far);
		clip-path: polygon(0 62%, 9% 40%, 18% 55%, 28% 28%, 38% 48%, 50% 22%, 61% 47%, 71% 32%, 82% 52%, 92% 38%, 100% 58%, 100% 100%, 0 100%);
	}
	.ridge.far {
		bottom: 26%;
		height: 46%;
		opacity: 0.75;
	}
	.ridge.near {
		bottom: 18%;
		height: 38%;
		background: var(--near);
		clip-path: polygon(0 70%, 12% 52%, 24% 66%, 35% 44%, 48% 62%, 58% 40%, 70% 60%, 84% 46%, 100% 66%, 100% 100%, 0 100%);
	}
	.floor {
		left: 0;
		right: 0;
		bottom: 0;
		height: 22%;
		background: linear-gradient(180deg, var(--ground), color-mix(in srgb, var(--ground) 55%, #000));
	}
	/* drifting motes: snow in the ice path, embers in the volcano, sparks in the
	   power plant, all the same two gradients tinted by the zone */
	.motes {
		inset: 0;
		background-image:
			radial-gradient(2px 2px at 12% 30%, var(--fleck), transparent),
			radial-gradient(2px 2px at 34% 62%, var(--fleck), transparent),
			radial-gradient(1.6px 1.6px at 58% 22%, var(--fleck), transparent),
			radial-gradient(2px 2px at 76% 54%, var(--fleck), transparent),
			radial-gradient(1.4px 1.4px at 90% 34%, var(--fleck), transparent),
			radial-gradient(1.6px 1.6px at 22% 78%, var(--fleck), transparent);
		opacity: 0.75;
		animation: pcdrift 9s linear infinite;
	}
	.vignette {
		inset: 0;
		background:
			radial-gradient(75% 60% at 50% 45%, transparent 40%, rgba(2, 10, 15, 0.55)),
			linear-gradient(180deg, rgba(2, 10, 15, 0.35), transparent 30%);
	}
	.arena > *:not(.scene) {
		position: relative;
		z-index: 1;
	}

	.stagebar {
		display: flex;
		align-items: center;
		gap: 0.7rem;
		padding: 0.35rem 0.5rem;
		border-radius: 12px;
		background: rgba(3, 14, 20, 0.55);
		border: 1px solid rgba(255, 255, 255, 0.1);
	}
	.navb {
		width: 1.9rem;
		height: 1.9rem;
		border-radius: 8px;
		border: 1px solid rgba(255, 255, 255, 0.14);
		background: rgba(255, 255, 255, 0.07);
		color: #e2f1f5;
		font-size: 1rem;
		line-height: 1;
		cursor: pointer;
	}
	.navb:disabled {
		opacity: 0.22;
		cursor: default;
	}
	.stagemid {
		display: grid;
		justify-items: center;
		gap: 0.1rem;
		min-width: 210px;
	}
	.stagemid strong {
		font-size: 0.98rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: #fff;
		text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
	}
	.stagenum {
		font-size: 0.72rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: #a9ccd4;
	}
	.stagenum b {
		font-size: 0.95rem;
		color: var(--acc);
	}
	.stagenum i {
		font-style: normal;
		margin-left: 0.4rem;
		opacity: 0.6;
	}
	.killdots {
		display: flex;
		gap: 3px;
		margin-top: 0.15rem;
	}
	.killdots.blank {
		visibility: hidden;
	}
	.killdots b {
		width: 13px;
		height: 4px;
		border-radius: 2px;
		background: rgba(255, 255, 255, 0.2);
	}
	.killdots b.done {
		background: var(--acc);
		box-shadow: 0 0 6px var(--acc);
	}

	.foeBtn {
		position: relative;
		width: min(330px, 70vw);
		aspect-ratio: 1;
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
		width: 72%;
		height: 72%;
		object-fit: contain;
		image-rendering: pixelated;
		filter: drop-shadow(0 10px 16px rgba(0, 0, 0, 0.55));
		transition: transform 0.08s ease;
		pointer-events: none;
		animation: pcbob 2.8s ease-in-out infinite;
	}
	/* an ellipse on the floor instead of a glowing ring, so the foe stands in the
	   scene rather than floating in front of it */
	.shadow {
		position: absolute;
		bottom: 12%;
		width: 42%;
		height: 7%;
		border-radius: 50%;
		background: rgba(0, 0, 0, 0.4);
		filter: blur(5px);
		pointer-events: none;
	}
	.foeBtn.boss .foeArt {
		filter: drop-shadow(0 0 18px rgba(255, 90, 90, 0.7)) drop-shadow(0 10px 16px rgba(0, 0, 0, 0.6));
		animation-duration: 1.4s;
	}
	.foeBtn.shiny .foeArt {
		filter: drop-shadow(0 0 20px rgba(255, 224, 102, 0.85)) drop-shadow(0 10px 16px rgba(0, 0, 0, 0.6));
	}

	.dmg {
		position: absolute;
		transform: translate(-50%, -50%);
		font-weight: 900;
		font-size: 1.15rem;
		color: #fff;
		text-shadow: 0 0 6px rgba(0, 0, 0, 0.9), 0 2px 0 rgba(0, 0, 0, 0.6);
		pointer-events: none;
		animation: pcfloat 0.7s ease-out forwards;
	}
	.dmg.crit {
		font-size: 1.8rem;
		color: #ffd166;
	}

	.nameplate {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 260px;
		min-height: 2rem;
		gap: 0.4rem;
		padding: 0.3rem 0.8rem;
		border-radius: 999px;
		background: rgba(3, 14, 20, 0.72);
		border: 1px solid rgba(255, 255, 255, 0.12);
	}
	.nameplate.bossplate {
		border-color: rgba(255, 90, 90, 0.6);
	}
	.npname {
		font-size: 0.95rem;
		font-weight: 700;
	}
	.typetag {
		padding: 0.08rem 0.5rem;
		border-radius: 999px;
		font-size: 0.6rem;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		background: color-mix(in srgb, var(--t) 30%, transparent);
		color: var(--t);
	}
	.bosstag {
		padding: 0.08rem 0.5rem;
		border-radius: 999px;
		font-size: 0.6rem;
		font-weight: 800;
		letter-spacing: 0.14em;
		background: #d8443f;
		color: #fff;
	}
	.shinytag {
		font-style: normal;
		color: #ffe066;
	}

	.hpwrap {
		display: grid;
		gap: 0.3rem;
		width: min(430px, 92%);
	}
	.hpbar {
		position: relative;
		height: 20px;
		border-radius: 6px;
		border: 2px solid rgba(0, 0, 0, 0.55);
		background: rgba(0, 0, 0, 0.5);
		overflow: hidden;
		box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.6);
	}
	.hpbar i {
		display: block;
		height: 100%;
		background: linear-gradient(180deg, #7ee08a, #34a04a 55%, #2a8440);
		transition: width 0.1s linear;
	}
	.hpbar.bosshp i {
		background: linear-gradient(180deg, #ff8a7a, #d8443f 55%, #a92e2b);
	}
	.hptext {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		font-size: 0.7rem;
		font-weight: 700;
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.95);
	}
	.bosstimer.blank {
		visibility: hidden;
	}
	.bosstimer {
		position: relative;
		height: 15px;
		border-radius: 6px;
		border: 2px solid rgba(0, 0, 0, 0.5);
		background: rgba(0, 0, 0, 0.5);
		overflow: hidden;
	}
	.bosstimer i {
		display: block;
		height: 100%;
		background: linear-gradient(180deg, #63dced, #2fa2b8);
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
		font-size: 0.63rem;
		font-weight: 700;
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.95);
	}

	.hint {
		margin: 0;
		min-height: 1.05rem;
		font-size: 0.72rem;
		color: #bcd9e1;
		text-shadow: 0 1px 4px rgba(0, 0, 0, 0.9);
	}

	/* ---- side panel ---- */
	.panel {
		display: grid;
		gap: 0.35rem;
		align-content: start;
		max-height: calc(100dvh - 5rem);
		overflow-y: auto;
		/* reserve the scrollbar so switching tabs never changes the column width */
		scrollbar-gutter: stable;
		padding: 0.5rem;
		border-radius: 16px;
		border: 2px solid rgba(255, 255, 255, 0.09);
		background: linear-gradient(180deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.015));
	}
	.tabbar {
		display: flex;
		gap: 3px;
		position: sticky;
		top: -0.5rem;
		z-index: 2;
		padding: 3px;
		margin: -0.5rem -0.5rem 0.2rem;
		border-radius: 12px;
		background: #072029;
	}
	.tabbar button {
		flex: 1;
		min-width: 0;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.2rem;
		padding: 0.45rem 0.15rem;
		border: 0;
		border-radius: 9px;
		background: rgba(255, 255, 255, 0.04);
		color: #7fa4ae;
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.01em;
		cursor: pointer;
	}
	.tabbar button.on {
		background: linear-gradient(180deg, color-mix(in srgb, var(--acc) 55%, #fff 8%), var(--acc));
		color: #03181f;
	}
	.pip {
		font-style: normal;
		width: 14px;
		height: 14px;
		display: grid;
		place-items: center;
		border-radius: 50%;
		background: #ff5a8a;
		color: #fff;
		font-size: 0.6rem;
	}

	.amounts {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.68rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: #749ea9;
	}
	.amounts button {
		padding: 0.22rem 0.5rem;
		border-radius: 7px;
		border: 1px solid rgba(255, 255, 255, 0.12);
		background: rgba(255, 255, 255, 0.04);
		color: #bcd9e1;
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0;
		cursor: pointer;
	}
	.amounts button.on {
		border-color: var(--acc);
		background: color-mix(in srgb, var(--acc) 30%, transparent);
		color: #fff;
	}

	.rowbtn {
		display: grid;
		grid-template-columns: 42px minmax(0, 1fr) auto;
		align-items: center;
		gap: 0.55rem;
		padding: 0.4rem 0.65rem 0.4rem 0.4rem;
		border-radius: 11px;
		border: 1px solid rgba(255, 255, 255, 0.09);
		border-left: 3px solid color-mix(in srgb, var(--t, #2fa2b8) 55%, transparent);
		background: linear-gradient(180deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02));
		color: inherit;
		text-align: left;
		cursor: pointer;
		transition: transform 0.08s, border-color 0.15s, background 0.15s;
	}
	.rowbtn:hover:not(:disabled) {
		border-color: var(--t, var(--acc));
		background: rgba(255, 255, 255, 0.08);
	}
	.rowbtn:active:not(:disabled) {
		transform: translateY(1px);
	}
	.rowbtn:disabled {
		opacity: 0.38;
		cursor: default;
	}
	.rowbtn.owned {
		background: linear-gradient(
			90deg,
			color-mix(in srgb, var(--t) 14%, transparent),
			rgba(255, 255, 255, 0.02) 45%
		);
	}
	.ricon {
		display: grid;
		place-items: center;
		width: 42px;
		height: 42px;
	}
	.ricon img {
		width: 100%;
		image-rendering: pixelated;
	}
	.ricon.glyph {
		font-size: 1.35rem;
	}
	.rmid {
		display: grid;
		gap: 0.08rem;
		min-width: 0;
	}
	.rmid b {
		font-size: 0.84rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.rmid u {
		text-decoration: none;
		color: var(--t, var(--acc));
		font-size: 0.74rem;
	}
	.plus {
		font-style: normal;
		margin-left: 0.3rem;
		padding: 0.02rem 0.32rem;
		border-radius: 5px;
		background: #3fae6a;
		color: #04180c;
		font-size: 0.66rem;
		font-weight: 800;
	}
	.rmid i {
		font-style: normal;
		font-size: 0.7rem;
		color: #7ba4ae;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.rcost {
		font-size: 0.76rem;
		font-weight: 700;
		color: #ffd066;
		white-space: nowrap;
	}
	.candycost {
		color: #ff9ecb;
	}
	.tapup {
		border-left-color: #ff9f6b;
	}
	.perk {
		border-left-color: #ff9ecb;
	}
	.shopitem {
		border-left-color: #ffd066;
	}
	.shopitem.member {
		border-left-color: #5fe0c8;
	}
	.shopnote {
		margin: 0.15rem 0;
		font-size: 0.7rem;
		color: #749ea9;
	}
	.owner {
		display: block;
		font-style: normal;
		font-size: 0.62rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #6f97a1;
		text-align: right;
	}

	.rebirth {
		display: grid;
		gap: 0.4rem;
		padding: 0.7rem;
		border-radius: 13px;
		border: 1px solid rgba(255, 158, 203, 0.35);
		background: linear-gradient(180deg, rgba(255, 158, 203, 0.13), rgba(255, 158, 203, 0.04));
	}
	.rbtitle {
		font-size: 0.66rem;
		font-weight: 800;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: #ff9ecb;
	}
	.rbline {
		margin: 0;
		font-size: 0.84rem;
	}
	.rbline b {
		color: #ffc8e2;
	}
	.rbsmall {
		margin: 0;
		font-size: 0.72rem;
		color: #7ba4ae;
	}
	.rbsmall b {
		color: #c9e4ea;
	}
	.confirm {
		display: flex;
		gap: 0.35rem;
	}

	.dexhead {
		display: flex;
		gap: 0.4rem;
		font-size: 0.68rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: #749ea9;
	}
	.dexhead b {
		font-size: 0.85rem;
		letter-spacing: 0;
		color: #e2f1f5;
	}
	.dexgrid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(48px, 1fr));
		gap: 3px;
	}
	.dexcell {
		position: relative;
		aspect-ratio: 1;
		display: grid;
		place-items: center;
		border-radius: 8px;
		border: 1px solid rgba(255, 255, 255, 0.05);
		background: rgba(0, 0, 0, 0.25);
	}
	.dexcell img {
		width: 92%;
		image-rendering: pixelated;
		filter: brightness(0) opacity(0.3);
	}
	.dexcell.got {
		background: rgba(255, 255, 255, 0.05);
		border-color: rgba(255, 255, 255, 0.12);
	}
	.dexcell.got img {
		filter: none;
	}
	.dexcell.bossmon {
		border-color: rgba(255, 90, 90, 0.3);
	}
	.dexn {
		position: absolute;
		right: 2px;
		bottom: 0;
		font-size: 0.58rem;
		font-weight: 700;
		text-shadow: 0 1px 3px #000;
	}
	.dexs {
		position: absolute;
		left: 2px;
		top: 0;
		font-size: 0.6rem;
		color: #ffe066;
	}

	.boardnote {
		margin: 0.2rem 0;
		font-size: 0.72rem;
		color: #749ea9;
	}
	.boardlist {
		display: grid;
		gap: 0.3rem;
	}
	.brow {
		display: grid;
		grid-template-columns: 1.5rem minmax(0, 1fr) auto;
		align-items: center;
		gap: 0.5rem;
		padding: 0.4rem 0.6rem;
		border-radius: 11px;
		border: 1px solid rgba(255, 255, 255, 0.08);
		background: rgba(255, 255, 255, 0.03);
	}
	.brow.first {
		border-color: rgba(255, 208, 102, 0.45);
		background: rgba(255, 208, 102, 0.09);
	}
	.brow.me {
		border-color: var(--acc);
	}
	.bpos {
		font-weight: 800;
		color: #749ea9;
	}
	.bname {
		display: grid;
		gap: 0.05rem;
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
		color: #749ea9;
	}
	.bstage {
		display: grid;
		justify-items: end;
	}
	.bstage b {
		font-size: 1.05rem;
		color: #ffd066;
	}
	.bstage i {
		font-style: normal;
		font-size: 0.58rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: #749ea9;
	}

	.modal {
		position: fixed;
		inset: 0;
		z-index: 40;
		display: grid;
		place-items: center;
		padding: 1rem;
		background: rgba(2, 10, 15, 0.85);
	}
	.sheet {
		display: grid;
		gap: 0.55rem;
		justify-items: center;
		text-align: center;
		width: min(420px, 92vw);
		padding: 1.4rem;
		border-radius: 16px;
		border: 2px solid color-mix(in srgb, var(--acc) 45%, transparent);
		background: #072029;
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
		color: #ffd066;
	}

	.err {
		max-width: 1320px;
		margin: 0.7rem auto 0;
		font-size: 0.74rem;
		color: #ff8a7a;
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
	@keyframes pcdrift {
		0% {
			transform: translate3d(0, 0, 0);
			opacity: 0.3;
		}
		50% {
			opacity: 0.8;
		}
		100% {
			transform: translate3d(-14px, 22px, 0);
			opacity: 0.3;
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
