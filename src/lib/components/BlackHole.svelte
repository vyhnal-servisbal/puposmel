<script lang="ts">
	// Everything scales off --s, so the topbar button and the page header are the
	// same drawing at two sizes. Animation is transform-only on purpose: no blur
	// and no backdrop-filter, which is what made the old Snorlax effect lag.
	let { size = 30 }: { size?: number } = $props();
</script>

<span class="bh" style="--s:{size}px" aria-hidden="true">
	<span class="halo"></span>
	<span class="ring"><span class="spin"></span></span>
	<span class="core"></span>
	<span class="disk front"><span class="spin"></span></span>
</span>

<style>
	.bh {
		position: relative;
		display: inline-block;
		flex: none;
		width: var(--s);
		height: var(--s);
		vertical-align: middle;
	}
	.bh > * {
		position: absolute;
		inset: 0;
		border-radius: 50%;
	}

	.halo {
		background: radial-gradient(
			circle closest-side,
			rgba(255, 200, 130, 0.5),
			rgba(255, 130, 30, 0.18) 55%,
			transparent 78%
		);
		transform: scale(1.75);
	}

	/* light from behind the hole, bent up and over the event horizon */
	.ring .spin {
		position: absolute;
		inset: 0;
		border-radius: 50%;
		background: conic-gradient(
			from 90deg,
			#ffb347,
			#fff6e0,
			#ff8a1f,
			#ffd9a0,
			#ff7a00,
			#ffb347
		);
		-webkit-mask: radial-gradient(
			circle closest-side,
			transparent 58%,
			#000 62%,
			#000 76%,
			transparent 80%
		);
		mask: radial-gradient(
			circle closest-side,
			transparent 58%,
			#000 62%,
			#000 76%,
			transparent 80%
		);
		animation: bhspin 9s linear infinite;
	}

	.core {
		inset: 27%;
		background: #04020a;
		box-shadow:
			0 0 0 1px rgba(255, 195, 130, 0.9),
			0 0 calc(var(--s) * 0.2) calc(var(--s) * 0.03) rgba(255, 150, 60, 0.5);
	}

	.disk {
		transform: scaleX(1.32) scaleY(0.3);
	}
	.disk .spin {
		position: absolute;
		inset: 0;
		border-radius: 50%;
		background: conic-gradient(
			from 0deg,
			#ff7a00,
			#fff3d6,
			#ffc46b,
			#ff6a00,
			#ffd9a0,
			#ff7a00
		);
		-webkit-mask: radial-gradient(
			circle closest-side,
			transparent 30%,
			#000 38%,
			#000 94%,
			transparent 100%
		);
		mask: radial-gradient(
			circle closest-side,
			transparent 30%,
			#000 38%,
			#000 94%,
			transparent 100%
		);
		animation: bhspin 4s linear infinite;
	}
	/* only the near edge is drawn over the core; the far edge stays behind it */
	.disk.front {
		clip-path: inset(50% 0 0 0);
	}

	.bh:hover .disk .spin {
		animation-duration: 1.6s;
	}
	.bh:hover .ring .spin {
		animation-duration: 4s;
	}
	.bh:hover .halo {
		transform: scale(2);
	}
	.halo {
		transition: transform 0.25s ease;
	}

	@keyframes bhspin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
