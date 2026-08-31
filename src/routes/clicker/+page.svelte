<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { fade, fly, scale } from 'svelte/transition';
	import { game, fmt, pretty, hpAt, isBossStage, PARTY, PERKS, ZONES } from '$lib/clicker/game.svelte';
	import { spriteOf, aniOf, typeColor } from '$lib/dexStore.svelte';
	import { cloud } from '$lib/cloud.svelte';

	type Tab = 'party' | 'perks' | 'dex' | 'board';

	let tab = $state<Tab>('party');
	let buyAmt = $state<1 | 10 | 100>(1);
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

	// Showdown has no animated sprite for every species, so a failed gif quietly
	// falls back to the still one rather than leaving a hole where the foe was.
	function art(name: string, id: number, shiny: boolean): string {
		return broken[name] ? spriteOf(id, shiny) : aniOf(name, shiny);
	}

	function hitFoe(e: MouseEvent) {
		const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
		game.tap(((e.clientX - r.left) / r.width) * 100, ((e.clientY - r.top) / r.height) * 100);
	}

	function buy(key: string) {
		game.buyMember(key, buyAmt);
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
</script>

<svelte:head><title>Pokemon Clicker</title></svelte:head>
<svelte:window
	onkeydown={(e) => {
		if (e.key === ' ') {
			e.preventDefault();
			game.tap(50, 45);
		}
	}}
/>

<div class="pcwrap" style="--acc:{accent}">
	<header class="pchead">
		<a class="pcbtn" href="/">← Binder</a>
		<span class="who">{cloud.profileName || 'Trainer'}</span>
		<span class="money">₽ {fmt(game.save.gold)}</span>
		<span class="dpsline">{fmt(game.dps)} <i>dps</i></span>
		<span class="tapline">{fmt(game.tapDamage)} <i>per tap</i></span>
		{#if game.save.candy}
			<span class="candy">🍬 {fmt(game.save.candy)}</span>
		{/if}
		<span class="sync" class:on={game.saving === 'saved'} class:bad={game.saving === 'error'}>
			{game.saving === 'saving' ? 'saving' : game.saving === 'error' ? 'save failed' : 'synced'}
		</span>
	</header>

	<div class="pcgrid">
		<section class="arena">
			<div class="stagebar">
				<button class="navb" onclick={() => game.goBack()} disabled={game.save.stage <= 1}>◀</button>
				<div class="stagemid">
					<strong>{zone.name}</strong>
					<span>Stage {game.save.stage} · best {game.save.highest}</span>
					{#if !isBossStage(game.save.stage)}
						<i class="killdots">
							{#each { length: 10 } as _, i}
								<b class:done={i < game.save.kills}></b>
							{/each}
						</i>
					{/if}
				</div>
				<button
					class="navb"
					onclick={() => game.goForward()}
					disabled={game.save.stage >= game.save.highest}>▶</button
				>
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
					<span class="ring"></span>
					{#key foe.mon[1] + String(foe.shiny)}
						<img
							class="foeArt"
							src={art(foe.mon[1], foe.mon[0], foe.shiny)}
							alt={pretty(foe.mon[1])}
							draggable="false"
							onerror={() => (broken[foe.mon[1]] = true)}
							in:scale={{ duration: 200, start: 0.7 }}
						/>
					{/key}

					{#each game.hits as h (h.id)}
						<span
							class="dmg"
							class:crit={h.crit}
							style="left:{h.x}%; top:{h.y}%"
							out:fade={{ duration: 300 }}
						>
							{fmt(h.amount)}{h.crit ? '!' : ''}
						</span>
					{/each}
				</div>

				<div class="foename">
					{#if foe.shiny}<em class="shinytag">✦ SHINY</em>{/if}
					<b>{pretty(foe.mon[1])}</b>
					{#if foe.boss}<em class="bosstag">BOSS</em>{/if}
					<span class="typetag" style="--t:{typeColor(foe.type)}">{foe.type}</span>
				</div>

				<div class="hpwrap">
					<div class="hpbar"><i style="width:{hpPct}%"></i></div>
					<span class="hptext">{fmt(Math.max(0, foe.hp))} / {fmt(foe.maxHp)}</span>
				</div>

				{#if foe.boss}
					<div class="bosstimer" class:low={game.bossLeft < 8}>
						<i style="width:{(game.bossLeft / 30) * 100}%"></i>
						<span>{game.bossLeft.toFixed(1)}s</span>
					</div>
				{/if}
			{/if}

			<p class="hint">Click the Pokémon, or hold Space. Next stage needs {fmt(nextStageHp)} HP.</p>
		</section>

		<aside class="panel">
			<div class="tabbar">
				<button class:on={tab === 'party'} onclick={() => (tab = 'party')}>Party</button>
				<button class:on={tab === 'perks'} onclick={() => (tab = 'perks')}>
					Rebirth {#if game.candyGain > 0}<i class="pip">{fmt(game.candyGain)}</i>{/if}
				</button>
				<button class:on={tab === 'dex'} onclick={() => (tab = 'dex')}>
					Dex <i>{game.dexCount}</i>
				</button>
				<button class:on={tab === 'board'} onclick={() => (tab = 'board')}>Board</button>
			</div>

			{#if tab === 'party'}
				<div class="amounts">
					<span>Buy</span>
					{#each [1, 10, 100] as n}
						<button class:on={buyAmt === n} onclick={() => (buyAmt = n as 1 | 10 | 100)}>×{n}</button>
					{/each}
				</div>

				<button class="rowbtn tapup" onclick={() => game.buyTap()} disabled={game.save.gold < game.tapCost}>
					<span class="ricon">👆</span>
					<span class="rmid">
						<b>Tap power</b>
						<i>level {game.save.tapLevel} · {fmt(game.tapDamage)} per tap</i>
					</span>
					<span class="rcost">₽ {fmt(game.tapCost)}</span>
				</button>

				{#each PARTY as m, i (m.key)}
					{@const lvl = game.memberLevel(m.key)}
					{@const cost = game.memberCost(m.key, buyAmt)}
					{@const locked = !lvl && i > 0 && !game.memberLevel(PARTY[i - 1].key)}
					{#if !locked}
						<button
							class="rowbtn"
							class:owned={lvl > 0}
							style="--t:{typeColor(m.type)}"
							onclick={() => buy(m.key)}
							disabled={game.save.gold < cost}
						>
							<span class="ricon">
								<img src={spriteOf(m.mon[0])} alt="" loading="lazy" />
							</span>
							<span class="rmid">
								<b>{pretty(m.mon[1])} {#if lvl}<u>lv {lvl}</u>{/if}</b>
								<i>
									{#if lvl}
										{fmt(game.memberDps(m.key))} dps
										{#if game.memberMult(lvl) > 1}· ×{game.memberMult(lvl)}{/if}
									{:else}
										recruit · {m.type}
									{/if}
								</i>
							</span>
							<span class="rcost">₽ {fmt(cost)}</span>
						</button>
					{/if}
				{/each}
			{:else if tab === 'perks'}
				<div class="rebirth">
					<p class="rbline">
						Reset the run and keep candy, perks and the Dex. You would get
						<b>🍬 {fmt(game.candyGain)}</b> candy.
					</p>
					<p class="rbsmall">
						Holding candy is itself worth <b>+{Math.round((game.candyBonus - 1) * 100)}%</b> damage,
						so spending every last one is not always right. Rebirths so far: {game.save.rebirths}.
						{#if game.startGold > 0}You would restart with ₽ {fmt(game.startGold)}.{/if}
					</p>
					{#if confirming}
						<div class="confirm">
							<button class="pcbtn go" onclick={() => { game.rebirth(); confirming = false; tab = 'party'; }}>
								Yes, rebirth
							</button>
							<button class="pcbtn" onclick={() => (confirming = false)}>Cancel</button>
						</div>
					{:else}
						<button
							class="pcbtn go wide"
							onclick={() => (confirming = true)}
							disabled={game.candyGain <= 0}
						>
							{game.candyGain > 0 ? `Rebirth for ${fmt(game.candyGain)} candy` : 'Get further first'}
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
						<span class="ricon big">{p.icon}</span>
						<span class="rmid">
							<b>{p.name} {#if lvl}<u>lv {lvl}</u>{/if}</b>
							<i>{p.desc}</i>
						</span>
						<span class="rcost candycost">
							{lvl >= p.max ? 'MAX' : `🍬 ${fmt(cost)}`}
						</span>
					</button>
				{/each}
			{:else if tab === 'dex'}
				<p class="dexline">
					{game.dexCount} / {dexAll.length} seen · {game.shinyCount} shiny · {fmt(game.save.clicks)} taps
				</p>
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
				<p class="dexline">Highest stage wins. Refreshes every half minute.</p>
				<div class="boardlist">
					{#each game.board as b, i (b.profile_name)}
						<div class="brow" class:me={b.profile_name === cloud.profileName}>
							<span class="bpos">{i + 1}</span>
							<span class="bname">{b.profile_name}</span>
							<span class="bstage">stage {b.highest}</span>
							<span class="bmeta">{b.rebirths} rebirths · 🍬 {fmt(b.candy)}</span>
						</div>
					{/each}
					{#if !game.board.length}
						<p class="hint">Nothing here yet.</p>
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
					You were away {label(game.offlineSeconds)} and they farmed
					<b>₽ {fmt(game.offlineGold)}</b>.
				</p>
				<p class="rbsmall">Offline rate is {Math.round(game.idleRate * 100)}%, capped at 12 hours.</p>
				<button class="pcbtn go" onclick={() => game.dismissOffline()}>Nice</button>
			</div>
		</div>
	{/if}

	{#if game.error}
		<p class="err">{game.error}</p>
	{/if}
</div>

<style>
	.pcwrap {
		min-height: 100dvh;
		padding: 0.8rem clamp(0.6rem, 2vw, 1.6rem) 2rem;
		color: #e4dff5;
		background:
			radial-gradient(70% 45% at 50% -8%, color-mix(in srgb, var(--acc) 22%, transparent), transparent 70%),
			radial-gradient(50% 40% at 8% 100%, rgba(120, 80, 220, 0.16), transparent 70%),
			linear-gradient(180deg, #0a0714, #0d0a1c 50%, #070511);
	}

	.pchead {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		max-width: 1280px;
		margin: 0 auto 0.9rem;
	}
	.pcbtn {
		padding: 0.4rem 0.8rem;
		border-radius: 10px;
		border: 1px solid rgba(255, 255, 255, 0.12);
		background: rgba(255, 255, 255, 0.05);
		color: #cfc9ea;
		text-decoration: none;
		font-size: 0.84rem;
		cursor: pointer;
	}
	.pcbtn:hover:not(:disabled) {
		border-color: var(--acc);
	}
	.pcbtn:disabled {
		opacity: 0.45;
		cursor: default;
	}
	.pcbtn.go {
		border-color: rgba(255, 190, 110, 0.7);
		background: linear-gradient(180deg, rgba(255, 175, 85, 0.28), rgba(255, 120, 40, 0.12));
		color: #fff;
		font-weight: 600;
	}
	.pcbtn.wide {
		width: 100%;
	}
	.who {
		font-size: 0.8rem;
		color: #8f88b4;
	}
	.money,
	.dpsline,
	.tapline,
	.candy {
		padding: 0.32rem 0.7rem;
		border-radius: 999px;
		border: 1px solid rgba(255, 255, 255, 0.09);
		background: rgba(255, 255, 255, 0.04);
		font-size: 0.86rem;
		font-variant-numeric: tabular-nums;
	}
	.money {
		color: #ffd08a;
		border-color: rgba(255, 208, 138, 0.3);
	}
	.candy {
		color: #ff9ecb;
		border-color: rgba(255, 158, 203, 0.35);
	}
	.dpsline i,
	.tapline i {
		font-style: normal;
		font-size: 0.7rem;
		color: #8f88b4;
	}
	.sync {
		margin-left: auto;
		font-size: 0.7rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: #5f5a80;
	}
	.sync.on {
		color: #86d7a2;
	}
	.sync.bad {
		color: #ff9a8a;
	}

	.pcgrid {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(300px, 380px);
		gap: 1rem;
		max-width: 1280px;
		margin: 0 auto;
		align-items: start;
	}
	@media (max-width: 900px) {
		.pcgrid {
			grid-template-columns: minmax(0, 1fr);
		}
	}

	.arena {
		display: grid;
		justify-items: center;
		gap: 0.7rem;
		padding: 1rem 1rem 1.3rem;
		border-radius: 20px;
		border: 1px solid color-mix(in srgb, var(--acc) 26%, rgba(255, 255, 255, 0.08));
		background:
			radial-gradient(85% 60% at 50% 8%, color-mix(in srgb, var(--acc) 16%, transparent), transparent 72%),
			rgba(255, 255, 255, 0.025);
	}
	.stagebar {
		display: flex;
		align-items: center;
		gap: 0.9rem;
	}
	.navb {
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
		border: 1px solid rgba(255, 255, 255, 0.12);
		background: rgba(255, 255, 255, 0.05);
		color: #cfc9ea;
		cursor: pointer;
	}
	.navb:disabled {
		opacity: 0.25;
		cursor: default;
	}
	.stagemid {
		display: grid;
		justify-items: center;
		gap: 0.15rem;
		min-width: 220px;
	}
	.stagemid strong {
		font-size: 1.15rem;
		color: var(--acc);
	}
	.stagemid span {
		font-size: 0.74rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: #8f88b4;
	}
	.killdots {
		display: flex;
		gap: 3px;
		margin-top: 0.2rem;
	}
	.killdots b {
		width: 12px;
		height: 4px;
		border-radius: 99px;
		background: rgba(255, 255, 255, 0.14);
	}
	.killdots b.done {
		background: var(--acc);
	}

	/* the foe itself: a big hit area, a pulse ring behind it, nothing on top of
	   the sprite that could swallow a click */
	.foeBtn {
		position: relative;
		width: min(340px, 74vw);
		aspect-ratio: 1;
		display: grid;
		place-items: center;
		cursor: pointer;
		user-select: none;
		-webkit-user-select: none;
	}
	.foeBtn:active .foeArt {
		transform: scale(0.94);
	}
	.foeArt {
		width: 78%;
		height: 78%;
		object-fit: contain;
		image-rendering: pixelated;
		filter: drop-shadow(0 12px 22px rgba(0, 0, 0, 0.6));
		transition: transform 0.08s ease;
		pointer-events: none;
	}
	.ring {
		position: absolute;
		inset: 12%;
		border-radius: 50%;
		background: radial-gradient(circle, color-mix(in srgb, var(--acc) 30%, transparent), transparent 66%);
		animation: pcpulse 2.6s ease-in-out infinite;
		pointer-events: none;
	}
	.foeBtn.boss .ring {
		background: radial-gradient(circle, rgba(255, 90, 90, 0.4), transparent 66%);
		animation-duration: 1.1s;
	}
	.foeBtn.shiny .ring {
		background: radial-gradient(circle, rgba(255, 224, 102, 0.45), transparent 66%);
	}
	.foeBtn.shiny .foeArt {
		filter: drop-shadow(0 0 18px rgba(255, 224, 102, 0.75)) drop-shadow(0 12px 22px rgba(0, 0, 0, 0.6));
	}

	.dmg {
		position: absolute;
		transform: translate(-50%, -50%);
		font-weight: 800;
		font-size: 1.1rem;
		color: #fff;
		text-shadow: 0 2px 8px rgba(0, 0, 0, 0.9);
		pointer-events: none;
		animation: pcfloat 0.7s ease-out forwards;
	}
	.dmg.crit {
		font-size: 1.65rem;
		color: #ffd166;
	}

	.foename {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		font-size: 1.05rem;
	}
	.typetag {
		padding: 0.1rem 0.5rem;
		border-radius: 999px;
		font-size: 0.66rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		background: color-mix(in srgb, var(--t) 25%, transparent);
		color: var(--t);
	}
	.bosstag {
		font-style: normal;
		padding: 0.1rem 0.5rem;
		border-radius: 999px;
		font-size: 0.66rem;
		letter-spacing: 0.12em;
		background: rgba(255, 90, 90, 0.2);
		color: #ff9a8a;
	}
	.shinytag {
		font-style: normal;
		padding: 0.1rem 0.5rem;
		border-radius: 999px;
		font-size: 0.66rem;
		letter-spacing: 0.12em;
		background: rgba(255, 224, 102, 0.18);
		color: #ffe066;
	}

	.hpwrap {
		width: min(420px, 88%);
		display: grid;
		gap: 0.25rem;
		justify-items: center;
	}
	.hpbar {
		width: 100%;
		height: 14px;
		border-radius: 999px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		background: rgba(0, 0, 0, 0.4);
		overflow: hidden;
	}
	.hpbar i {
		display: block;
		height: 100%;
		background: linear-gradient(90deg, #ff5a5a, #ffb454);
		transition: width 0.1s linear;
	}
	.hptext {
		font-size: 0.76rem;
		color: #8f88b4;
		font-variant-numeric: tabular-nums;
	}

	.bosstimer {
		position: relative;
		width: min(420px, 88%);
		height: 18px;
		border-radius: 999px;
		background: rgba(0, 0, 0, 0.45);
		overflow: hidden;
	}
	.bosstimer i {
		display: block;
		height: 100%;
		background: linear-gradient(90deg, #6f5ad8, #9b8cff);
		transition: width 0.1s linear;
	}
	.bosstimer.low i {
		background: linear-gradient(90deg, #d84a4a, #ff8a5a);
	}
	.bosstimer span {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		font-size: 0.7rem;
		font-variant-numeric: tabular-nums;
		text-shadow: 0 1px 4px rgba(0, 0, 0, 0.9);
	}

	.hint {
		margin: 0;
		font-size: 0.76rem;
		color: #7d769f;
		text-align: center;
	}

	.panel {
		display: grid;
		gap: 0.4rem;
		align-content: start;
		max-height: calc(100dvh - 5.5rem);
		overflow-y: auto;
		padding-right: 0.2rem;
	}
	.tabbar {
		display: flex;
		gap: 3px;
		padding: 3px;
		border-radius: 999px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		background: rgba(255, 255, 255, 0.04);
		position: sticky;
		top: 0;
		z-index: 2;
		backdrop-filter: none;
	}
	.tabbar button {
		flex: 1;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.3rem;
		padding: 0.4rem 0.3rem;
		border: 0;
		border-radius: 999px;
		background: transparent;
		color: #9a93bd;
		font-size: 0.8rem;
		cursor: pointer;
	}
	.tabbar button.on {
		background: color-mix(in srgb, var(--acc) 28%, transparent);
		color: #fff;
	}
	.tabbar i,
	.pip {
		font-style: normal;
		font-size: 0.68rem;
		padding: 0.02rem 0.35rem;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.1);
	}
	.pip {
		background: rgba(255, 158, 203, 0.28);
		color: #ffd0e6;
	}

	.amounts {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		font-size: 0.74rem;
		color: #8f88b4;
	}
	.amounts button {
		padding: 0.2rem 0.55rem;
		border-radius: 8px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		background: rgba(255, 255, 255, 0.04);
		color: #cfc9ea;
		font-size: 0.74rem;
		cursor: pointer;
	}
	.amounts button.on {
		border-color: var(--acc);
		color: #fff;
	}

	.rowbtn {
		display: grid;
		grid-template-columns: 44px minmax(0, 1fr) auto;
		align-items: center;
		gap: 0.6rem;
		padding: 0.45rem 0.7rem 0.45rem 0.45rem;
		border-radius: 13px;
		border: 1px solid rgba(255, 255, 255, 0.09);
		background: rgba(255, 255, 255, 0.03);
		color: inherit;
		text-align: left;
		cursor: pointer;
		transition:
			border-color 0.15s,
			background 0.15s;
	}
	.rowbtn:hover:not(:disabled) {
		border-color: var(--t, var(--acc));
		background: rgba(255, 255, 255, 0.06);
	}
	.rowbtn:disabled {
		opacity: 0.42;
		cursor: default;
	}
	.rowbtn.owned {
		border-color: color-mix(in srgb, var(--t) 40%, transparent);
	}
	.ricon {
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
	}
	.ricon img {
		width: 100%;
		image-rendering: pixelated;
	}
	.ricon.big {
		font-size: 1.4rem;
	}
	.rmid {
		display: grid;
		gap: 0.1rem;
		min-width: 0;
	}
	.rmid b {
		font-size: 0.86rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.rmid u {
		text-decoration: none;
		color: var(--t, var(--acc));
		font-size: 0.76rem;
	}
	.rmid i {
		font-style: normal;
		font-size: 0.72rem;
		color: #8f88b4;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.rcost {
		font-size: 0.78rem;
		color: #ffd08a;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}
	.candycost {
		color: #ff9ecb;
	}
	.tapup {
		border-color: rgba(255, 208, 138, 0.3);
	}

	.rebirth {
		display: grid;
		gap: 0.5rem;
		padding: 0.8rem;
		border-radius: 14px;
		border: 1px solid rgba(255, 158, 203, 0.3);
		background: rgba(255, 158, 203, 0.07);
	}
	.rbline {
		margin: 0;
		font-size: 0.86rem;
	}
	.rbline b {
		color: #ff9ecb;
	}
	.rbsmall {
		margin: 0;
		font-size: 0.74rem;
		color: #8f88b4;
	}
	.confirm {
		display: flex;
		gap: 0.4rem;
	}

	.dexline {
		margin: 0.2rem 0;
		font-size: 0.76rem;
		color: #8f88b4;
	}
	.dexgrid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(52px, 1fr));
		gap: 4px;
	}
	.dexcell {
		position: relative;
		aspect-ratio: 1;
		display: grid;
		place-items: center;
		border-radius: 10px;
		border: 1px solid rgba(255, 255, 255, 0.06);
		background: rgba(255, 255, 255, 0.02);
	}
	.dexcell img {
		width: 90%;
		image-rendering: pixelated;
		filter: brightness(0) opacity(0.32);
		transition: filter 0.2s;
	}
	.dexcell.got img {
		filter: none;
	}
	.dexcell.bossmon {
		border-color: rgba(255, 90, 90, 0.28);
	}
	.dexn {
		position: absolute;
		right: 2px;
		bottom: 1px;
		font-size: 0.6rem;
		color: #cfc9ea;
		text-shadow: 0 1px 3px #000;
	}
	.dexs {
		position: absolute;
		left: 3px;
		top: 1px;
		font-size: 0.62rem;
		color: #ffe066;
	}

	.boardlist {
		display: grid;
		gap: 0.35rem;
	}
	.brow {
		display: grid;
		grid-template-columns: 1.6rem minmax(0, 1fr) auto;
		align-items: center;
		gap: 0.5rem;
		padding: 0.45rem 0.7rem;
		border-radius: 12px;
		border: 1px solid rgba(255, 255, 255, 0.08);
		background: rgba(255, 255, 255, 0.03);
	}
	.brow.me {
		border-color: var(--acc);
		background: color-mix(in srgb, var(--acc) 12%, transparent);
	}
	.bpos {
		font-weight: 700;
		color: #8f88b4;
	}
	.bname {
		font-size: 0.88rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.bstage {
		font-size: 0.82rem;
		color: #ffd08a;
		white-space: nowrap;
	}
	.bmeta {
		grid-column: 2 / -1;
		font-size: 0.7rem;
		color: #8f88b4;
	}

	.modal {
		position: fixed;
		inset: 0;
		z-index: 40;
		display: grid;
		place-items: center;
		padding: 1rem;
		background: rgba(4, 2, 10, 0.82);
	}
	.sheet {
		display: grid;
		gap: 0.6rem;
		justify-items: center;
		text-align: center;
		width: min(420px, 92vw);
		padding: 1.4rem;
		border-radius: 18px;
		border: 1px solid color-mix(in srgb, var(--acc) 40%, transparent);
		background: #100c22;
	}
	.sheet h2 {
		margin: 0;
		font-size: 1.15rem;
	}
	.sheet p {
		margin: 0;
		font-size: 0.88rem;
	}
	.sheet b {
		color: #ffd08a;
	}

	.err {
		max-width: 1280px;
		margin: 0.8rem auto 0;
		font-size: 0.76rem;
		color: #ff9a8a;
	}

	@keyframes pcpulse {
		0%,
		100% {
			opacity: 0.5;
			transform: scale(1);
		}
		50% {
			opacity: 0.85;
			transform: scale(1.06);
		}
	}
	@keyframes pcfloat {
		0% {
			opacity: 1;
			transform: translate(-50%, -50%) scale(0.8);
		}
		100% {
			opacity: 0;
			transform: translate(-50%, -190%) scale(1.15);
		}
	}
</style>
