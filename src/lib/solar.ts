// Numbers and facts are hardcoded on purpose: the open solar-system API now
// answers 401, and none of this changes anyway. Positions are the only live
// part and those come from astronomy-engine.

export type Planet = {
	key: string;
	name: string;
	glyph: string;
	color: string;
	ring?: boolean;
	orbitAu: number;
	radiusKm: number;
	moons: number;
	dayLength: string;
	yearLength: string;
	tagline: string;
	facts: string[];
};

export const PLANETS: Planet[] = [
	{
		key: 'Mercury',
		name: 'Mercury',
		glyph: '☿',
		color: '#a8a29b',
		orbitAu: 0.387,
		radiusKm: 2440,
		moons: 0,
		dayLength: '176 Earth days',
		yearLength: '88 Earth days',
		tagline: 'A day here outlasts the year.',
		facts: [
			'One day on Mercury lasts twice as long as its entire year. Sunrise to sunrise takes 176 Earth days; a full orbit takes 88.',
			'The surface swings from 430 °C in daylight to −180 °C at night, the widest temperature range of any planet.',
			'Despite sitting closest to the Sun, it holds water ice in crater floors near the poles that sunlight has never touched.',
			'It is shrinking. The iron core cooled and the whole crust wrinkled inward, leaving cliffs kilometres high.'
		]
	},
	{
		key: 'Venus',
		name: 'Venus',
		glyph: '♀',
		color: '#e8c48a',
		orbitAu: 0.723,
		radiusKm: 6052,
		moons: 0,
		dayLength: '243 Earth days',
		yearLength: '225 Earth days',
		tagline: 'Hotter than Mercury, and spinning backwards.',
		facts: [
			'At 465 °C the surface is hotter than Mercury, even though Venus is nearly twice as far from the Sun. The atmosphere traps everything.',
			'It rotates backwards, and one rotation takes longer than one orbit. The Sun rises in the west, roughly twice per Venusian year.',
			'Surface pressure matches being 900 metres underwater on Earth. Early landers were crushed within an hour.',
			'It rains sulfuric acid, but the drops evaporate several kilometres up and never reach the ground.'
		]
	},
	{
		key: 'Earth',
		name: 'Earth',
		glyph: '⊕',
		color: '#5aa9e6',
		orbitAu: 1,
		radiusKm: 6371,
		moons: 1,
		dayLength: '24 hours',
		yearLength: '365.25 days',
		tagline: 'The only one with a confirmed pizza supply.',
		facts: [
			'The magnetic field reverses every few hundred thousand years on average. The last flip was 780,000 years ago, so we are overdue.',
			'The Moon is drifting away at 3.8 cm per year. Total solar eclipses will eventually stop happening.',
			'It is the only body in the solar system where liquid water covers most of the surface, at 71 percent.',
			'The deepest point in the ocean is further down than Everest is up, and we have mapped more of Mars than the sea floor.'
		]
	},
	{
		key: 'Mars',
		name: 'Mars',
		glyph: '♂',
		color: '#e2683f',
		orbitAu: 1.524,
		radiusKm: 3390,
		moons: 2,
		dayLength: '24h 37m',
		yearLength: '687 Earth days',
		tagline: 'Blue sunsets and a volcano you cannot see.',
		facts: [
			'Olympus Mons is 22 km tall, almost three times Everest. It is so wide that standing on it you would not notice you were on a mountain.',
			'Sunsets are blue. Fine dust scatters red light away, which is the exact opposite of what happens here.',
			'It had oceans. Much of that water is still there, frozen underground and locked into the polar caps.',
			'Its two moons are almost certainly captured asteroids, and Phobos is spiralling in. In 50 million years it will break into a ring.'
		]
	},
	{
		key: 'Jupiter',
		name: 'Jupiter',
		glyph: '♃',
		color: '#d9a066',
		orbitAu: 5.203,
		radiusKm: 69911,
		moons: 95,
		dayLength: '9h 56m',
		yearLength: '11.9 Earth years',
		tagline: 'A storm older than the telescope that found it.',
		facts: [
			'The Great Red Spot is a storm wider than Earth that has been running for at least 350 years, and it is finally shrinking.',
			'There is no surface. Descend far enough and the atmosphere simply thickens into liquid metallic hydrogen.',
			'It spins so fast that a day lasts under ten hours, which visibly squashes the planet into an oval.',
			'Its radiation belts would deliver a lethal dose to a human in hours, which is why probes give the inner moons a wide berth.'
		]
	},
	{
		key: 'Saturn',
		name: 'Saturn',
		glyph: '♄',
		color: '#e3d3a3',
		ring: true,
		orbitAu: 9.537,
		radiusKm: 58232,
		moons: 146,
		dayLength: '10h 33m',
		yearLength: '29.4 Earth years',
		tagline: 'Less dense than water. It would float.',
		facts: [
			'Saturn is less dense than water. Given a bathtub big enough, it would float.',
			'The rings stretch 280,000 km across but are typically only about ten metres thick.',
			'They are temporary. Ring material is raining into the planet and will be gone in roughly 100 million years, so we arrived at a good time.',
			'There is a hexagon at the north pole, a six-sided jet stream wide enough to swallow four Earths, and nobody expected it.'
		]
	},
	{
		key: 'Uranus',
		name: 'Uranus',
		glyph: '♅',
		color: '#9fd8e0',
		ring: true,
		orbitAu: 19.191,
		radiusKm: 25362,
		moons: 28,
		dayLength: '17h 14m',
		yearLength: '84 Earth years',
		tagline: 'Knocked on its side and never recovered.',
		facts: [
			'It rotates on its side at a 98 degree tilt, so it rolls around the Sun rather than spinning upright. Something very large hit it.',
			'That tilt gives it 21-year seasons. One pole faces the Sun for two decades while the other sits in continuous darkness.',
			'It has the coldest atmosphere in the solar system at −224 °C, colder than Neptune, which is far further out.',
			'Conditions inside are thought to compress carbon into diamonds that then sink toward the core.'
		]
	},
	{
		key: 'Neptune',
		name: 'Neptune',
		glyph: '♆',
		color: '#4f6fd8',
		ring: true,
		orbitAu: 30.069,
		radiusKm: 24622,
		moons: 16,
		dayLength: '16h 6m',
		yearLength: '165 Earth years',
		tagline: 'Found with a pencil before anyone looked.',
		facts: [
			'It was predicted mathematically from wobbles in the orbit of Uranus, then found within a degree of where the maths said to point.',
			'Winds reach 2,100 km/h, the fastest in the solar system, on a planet that receives almost no sunlight to drive them.',
			'One Neptunian year is 165 Earth years. It finished its first full orbit since discovery in 2011.',
			'Its moon Triton orbits backwards, which means Neptune captured it, and it is slowly falling in.'
		]
	},
	{
		key: 'Pluto',
		name: 'Pluto',
		glyph: '♇',
		color: '#c9b6a4',
		orbitAu: 39.482,
		radiusKm: 1188,
		moons: 5,
		dayLength: '6.4 Earth days',
		yearLength: '248 Earth years',
		tagline: 'Demoted, but it has a glacier shaped like a heart.',
		facts: [
			'It has a heart. Sputnik Planitia is a nitrogen ice glacier a thousand kilometres across, and it is actively churning.',
			'Its moon Charon is so large relative to Pluto that both orbit a point in empty space between them.',
			'For 20 years of every orbit it is closer to the Sun than Neptune. It was last inside that orbit from 1979 to 1999.',
			'The sky there is blue. Haze in the thin atmosphere scatters light the same way ours does.'
		]
	}
];

export const SUN = {
	name: 'Sun',
	glyph: '☉',
	color: '#ffcf5c',
	radiusKm: 696340,
	tagline: 'Everything else is a rounding error.',
	facts: [
		'It holds 99.86 percent of all the mass in the solar system. Every planet, moon and asteroid combined is the leftovers.',
		'Sunlight takes 8 minutes 20 seconds to reach us, but that energy spent up to 100,000 years fighting its way out of the core first.',
		'It converts about 4 million tonnes of mass into energy every second and has been doing it for 4.6 billion years.',
		'It is not on fire. It is a fusion reactor held together by nothing but its own weight.'
	]
};

export type DeepSky = {
	key: string;
	name: string;
	kind: string;
	distance: string;
	tagline: string;
	facts: string[];
	query: string;
};

export const DEEP_SKY: DeepSky[] = [
	{
		key: 'milkyway',
		name: 'The Milky Way',
		kind: 'Barred spiral galaxy',
		distance: 'We are 26,000 light years from the centre',
		tagline: 'Home, and we have never seen it from outside.',
		facts: [
			'Every photograph of the Milky Way from the outside is an artist reconstruction. We cannot get far enough away to take one.',
			'The Sun takes about 230 million years to complete one lap. The last time it was here, dinosaurs had not started yet.',
			'It contains somewhere between 100 and 400 billion stars, and we still argue about how many arms it has.',
			'It is eating other galaxies right now. Streams of stars torn from smaller ones wrap around us.'
		],
		query: 'milky way galaxy'
	},
	{
		key: 'sgra',
		name: 'Sagittarius A*',
		kind: 'Supermassive black hole',
		distance: '26,000 light years',
		tagline: 'The thing everything here is falling around.',
		facts: [
			'It weighs 4.3 million Suns and sits at the centre of our galaxy, and we found it by watching stars whip around apparently nothing.',
			'One of those stars, S2, completes an orbit every 16 years at 3 percent the speed of light.',
			'It was photographed in 2022 using telescopes across the whole planet linked into one Earth-sized instrument.',
			'It is remarkably quiet. If it were feeding actively, the night sky would look very different.'
		],
		query: 'sagittarius a black hole'
	},
	{
		key: 'andromeda',
		name: 'Andromeda',
		kind: 'Spiral galaxy',
		distance: '2.5 million light years',
		tagline: 'Incoming, at 110 km per second.',
		facts: [
			'It is heading straight for us and will merge with the Milky Way in about 4.5 billion years.',
			'Almost no stars will collide. Galaxies are so empty that they will pass straight through each other.',
			'It is the furthest thing visible to the naked eye. The light hitting your eye left before humans existed.',
			'It looks small in the sky only because it is faint. It is actually six times wider than the full Moon.'
		],
		query: 'andromeda galaxy'
	},
	{
		key: 'orion',
		name: 'Orion Nebula',
		kind: 'Stellar nursery',
		distance: '1,344 light years',
		tagline: 'Stars being built, visible without a telescope.',
		facts: [
			'It is the middle "star" in the sword of Orion, and it is not a star. It is a cloud where new ones are forming right now.',
			'Around 700 stars are in various stages of assembly inside it.',
			'It is 24 light years across, which means the light from one side takes 24 years to reach the other.',
			'Many of the young stars have visible discs of dust around them, which is what planets are made from.'
		],
		query: 'orion nebula'
	},
	{
		key: 'betelgeuse',
		name: 'Betelgeuse',
		kind: 'Red supergiant',
		distance: '548 light years',
		tagline: 'Due to explode. Possibly already has.',
		facts: [
			'If it replaced the Sun, its surface would swallow Mars and reach most of the way to Jupiter.',
			'It will go supernova, and when it does it will be visible in daylight for weeks.',
			'It might already have. The light takes 548 years to arrive, so the event could be halfway here.',
			'It dimmed dramatically in 2019 and everyone got excited. It had burped out a cloud of dust and hidden behind it.'
		],
		query: 'betelgeuse star'
	},
	{
		key: 'ton618',
		name: 'TON 618',
		kind: 'Ultramassive black hole',
		distance: '10.4 billion light years',
		tagline: 'Roughly 40 billion Suns, in one object.',
		facts: [
			'Its mass is about 40 billion Suns. Its event horizon alone is wider than our entire solar system, several times over.',
			'We see it as a quasar, which means the matter falling in shines brighter than whole galaxies.',
			'The light we receive left when the universe was a quarter of its present age.',
			'For scale, Sagittarius A* would fit inside it roughly ten thousand times over.'
		],
		query: 'quasar black hole'
	}
];
