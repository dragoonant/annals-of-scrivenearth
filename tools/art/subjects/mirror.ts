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
};
void s;
