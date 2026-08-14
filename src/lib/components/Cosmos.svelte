<script lang="ts">
	// Two real NASA frames drifting and cross-fading forever, over a painted base
	// that renders instantly and stays put if the images never arrive. Everything
	// animated here is transform or opacity only, so it runs on the compositor.
	const SHOTS = [
		'https://images-assets.nasa.gov/image/carina_nebula/carina_nebula~medium.jpg',
		'https://images-assets.nasa.gov/image/PIA15658/PIA15658~medium.jpg'
	];
</script>

<div class="cosmos" aria-hidden="true">
	<div class="base"></div>
	<div class="photo a" style="background-image:url({SHOTS[0]})"></div>
	<div class="photo b" style="background-image:url({SHOTS[1]})"></div>
	<div class="neb neb1"></div>
	<div class="neb neb2"></div>
	<div class="stars far"></div>
	<div class="stars near"></div>
	<div class="shade"></div>
	<div class="vignette"></div>
</div>

<style>
	.cosmos {
		position: fixed;
		inset: 0;
		z-index: 0;
		pointer-events: none;
		overflow: hidden;
	}
	.cosmos > * {
		position: absolute;
		inset: 0;
	}

	.base {
		background: linear-gradient(180deg, #05030e, #090616 50%, #04020b);
	}

	/* the pair breathe in and out of each other on the same clock, so the loop
	   never lands on a seam; alternate keeps the drift from snapping back */
	.photo {
		inset: -12%;
		background-size: cover;
		background-position: center;
		will-change: transform, opacity;
		mix-blend-mode: screen;
	}
	.a {
		opacity: 0.55;
		animation:
			driftA 72s ease-in-out infinite alternate,
			fadeA 60s ease-in-out infinite;
	}
	.b {
		opacity: 0;
		animation:
			driftB 88s ease-in-out infinite alternate,
			fadeB 60s ease-in-out infinite;
	}

	.neb {
		will-change: transform;
		mix-blend-mode: screen;
	}
	.neb1 {
		background: radial-gradient(38% 30% at 22% 26%, rgba(126, 74, 224, 0.3), transparent 70%);
		animation: driftA 64s ease-in-out infinite alternate;
	}
	.neb2 {
		background: radial-gradient(36% 30% at 78% 78%, rgba(206, 72, 168, 0.22), transparent 72%);
		animation: driftB 96s ease-in-out infinite alternate;
	}

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

	/* the photos are gorgeous and completely unreadable behind text, so they get
	   pushed back down before the content sits on top */
	.shade {
		background: linear-gradient(
			180deg,
			rgba(4, 2, 12, 0.62),
			rgba(4, 2, 12, 0.76) 45%,
			rgba(3, 1, 9, 0.88)
		);
	}
	.vignette {
		background: radial-gradient(circle at 50% 38%, transparent 38%, rgba(2, 1, 6, 0.8) 100%);
	}

	@keyframes driftA {
		from {
			transform: scale(1.06) translate3d(-1.5%, 1%, 0);
		}
		to {
			transform: scale(1.2) translate3d(2%, -2%, 0);
		}
	}
	@keyframes driftB {
		from {
			transform: scale(1.18) translate3d(2%, -1.5%, 0);
		}
		to {
			transform: scale(1.05) translate3d(-2%, 2%, 0);
		}
	}
	@keyframes fadeA {
		0%,
		38% {
			opacity: 0.55;
		}
		50%,
		88% {
			opacity: 0;
		}
		100% {
			opacity: 0.55;
		}
	}
	@keyframes fadeB {
		0%,
		38% {
			opacity: 0;
		}
		50%,
		88% {
			opacity: 0.5;
		}
		100% {
			opacity: 0;
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
