<script lang="ts">
	// Same construction as BlackHole so the two buttons read as a pair: one size
	// variable, transform-only animation, no filters.
	let { size = 30 }: { size?: number } = $props();
</script>

<span class="mw" style="--s:{size}px" aria-hidden="true">
	<span class="halo"></span>
	<span class="disc">
		<span class="arms"></span>
		<span class="dust"></span>
	</span>
	<span class="core"></span>
</span>

<style>
	.mw {
		position: relative;
		display: inline-block;
		flex: none;
		width: var(--s);
		height: var(--s);
		vertical-align: middle;
	}
	.mw > * {
		position: absolute;
		inset: 0;
		border-radius: 50%;
	}

	.halo {
		background: radial-gradient(
			circle closest-side,
			rgba(180, 170, 255, 0.42),
			rgba(110, 90, 220, 0.16) 55%,
			transparent 78%
		);
		transform: scale(1.6);
		transition: transform 0.25s ease;
	}

	/* the whole galaxy sits tilted, the arms spin inside that tilt */
	.disc {
		transform: rotate(-18deg) scaleY(0.62);
	}
	.disc > * {
		position: absolute;
		inset: 0;
		border-radius: 50%;
	}

	.arms {
		background: conic-gradient(
			from 0deg,
			rgba(190, 205, 255, 0.95),
			rgba(120, 110, 230, 0.15) 22%,
			rgba(255, 235, 210, 0.75) 48%,
			rgba(110, 100, 220, 0.12) 72%,
			rgba(190, 205, 255, 0.95)
		);
		-webkit-mask: radial-gradient(
			circle closest-side,
			#000 8%,
			rgba(0, 0, 0, 0.85) 34%,
			rgba(0, 0, 0, 0.35) 68%,
			transparent 92%
		);
		mask: radial-gradient(
			circle closest-side,
			#000 8%,
			rgba(0, 0, 0, 0.85) 34%,
			rgba(0, 0, 0, 0.35) 68%,
			transparent 92%
		);
		animation: mwspin 18s linear infinite;
	}

	.dust {
		background: conic-gradient(
			from 140deg,
			transparent,
			rgba(30, 14, 60, 0.75) 12%,
			transparent 26%,
			transparent 62%,
			rgba(30, 14, 60, 0.7) 74%,
			transparent 88%
		);
		-webkit-mask: radial-gradient(circle closest-side, transparent 14%, #000 30%, transparent 88%);
		mask: radial-gradient(circle closest-side, transparent 14%, #000 30%, transparent 88%);
		animation: mwspin 18s linear infinite;
	}

	.core {
		inset: 38%;
		background: radial-gradient(circle, #fff8e8, #ffd9a0 45%, rgba(255, 190, 120, 0) 72%);
		box-shadow: 0 0 calc(var(--s) * 0.16) rgba(255, 220, 170, 0.7);
	}

	.mw:hover .arms,
	.mw:hover .dust {
		animation-duration: 7s;
	}
	.mw:hover .halo {
		transform: scale(1.85);
	}

	@keyframes mwspin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
