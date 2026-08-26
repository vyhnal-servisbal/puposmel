// Supabase pauses a free project after 7 days with no API traffic, and this app
// goes quiet for longer than that. The cron fires every other day so a couple of
// failed runs in a row still cannot reach the deadline.
//
// Note this cannot revive an already paused project. Once it is down only the
// dashboard brings it back; this only stops it going down in the first place.

async function ping(env) {
	const url = `${env.SUPABASE_URL}/rest/v1/${env.SUPABASE_TABLE}?select=id&limit=1`;
	const started = Date.now();
	try {
		const r = await fetch(url, {
			headers: { apikey: env.SUPABASE_KEY, Authorization: `Bearer ${env.SUPABASE_KEY}` }
		});
		return { ok: r.ok, status: r.status, ms: Date.now() - started };
	} catch (e) {
		return { ok: false, status: 0, ms: Date.now() - started, error: String(e) };
	}
}

export default {
	async scheduled(event, env, ctx) {
		ctx.waitUntil(
			ping(env).then((r) => {
				// shows up in `wrangler tail`, and a bad status is worth seeing
				console.log(`keepalive ${r.ok ? 'ok' : 'FAILED'} status=${r.status} ${r.ms}ms`);
			})
		);
	},

	// same check on demand, so you can confirm it works without waiting for the cron
	async fetch(request, env) {
		const r = await ping(env);
		return new Response(JSON.stringify(r, null, 2), {
			status: r.ok ? 200 : 503,
			headers: { 'content-type': 'application/json' }
		});
	}
};
