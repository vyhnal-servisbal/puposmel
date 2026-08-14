<script lang="ts">
	// Nebula haze plus two star layers that breathe at different rates. Only
	// opacity and transform are animated, so the compositor handles all of it
	// and the CPU stays out of it entirely.
</script>

<div class="cosmos" aria-hidden="true">
	<div class="neb neb1"></div>
	<div class="neb neb2"></div>
	<div class="neb neb3"></div>
	<div class="stars far"></div>
	<div class="stars near"></div>
	<div class="vignette"></div>
</div>

<style>
	.cosmos {
		position: fixed;
		inset: 0;
		z-index: 0;
		pointer-events: none;
		overflow: hidden;
		background: linear-gradient(180deg, #05030e, #090616 50%, #04020b);
	}
	.cosmos > * {
		position: absolute;
		inset: -20%;
	}

	.neb {
		will-change: transform;
	}
	.neb1 {
		background: radial-gradient(
			38% 30% at 22% 26%,
			rgba(126, 74, 224, 0.32),
			transparent 70%
		);
		animation: drift1 64s ease-in-out infinite alternate;
	}
	.neb2 {
		background: radial-gradient(
			34% 28% at 78% 20%,
			rgba(48, 132, 214, 0.26),
			transparent 70%
		);
		animation: drift2 82s ease-in-out infinite alternate;
	}
	.neb3 {
		background: radial-gradient(
			42% 34% at 62% 84%,
			rgba(206, 72, 168, 0.2),
			transparent 72%
		);
		animation: drift3 96s ease-in-out infinite alternate;
	}

	/* two fixed star sheets, breathing out of phase so the sky never sits still */
	.stars {
		will-change: opacity;
	}
	.far {
		background-image:
			radial-gradient(1px 1px at 8% 14%, rgba(255, 255, 255, 0.7), transparent 60%),
			radial-gradient(1px 1px at 23% 62%, rgba(255, 255, 255, 0.5), transparent 60%),
			radial-gradient(1px 1px at 37% 28%, rgba(210, 225, 255, 0.6), transparent 60%),
			radial-gradient(1px 1px at 51% 78%, rgba(255, 255, 255, 0.45), transparent 60%),
			radial-gradient(1px 1px at 66% 42%, rgba(255, 245, 220, 0.55), transparent 60%),
			radial-gradient(1px 1px at 74% 12%, rgba(255, 255, 255, 0.5), transparent 60%),
			radial-gradient(1px 1px at 88% 56%, rgba(210, 225, 255, 0.55), transparent 60%),
			radial-gradient(1px 1px at 94% 84%, rgba(255, 255, 255, 0.4), transparent 60%),
			radial-gradient(1px 1px at 15% 88%, rgba(255, 255, 255, 0.45), transparent 60%),
			radial-gradient(1px 1px at 45% 6%, rgba(255, 255, 255, 0.5), transparent 60%);
		animation: breathe 7s ease-in-out infinite alternate;
	}
	.near {
		background-image:
			radial-gradient(1.8px 1.8px at 18% 34%, rgba(255, 255, 255, 0.95), transparent 62%),
			radial-gradient(1.6px 1.6px at 58% 18%, rgba(255, 240, 210, 0.9), transparent 62%),
			radial-gradient(1.7px 1.7px at 82% 70%, rgba(215, 230, 255, 0.9), transparent 62%),
			radial-gradient(1.5px 1.5px at 34% 76%, rgba(255, 255, 255, 0.85), transparent 62%),
			radial-gradient(1.6px 1.6px at 70% 90%, rgba(255, 255, 255, 0.8), transparent 62%),
			radial-gradient(1.9px 1.9px at 92% 26%, rgba(255, 235, 200, 0.9), transparent 62%);
		animation: breathe 4.6s ease-in-out infinite alternate-reverse;
	}

	.vignette {
		background: radial-gradient(circle at 50% 40%, transparent 42%, rgba(2, 1, 6, 0.72) 100%);
	}

	@keyframes drift1 {
		to {
			transform: translate3d(3%, -2%, 0) scale(1.08);
		}
	}
	@keyframes drift2 {
		to {
			transform: translate3d(-4%, 3%, 0) scale(1.1);
		}
	}
	@keyframes drift3 {
		to {
			transform: translate3d(2%, -3%, 0) scale(1.06);
		}
	}
	@keyframes breathe {
		from {
			opacity: 0.45;
		}
		to {
			opacity: 1;
		}
	}
</style>
