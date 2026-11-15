// One entry per card (heroes also get '<id>--ascended'). Written by hand, one subject and one scene each.
import type { Subject } from './style';

const s = (subject: string, scene: string): Subject => ({ subject, scene });

export const SUBJECTS: Record<string, Subject> = {
  // ---------------- PRISM ----------------
  'prism-ysolde': s(
    'a broad-shouldered woman of about forty with a grey-streaked black braid and a scarred jaw, in pale gold and white plate armour, a round lens-shield on her left arm and a short mace in her right',
    'bracing the shield against a surge of orange fire on a wide upper terrace stair, rings of gold light rippling over the soldiers behind her'),
  'prism-ysolde--ascended': s(
    'a broad-shouldered woman of about forty with a grey-streaked black braid and a scarred jaw, white-gold light pouring from her eyes, a halo of floating glass shards behind her head, crystal growing through her gold and white pauldrons, a tall tower lens-shield on her left arm',
    'standing unmoved at the top of a terrace stair as a wall of fire breaks on her shield and a shining dome spreads over every soldier below'),
  'prism-oren': s(
    'a very tall, heavy-set bald man with a thick white beard and a broken nose, in thick white plate with gold trim, a door-sized lens-shield in one fist and a brass spotting lens hanging at his chest',
    'planting his boots on a crumbling crystal balcony as bolts strike his shield and splinter away, a glass bridge falling behind him'),
  'prism-oren--ascended': s(
    'a very tall, heavy-set bald man with a thick white beard and a broken nose, veins of white-gold crystal growing through his thick plate, a ring of shards circling his shoulders, a door-sized lens-shield now twice as wide, a brass spotting lens glowing at his chest',
    'rising from one knee on a shattered balcony, a beam of gold light leaping from his shield into the strongest of the attackers below'),
  'prism-glasswarden': s(
    'a young woman guard with short red hair and freckles, a gold-edged white breastplate, and a round glass buckler held low in a gloved fist',
    'keeping the night watch on a lamp-lit crystal stairway, leaning into a cold gust with her cloak streaming sideways'),
  'prism-lampkeeper': s(
    'a stooped grey-haired man in a long white coat with gold buttons, holding a tall pole topped with a glowing lens-lantern',
    'reaching up on tiptoe to trim a flickering street-lens above a quiet terrace at dusk, a soldier resting against the wall below'),
  'prism-facet-initiate': s(
    'a lean young man in his twenties with ink-dark curls, pale robes with gold cuffs and a leather apron, holding a freshly cut crystal in a pair of brass tongs',
    'setting a glowing gem into the shoulder plate of a taller guard in a bright lens workshop, sawdust of glass drifting in the light'),
  'prism-tierguard': s(
    'a stocky man in his thirties with a square jaw, white plate armour and a gold-crested helmet, a tall tower shield of layered glass',
    'holding a narrow archway on an upper terrace, shoulder down, as the light gathers brighter around him and a sword glances off the glass'),
  'prism-bracewright': s(
    'a wiry woman in her thirties with a shaved head and brass-framed goggles pushed up on her brow, light white plate over a grey tunic, a slim lens-bladed rapier',
    'parrying a slash mid-lunge on a glass walkway, cracks in her breastplate knitting closed with threads of gold light'),
  'prism-pane-mender': s(
    'a heavyset woman in her fifties with grey curls, a leather apron over white robes, a satchel of glass panes on her hip and a gold glazing tool in her hand',
    'kneeling in a ruined colonnade, pressing a wounded soldier\'s split armour back together with glowing resin'),
  'prism-crystal-bulwark': s(
    'a squat walking barricade of white crystal slabs joined by brass hinges, a glowing amber core visible in its chest, thick arms ending in flat slab fists',
    'advancing slowly down a terrace ramp that it fills from wall to wall, crystal dust drifting off its shoulders'),
  'prism-chorus-warden': s(
    'a tall man in his forties with a trimmed black beard, gold-trimmed white plate and a long pale blue cape, a pair of tall tuning-fork spears',
    'standing at the head of a rank of soldiers on a wide plaza, his mouth open in a deep call, shards of light echoing above every helmet'),
  'prism-sentinel-lens': s(
    'a floating tripod of white metal holding a huge round lens with a gold iris, a single amber light glowing in its centre',
    'swivelling toward a thief crouched on a rooftop and casting a bright ring of light over an ally on the terrace below'),
  'prism-aegis-colossus': s(
    'a very tall humanoid construct of white crystal plates and gold joints, a wall-sized lens-shield on one arm and a long lance in the other',
    'locked lance to blade with an attacker in a narrow street, sparks flying and glass rain falling off its shoulders'),
  'prism-vault-captain': s(
    'a lean woman in her forties with short silver hair, a gold-plated cuirass and a white cloak, one arm raised with a short bright sword',
    'directing a charge from the top of a huge round bronze door on an upper plaza, the blades of her soldiers glowing gold below her'),
  'prism-spire-keeper': s(
    'a stout man in his fifties with mutton-chop whiskers, heavy white and gold plate, a long hammer with a crystal head',
    'hammering a glowing crack closed at the foot of a great crystal spire, gold sparks leaping with each blow'),
  'prism-lightwall-matron': s(
    'a tall, broad woman in her sixties with white hair in a crown braid, gold and white full plate, a great lens-shield glowing like a sunrise',
    'walking calmly up a terrace stair through a hail of arrows, a company of soldiers sheltering in her glow'),
  'prism-tier-sovereign': s(
    'a huge, broad-framed man in his fifties with a gold-wire beard and a crown of crystal spikes, enormous white plate with gold filigree, a long halberd',
    'striding down the central avenue of the upper tiers as pale shields of light spring up around the soldiers beside him'),
  'prism-hold-the-line': s(
    'a gloved hand pressing a glowing gold plate of light onto a soldier\'s breastplate, layers of white plating unfolding over his chest',
    'at the instant of a charge on a narrow bridge, a row of enemy spears levelled at him from the far side'),
  'prism-mirror-ward': s(
    'a round, polished lens-shield of light floating before a soldier\'s raised palm, bouncing a bolt of orange fire back along its path',
    'above a narrow canal bridge at dusk, the returned flame lighting the water and the underside of the arches'),
  'prism-choir-of-facets': s(
    'a ring of floating crystal shards chiming and glowing gold above a rank of armoured soldiers, hairline cracks in their plates closing',
    'over a vast plaza at dawn, every helmet catching a different colour of light'),
  'prism-patch-the-pane': s(
    'a hand holding a glowing gold seam of molten glass that seals a cracked white armour plate',
    'in close view of a wounded soldier\'s shoulder in a candle-lit infirmary arcade, a nurse\'s steady wrist above'),
  'prism-call-out': s(
    'a raised gauntlet pointing a sword at a rival, a bar of gold light striking a soldier\'s blade and flaring along its edge',
    'in a duelling ring of cut glass tiles, a crowd of dark silhouettes watching from tiered seats'),
  'prism-lightwall-oath': s(
    'a kneeling soldier with a fist pressed to his chest, white-gold plating growing over his armour as a pillar of light falls on him',
    'in a vaulted crystal chapel at dawn, long shadows of columns across the floor'),
  'prism-spire-mantle': s(
    'a cloak of gold light unfolding over the whole peak of a white crystal spire while a row of soldiers at its base raise round shields',
    'seen from the foot of the spire in a steep low angle, mist and rim light around the glowing facets'),
  'prism-tier-rally': s(
    'a row of soldiers raising white spears together, gold light running up every blade to the points',
    'on a high terrace at the moment before a march, their cloaks snapping in the wind over the city below'),
  'prism-crystal-dawn': s(
    'a flood of gold sunrise rushing through a city of pale crystal, every soldier\'s armour restored and glowing, a cracked spire mending itself',
    'wide view from the top terrace as the first dawn strikes the spires and soldiers rise to their feet'),

  // ---------------- EMBER ----------------
  'ember-kessa': s(
    'a lean woman in her thirties with short black hair singed at the tips, a soot-dark leather coat, copper goggles on her forehead, a brass arc-gun with a glowing orange coil',
    'firing a bolt across a foundry catwalk, sparks showering down from a glowing furnace mouth behind her'),
  'ember-kessa--ascended': s(
    'a lean woman in her thirties with short black hair singed at the tips, soot-dark leather coat now veined with white-orange lightning, copper goggles on her forehead, a long brass arc-lance with crystal coils, her hair lifting in the heat',
    'stepping out of a burst of arcs in a roaring foundry hall, a line of enemy machines glowing white-hot ahead of her'),
  'ember-crucible': s(
    'a huge barrel-bodied brass furnace-machine with riveted plates, an orange glow in a grate on its chest, a pair of thick piston arms and a tall funnel chimney',
    'tipping a stream of liquid metal into a mould in a vast foundry hall, small brass machines tumbling out of the mould'),
  'ember-crucible--ascended': s(
    'a huge barrel-bodied brass furnace-machine, now white-hot with crystal chimneys, extra plating on a larger body, liquid gold running through cracks and a pair of crystal-tipped drill arms',
    'rearing up in the middle of a foundry hall, drills spinning, a row of small slag machines marching from its open grate'),
  'ember-sparkbot': s(
    'a small brass clockwork walker with a round glass head glowing orange, thin jointed legs and a wind-up key on its back',
    'scurrying across a foundry floor trailing sparks toward a cracked door'),
  'ember-slagling': s(
    'a squat black iron and brass walking bomb with a glowing orange belly of liquid slag and a pair of blunt arms',
    'charging through a steam vent, molten drips hissing on the stone behind it'),
  'ember-cinderscamp': s(
    'a wiry, short woman engineer in her twenties in soot-dark overalls, a face smudged with ash, a small brass wind-up machine held in her hands',
    'winding the key of the little machine at a cluttered workbench, sparks leaping from its ears'),
  'ember-kilnhand': s(
    'a stocky bare-armed man in his twenties with blackened forearms and a leather apron, a wooden hod of red bricks on his shoulder',
    'slamming a hammer onto a stack of bricks that bursts into glowing fragments in a dim kiln yard'),
  'ember-ashrunner': s(
    'a lean sprinter in a soot-dark leather jerkin with bandaged shins and a smouldering brass torch held forward',
    'sprinting along a narrow pipe above a furnace pit, a trail of embers streaming behind'),
  'ember-slagsmith': s(
    'a muscular bald man in his forties with a scarred scalp, a leather apron and a long-handled ladle brimming with glowing slag',
    'flinging a spray of orange slag across a foundry aisle at an enemy machine, his boots braced wide'),
  'ember-sparkforge': s(
    'a waist-high brass forge-engine with an anvil top, a glass window showing orange fire, pipes and bellows, two short legs',
    'hammering out a small brass machine with every pulse, sparks leaping in a dim foundry alcove'),
  'ember-fuseguard': s(
    'a wiry man in sooty guard leather with a brass helmet, a bandolier of coiled fuse-wire and a pair of lit charges in his fists',
    'crouched behind a stack of pipes, grinning as a lit fuse sparks along the floor'),
  'ember-furnacebrute': s(
    'a huge, broad construct of black iron plates with an open grate in its chest burning orange and a pair of hammer fists',
    'smashing through a brick wall as flames roar out of its torso and bricks fly in all directions'),
  'ember-arcwelder': s(
    'a woman in her thirties with braided hair, a dark welding mask lowered over her face, a heavy leather glove and a brass arc-torch throwing blue-white light',
    'cutting a bolt of white arc-light across a rail yard into an enemy gantry, sparks raining on her shoulders'),
  'ember-furnacetender': s(
    'a heavy-set woman in her fifties with grey hair under a leather cap, thick gloves and a long iron rake',
    'raking glowing slag out of a roaring iron oven door while a small slag machine crawls from the heap'),
  'ember-blastminer': s(
    'a broad man in his forties with a brass hard hat and a bandolier of charges, a pickaxe in one hand and a lantern in the other',
    'setting a charge into the wall of a deep mine tunnel and sprinting back as the rock glows red'),
  'ember-pyrelancer': s(
    'a lean soldier in soot-dark armour with a brass helmet, a long lance with a blazing orange head',
    'charging down a rail yard at full stride and driving the burning lance tip into an enemy gate'),
  'ember-moltenwarden': s(
    'a very tall armoured construct of black iron and brass with orange glowing joints, a broad blank helm, one arm ending in a long gun barrel',
    'firing a burning orange bolt from a gantry over a furnace pit, the barrel smoking in the dark'),
  'ember-crucibleherald': s(
    'a heavyset man in his fifties in soot-dark ceremonial leather, a long coat singed at the hem, a tall brass horn at his lips',
    'blowing the horn above a foundry pit as a crowd of small slag machines pours out of the floor grates'),
  'ember-foundrytitan': s(
    'a gigantic walking furnace-machine of black iron and brass towering over rooftops, an orange glow in its chest, pistons as thick as columns, a huge drill for one arm',
    'stepping through a burning rail yard, crushing a gantry under one foot while sparks pour off its shoulders'),
  'ember-overdrive': s(
    'a brass gauntlet turning a red-hot valve wheel, the pistons on an ally\'s arm racing and orange light surging along them',
    'in close view of a lever pulled to the end of its track in a dim workshop'),
  'ember-pinprick': s(
    'a single needle of orange light flicking from a fingertip toward a distant target',
    'across a dark canal, a tiny bright spark striking a steel hatch on the far quay'),
  'ember-ventburst': s(
    'a pressure vent bursting open in a street, a jet of orange fire and steam throwing a brass machine into the air',
    'in an alley of brick walls and brass pipes, window glass cracking in the blast'),
  'ember-slagbolt': s(
    'a thrown ladle-load of liquid orange slag arcing through the air toward an enemy machine, droplets trailing behind',
    'above a street of foundry roofs in the dusk, the glow reflected in a row of wet windows'),
  'ember-scrapburst': s(
    'a brass construct bursting apart, its core overloading into an orange fireball that sends a jet of shards upward',
    'beneath the base of a crystal spire, plates and cogs raining down on the paving'),
  'ember-heatlance': s(
    'a single white-hot orange beam from a brass lens-cannon on a roof, thin as a rod and bright as a welding arc',
    'boring across a plaza toward a crystal tower, the air shimmering along its path'),
  'ember-cinderhail': s(
    'a rain of glowing orange embers and clumps of hot ash falling over a rank of enemy soldiers who raise their shields',
    'over a wide square of crystal tiles, glass awnings cracking under the weight'),
  'ember-sparkcascade': s(
    'a tumbling flood of small glowing brass machines spilling from a hatch, their orange eyes lighting up one after another',
    'down a long iron stair at night, a trail of sparks bouncing off every step'),
  'ember-firestorm': s(
    'a roaring wall of orange fire thrown by a ring of brass funnels on a roof, sweeping down a whole street',
    'wide view of a district at dusk, the crystal spires lit amber and enemy machines crumpling'),

  // ---------------- TIDE ----------------
  'tide-maren': s(
    'a slender woman in her forties with long silver-white hair and brown skin, deep blue robes with glass beads along the hem, a sphere of water cupped in one hand',
    'standing on a lock gate at dusk, a spiral of canal water rising around her wrist and glowing with each gesture'),
  'tide-maren--ascended': s(
    'a slender woman in her forties with long silver-white hair and brown skin, her hair floating, a ring of glass shards around her head, deep blue robes with glass beads rippling with white light, a wave of water curling above her palm like a bow',
    'standing high on a lock gate as a great curl of canal water rises behind her and every lantern on the canal flares'),
  'tide-ilvane': s(
    'an elderly man with a long white beard and shaved head, a deep blue robe with a high collar, a glass staff holding a frozen drop of water',
    'stopping a canal wave mid-crest with a raised palm, the water around him turning to glass'),
  'tide-ilvane--ascended': s(
    'an elderly man with a long white beard and shaved head, pale white eyes, a deep blue robe edged with frost crystals and a high collar, a taller glass staff holding a ring of ice around a frozen drop of water',
    'standing in the middle of a stilled canal city, every boat, wave and falling droplet locked in clear ice around him'),
  'tide-sluicepage': s(
    'a slim man in his twenties with ink-stained fingers, a satchel and a blue apprentice coat, holding a small glass flask',
    'dipping the flask into a canal at a lock gate and watching a bright thought-light rise from it'),
  'tide-ripplescribe': s(
    'a woman in her twenties with a long braid, a blue robe, a glass stylus drawing in the air, her ink forming droplets of water',
    'sitting on a canal wall as concentric rings spread from the stylus tip across the dark water'),
  'tide-mirroreel': s(
    'a long silver eel with glassy scales as bright as polished steel and a pair of luminous blue fins',
    'coiling around the post of a lock gate, its stare freezing a passing boat engine in a film of ice'),
  'tide-wardtender': s(
    'a broad-chested old woman with white braids, a blue robe and a thick glass breastplate',
    'standing in a shallow canal with her arms wide as a dome of water curves over a small boat behind her'),
  'tide-eddycourier': s(
    'a lean man in his thirties in a short blue cloak with a glass satchel and wet boots',
    'stepping into a swirl of canal water and vanishing, a soldier pulled along by the wrist behind him'),
  'tide-driftseer': s(
    'a thin woman in her sixties with milky white eyes and a blue hooded cloak, a glass bowl of still water in both hands',
    'reading the bowl\'s reflection of stars on a quiet canal balcony, a single leaf turning on the water'),
  'tide-lockkeeper': s(
    'a barrel-chested man in his forties with a thick black beard, an oilskin coat and a huge brass crank in both fists',
    'turning the crank of a canal gate as water pours through and pushes a small barge back'),
  'tide-hushwateradept': s(
    'a young woman in a hooded pale blue robe, a finger raised to her lips, a thin glass wand in the other hand',
    'gliding along a canal at night while the water around an enemy freezes in a silent circle'),
  'tide-glassarchivist': s(
    'a gaunt man in his fifties with round glass spectacles and ink-blue robes, carrying a stack of thin glass tablets',
    'pulling a glowing tablet from a high shelf in a flooded library hall, water up to his knees'),
  'tide-stillwaterbailiff': s(
    'a tall stern man in his forties with a shaved head, blue half-armour with glass pauldrons, a long glass mace',
    'striking a canal surface with the mace so a ring of ice races out and holds an enemy fast beside a bridge'),
  'tide-pearlsentinel': s(
    'a tall construct of blue glass and white coral with a round white orb glowing in its chest, a crystal spear and shield',
    'standing in a canal channel with water flowing around its legs, a dome of blue light over the barges behind'),
  'tide-deepwateroracle': s(
    'a large woman in her fifties with silver rings in her hair, a deep blue robe flowing into the water around her, glowing white eyes',
    'waist-deep in a canal basin as ribbons of light spiral up out of the water around her'),
  'tide-frostmeremagistrate': s(
    'a stern tall man in his sixties with a high crystal collar, a heavy blue robe edged with frost, a glass staff with a hammer head',
    'pointing two fingers at a pair of enemy soldiers on a courthouse stair as frost locks them into blocks of ice'),
  'tide-gateleviathan': s(
    'a vast whale-like sea beast with deep blue skin, glass plating along its back and a long jaw',
    'surging out of a harbour basin and flooding a whole quay, pushing enemy ships backward as water cascades from its flanks'),
  'tide-slipunder': s(
    'a mage dissolving into a canal in a swirl of blue water, one hand reaching back out toward a friend',
    'at the stone edge of a quiet canal at dusk, ripples closing over the spot'),
  'tide-heldbreath': s(
    'a canal wave frozen mid-curl, glassy and glowing blue, a boat stuck on its crest',
    'on a wide canal at the blue hour, a single white droplet hanging in the air beside it'),
  'tide-tidalveil': s(
    'a sheet of rippling water standing upright before a raised hand, curved like a curtain',
    'shielding a small boat from a bolt of fire on a dark canal, steam hissing off the surface'),
  'tide-quickcurrent': s(
    'a bright ribbon of water jumping out of a canal into a raised hand with a flash of light',
    'on a stone bridge at dusk, ripples spreading outward below'),
  'tide-unwrite': s(
    'a hand closing around a glowing line of orange light in the air and snuffing it into a drop of water',
    'in a hushed arcade of blue glass columns, pale mist at the floor'),
  'tide-backwash': s(
    'a wave of canal water sweeping an armoured soldier backward off a quay, his helmet spinning in the air',
    'at the edge of a stone quay, spray flashing in the lantern light'),
  'tide-sluiceclose': s(
    'a pair of huge brass lock gates swinging together, trapping two armoured soldiers in rising blue-white ice',
    'in a narrow canal between tall crystal walls, water boiling at the gates'),
  'tide-deepstudy': s(
    'a heap of glowing blue glass tablets floating around a seated reader, streams of light flowing into his forehead',
    'in a high moonlit tower room with wide windows over the canals'),
  'tide-floodtide': s(
    'a vast wall of blue water rolling down a street and freezing into glassy crests as it passes',
    'over a whole district of crystal rooftops at the blue hour, boats riding the crests'),

  // ---------------- COIL ----------------
  'coil-aruvi': s(
    'a tall dark-skinned woman in her fifties with long locs threaded with green vines, a bark-plate cuirass and a long staff topped with a glowing seed-crystal',
    'walking along a rooftop garden bridge with a huge bark-plated beast kneeling beside her'),
  'coil-aruvi--ascended': s(
    'a tall dark-skinned woman in her fifties with long locs threaded with green vines, a crown of green crystal antlers grown from her locs, a bark-plate cuirass glowing green-gold, a long staff topped with a blazing seed-crystal',
    'raising the staff on a rooftop as a whole machine tower is swallowed by roaring green growth and her beasts rise around her'),
  'coil-brakk': s(
    'a huge, hulking tusked boar with bark-plated shoulders, green crystal spines running down its back, one scarred cracked tusk and a brass coil collar',
    'charging down an overgrown rail trench, snapping a rusted machine in two'),
  'coil-brakk--ascended': s(
    'a huge, hulking tusked boar with a scarred cracked tusk and a brass coil collar, now larger, a double row of bark plates, green-white crystal spines glowing, both tusks sheathed in crystal, glowing green veins across its flanks',
    'rearing on its hind legs at the top of a ruined viaduct, roaring as a cloud of leaves explodes around it'),
  'coil-sprout-tender': s(
    'a young woman in her twenties in a patched green apron, soil on her knees, holding a copper watering can',
    'watering a seedling that pushes out of the cracked casing of an old machine on a rooftop garden'),
  'coil-thornback-cub': s(
    'a young bear with a bark-plated back, small green crystal nubs along its spine and mossy ears',
    'sniffing a flowering vine growing from a brass pipe on a garden terrace, a scratch on its flank closing with moss'),
  'coil-rootling': s(
    'a small machine of copper pipes with root-like legs and a glass bulb filled with glowing green liquid',
    'sinking its roots into cracked pavement as a green glow rises along a pipe into the bulb'),
  'coil-spearhorn': s(
    'a long-legged antelope with a single straight crystal horn, bark-brown flanks and green moss on its shoulders',
    'leaping across a gap between two garden rooftops with its horn lowered, leaves flying behind'),
  'coil-vinewhip': s(
    'a lean spotted wildcat with green vine tendrils for whiskers and a crystal-studded tail',
    'springing from a hanging garden onto a rusted machine, vines lashing around it'),
  'coil-sap-engine': s(
    'a copper and brass tank-machine with glass tubes of glowing green sap, a pair of wheels and a pump arm',
    'pumping sap into a trough in a rooftop greenhouse, steam rising from its valves'),
  'coil-crownmaw': s(
    'a tall grey wolf with curved crystal horns on its brow, a bark-plated jaw and green eyes',
    'howling from a rooftop ridge as a pack of smaller beasts gathers behind it in the wind'),
  'coil-bloomcaller': s(
    'a thin woman in her thirties with flowers in her hair, a green hooded cloak, one hand outstretched with gold pollen glowing in the palm',
    'walking among a row of overgrown machines as buds open on every one of them'),
  'coil-lashvine': s(
    'a broad ape with arms of braided green vines, bark armour on its shoulders and a heavy jaw',
    'swinging from a thick vine across a rail trench and whipping a second vine at an enemy'),
  'coil-tuskhide': s(
    'a huge buffalo-like bull with a hide of overlapping bark plates and long crystal tusks',
    'charging along a canopy bridge, planks cracking under its hooves, leaves flying'),
  'coil-spore-herald': s(
    'a stocky man in his forties in a wide mushroom-cap hat and a green coat, a copper censer on a chain trailing glowing green pollen',
    'swinging the censer on a rooftop garden ledge as glowing motes drift over a group of beasts'),
  'coil-canopy-titan': s(
    'a giant ape as big as a house, bark and moss plating over its shoulders, glowing green crystal in its chest, a small tree growing from its back',
    'standing up in a rooftop forest with branches in its fists, snapping a steel girder in two'),
  'coil-behemoth': s(
    'a huge walking boiler-machine on thick legs of iron, trees growing through its plates, glowing green roots wrapped around its limbs, a heavy ram at the front',
    'smashing an enemy gate with its ram, roots tearing up the street behind it'),
  'coil-domewyrm': s(
    'a gigantic serpent as long as a street, its back covered by a dome of green-glass crystal plates and bark, a ring of leaves around its head',
    'coiling around a crystal dome atop a hill, jaws wide, rooftop gardens trembling'),
  'coil-sap-surge': s(
    'a copper tube bursting with bright green glowing sap that floods into a glass tank',
    'in close view of a rooftop greenhouse at dusk, green light spilling over the plants'),
  'coil-bristle': s(
    'bark spines erupting along the back of a boar, rows of crystal quills shooting out',
    'mid-roar on an overgrown gantry, leaves bursting off the rails'),
  'coil-overgrowth': s(
    'thick vines and bark armour bursting out over a soldier\'s body, crystal thorns growing from his fists',
    'in the middle of a stone square, the paving cracking around his boots'),
  'coil-duel-of-thorns': s(
    'a bear-like beast and a steel-armoured machine locked jaw to blade, vines flailing between them',
    'on a broken rail trestle with the crystal city glowing far below'),
  'coil-lash-out': s(
    'a thick green vine whipping out and wrapping an enemy\'s blade arm',
    'from a bushy rooftop garden toward a walkway, leaves scattering in the air'),
  'coil-grafting': s(
    'a hand pressing a glowing green seedling onto a wound on an animal\'s flank, bark growing over it',
    'in a lantern-lit greenhouse, mist and gold dust floating in the light'),
  'coil-canopy-rampage': s(
    'a herd of large bark-plated beasts charging together, roots tearing up the street',
    'down a boulevard between crystal towers, a cloud of leaves in their wake'),
  'coil-hothouse-bloom': s(
    'a glass greenhouse dome bursting with huge glowing flowers on crystal stems',
    'on a rooftop at the blue hour, steam rising from the vents'),
  'coil-verdant-surge': s(
    'a green-gold tide of leaves and vines rising over a whole line of beasts and soldiers, their armour sprouting crystal',
    'across a wide roof garden with towers rising behind'),

  // ---------------- UNDER ----------------
  'under-sable': s(
    'a slim woman in her thirties with a black bob and pale skin, a violet-black coat with a high collar, a half mask of black glass and fingers wrapped in fuse wire',
    'crouching on a cable bridge high in a tunnel, a violet spark in her palm and a rat on her shoulder'),
  'under-sable--ascended': s(
    'a slim woman in her thirties with a black bob and pale skin, a half mask of black glass, white-violet lightning wreathing her, a long cloak of braided cables, a crown of fuses',
    'rising above a tunnel junction with a pair of rats at her feet as every cable around her arcs and sparks'),
  'under-vex': s(
    'a gaunt tall man in his fifties with a bald head covered in thin scars, round dark spectacles, a long leather apron over violet-black clothes, a brass harness of glass tubes on his chest',
    'bent over a glowing violet vat in an undercity laboratory, hoses draining a pale light into his harness'),
  'under-vex--ascended': s(
    'a gaunt tall man in his fifties with a bald head covered in thin scars, round dark spectacles, a long leather apron over violet-black clothes, a violet heart-lamp blazing in his chest, cables writhing from his back',
    'standing amid a ring of dead lamps in a vaulted cistern, violet current crawling up his arms'),
  'under-wirerat': s(
    'a large black rat with a violet-glowing cable for a tail and a fuse in its teeth',
    'running along a pipe in a sewer tunnel, sparks dropping behind it'),
  'under-fuserunner': s(
    'a lean man in his twenties in black cloth with a violet hood and a mask, a reel of fuse cord on his belt',
    'sprinting through a drain tunnel laying a hissing fuse behind him'),
  'under-leechtick': s(
    'a fat, dog-sized violet insect with a glass belly full of glowing violet blood and thin jointed legs',
    'clamped onto a fat cable in a tunnel, swelling and glowing'),
  'under-burnoutrunner': s(
    'a wiry man in a scorched black jacket with smoking sleeves, a cracked half mask, a glowing violet fuse in his fist',
    'leaping across a gap between pipes as fuse sparks climb his arm'),
  'under-ratwrangler': s(
    'a thick-set woman in her forties in a leather coat with many pockets, a mask pushed up on her forehead, a pair of rats on her shoulders',
    'whistling in a dark tunnel as a stream of rats pours out of a drain pipe'),
  'under-pitaccountant': s(
    'a thin man in his sixties with a black waistcoat, a violet eyeshade, a brass abacus and an ink-stained cane',
    'sliding abacus beads beneath a dangling lantern in a dim arcade while a machine behind him sparks'),
  'under-acidlamplighter': s(
    'a hunched woman in her fifties in a long black coat and a goggled mask, a long pole with a dripping green-violet lamp',
    'spilling glowing acid on an iron gate that fizzes in a dripping tunnel'),
  'under-furnacehand': s(
    'a big, heavy man in his thirties with a shaved head, scorched black leather, orange-lit eyes behind a mask and a huge iron hook',
    'hauling a crate toward an orange-lit iron door in an undercity boiler room'),
  'under-backalleyenforcer': s(
    'a broad man in his thirties in a violet-black longcoat, a half mask, brass knuckles and a coiled cable whip',
    'stepping out of a dark alley between two glowing pipes, a lamp throwing his long shadow ahead'),
  'under-leechwiresurgeon': s(
    'a precise woman in her forties in a white and violet coat, a glass visor and long thin wire-tipped tools',
    'drawing a glowing violet thread of light out of an enemy soldier\'s chest with a clamp'),
  'under-vaultpawnbroker': s(
    'a stout man in his sixties with grey side-whiskers, a monocle of violet glass, a rich black coat with a gold watch chain',
    'weighing a small glowing gem on a brass scale across a counter in a cramped lamp-lit shop'),
  'under-powdercourier': s(
    'a lean woman in her twenties in a patched black coat with a satchel of small barrels, a mask and a lit match',
    'crouched at a tunnel mouth, striking the match against a pipe as a fuse hisses'),
  'under-syndicatebroker': s(
    'a plump man in his forties in a violet silk waistcoat, gold rings, a mask pushed up on his forehead, rats peeking from his sleeves',
    'leaning back on a stack of crates in a tunnel bazaar as rats spill out of a trunk'),
  'under-leechoverseer': s(
    'a very tall, heavily built man in his fifties in a black and violet armoured coat, a pair of glowing cables from his back plugged into a rack',
    'walking a gantry above a pit of workers, hauling a cable into a socket as violet light flares'),
  'under-mainlinedynamo': s(
    'a huge violet-black machine of cables and coils on thick legs, a grille of violet lightning where its face would be',
    'bursting out of a tunnel wall with cables whipping, sparks across the whole pit'),
  'under-pullplug': s(
    'a hand yanking a giant plug out of a socket in a wall, arcs of violet lightning flaring as a machine dies',
    'in close view of an undercity switch room, dials dropping to dark'),
  'under-siphontap': s(
    'a brass tap hammered into an enemy\'s armour, glowing violet fluid pouring into a glass jar',
    'in a dim cellar with drips and low lamplight'),
  'under-acidbath': s(
    'an armoured fist dipped into a vat of fizzing green-violet liquid, steam rising from the metal',
    'over a cracked stone vat in a tunnel, pipes dripping around it'),
  'under-burnledger': s(
    'a heap of old papers and a worn coat burning in a violet fire, a hand pulling a glowing coin purse from the flames',
    'in an alley bin at night, sparks rising into the dark'),
  'under-snuffedfuse': s(
    'a burning fuse cord pinched out between a gloved thumb and finger, a thin curl of violet smoke rising',
    'in close view of a tunnel floor beside a pile of powder kegs'),
  'under-bleeddry': s(
    'a soldier\'s armour cracking dry as violet light drains out through cables into a glass jar',
    'in a dark cellar room, a single lamp swinging overhead'),
  'under-chainoverload': s(
    'a row of enemy machines joined by cables, each bursting in a violet spark one after another',
    'along a long tunnel, lamps winking out one by one'),
  'under-wiremarket': s(
    'a crowd of black rats heaped around a cluttered tunnel stall hung with cables and lamps',
    'in a violet-lit bazaar inside a drain cavern, steam from grates'),
  'under-leechharvest': s(
    'a violet glowing arc of current flowing along a row of cables from broken machines toward a great glass jar',
    'in a pit of wrecked machines, smoke curling under the lamps'),

  // ---------------- STORM ----------------
  'storm-jax': s(
    'a lean young man in his twenties with windswept sandy hair and a lightning scar on his cheek, teal and silver flight leathers, goggles on his brow, a silver wing strapped across his back, a short rail hook',
    'diving off a spire tip with arms wide, the silver wing catching the wind above a canyon of towers'),
  'storm-jax--ascended': s(
    'a lean young man in his twenties with windswept sandy hair and a lightning scar on his cheek, goggles on his brow, white-teal arcs crawling over his arms, a much larger silver wing crackling with storm light, a long rail-hook lance',
    'bursting out of a dark thundercloud above the skyline, the great wing spread wide and lightning branching behind him'),
  'storm-corvane': s(
    'a heavy-built man in his fifties with a grey crew-cut and a trimmed white goatee, a long teal coat with silver epaulettes, a brass spyglass and a curved sabre',
    'standing at the prow of an airship deck high above the clouds, pointing the sabre forward as gliders break away beside him'),
  'storm-corvane--ascended': s(
    'a heavy-built man in his fifties with a grey crew-cut and a trimmed white goatee, a huge silver feathered cloak spread like wings, white-teal lightning along his curved sabre, a crown of wind around his head',
    'hovering above a spiral of gale cloud with a pair of gliders sweeping out at his sides, the city glittering far below'),
  'storm-wingmate': s(
    'a lean woman in her twenties in teal flight gear with a braided ponytail, goggles, and a slim silver glider wing',
    'banking hard past a crystal spire, cloud streaming off her wingtips'),
  'storm-signalkite': s(
    'a large silver-framed kite with teal cloth wings, a glowing lamp at its centre and a long tail of ribbons',
    'hovering over a rooftop at dusk, flashing its lamp toward others far away'),
  'storm-tickettaker': s(
    'a stern man in his forties in a teal rail uniform and a conductor\'s cap, a punch-tool in his fist and a satchel at his hip',
    'leaping from a moving rail car onto a rooftop with the punch-tool raised'),
  'storm-flagbearer': s(
    'a strong woman in her thirties in teal flight armour, holding a tall silver pole carrying a snapping teal pennant',
    'charging along a rail line at the head of a squad, the pennant streaming behind her'),
  'storm-railglider': s(
    'a lean man in his twenties on a pair of silver rail-skates beneath a sail-wing of teal cloth',
    'grinding along a rail between towers with sparks flying, wing spread against the sky'),
  'storm-gustcaller': s(
    'a calm woman in her fifties in a teal robe with white hair whipping in the wind, a silver wind-chime staff',
    'raising the staff on a rooftop as a spiral of wind lifts leaves and cloaks around her allies'),
  'storm-dispatcher': s(
    'a stocky man in his forties in a teal uniform with a brass whistle at his lips and a signal lamp in his hand',
    'leaning from a rail platform, throwing the lamp\'s beam over a soldier who lifts into the air'),
  'storm-galecourier': s(
    'a lean woman in her thirties with a short red crop, teal and silver leathers and a long slim silver wing',
    'streaking past a spire, a white wake of wind scraping the crystal tip'),
  'storm-sparkrider': s(
    'a grinning young man in his twenties with a shaved head, teal armour, riding a low silver rail-sled that throws orange sparks',
    'racing along a rail across a viaduct, sparks streaming behind him'),
  'storm-squadcaller': s(
    'a wiry woman in her forties with a whistle and a brass megaphone, a teal flight jacket',
    'waving a signal paddle from a roof edge as a glider launches off the ledge behind her'),
  'storm-railmarshal': s(
    'a big man in his fifties in a teal long coat with silver rail-spike shoulder plates and a heavy rail hook',
    'standing on top of a moving rail car, directing two squads of riders with sweeping arms'),
  'storm-thunderkite': s(
    'a giant armoured kite with silver ribs, a teal hull and a glowing storm-core, a rider hanging below it',
    'slicing through a dark thundercloud above a skyline, lightning branching around it'),
  'storm-stormcaller': s(
    'a tall woman in her forties with long grey braids, a silver breastplate, a long teal storm-cloak and a lightning-forked staff',
    'standing on the highest ledge of a spire as a roll of dark cloud gathers above her'),
  'storm-cyclonebarge': s(
    'a huge flat-bottomed flying ship of silver plates with a pair of massive wind turbines and teal sails',
    'drifting over the crystal city at dusk, small gliders launching from its deck'),
  'storm-tempestliner': s(
    'a colossal silver and teal flying train, a long streamlined locomotive with a pair of giant wings and a glowing storm-core',
    'tearing across a line of towers above the clouds, a trail of lightning behind it'),
  'storm-tailwind': s(
    'a gust of wind made visible as silver-teal ribbons lifting a soldier\'s cloak and boots',
    'on a high rooftop at dusk as he sprints toward the edge'),
  'storm-updraft': s(
    'a column of rising air with leaves and sparks carrying a glider pilot upward',
    'up the face of a glass tower in a steep low angle'),
  'storm-crosswind': s(
    'a sideways blast of wind freezing a soldier mid-step, ice crystals hanging in the air',
    'on a narrow ledge with cloak and pennants stretched flat in the gale'),
  'storm-galesurge': s(
    'a huge spiral of teal wind sweeping through a squad\'s cloaks, every soldier leaning forward',
    'on a long viaduct with sparks and leaves flying past'),
  'storm-reroute': s(
    'a gloved hand pulling a big brass rail switch lever, a sparking rail track swinging to a new line',
    'at a rail junction high above the city, wind tugging at the sleeve'),
  'storm-skyhook': s(
    'a large silver hook on a long cable snagging an enemy glider wing and yanking it downward',
    'against the dusk sky between two spires, the cable taut and shining'),
  'storm-jetstream': s(
    'a river of fast white air ribboning through the city sky, carrying a row of gliders that glow teal',
    'high above the spires at sunset, the clouds torn into long streaks'),
  'storm-airmail': s(
    'a satchel bursting open, a flurry of glowing teal paper messages whirling around a flying courier',
    'from rooftop to rooftop, a spiral of wind carrying them upward'),
  'storm-skyraid': s(
    'a squad of gliders diving in a V formation toward a spire, silver wings flashing',
    'out of a bank of cloud at dusk, a pennant streaming from the lead wing'),
};

const GEM =
  'crisp digital illustration, flat cel shading with hard-edged faceted highlights, clean confident linework, ' +
  'a single large cut gem centred in the frame on a plain dark indigo background, luminous glow from within, deep indigo shadows, wordless and unlettered, full-bleed';

/** Non-card plates: full prompts (the style words are included by hand, and linted the same way). */
export const EXTRA: Record<string, { prompt: string; aspect: '3:2' | '2:3' }> = {
  'crest-prism': { aspect: '3:2', prompt: `a pale gold and white cut gem with a simple round lens silhouette glowing inside it, ${GEM}` },
  'crest-ember': { aspect: '3:2', prompt: `an orange and soot-black cut gem with a simple anvil and flame silhouette glowing inside it, ${GEM}` },
  'crest-tide': { aspect: '3:2', prompt: `a deep blue cut gem with a simple curling wave silhouette glowing inside it, ${GEM}` },
  'crest-coil': { aspect: '3:2', prompt: `a green cut gem with a simple coiled vine and leaf silhouette glowing inside it, ${GEM}` },
  'crest-under': { aspect: '3:2', prompt: `a violet and black cut gem with a simple lit fuse and cable knot silhouette glowing inside it, ${GEM}` },
  'crest-storm': { aspect: '3:2', prompt: `a teal and silver cut gem with a simple spread wing and lightning bolt silhouette glowing inside it, ${GEM}` },
  cardback: {
    aspect: '2:3',
    prompt: 'a perfectly symmetrical pattern of interlocking faceted crystals in indigo and cyan, a central starburst of cut facets with mirrored rows of smaller gems around it, crisp digital illustration, flat cel shading with hard-edged faceted highlights, luminous cyan rim light, deep indigo shadows, wordless and unlettered, full-bleed',
  },
  'title-skyline': {
    aspect: '3:2',
    prompt: 'wide establishing view of a city of pale cut crystal spires at the blue hour, a very tall central spire glowing cyan and amber above terraces, glass bridges and canals reflecting the sky, small airships drifting in the distance, crisp digital illustration, flat cel shading with hard-edged faceted highlights, clean confident linework, deep indigo shadows, wordless and unlettered, full-bleed',
  },
  'board-backdrop': {
    aspect: '3:2',
    prompt: 'a calm, dark, low-contrast top-down view of a plaza of cut glass tiles in deep indigo with faint cyan conduits running between them, an open central area, soft even light, crisp digital illustration, flat cel shading with subtle faceted highlights, wordless and unlettered, full-bleed',
  },
};
