// Keeps the Supabase project from being paused. A free project goes to sleep
// after 7 days with no API traffic and this app is quiet for longer than that.
//
// There is no wrangler config on purpose: the dashboard uploader rejects any
// folder containing one. The schedule is therefore set in the dashboard under
// Settings -> Triggers -> Cron Triggers, not here.
//
// It cannot revive an already paused project. Only the dashboard does that.
// This just stops it going down in the first place.

const SUPABASE_URL = 'https://kjzcdlsopiqkrzgfvdlv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_mL9wqIvCJ1fpxibt-ZmncQ_GNp9_nYx';
const TABLE = 'binders';

async function ping() {
	const started = Date.now();
	try {
		const r = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?select=id&limit=1`, {
			headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
		});
		return { ok: r.ok, status: r.status, ms: Date.now() - started, at: new Date().toISOString() };
	} catch (e) {
		return { ok: false, status: 0, ms: Date.now() - started, error: String(e) };
	}
}

export default {
	async scheduled(event, env, ctx) {
		ctx.waitUntil(
			ping().then((r) => console.log(`keepalive ${r.ok ? 'ok' : 'FAILED'} status=${r.status} ${r.ms}ms`))
		);
	},

	// open the worker URL to run the same check by hand
	async fetch() {
		const r = await ping();
		return new Response(JSON.stringify(r, null, 2), {
			status: r.ok ? 200 : 503,
			headers: { 'content-type': 'application/json' }
		});
	}
};
