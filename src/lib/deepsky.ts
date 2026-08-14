export type SkyObject = {
	key: string;
	name: string;
	kind: string;
	distance: string;
	tagline: string;
	query: string;
	facts: string[];
};

export type Category = {
	key: string;
	name: string;
	icon: string;
	blurb: string;
	items: SkyObject[];
};

export const CATEGORIES: Category[] = [
	{
		key: 'moons',
		name: 'Moons worth knowing',
		icon: '🌘',
		blurb: 'Several of these are better candidates for life than Mars.',
		items: [
			{
				key: 'moon',
				name: 'The Moon',
				kind: 'Our moon',
				distance: '384,400 km',
				tagline: 'Drifting away, one fingernail per year.',
				query: 'moon apollo surface',
				facts: [
					'It is moving away at 3.8 cm per year, about the speed your fingernails grow.',
					'It always shows the same face because Earth slowed its spin until the two matched.',
					'It was probably made when a Mars-sized object hit the early Earth and the debris clumped together.',
					'Moonquakes can last over an hour. With no water in the rock, it rings like a bell.',
					'The footprints left by Apollo will survive for millions of years, since there is no wind to erase them.',
					'It is drifting far enough that in 600 million years total solar eclipses will stop happening.',
					'Its far side looks completely different, with almost none of the dark plains we see from here.'
				]
			},
			{
				key: 'europa',
				name: 'Europa',
				kind: 'Moon of Jupiter',
				distance: '628 million km',
				tagline: 'More liquid water than every ocean on Earth.',
				query: 'europa jupiter moon',
				facts: [
					'Under its ice shell is an ocean holding more liquid water than every ocean on Earth combined.',
					'That ocean stays liquid because Jupiter squeezes and stretches the moon, heating it by friction.',
					'Its surface is the smoothest solid surface in the solar system, with almost no craters.',
					'It has very few craters because the ice keeps resurfacing, which means it is geologically young.',
					'Hubble has seen plumes of water erupting hundreds of kilometres above the surface.',
					'It is one of the best places to look for life anywhere off Earth, which is why Cassini was deliberately destroyed rather than risk contaminating this region.'
				]
			},
			{
				key: 'titan',
				name: 'Titan',
				kind: 'Moon of Saturn',
				distance: '1.2 billion km',
				tagline: 'Rivers, lakes and rain, all made of methane.',
				query: 'titan saturn moon huygens',
				facts: [
					'It is the only place besides Earth with stable liquid on its surface, but the liquid is methane.',
					'It has a thicker atmosphere than Earth does, and it is the only moon with a proper one.',
					'Gravity is low and air is dense enough that a human with strapped-on wings could genuinely fly.',
					'It rains there, forms rivers, carves canyons and fills lakes, using a chemistry with no water involved.',
					'Huygens landed on it in 2005, the most distant landing humans have ever made.',
					'Its surface is around −180 °C, so water ice there behaves like bedrock.'
				]
			},
			{
				key: 'io',
				name: 'Io',
				kind: 'Moon of Jupiter',
				distance: '628 million km',
				tagline: 'The most volcanically violent place we know.',
				query: 'io jupiter volcano',
				facts: [
					'It has over 400 active volcanoes, making it the most geologically violent object in the solar system.',
					'Eruptions throw plumes 500 km up, high enough to escape into orbit around Jupiter.',
					'Jupiter flexes its surface by up to 100 metres, and that constant kneading is what melts the interior.',
					'It has effectively no craters. The surface repaves itself faster than impacts can mark it.',
					'It is the driest known object in the solar system, having lost all its water long ago.',
					'It sheds a tonne of material into space every second, which forms a glowing torus around Jupiter.'
				]
			},
			{
				key: 'enceladus',
				name: 'Enceladus',
				kind: 'Moon of Saturn',
				distance: '1.3 billion km',
				tagline: 'It sprays its ocean into space, and we flew through it.',
				query: 'enceladus geysers cassini',
				facts: [
					'It fires geysers of liquid water hundreds of kilometres into space from cracks near its south pole.',
					'Cassini flew straight through those plumes and tasted the ocean without ever landing.',
					'The spray contained salt, silica and organic molecules, which means warm water is meeting rock down there.',
					'It is only 500 km across, small enough to fit inside the United Kingdom.',
					'Its ice reflects almost all sunlight, making it the most reflective body in the solar system.',
					'The material it loses forms one of Saturn’s rings outright.'
				]
			},
			{
				key: 'ganymede',
				name: 'Ganymede',
				kind: 'Moon of Jupiter',
				distance: '1.07 million km from Jupiter',
				tagline: 'Bigger than Mercury, and it has its own aurora.',
				query: 'ganymede jupiter moon',
				facts: [
					'It is the largest moon in the solar system, and bigger than the planet Mercury.',
					'It is the only moon with its own magnetic field, which gives it genuine polar aurorae.',
					'It very likely hides a salty ocean under the ice, possibly deeper than any on Earth.',
					'If it orbited the Sun instead of Jupiter, we would call it a planet without hesitation.',
					'Watching the way its aurorae rock back and forth is how we inferred the hidden ocean.',
					'Its surface is half ancient dark cratered terrain and half younger grooved ice.'
				]
			},
			{
				key: 'triton',
				name: 'Triton',
				kind: 'Moon of Neptune',
				distance: '4.5 billion km',
				tagline: 'Orbiting the wrong way, and doomed.',
				query: 'triton neptune moon',
				facts: [
					'It orbits backwards, which no large moon does naturally. Neptune captured it.',
					'It is spiralling inward and will eventually be torn apart into a ring system.',
					'It has nitrogen geysers erupting eight kilometres up, at a surface temperature of −235 °C.',
					'It is one of the coldest measured places in the solar system.',
					'It was probably a Kuiper Belt object like Pluto before it was caught.',
					'Voyager 2 photographed only 40 percent of it, and nothing has been back since 1989.'
				]
			}
		]
	},
	{
		key: 'small',
		name: 'Small bodies',
		icon: '☄️',
		blurb: 'Leftovers from the building site, still floating around.',
		items: [
			{
				key: 'ceres',
				name: 'Ceres',
				kind: 'Dwarf planet',
				distance: '413 million km',
				tagline: 'The asteroid belt is mostly empty, and this is a third of it.',
				query: 'ceres dawn dwarf planet',
				facts: [
					'It holds about a third of all the mass in the asteroid belt by itself.',
					'It has bright spots that turned out to be salt deposits left by briny water reaching the surface.',
					'It may hold more fresh water than Earth does, locked as ice.',
					'When it was discovered in 1801 it was called a planet, and it kept that status for 50 years.',
					'The asteroid belt is so empty that spacecraft cross it without any risk of hitting anything.',
					'It has a mountain, Ahuna Mons, that appears to be a volcano that erupted ice rather than lava.'
				]
			},
			{
				key: 'halley',
				name: "Halley's Comet",
				kind: 'Periodic comet',
				distance: 'Returns in 2061',
				tagline: 'Most people get exactly one chance.',
				query: 'halley comet',
				facts: [
					'It returns every 75 to 76 years, so most people see it once if they see it at all.',
					'Halley did not discover it. He worked out that repeated sightings were the same object coming back.',
					'It appears in the Bayeux Tapestry, recorded as an omen before the Battle of Hastings in 1066.',
					'Mark Twain was born in the year it appeared and died the day after its next return, as he predicted.',
					'Its nucleus is one of the darkest objects in the solar system, reflecting only about 4 percent of light.',
					'Earth passes through its debris twice a year, which gives us the Eta Aquariid and Orionid meteor showers.'
				]
			},
			{
				key: 'oumuamua',
				name: "ʻOumuamua",
				kind: 'Interstellar object',
				distance: 'Gone, and not coming back',
				tagline: 'It came from another star and left before we got a good look.',
				query: 'interstellar object comet',
				facts: [
					'It is the first object ever confirmed to have come from outside our solar system.',
					'It was moving too fast for the Sun to hold it, so it passed through once and left forever.',
					'It is unusually elongated, possibly ten times longer than it is wide, which nothing local looks like.',
					'It accelerated slightly on the way out in a way a plain rock should not, and the argument is not settled.',
					'We only spotted it on the way out. It was already leaving when it was found in 2017.',
					'Its name is Hawaiian and roughly means a scout arriving from the distant past.'
				]
			},
			{
				key: 'bennu',
				name: 'Bennu',
				kind: 'Near-Earth asteroid',
				distance: 'Crosses our orbit',
				tagline: 'We went, took a scoop, and brought it home.',
				query: 'bennu osiris-rex asteroid',
				facts: [
					'OSIRIS-REx touched down on it, grabbed a sample and returned it to Earth in 2023.',
					'The surface turned out to be so loose that the spacecraft sank in like it had landed in a ball pit.',
					'It has a small chance of hitting Earth in the late 2100s, which is one reason we studied it.',
					'Its samples contain carbon and water-bearing minerals from the earliest days of the solar system.',
					'It is a rubble pile, not a solid rock, held together by very weak gravity.',
					'Sunlight itself is slowly pushing its orbit around, an effect we can now measure directly.'
				]
			},
			{
				key: 'kuiper',
				name: 'The Kuiper Belt',
				kind: 'Region',
				distance: '30 to 50 AU',
				tagline: 'Where Pluto lives, and thousands like it.',
				query: 'kuiper belt new horizons arrokoth',
				facts: [
					'It is a ring of icy bodies beyond Neptune, and Pluto is only one of many.',
					'New Horizons flew past Arrokoth out there, the most distant object we have ever visited up close.',
					'Arrokoth looks like two spheres gently stuck together, which is how planets probably started forming.',
					'Short-period comets mostly come from here.',
					'It contains several dwarf planets, including Eris, which is heavier than Pluto.',
					'Discovering how crowded it is out there is exactly why Pluto got reclassified.'
				]
			},
			{
				key: 'oort',
				name: 'The Oort Cloud',
				kind: 'Region',
				distance: 'Up to 100,000 AU',
				tagline: 'The edge of the Sun, halfway to the next star.',
				query: 'oort cloud comet',
				facts: [
					'It is a spherical shell of icy bodies surrounding the entire solar system.',
					'Its outer edge may reach a quarter of the way to the nearest star.',
					'Voyager 1 will not reach the inner edge for another 300 years, and would take 30,000 years to cross it.',
					'Long-period comets fall in from here, sometimes after millions of years of drifting.',
					'Nobody has ever directly observed an object in it. Its existence is inferred from where comets come from.',
					'Passing stars occasionally nudge it, which sends new comets falling toward us.'
				]
			}
		]
	},
	{
		key: 'stars',
		name: 'Stars',
		icon: '⭐',
		blurb: 'The nearest, the biggest and the ones about to go.',
		items: [
			{
				key: 'proxima',
				name: 'Proxima Centauri',
				kind: 'Red dwarf',
				distance: '4.24 light years',
				tagline: 'The closest star, and it has a planet.',
				query: 'proxima centauri exoplanet',
				facts: [
					'It is the nearest star to the Sun, and still 4.24 light years away.',
					'Voyager 1 travelling at its current speed would take about 73,000 years to get there.',
					'It has a planet in its habitable zone, Proxima b, roughly Earth-sized.',
					'It is too faint to see with the naked eye despite being our closest neighbour.',
					'It throws out enormous flares that would likely strip the atmosphere from anything orbiting close.',
					'Red dwarfs like it burn so slowly they can live for trillions of years, far longer than the universe has existed.'
				]
			},
			{
				key: 'betelgeuse',
				name: 'Betelgeuse',
				kind: 'Red supergiant',
				distance: '548 light years',
				tagline: 'Due to explode. Possibly already has.',
				query: 'betelgeuse star',
				facts: [
					'If it replaced the Sun, its surface would swallow Mars and reach most of the way to Jupiter.',
					'When it goes supernova it will be visible in daylight for weeks.',
					'It might have already exploded. The light takes 548 years to arrive, so the news could be in transit.',
					'It dimmed dramatically in 2019 and everyone got excited. It had coughed out dust and hidden behind it.',
					'It is only about 10 million years old, but supergiants burn through their fuel absurdly fast.',
					'It is the red shoulder of Orion, and you can see the colour difference with the naked eye.'
				]
			},
			{
				key: 'sirius',
				name: 'Sirius',
				kind: 'Binary star',
				distance: '8.6 light years',
				tagline: 'The brightest star, with a dead one hidden beside it.',
				query: 'sirius star',
				facts: [
					'It is the brightest star in our night sky, mostly because it is very close rather than very luminous.',
					'It has a companion, a white dwarf the size of Earth but as heavy as the Sun.',
					'A teaspoon of that companion would weigh about a tonne.',
					'The ancient Egyptians timed the flooding of the Nile by its rising.',
					'It twinkles violently near the horizon and gets reported as a UFO more than any other star.',
					'It is drifting closer, and will get brighter for the next 60,000 years.'
				]
			},
			{
				key: 'vycma',
				name: 'VY Canis Majoris',
				kind: 'Red hypergiant',
				distance: '3,900 light years',
				tagline: 'Light takes over 8 hours to cross it.',
				query: 'red hypergiant star',
				facts: [
					'It is one of the largest stars known. Light needs more than eight hours just to cross it once.',
					'Put it where the Sun is and its surface would sit somewhere between Jupiter and Saturn.',
					'Despite the size it is so diffuse that its outer layers are thinner than a laboratory vacuum.',
					'It is shedding mass violently and is surrounded by the debris it has thrown off.',
					'It will end as a supernova, possibly collapsing straight into a black hole.',
					'Roughly a billion Suns would fit inside its volume.'
				]
			}
		]
	},
	{
		key: 'deep',
		name: 'Deep sky',
		icon: '🌌',
		blurb: 'Nebulae and galaxies, some visible without a telescope.',
		items: [
			{
				key: 'milkyway',
				name: 'The Milky Way',
				kind: 'Barred spiral galaxy',
				distance: 'We sit 26,000 light years out',
				tagline: 'Home, and we have never seen it from outside.',
				query: 'milky way galaxy',
				facts: [
					'Every picture of it from the outside is an artist reconstruction. We cannot get far enough away.',
					'The Sun takes 230 million years to complete one lap. Last time it was here, dinosaurs had not started.',
					'It holds somewhere between 100 and 400 billion stars, and we still argue about how many arms it has.',
					'It is eating smaller galaxies right now, and streams of stolen stars wrap around us.',
					'It is about 100,000 light years across but only around 1,000 light years thick.',
					'Most of its mass is not stars. It is dark matter, and we do not know what that is.'
				]
			},
			{
				key: 'andromeda',
				name: 'Andromeda',
				kind: 'Spiral galaxy',
				distance: '2.5 million light years',
				tagline: 'Incoming, at 110 km per second.',
				query: 'andromeda galaxy',
				facts: [
					'It is heading straight for us and will merge with the Milky Way in about 4.5 billion years.',
					'Almost no stars will collide. Galaxies are empty enough to pass straight through each other.',
					'It is the furthest thing visible to the naked eye, and that light left before humans existed.',
					'It looks small only because it is faint. It actually spans six times the width of the full Moon.',
					'It contains about a trillion stars, several times more than we do.',
					'Until 1925 we thought it was a cloud inside our own galaxy, and that the Milky Way was the whole universe.'
				]
			},
			{
				key: 'orion',
				name: 'Orion Nebula',
				kind: 'Stellar nursery',
				distance: '1,344 light years',
				tagline: 'Stars being built, visible without a telescope.',
				query: 'orion nebula',
				facts: [
					'It is the middle "star" in the sword of Orion, and it is not a star at all.',
					'Around 700 stars are in various stages of assembly inside it right now.',
					'It is 24 light years across, so light takes 24 years to cross it.',
					'Many young stars in it have visible dust discs, which is what planets get built from.',
					'It is the closest region of massive star formation to us.',
					'Our own Sun very likely formed in something just like it, 4.6 billion years ago.'
				]
			},
			{
				key: 'eagle',
				name: 'Pillars of Creation',
				kind: 'Eagle Nebula',
				distance: '6,500 light years',
				tagline: 'The most famous photograph in astronomy.',
				query: 'pillars of creation eagle nebula',
				facts: [
					'The pillars are columns of gas light years tall, with new stars forming inside them.',
					'Hubble photographed them in 1995 and it became the most reproduced astronomy image ever taken.',
					'Webb rephotographed them in infrared and revealed stars buried inside that Hubble could not see.',
					'They are being eaten away by radiation from nearby stars and will not last.',
					'There is some evidence a supernova already destroyed them, and we are watching light from before that.',
					'The tallest pillar is around four light years long, roughly the distance to the nearest star.'
				]
			},
			{
				key: 'crab',
				name: 'Crab Nebula',
				kind: 'Supernova remnant',
				distance: '6,500 light years',
				tagline: 'An explosion humans watched in the year 1054.',
				query: 'crab nebula',
				facts: [
					'Chinese astronomers recorded the star that made it exploding in 1054, and it was visible in daylight for weeks.',
					'At its centre is a neutron star spinning 30 times a second.',
					'That pulsar is only about 20 km across but weighs more than the Sun.',
					'It is still expanding at 1,500 km/s, and we can see the change over a human lifetime.',
					'It emits across every wavelength we can detect, which makes it a standard reference object.',
					'One teaspoon of the neutron star at its heart would weigh about a billion tonnes.'
				]
			}
		]
	},
	{
		key: 'extreme',
		name: 'The extremes',
		icon: '🕳️',
		blurb: 'Objects where the numbers stop making intuitive sense.',
		items: [
			{
				key: 'sgra',
				name: 'Sagittarius A*',
				kind: 'Supermassive black hole',
				distance: '26,000 light years',
				tagline: 'The thing everything here falls around.',
				query: 'sagittarius a black hole',
				facts: [
					'It weighs 4.3 million Suns and sits at the centre of our galaxy.',
					'We found it by watching stars whip around apparently nothing at enormous speed.',
					'One of those stars, S2, orbits every 16 years at 3 percent of the speed of light.',
					'It was photographed in 2022 using telescopes across the whole planet linked into one Earth-sized instrument.',
					'It is remarkably quiet. If it were feeding actively, our night sky would look very different.',
					'Tracking those orbits won the 2020 Nobel Prize in Physics.'
				]
			},
			{
				key: 'ton618',
				name: 'TON 618',
				kind: 'Ultramassive black hole',
				distance: '10.4 billion light years',
				tagline: 'Roughly 40 billion Suns, in one object.',
				query: 'quasar black hole',
				facts: [
					'Its mass is about 40 billion Suns, and its event horizon is several times wider than our entire solar system.',
					'We see it as a quasar, meaning the matter falling in outshines whole galaxies.',
					'The light reaching us left when the universe was a quarter of its present age.',
					'Sagittarius A* would fit inside it roughly ten thousand times over.',
					'Nothing that falls past its horizon can ever influence the outside universe again.',
					'It is so bright that it was catalogued as a star for years before anyone realised what it was.'
				]
			},
			{
				key: 'neutron',
				name: 'Neutron stars',
				kind: 'Stellar remnant',
				distance: 'Nearest is 400 light years',
				tagline: 'A city-sized object heavier than the Sun.',
				query: 'neutron star pulsar',
				facts: [
					'They pack more than the mass of the Sun into a sphere about 20 km across.',
					'One teaspoon of the material would weigh around a billion tonnes.',
					'Some spin over 700 times per second, fast enough that the surface moves at a fifth of light speed.',
					'Their magnetic fields are a trillion times stronger than Earth’s, strong enough to disrupt atoms.',
					'When two of them collide they forge gold and platinum, which is where those elements came from.',
					'We detected two merging in 2017 through both gravitational waves and light, which started a new kind of astronomy.'
				]
			}
		]
	}
];
