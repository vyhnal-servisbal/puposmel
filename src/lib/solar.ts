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
	query: string;
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
		query: 'mercury planet messenger',
		facts: [
			'One day lasts twice as long as one year. Sunrise to sunrise takes 176 Earth days; a full orbit takes 88.',
			'The surface swings from 430 °C in daylight to −180 °C at night, the widest temperature range of any planet.',
			'It holds water ice in crater floors near the poles that sunlight has never once touched.',
			'It is shrinking. The iron core cooled and the whole crust wrinkled inward, leaving cliffs kilometres high.',
			'Its orbit did not obey Newton. Einstein explaining that wobble was the first hard evidence for general relativity.',
			'The core fills about 60 percent of its volume. It is essentially a ball of iron with a thin rocky shell.',
			'From the surface the Sun appears three times wider than it does from Earth.',
			'Its orbit is so stretched that near closest approach the Sun appears to stop, reverse, then carry on.',
			'It has a tail. Solar wind strips sodium off the surface and blows it into a comet-like streak.',
			'Only two spacecraft have ever visited. Reaching it takes more fuel than reaching Pluto, because you must brake against the Sun.',
			'Its craters are named after artists, writers and composers, so there is a Tolkien crater and a Lennon crater.',
			'It is closest to the Sun but not the hottest. Venus beats it by 130 degrees.'
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
		query: 'venus planet magellan',
		facts: [
			'At 465 °C it is hotter than Mercury despite being nearly twice as far from the Sun. The atmosphere lets nothing escape.',
			'It rotates backwards, and one rotation takes longer than one orbit. The Sun rises in the west.',
			'Surface pressure matches being 900 metres underwater. Early landers were crushed within an hour.',
			'It rains sulfuric acid, but the drops evaporate kilometres above the ground and never land.',
			'The longest any spacecraft has survived on the surface is 127 minutes, set by Venera 13 in 1982.',
			'Winds at cloud level circle the entire planet in four days, sixty times faster than the planet itself turns.',
			'It is the brightest thing in our sky after the Sun and Moon, and gets mistaken for aircraft constantly.',
			'It has no magnetic field, so the solar wind strips its atmosphere directly.',
			'Its surface is young, around 300 to 600 million years old, which suggests the whole planet resurfaced itself at once.',
			'Almost every feature on it is named after a woman, real or mythological. It is the only planet with that rule.',
			'It probably had oceans for two billion years before a runaway greenhouse boiled them away.',
			'Seen from Venus, Earth would be the brightest star in the sky, and blue.'
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
		query: 'earth from space blue marble',
		facts: [
			'The magnetic field reverses every few hundred thousand years. The last flip was 780,000 years ago, so we are overdue.',
			'The Moon drifts away 3.8 cm per year. Total solar eclipses will eventually stop happening for good.',
			'It is the only body where liquid water covers most of the surface, at 71 percent.',
			'We have mapped the surface of Mars in more detail than our own sea floor.',
			'The centre of the planet is roughly as hot as the surface of the Sun.',
			'Days are getting longer. 600 million years ago one lasted 21 hours, and tidal drag is still slowing us.',
			'It is not a sphere. It bulges at the equator, so the summit furthest from the centre is Chimborazo, not Everest.',
			'Around 100 tonnes of space dust and debris fall onto it every single day.',
			'Its atmosphere is 21 percent oxygen, and every bit of that is waste gas produced by living things.',
			'It has a second, temporary moon fairly often. Small asteroids get captured for a few months, then leave.',
			'The Sahara sends phosphorus dust across the Atlantic that fertilises the Amazon rainforest.',
			'If it were shrunk to the size of a billiard ball it would be smoother than the ball.'
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
		query: 'mars surface curiosity rover',
		facts: [
			'Olympus Mons is 22 km tall. It is so wide that standing on it you would not notice you were on a mountain at all.',
			'Sunsets are blue. Fine dust scatters red light away, the exact opposite of what happens here.',
			'It had oceans. Much of that water is still there, frozen underground and locked in the polar caps.',
			'Phobos is spiralling inward. In about 50 million years it will break apart and give Mars a ring.',
			'Valles Marineris is 4,000 km long. Dropped onto Earth it would stretch across the whole United States.',
			'Its day is 24 hours 37 minutes, so a human sleep cycle would work there almost unchanged.',
			'Dust storms occasionally engulf the entire planet and last for months.',
			'It is red because it is rusty. The surface is iron oxide, the same chemistry as an old bike left in the rain.',
			'Gravity is 38 percent of ours, which is why its volcanoes could grow so absurdly tall.',
			'Both moons are almost certainly captured asteroids, and Deimos is so small its escape velocity is walking pace.',
			'We have found organic molecules there, but nothing yet that proves they came from life.',
			'There is currently more functioning hardware on Mars than on any world except Earth.'
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
		query: 'jupiter juno great red spot',
		facts: [
			'The Great Red Spot is a storm wider than Earth that has run for at least 350 years, and it is finally shrinking.',
			'There is no surface. Descend far enough and the atmosphere simply thickens into liquid metallic hydrogen.',
			'A day lasts under ten hours, which spins it visibly out of round.',
			'Its radiation belts would give a human a lethal dose in hours.',
			'It is more massive than every other planet combined, twice over.',
			'It does not orbit the Sun exactly. Both orbit a point just outside the Sun, because Jupiter is that heavy.',
			'It has at least 95 moons, and four of them are big enough to see with binoculars.',
			'It has rings. They are dark, thin and made of dust kicked off its inner moons, and we only found them in 1979.',
			'Its magnetic field is so large that if you could see it, it would look bigger than the full Moon from here.',
			'It radiates more heat than it receives from the Sun, still slowly shrinking and warming itself.',
			'It shields the inner solar system by hoovering up comets, and we watched it destroy one in 1994.',
			'Galileo seeing its moons orbit something other than Earth is the observation that broke the old model of the universe.'
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
		query: 'saturn cassini rings',
		facts: [
			'It is less dense than water. Given a bathtub big enough, it would float.',
			'The rings stretch 280,000 km across but are typically only about ten metres thick.',
			'They are temporary. Ring material is raining into the planet and will be gone in roughly 100 million years.',
			'There is a hexagon at the north pole, a six-sided jet stream wide enough to swallow four Earths.',
			'Galileo saw the rings but his telescope was too weak to resolve them, so he reported that Saturn had ears.',
			'The rings are almost pure water ice, which is why they are so bright.',
			'Winds near the equator reach 1,800 km/h.',
			'Its moon Enceladus fires geysers of liquid water into space, and we flew a spacecraft through them.',
			'Titan has lakes, rivers and rain, all made of liquid methane, and is the only other place with surface liquid.',
			'Nobody knows exactly how long its day is. It has no solid surface to track and the magnetic field is too symmetrical to help.',
			'Cassini ended by deliberately diving into the planet, so it could never contaminate Enceladus.',
			'It has 146 confirmed moons, more than any other planet, and the count keeps rising.'
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
		query: 'uranus planet voyager',
		facts: [
			'It rotates on its side at a 98 degree tilt, so it rolls around the Sun. Something enormous hit it.',
			'That tilt gives 21-year seasons. One pole faces the Sun for two decades while the other sits in darkness.',
			'It has the coldest atmosphere in the solar system at −224 °C, colder than Neptune, which is far further out.',
			'Conditions inside likely compress carbon into diamonds that sink toward the core.',
			'It was the first planet discovered with a telescope, and Herschel initially thought it was a comet.',
			'He wanted to name it after King George. The rest of Europe declined.',
			'Only one spacecraft has ever been there, Voyager 2, for a few hours in 1986.',
			'It has 13 rings, discovered by accident when the planet passed in front of a star and the star blinked early.',
			'Its magnetic field is tilted 59 degrees from its axis and does not pass through the centre of the planet.',
			'Its moons are named after Shakespeare and Pope characters instead of classical mythology.',
			'Voyager caught it during a bland phase and it looked like a plain blue ball. Later images show it has weather after all.',
			'A year lasts 84 Earth years, so it has completed only about three orbits since we found it.'
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
		query: 'neptune planet voyager 2',
		facts: [
			'It was predicted from maths, using wobbles in the orbit of Uranus, then found within one degree of the prediction.',
			'Winds reach 2,100 km/h, the fastest in the solar system, on a planet receiving almost no sunlight to drive them.',
			'One year is 165 Earth years. It completed its first full orbit since discovery in 2011.',
			'Triton orbits backwards, which means Neptune captured it, and it is slowly falling in.',
			'Triton has nitrogen geysers erupting through its ice, despite sitting at −235 °C.',
			'Galileo saw it in 1613 and recorded it as a star, missing the discovery by two centuries.',
			'It radiates more than twice the energy it receives, and nobody is entirely sure where that comes from.',
			'It had a Great Dark Spot the size of Earth. By the time Hubble looked again, it had vanished.',
			'It is the only planet you cannot see with the naked eye from Earth under any conditions.',
			'It also likely rains diamonds, and experiments on Earth have reproduced the conditions that would do it.',
			'Voyager 2 remains the only visitor, and it will not have another for decades.',
			'Its rings are clumpy rather than even, held in place by shepherd moons.'
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
		query: 'pluto new horizons',
		facts: [
			'It has a heart. Sputnik Planitia is a nitrogen ice glacier a thousand kilometres across, and it is actively churning.',
			'Charon is so large relative to Pluto that both orbit a point in empty space between them.',
			'For 20 years of every orbit it is closer to the Sun than Neptune. It last was, from 1979 to 1999.',
			'The sky there is blue, because haze scatters light the same way our atmosphere does.',
			'It has mountains of water ice several kilometres high, which at that temperature is as hard as rock.',
			'Its atmosphere freezes and falls as snow when it moves further from the Sun, then sublimates back.',
			'Some of the ashes of Clyde Tombaugh, who discovered it, are aboard New Horizons and flew past it in 2015.',
			'It was named by an 11-year-old girl in Oxford who suggested it over breakfast.',
			'Sunlight there is about as bright as twilight here, but that is still 250 times brighter than a full Moon.',
			'It is smaller than our Moon, and smaller than seven other moons in the solar system.',
			'The New Horizons flyby data took 15 months to fully transmit back at 2 kilobits per second.',
			'Before 2015 the best image we had of it was a handful of blurry pixels.'
		]
	}
];

export const SUN = {
	name: 'Sun',
	glyph: '☉',
	color: '#ffcf5c',
	radiusKm: 696340,
	tagline: 'Everything else is a rounding error.',
	query: 'sun solar dynamics observatory',
	facts: [
		'It holds 99.86 percent of all the mass in the solar system. Every planet, moon and asteroid is the leftovers.',
		'Sunlight takes 8 minutes 20 seconds to reach us, but that energy spent up to 100,000 years escaping the core first.',
		'It converts about 4 million tonnes of mass into energy every second, and has done for 4.6 billion years.',
		'It is not on fire. It is a fusion reactor held together by nothing but its own weight.',
		'Its core is 15 million degrees, but the corona above the surface is hotter still, and we do not fully know why.',
		'You could fit 1.3 million Earths inside it.',
		'It is a third-generation star. The heavy elements in your body were made by stars that died before it formed.',
		'Every second it emits more energy than humanity has used in its entire history.',
		'Its magnetic field flips completely every 11 years, and we are living through those cycles constantly.',
		'It is travelling around the galaxy at 220 km/s, dragging every planet with it in a long spiral.',
		'In about 5 billion years it will swell into a red giant and swallow Mercury, Venus and probably Earth.',
		'It is not yellow. It emits white light, and looks yellow only because our atmosphere scatters the blue away.'
	]
};
