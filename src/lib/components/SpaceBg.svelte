<script lang="ts">
	import { onMount } from 'svelte';

	// Rendered at a fraction of the real resolution and capped well under 60fps.
	// A fullscreen quad of maths is cheap; what killed the old Snorlax effect was
	// backdrop-filter over a large area, which is a completely different cost.
	const SCALE = 0.55;
	const FPS = 30;

	let canvas: HTMLCanvasElement;
	let failed = $state(false);

	const VERT = `
attribute vec2 a;
void main(){ gl_Position = vec4(a, 0.0, 1.0); }`;

	const FRAG = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }

vec3 starField(vec2 uv, float t){
	vec3 c = vec3(0.0);
	for(int i = 0; i < 3; i++){
		float layer = 1.0 + float(i) * 1.8;
		vec2 g = uv * layer * 150.0;
		vec2 id = floor(g);
		vec2 f = fract(g) - 0.5;
		float h = hash(id + float(i) * 41.7);
		if(h > 0.982){
			float d = length(f);
			float b = smoothstep(0.45, 0.0, d) * ((h - 0.982) / 0.018);
			float tw = 0.75 + 0.25 * sin(t * 0.9 + h * 60.0);
			c += vec3(b * tw) * vec3(0.85, 0.88, 1.0);
		}
	}
	return c;
}

void main(){
	vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
	float t = u_time;
	float r = max(length(p), 0.0008);
	vec2 dir = p / r;

	float rs = 0.075;

	// light from behind is pushed outward around the hole, which is what makes
	// the star field smear into a ring instead of just sitting there
	float bend = (rs * 1.6) / r;
	vec2 lensed = p + dir * bend * 0.42;

	vec3 col = starField(lensed, t);
	col += vec3(0.05, 0.03, 0.11) * smoothstep(1.2, 0.0, r);

	// accretion disk, squashed to near edge-on and spun
	vec2 dp = vec2(p.x, p.y / 0.26);
	float dr = length(dp);
	float ang = atan(dp.y, dp.x);
	float band = smoothstep(0.60, 0.42, dr) * smoothstep(0.11, 0.17, dr);
	float swirl = 0.55 + 0.45 * sin(ang * 3.0 - t * 1.7 + dr * 18.0);
	float grain = 0.75 + 0.25 * sin(ang * 11.0 - t * 2.6 + dr * 40.0);
	// the side rotating toward us is brighter, the far side dimmer
	float doppler = 0.45 + 0.55 * (0.5 + 0.5 * cos(ang));
	float disk = band * swirl * grain * doppler;

	vec3 hot = mix(vec3(1.0, 0.42, 0.05), vec3(1.0, 0.95, 0.82), smoothstep(0.2, 0.85, disk));
	col += hot * disk * 1.35;

	// thin ring of light orbiting just outside the horizon
	float photon = smoothstep(0.016, 0.0, abs(r - rs * 1.32));
	col += vec3(1.0, 0.82, 0.55) * photon * 0.9;

	// nothing escapes from inside
	col *= smoothstep(rs * 0.97, rs * 1.06, r);

	col = pow(col, vec3(0.92));
	gl_FragColor = vec4(col, 1.0);
}`;

	function compile(gl: WebGLRenderingContext, type: number, src: string) {
		const sh = gl.createShader(type)!;
		gl.shaderSource(sh, src);
		gl.compileShader(sh);
		if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS))
			throw new Error(gl.getShaderInfoLog(sh) ?? 'shader failed');
		return sh;
	}

	onMount(() => {
		let gl: WebGLRenderingContext | null = null;
		try {
			gl = canvas.getContext('webgl', {
				antialias: false,
				depth: false,
				powerPreference: 'low-power'
			}) as WebGLRenderingContext | null;
			if (!gl) throw new Error('no webgl');

			const prog = gl.createProgram()!;
			gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
			gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
			gl.linkProgram(prog);
			if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
				throw new Error(gl.getProgramInfoLog(prog) ?? 'link failed');
			gl.useProgram(prog);

			const buf = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, buf);
			gl.bufferData(
				gl.ARRAY_BUFFER,
				new Float32Array([-1, -1, 3, -1, -1, 3]),
				gl.STATIC_DRAW
			);
			const loc = gl.getAttribLocation(prog, 'a');
			gl.enableVertexAttribArray(loc);
			gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

			const uRes = gl.getUniformLocation(prog, 'u_res');
			const uTime = gl.getUniformLocation(prog, 'u_time');

			const resize = () => {
				const w = Math.max(1, Math.floor(window.innerWidth * SCALE));
				const h = Math.max(1, Math.floor(window.innerHeight * SCALE));
				if (canvas.width === w && canvas.height === h) return;
				canvas.width = w;
				canvas.height = h;
				gl!.viewport(0, 0, w, h);
			};
			resize();
			window.addEventListener('resize', resize);

			let raf = 0;
			let last = 0;
			const start = performance.now();
			const frame = (now: number) => {
				raf = requestAnimationFrame(frame);
				if (document.hidden) return;
				if (now - last < 1000 / FPS) return;
				last = now;
				gl!.uniform2f(uRes, canvas.width, canvas.height);
				gl!.uniform1f(uTime, (now - start) / 1000);
				gl!.drawArrays(gl!.TRIANGLES, 0, 3);
			};
			raf = requestAnimationFrame(frame);

			return () => {
				cancelAnimationFrame(raf);
				window.removeEventListener('resize', resize);
				gl?.getExtension('WEBGL_lose_context')?.loseContext();
			};
		} catch {
			failed = true;
		}
	});
</script>

<canvas bind:this={canvas} class:hide={failed} aria-hidden="true"></canvas>
{#if failed}
	<div class="fallback" aria-hidden="true"></div>
{/if}

<style>
	canvas,
	.fallback {
		position: fixed;
		inset: 0;
		width: 100%;
		height: 100%;
		z-index: 0;
		display: block;
		pointer-events: none;
	}
	.hide {
		display: none;
	}
	/* no WebGL: a plain star field so the page still has a sky behind it */
	.fallback {
		background:
			radial-gradient(1px 1px at 12% 22%, rgba(255, 255, 255, 0.75), transparent 60%),
			radial-gradient(1px 1px at 68% 12%, rgba(255, 255, 255, 0.6), transparent 60%),
			radial-gradient(1.4px 1.4px at 82% 64%, rgba(255, 255, 255, 0.65), transparent 60%),
			radial-gradient(1px 1px at 34% 78%, rgba(255, 255, 255, 0.5), transparent 60%),
			radial-gradient(circle at 78% 8%, rgba(120, 80, 220, 0.22), transparent 45%),
			linear-gradient(180deg, #06040f, #0a0716 55%, #05030c);
	}
</style>
