import { supabase, hasSupabase } from './supabase';
import { cloud } from './cloud.svelte';
import type { PackCard } from './packs';

// Everything ever pulled, one row per card per finish per profile. The counting
// happens in Postgres (record_pull) rather than here, so two tabs opening packs
// at once cannot overwrite each other's totals.

export interface LibRow {
	id: string;
	card_id: string;
	reverse: boolean;
	copies: number;
	data: { name?: string; image?: string; set?: string; series?: string; number?: string };
	price: number | null;
	price_unit: string | null;
	set_id: string | null;
	rarity: string | null;
	tier: number;
	first_at: string;
	last_at: string;
}

export interface OpenRow {
	id: string;
	set_id: string;
	set_name: string | null;
	logo: string | null;
	packs: number;
	cards: number;
	gods: number;
	best_tier: number;
	best_card: { name?: string; image?: string; rarity?: string; price?: number } | null;
	spent: number;
	first_at: string;
	last_at: string;
}

class LibraryStore {
	rows = $state<LibRow[]>([]);
	opens = $state<OpenRow[]>([]);
	// supabase.rpc resolves with { error } instead of throwing, so a broken write
	// used to vanish into a catch that never fired. Keep the last one visible.
	writeError = $state('');
	loading = $state(false);
	error = $state('');
	enabled = hasSupabase;

	private channel: ReturnType<typeof supabase.channel> | null = null;

	get totalCards(): number {
		return this.rows.reduce((n, r) => n + r.copies, 0);
	}
	get uniqueCards(): number {
		return this.rows.length;
	}
	get totalValue(): number {
		return this.rows.reduce((n, r) => n + (r.price ?? 0) * r.copies, 0);
	}
	get sets(): { id: string; name: string; count: number; series: string }[] {
		const by = new Map<string, { id: string; name: string; count: number; series: string }>();
		for (const r of this.rows) {
			const id = r.set_id ?? '';
			if (!id) continue;
			const cur = by.get(id);
			if (cur) cur.count += r.copies;
			else
				by.set(id, {
					id,
					name: r.data?.set ?? id,
					count: r.copies,
					series: r.data?.series ?? ''
				});
		}
		return [...by.values()].sort((a, b) => b.count - a.count);
	}

	get totalPacks(): number {
		return this.opens.reduce((n, o) => n + o.packs, 0);
	}
	get totalGods(): number {
		return this.opens.reduce((n, o) => n + o.gods, 0);
	}
	get bestEver(): OpenRow | null {
		let best: OpenRow | null = null;
		for (const o of this.opens) if (!best || o.best_tier > best.best_tier) best = o;
		return best?.best_card ? best : null;
	}
	// newest first, which is what the library opens on
	get recent(): LibRow[] {
		return [...this.rows].sort((a, b) => b.last_at.localeCompare(a.last_at));
	}

	async load() {
		if (!this.enabled) {
			this.error = 'Cloud is not configured.';
			return;
		}
		this.loading = true;
		this.error = '';
		try {
			const profile = cloud.profileName || 'Unknown';
			const { data, error } = await supabase
				.from('card_library')
				.select('*')
				.eq('profile_name', profile)
				.order('tier', { ascending: false })
				.order('last_at', { ascending: false });
			if (error) throw error;
			this.rows = (data ?? []) as LibRow[];

			const opens = await supabase
				.from('pack_opens')
				.select('*')
				.eq('profile_name', profile)
				.order('packs', { ascending: false });
			if (opens.error) this.writeError = 'pack stats: ' + opens.error.message;
			else this.opens = (opens.data ?? []) as OpenRow[];
		} catch (e) {
			this.error = e instanceof Error ? e.message : 'failed';
		} finally {
			this.loading = false;
		}
	}

	// live updates, so a pack opened on the phone shows up on the laptop
	watch() {
		if (!this.enabled || this.channel) return;
		const profile = cloud.profileName || 'Unknown';
		this.channel = supabase
			.channel('card_library:' + profile)
			.on(
				'postgres_changes',
				{ event: '*', schema: 'public', table: 'card_library' },
				() => this.load()
			)
			.on(
				'postgres_changes',
				{ event: '*', schema: 'public', table: 'pack_opens' },
				() => this.load()
			)
			.subscribe();
	}

	unwatch() {
		if (this.channel) {
			supabase.removeChannel(this.channel);
			this.channel = null;
		}
	}

	// One row per set: how many packs went through it and the best thing it gave up.
	async recordOpen(
		setId: string,
		setName: string,
		logo: string,
		cards: PackCard[],
		god: boolean
	) {
		if (!this.enabled || !cards.length) return;
		let best = cards[0];
		for (const c of cards) if (c.tier > best.tier) best = c;
		const value = cards.reduce((n, c) => n + (c.price ?? 0), 0);
		{
			const { error } = await supabase.rpc('record_open', {
				p_profile: cloud.profileName || 'Unknown',
				p_set_id: setId,
				p_set_name: setName,
				p_logo: logo || null,
				p_cards: cards.length,
				p_god: god,
				p_best_tier: best.tier,
				p_best_card: {
					name: best.name,
					image: best.image,
					rarity: best.asReverse ? 'Reverse holo' : best.rarity,
					price: best.price ?? null
				},
				p_value: Number(value.toFixed(2))
			});
			if (error) this.writeError = 'pack stats: ' + error.message;
		}
	}

	// Fire and forget: a failed write must never interrupt a pack being opened.
	async record(cards: PackCard[]) {
		if (!this.enabled || !cards.length) return;
		const profile = cloud.profileName || 'Unknown';
		for (const c of cards) {
			{
				const { error } = await supabase.rpc('record_pull', {
					p_profile: profile,
					p_card_id: c.id,
					p_reverse: !!c.asReverse,
					p_data: {
						name: c.name,
						image: c.image,
						set: c.set,
						series: c.series,
						number: c.number
					},
					p_price: c.price ?? null,
					p_price_unit: c.priceUnit ?? 'EUR',
					p_set_id: c.setId ?? null,
					p_rarity: c.rarity,
					p_tier: c.tier
				});
				if (error) {
					this.writeError = 'library: ' + error.message;
					break; // one bad row means the rest will fail the same way
				}
			}
		}
	}
}

export const library = new LibraryStore();
