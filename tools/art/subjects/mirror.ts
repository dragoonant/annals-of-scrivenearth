// Art subjects for the mirror cards: one subject and one scene each, written by hand (heroes also get '<id>--ascended').
// The Mirror Quarter's look: rose and silver mirrored glass, polished panes and quicksilver light.
import { s, type Subjects } from './shared';

export const mirror: Subjects = {
  // ---------- heroes ----------
  'mirror-sabeline': s(
    'a lean woman in her thirties with a sharp black bob and olive skin, a rose-silver mirrored half-mask over one eye, a fitted charcoal coat lined with small mirror tiles',
    'reaching from a doorway of rose glass to lift a glowing reflection of a soldier off a polished street like a sheet of silk'),
  'mirror-sabeline--ascended': s(
    'a lean woman in her thirties with a sharp black bob and olive skin, a full rose-silver mirrored mask, a long charcoal coat whose mirror tiles each hold a different stolen face',
    'standing in a plaza of rose glass as reflected soldiers peel away from the panes and fall into line behind her'),
  'mirror-ottavine': s(
    'a tall woman in her fifties with grey curls pinned high and dark brown skin, a rose silk robe with silver mirror beads, a hand mirror of pink glass raised before her lips',
    'speaking into the hand mirror on a balcony at dawn while a bright spark of light leaps out of the glass'),
  'mirror-ottavine--ascended': s(
    'a tall woman in her fifties with grey curls floating loose and dark brown skin, a rose silk robe threaded with silver light, a pair of pink glass hand mirrors orbiting her shoulders',
    'chanting on a high terrace as every window of the quarter answers her voice with a spark of its own'),
  'mirror-wystan': s(
    'a wiry man in his forties with a close grey beard and pale skin, a dark hooded cloak of matte silver scales, a slim smoked-glass dagger at his hip',
    'stepping out of a tall street mirror into an alley behind an enemy watchtower, half his body still inside the glass'),
  'mirror-wystan--ascended': s(
    'a wiry man in his forties with a close grey beard and pale skin, a long cloak of rippling quicksilver that blurs at the edges, a smoked-glass dagger in each hand',
    'walking through the open gate of an enemy fortress at night while the guards stare past him into their own reflections'),
  'mirror-ondrine': s(
    'a broad-shouldered woman in her twenties with a shaved head and freckled pale skin, a glassblower apron over a rose tunic, a round convex shield of polished silver glass',
    'catching a bolt of enemy fire on the shield in a glass workshop as the light bends back toward its caster'),
  'mirror-ondrine--ascended': s(
    'a broad-shouldered woman in her twenties with a shaved head and freckled pale skin, armour of rose-silver mirrored plates, a great concave shield of molten silver glass',
    'standing on a ruined bridge as a storm of enemy light curves around her shield and pours back across the river'),

  // ---------- tokens ----------
  'mirror-spark': s(
    'a bright spark of rose-white light trailing glittering splinters of silver glass',
    'darting across a dark courtyard and striking a soldier\'s breastplate in a ring of pink fire'),
  'mirror-reflection': s(
    'a translucent pale-pink duplicate of a young soldier with a glass-edged outline and silver eyes',
    'stepping out of a shop window onto a cobbled lane beside its startled original'),

  // ---------- units ----------
  'mirror-glintpicker': s(
    'a scrawny boy of about fourteen with messy red hair, patched grey clothes and a pocket mirror on a string',
    'holding the pocket mirror toward a marching guard so the guard\'s reflection drops into his open palm'),
  'mirror-veilrunner': s(
    'a slight young woman in a grey hood with a rose glass visor and soft leather boots',
    'sprinting along a ledge of mirrored rooftops, her outline fading into the silver panes as she runs'),
  'mirror-sparkglazier': s(
    'a stocky apprentice in his teens with soot on his cheeks, a heavy leather apron and a long glassblowing pipe',
    'blowing a small rose bubble of glass at a furnace mouth as a spark of light flickers inside it'),
  'mirror-panesentry': s(
    'a thin guard in her thirties in silver lamellar armour, a tall rectangular pane of mirrored glass carried as a shield',
    'standing watch at a quarter gate as an incoming dart of enemy light glances off the pane into the gutter'),
  'mirror-twincourier': s(
    'a young man in a rose messenger jacket with a satchel of sealed glass tubes, an identical copy of him at his side',
    'two matching couriers running in opposite directions from a fountain of silver water'),
  'mirror-backstairknife': s(
    'a gaunt woman in her twenties with cropped black hair and a dark scarf over her mouth, a short blade of smoked glass',
    'creeping up a narrow servants\' stair lit by a single rose lamp, the blade reversed along her forearm'),
  'mirror-lanternmimic': s(
    'a slender illusionist in a long coat of patchwork mirror cloth holding a pink glass lamp on a pole',
    'raising the lamp in a dark market as the light copies every spell cast nearby into glowing echoes around her'),
  'mirror-facethief': s(
    'a soft-spoken man in his fifties with a neat white moustache, a velvet waistcoat and a case of hand mirrors',
    'kneeling on a battlefield at dusk to catch the reflection of a fallen soldier in one of his mirrors'),
  'mirror-polishedbulwark': s(
    'a squat construct of riveted silver frames and thick rose glass panes, a burnished dome for a head',
    'planting its feet on a cracked plaza as a white shimmer of light wraps around its chest'),
  'mirror-echoscribe': s(
    'a young woman with round spectacles and ink-dark braids, a rose robe and a quill of drawn glass',
    'sketching a spell in the air at a high desk while a faint double of her hand repeats each stroke'),
  'mirror-whisperbroker': s(
    'a heavyset man in his sixties in a dark silk coat, rings of mirrored glass on every finger, a cup of rose tea',
    'leaning across a candlelit tavern booth to murmur into a stranger\'s ear while his own reflection listens from the window'),
  'mirror-masquedancer': s(
    'a lithe performer in her twenties with long silver hair, a rose ribbon gown and a mirrored half-mask',
    'spinning across a ballroom of rose glass as her trailing ribbons wrap a soldier in shimmering silver light'),
  'mirror-shardcantor': s(
    'an elderly glassmaker with a long grey braid, a heavy rose apron and a tuning fork of pink crystal',
    'striking the fork in a ringing workshop as splinters of glass lift from the floor and fly toward an intruder'),
  'mirror-gallerycopyist': s(
    'a stooped painter in his seventies with a white goatee, a smock spattered with silver paint, a palette of liquid mirror',
    'painting a perfect reflection of an armoured warrior on a tall canvas of glass in a lamplit studio'),
  'mirror-lookingglassgolem': s(
    'a towering construct built from an ornate standing mirror, its frame of carved silver forming arms and legs',
    'pushing through a crowd in a glass arcade while a pale double of a passer-by climbs out of its chest'),
  'mirror-rooftopinformant': s(
    'a lanky woman in her forties with a long grey coat, a spyglass of rose crystal and a crossbow on her back',
    'crouching at the edge of a mirrored roof at night to loose a bolt of light toward a distant fortress wall'),
  'mirror-choirofechoes': s(
    'a pair of robed singers in rose and silver, their faces lit from below by a bowl of quicksilver',
    'singing in a vaulted glass chapel as their voices return from the walls as rings of rose light'),
  'mirror-curatoroffaces': s(
    'a tall stern woman in her sixties with an iron-grey chignon, a high-collared silver gown and a ring of keys',
    'walking down a long gallery of tall mirrors, each holding a captured warrior who presses a hand against the glass'),
  'mirror-silveredbastion': s(
    'a massive four-legged construct shaped like a fortress tower, its walls clad in mirrored silver tiles',
    'crouching at the edge of a bridge as every tile flashes outward in a burst of rose light across the enemy line'),
  'mirror-shadowglassassassin': s(
    'a tall masked killer in a suit of dark smoked glass plates that drink the light, long curved glass blades',
    'dropping from a dark balcony onto a lit parade, the blades catching a single line of rose moonlight'),
  'mirror-echocolossus': s(
    'a giant construct of stacked rose glass rings around a core of rippling quicksilver',
    'standing over the quarter as each spell cast below it rises through its rings and fires a beam toward a distant tower'),
  'mirror-glasswingdreadnought': s(
    'a huge flying warship of silver ribs and rose glass sails, its hull mirrored so it reflects the sky around it',
    'gliding above the crystal city at dusk, almost lost against the clouds it mirrors, its shadow falling on an enemy camp'),

  // ---------- glyphs ----------
  'mirror-flickeredge': s(
    'a sword edge wrapped in a doubled rose afterimage of itself',
    'flashing twice in a duel in a mirrored hall, the second swing a beat behind the first'),
  'mirror-echoneedle': s(
    'a slender pin of pink glass followed by a faint copy of itself',
    'piercing the gauntlet of a charging knight in a moonlit courtyard as the copy follows the same line'),
  'mirror-sleightofglass': s(
    'a gloved hand drawing a sheet of clear rippling glass over a crouching scout',
    'in a sunlit market square where the scout fades into the reflection of the crowd'),
  'mirror-glanceback': s(
    'a round rose hand mirror held over a shoulder',
    'catching the reflection of an armoured giant on the road behind, the giant\'s likeness glowing inside the glass'),
  'mirror-splitimage': s(
    'a young soldier caught mid-step as a pair of translucent pink doubles peel away from his sides',
    'on a parade ground of polished stone at noon, the doubles marching in step with him'),
  'mirror-falseglare': s(
    'a burst of blinding rose light thrown off a tilted mirror',
    'dazzling a heavy brute across a narrow bridge so his raised club wavers in front of his eyes'),
  'mirror-stolenverse': s(
    'a ribbon of silver spell-light drawn out of an enemy mage\'s hands into a waiting pane of glass',
    'in a smoky debating hall where the mage stares at his own spell glowing in a rival\'s mirror'),
  'mirror-backdoorsignal': s(
    'a small rose lantern flashing behind a shuttered window',
    'in a dark lane where hooded agents in doorways draw their glass knives at the flash'),
  'mirror-ricochetlight': s(
    'a beam of rose-white light bouncing between tall mirrored panels',
    'zigzagging across a canyon of glass towers before slamming into the wall of a distant keep'),
  'mirror-reversepane': s(
    'a tall pane of silver glass spinning on its axis in mid-air',
    'turning a roaring jet of enemy flame back on itself above a broken city wall'),
  'mirror-vanityglass': s(
    'a great oval mirror in a gilded frame showing a hulking warrior with his own fist driving toward him',
    'in a dim throne room as the warrior recoils from the blow of his reflection'),
  'mirror-nightofmasks': s(
    'a crowd of revellers in rose and silver half-visors, their faces blurred like breath on glass',
    'flooding a lantern-lit boulevard during a midnight festival so the guards on the walls lose sight of them'),
  'mirror-encoreofglass': s(
    'a pair of glass harps playing the same chord, the second a pale echo of the first',
    'on an empty concert stage lit by rose footlights as shimmering cards of light fly from the strings into an open hand'),
  'mirror-hallofmirrors': s(
    'an endless corridor of rose and silver looking-glasses, each reflecting a different enemy warrior',
    'as the warriors step out of the frames one after another to stand behind a smiling rose-clad spy'),

  // ---------- set x2: The Starward Rise ----------
  'mirror-vesperine': s(
    'a poised woman in her forties with copper-brown skin and a long silver plait, a high-necked rose gown stitched with small star-cut mirror chips, a pair of matching glass orbs in her hands',
    'holding the orbs up at twilight on an observatory balcony as a soldier below steps forward and a pale rose double steps out beside him'),
  'mirror-vesperine--ascended': s(
    'a poised woman in her forties with copper-brown skin and a long silver plait unbound, a flowing gown of rose and starlit silver, a pair of glass orbs circling her like small twin suns',
    'rising above an open observatory dome at night while every ally on the plaza below is joined by a shining rose double'),
  'mirror-pairedwick': s(
    'a slim lamplighter boy of about sixteen in a rose waistcoat, a long brass pole ending in a pair of joined candle flames',
    'touching the pole to a lantern on a misty canal bridge as a second matching lantern flickers alight in the water below'),
  'mirror-quicksilvershell': s(
    'a squat round construct of rippling liquid silver held inside a cage of rose glass ribs, a pair of glowing pale eyes',
    'rolling into the path of a falling stone block in a narrow alley, its silver surface denting and flowing back smooth'),
  'mirror-quicksilvershell--ascended': s(
    'a broad round construct of liquid silver ringed by a pair of orbiting crescent moons of rose glass',
    'standing guard in a moonlit courtyard as a pair of pale rose duplicates of itself pour out of its gleaming surface'),
  'mirror-twinlensaugur': s(
    'a wiry woman in her fifties with short white hair and tan skin, a dark rose coat, a brass spyglass with a pair of side-by-side lenses',
    'peering through the double spyglass from a crumbling bell tower toward a distant enemy camp at dusk'),
  'mirror-backlitwarden': s(
    'a tall slender construct of curved mirrored glass panels on a frame of dark iron, a bright lamp burning inside its chest',
    'turning its glass chest toward a hurled bolt of enemy fire on a city rampart so the fire bends away toward a hulking brute'),
  'mirror-backlitwarden--ascended': s(
    'a towering construct of curved mirrored glass panels with a pair of blazing lamps like twin suns burning inside its chest',
    'striding through a smoky breach in a fortress wall as a pair of white beams lance out from its chest toward an enemy champion'),
  'mirror-twinstaroutrider': s(
    'a lean young man with dark curls and brown skin in a smoked-glass riding coat, a pale rose double of him riding at his shoulder',
    'galloping on a grey horse along a moonlit causeway beside his glass twin toward an enemy outpost'),
  'mirror-twinsunsentinel': s(
    'a heavy construct of thick rose glass plates over a frame of polished silver, a pair of dim amber suns set in its breastplate',
    'kneeling motionless on a high terrace through the night as frost gathers on its plates and the sky begins to pale'),
  'mirror-twinsunsentinel--ascended': s(
    'a colossal construct of rose glass armour over polished silver, a pair of blazing amber suns flaring in its breastplate',
    'rising from one knee at sunrise on a high terrace as a perfect glass copy of it begins to form in the light beside it'),
  'mirror-pairedsuns': s(
    'an enormous round looking-glass held in a frame of silver arms, a pair of rose suns glowing in its depths',
    'tilting on a hilltop above a marching army so a shining double of each soldier walks out of the glass to join the ranks'),
  'mirror-pairedglint': s(
    'a pair of rose-white sparks of light spiralling around each other',
    'settling on the shoulders of a young swordsman in a torchlit square as a glowing double of him flickers alight at his side'),
  'mirror-starwardglance': s(
    'a slender silver astrolabe with nested rings of rose glass',
    'spinning open above an old desk in a dark tower room as a pale beam of starlight lights a single card at the top of a deck'),
  'mirror-binaryflare': s(
    'a pair of blinding rose-white stars circling each other in the sky',
    'loosing a pair of searing beams down onto a muddy battlefield, each striking a different armoured raider'),
  'mirror-twinephemeris': s(
    'an open pair of folding star tables of silver leaf and rose glass, a quill of light resting between them',
    'glowing on a rooftop observatory at midnight as a pair of cards of light lift from the tables into a waiting hand'),
};
void s;
