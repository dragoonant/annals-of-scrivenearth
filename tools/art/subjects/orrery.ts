// Art subjects for the orrery cards: one subject and one scene each, written by hand (heroes also get '<id>--ascended',
// and so does every unit that Unfolds, since its second face needs its own plate).
// The Orrery Conclave's look: indigo and pale silver robes, brass orreries, starlight held in cut crystal.
import { s, type Subjects } from './shared';

export const orrery: Subjects = {
  // ---------- heroes ----------
  'orrery-vessaly': s(
    'a slender woman in her forties with long silver-streaked black hair and light brown skin, an indigo robe with pale silver piping, a crystal eyeglass on a brass arm before one eye',
    'leaning out over the rail of an observatory balcony at dusk, reading a falling streak of starlight across the sky'),
  'orrery-vessaly--ascended': s(
    'a slender woman in her forties with long silver hair drifting loose and light brown skin, a deep indigo robe sewn with points of cut-crystal light, a brass eyeglass ring circling her head',
    'standing at the centre of a vast open dome while the night sky pours down around her like a slow silver river'),
  'orrery-elsbet': s(
    'a stout woman in her sixties with cropped white hair and ruddy pale skin, a leather apron over an indigo coat, a ring of brass keys and fine tools at her belt',
    'kneeling inside the works of an enormous brass clock, adjusting a toothed wheel by the light of a crystal lamp'),
  'orrery-elsbet--ascended': s(
    'a stout woman in her sixties with cropped white hair and ruddy pale skin, an indigo coat trimmed in pale silver, a great brass key carried on her shoulder like a staff',
    'winding a towering clock face set into the side of a spire as its brass hands sweep a wave of light across the terraces below'),
  'orrery-pell': s(
    'a lanky young man in his twenties with curly auburn hair and freckled pale skin, a short indigo cape over a silver tunic, a small brass sphere orbiting each raised hand',
    'bringing the paired spheres together above a rooftop observatory so their light joins in a bright flare'),
  'orrery-pell--ascended': s(
    'a lanky young man in his twenties with curly auburn hair and freckled pale skin, a long indigo mantle lined with silver, a pair of large glowing crystal spheres circling him in opposite orbits',
    'striding across a glass bridge as the circling spheres throw interlocking rings of light onto the water beneath'),
  'orrery-aurelind': s(
    'a tall broad woman in her fifties with a grey braid and dark brown skin, a heavy indigo work coat with brass buckles, a mason hammer of pale crystal in her fist',
    'chiselling a block of glowing crystal in a vaulted workshop as a towering construct of light stands half-carved behind her'),
  'orrery-aurelind--ascended': s(
    'a tall broad woman in her fifties with a grey braid crowned in silver light and dark brown skin, an indigo coat edged with brass, a long crystal hammer shining at its head',
    'raising the hammer on a spire terrace as a giant of starlight and cut crystal rises from the stone at her feet'),

  // ---------- tokens ----------
  'orrery-starlightcolossus': s(
    'a towering humanoid construct of pale cut crystal filled with drifting points of white light, brass bands at its joints',
    'stepping down from a cloud-high terrace onto a broad avenue, its glow lighting the faces of the crowd below'),

  // ---------- units ----------
  'orrery-lenspolisher': s(
    'a thin girl of about fifteen with a dark braid and olive skin, an indigo smock dusted with crystal powder, a soft cloth and a round lens in her hands',
    'buffing the lens at a workbench under a skylight until a spark of starlight flashes across its surface'),
  'orrery-novicestargazer': s(
    'a round-faced boy of about sixteen with short black hair and brown skin, a plain indigo robe a little too large for him, a brass spyglass held up to one eye',
    'lying on his back on a tiled rooftop at nightfall, tracking a bright point of light across the sky'),
  'orrery-pocketorrery': s(
    'a palm-sized brass armillary of nested rings around a glowing crystal bead, its arms folded shut like a closed flower',
    'resting on a velvet cushion on a dark windowsill as the first starlight touches its rings'),
  'orrery-pocketorrery--ascended': s(
    'a brass armillary of nested rings opened wide around a bright crystal bead, its rings spinning in slow arcs',
    'hovering over an open hand in a dim library alcove, casting moving rings of light across the shelves'),
  'orrery-chartscribe': s(
    'a bookish young man in his twenties with ink-stained fingers and pale skin, an indigo robe with rolled sleeves, a silver pen and a sheet of dark star-dotted vellum',
    'pricking points of light into the dark vellum at a slanted desk beside an open shutter'),
  'orrery-brasssentinel': s(
    'a squat guardian construct of riveted bronze plates with a single round crystal eye and a domed head',
    'standing watch at the foot of an observatory stair while moths circle the glow of its eye'),
  'orrery-brasssentinel--ascended': s(
    'a squat guardian construct of gleaming gilded plates with a broad crystal eye and a silver crest along its domed head',
    'raising a heavy gilded arm to catch a falling stone on a cracked observatory stair'),
  'orrery-orbitacolyte': s(
    'a nimble young woman in her twenties with a shaved head and dark skin, a fitted indigo tunic, a brass hoop spinning around her waist with a crystal bead on it',
    'twirling through a courtyard of pale flagstones as the bead traces a glowing loop around her'),
  'orrery-lanternacolyte': s(
    'a gentle young man in his twenties with long fair hair tied back, an indigo robe with silver trim, a crystal lamp on a brass chain',
    'holding the lamp over a wounded comrade in a dark stairwell as its light closes around the comrade like a glass shell'),
  'orrery-armillarywarden': s(
    'a tall construct of interlocking brass rings around a dim crystal core, its rings locked still in a resting pose',
    'standing silent in an empty plaza while frost gathers on its brass rings'),
  'orrery-armillarywarden--ascended': s(
    'a towering construct of brass rings spinning around a blazing crystal core, its arms formed from the outer rings',
    'swinging its ring arm down at an enemy siege engine in a shower of brass sparks'),
  'orrery-cometherald': s(
    'a lean woman in her thirties with short silver hair and tan skin, a flowing indigo coat streaming behind her, a brass trumpet with a crystal bell',
    'sounding the trumpet from a rooftop as a streak of fire crosses the sky above her'),
  'orrery-quadrantkeeper': s(
    'an elderly man with a long white beard and deep brown skin, an indigo robe with silver star stitching, a large brass quarter-circle measuring frame',
    'sighting along the brass frame at a single bright point of light from a high parapet'),
  'orrery-meteorlancer': s(
    'a muscular young woman in her twenties with a red topknot and pale skin, light indigo plate armour, a long lance tipped with a glowing crystal shard',
    'charging forward on foot down a sloped avenue with the lance lowered and its tip trailing sparks'),
  'orrery-meteorlancer--ascended': s(
    'a muscular young woman in her twenties with a red topknot and pale skin, silver plate armour streaked with fire, a lance whose crystal head burns white',
    'leaping from a high ledge with the lance driven downward, a tail of white fire behind her like a falling star'),
  'orrery-lodestarprior': s(
    'a grave man in his fifties with a shaved head and olive skin, a heavy indigo cowl, a silver pendant holding a pointed crystal that always glows toward the north',
    'leading a column of robed acolytes down a dim cloister by the steady glow of the pendant'),
  'orrery-orreryengine': s(
    'a broad squat machine of brass gears and plated panels with a glass dome on top holding a still model of the heavens',
    'sitting dormant in the corner of a cluttered workshop beneath a sheet of canvas half pulled away'),
  'orrery-orreryengine--ascended': s(
    'a great machine of brass gears and plated panels with a glass dome on top where bright spheres whirl in their orbits',
    'grinding forward across a cobbled square as rings of starlight pulse out from its dome and scatter enemy soldiers'),
  'orrery-gyrewarden': s(
    'a tall slim construct of silver and brass with a slowly turning ring of gears where its chest should be',
    'kneeling beside a fallen soldier on a battlefield of broken glass, its turning ring knitting a cut closed with threads of light'),
  'orrery-eclipseknight': s(
    'a stern warrior in her thirties with close black hair and dark brown skin, armour of black and indigo plates edged in silver, a round shield showing a dark disc ringed with light',
    'holding the line on a bridge at noon as the sun behind her darkens to a glowing ring'),
  'orrery-dormantstartitan': s(
    'a colossal seated giant of dull grey crystal veined with faint silver light, its head bowed and its hands resting on its knees',
    'slumbering in a vast stone hall as acolytes in indigo tend lamps around its feet'),
  'orrery-dormantstartitan--ascended': s(
    'a colossal giant of brilliant cut crystal blazing with white starlight from within, brass bands at its wrists',
    'rising to its full height and tearing through the roof of a stone hall into the open sky'),
  'orrery-celestinebastion': s(
    'a heavy walking tower of pale silver crystal and brass on stout legs, a crystal lens set at its crown',
    'stomping across a ridge at dusk as its crown lens sweeps a beam of light over the clouds above'),
  'orrery-meridianconstruct': s(
    'a tall slender automaton of brass rods and silver wire with a bright crystal disc for a face, its arms ending in long pointing rods',
    'standing in the middle of a sundial courtyard at midday, its long shadow and the shadows of its allies aligned in a single line'),
  'orrery-sleepingconstellation': s(
    'a vast curled serpent woven from pale silver lines joined by dim crystal points, coiled in a loose ring',
    'lying asleep across the floor of a dark planetarium while faint light flickers along its joints'),
  'orrery-sleepingconstellation--ascended': s(
    'a vast winged serpent woven from bright silver lines joined by blazing crystal points, its wings spread wide',
    'uncoiling into the night sky above the city and soaring between the spires in a trail of light'),
  'orrery-starforgetitan': s(
    'a giant smith construct of blackened brass and glowing crystal, a furnace burning white in its chest and a great hammer in one hand',
    'beating a glowing ingot of starlight on a huge anvil in a forge carved into a mountainside'),
  'orrery-zenithseer': s(
    'an ancient woman with long white hair and deep brown skin, a sweeping indigo robe covered in silver points of light, both eyes shining pale silver',
    'floating cross-legged above the highest platform of a spire with her face turned straight up into the sky'),
  'orrery-firstnight': s(
    'an immense brass armillary of countless rings the size of a cathedral, crystal spheres glowing along every ring',
    'turning slowly above a darkened city as its spheres rain cold white light onto the enemy camps below'),

  // ---------- glyphs ----------
  'orrery-firstglimpse': s(
    'a single eye reflected in a curved crystal lens, a point of starlight sparking in its pupil',
    'the lens catching the earliest light over a dark horizon'),
  'orrery-trinelight': s(
    'a pair of crystal prisms aligned on a brass rail with a beam of starlight passing through both',
    'the joined beam splitting into bright colour across an outstretched gauntlet'),
  'orrery-brassshelter': s(
    'a curved wall of interlocking metal plates unfolding like a fan in front of a crouching acolyte',
    'arrows glancing off the plates in a spray of sparks in a narrow alley'),
  'orrery-fallingglint': s(
    'a sliver of white-hot crystal streaking downward with a long silver tail',
    'striking a soldier on a city wall in a burst of cold white light'),
  'orrery-longpatience': s(
    'a pair of weathered hands cupped around a small glass hourglass full of glowing silver sand',
    'the sand trickling slowly as a faint healing glow spreads up the wrists'),
  'orrery-gravitywell': s(
    'a dark sphere of indigo light pulling loose stones and dust into a spiral around itself',
    'an enemy warrior dragged to one knee on a cobbled road, his raised sword bent toward the sphere'),
  'orrery-starreckoning': s(
    'a brass astrolabe held up against the sky with its rings aligned on a bright point of light',
    'the aligned rings glowing as starlight runs along them into the hand that holds them'),
  'orrery-hourofmending': s(
    'a great bronze bell ringing with visible rings of soft silver light',
    'the rings of light washing over a line of tired soldiers on a parapet and closing their wounds'),
  'orrery-cometlance': s(
    'a spear of blazing crystal with a long burning tail hurled across a dark sky',
    'piercing a siege tower and carrying on toward an enemy spire in a streak of fire'),
  'orrery-occultation': s(
    'a black disc sliding across a bright crystal sphere until only a thin ring of light remains',
    'a blazing enemy spell going dark mid-flight above a crowded bridge'),
  'orrery-rainofglassstars': s(
    'a sky full of falling shards of glowing crystal, each trailing a thin silver line',
    'the shards crashing down across an enemy encampment of tents and wagons'),
  'orrery-seekthebrightones': s(
    'a tall brass telescope on a rotating mount aimed at a cluster of especially brilliant points of light',
    'the eyepiece glowing gold as an astronomer leans in to look'),
  'orrery-slowturning': s(
    'a huge horizontal brass wheel set into the floor of a domed hall, revolving slowly under a ring of crystal lamps',
    'robed acolytes walking alongside the wheel as a gentle silver glow rises from its rim over them'),
  'orrery-kindlethecolossus': s(
    'a blazing seed of white starlight held between a pair of brass tongs above a mould of pale crystal',
    'the seed dropped into the mould as giant limbs of light begin to rise from it in a vaulted foundry'),
};
