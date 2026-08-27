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

class LibraryStore {
	rows = $state<LibRow[]>([]);
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
	get sets(): string[] {
		return [...new Set(this.rows.map((r) => r.data?.set ?? r.set_id ?? ''))].filter(Boolean).sort();
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
			.subscribe();
	}

	unwatch() {
		if (this.channel) {
			supabase.removeChannel(this.channel);
			this.channel = null;
		}
	}

	// Fire and forget: a failed write must never interrupt a pack being opened.
	async record(cards: PackCard[]) {
		if (!this.enabled || !cards.length) return;
		const profile = cloud.profileName || 'Unknown';
		for (const c of cards) {
			try {
				await supabase.rpc('record_pull', {
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
			} catch {
				/* the pack matters more than the bookkeeping */
			}
		}
	}
}

export const library = new LibraryStore();
