# Lighting guide — how GraveQuota is lit, and why

Rules pulled from books and talks on lighting with several lights (film, animation, stylized games), then turned into
one rig for our day and our night. The numbers live in `RIG` in `src/shaders/toon.js`; this file says what each light
is for, so that tuning stays a matter of roles and ratios, not of taste per pixel.

## Sources

- Jeremy Birn, *Digital Lighting and Rendering*, 3rd ed., ch. 4 "Lighting Environments and Architecture" (daylight,
  practical lights, night scenes, depth, atmosphere) — free sample chapter from the publisher:
  https://ptgmedia.pearsoncmg.com/images/9780321928986/samplepages/0321928989.pdf
- Jeremy Birn, "Three-Point Lighting for 3D Renderings": https://3drender.com/light/3point.html
- Mitchell, Francke, Eng (Valve), "Illustrative Rendering in Team Fortress 2", NPAR 2007:
  https://www.cs.princeton.edu/courses/archive/fall07/cos597B/papers/mitchell-team-fortress.pdf
- Jason Mitchell (Valve), "Connecting Visuals to Gameplay" (TF2 and the dark of Left 4 Dead), MIGS 2008:
  https://cdn.fastly.steamstatic.com/apps/valve/2008/MIGS08_ConnectingVisualsToGameplay.pdf
- James Gurney (*Color and Light*), blog posts: "Seven tips for painting moonlight"
  https://gurneyjourney.blogspot.com/2020/07/seven-tips-for-painting-moonlight.html, "Is moonlight blue?"
  https://gurneyjourney.blogspot.com/2008/01/is-moonlight-blue.html, "Golden hour"
  https://gurneyjourney.blogspot.com/2008/01/golden-hour.html, "Reflected light in shadow"
  https://gurneyjourney.blogspot.com/2014/11/reflected-light-in-shadow.html, "Atmospheric distance and value"
  https://gurneyjourney.blogspot.com/2013/07/atmospheric-distance-and-value.html
- Robert Yang, "Lighting theory for 3D games" parts 2-4 and "How to light a level" (GDC 2018):
  https://www.blog.radiator.debacle.us/2018/03/gdc-2018-how-to-light-level-slides-and.html
- Blender Studio, "Sprite Fright master class: lighting & rendering":
  https://studio.blender.org/blog/Sprite-Fright-Master-Class-Lighting-Rendering/
- Unity manual, "Believable visuals: outdoor lighting"; Shedworks on Sable's readability (Game Developer).
- Not readable online (only the table of contents is free): Sharon Calahan, "Storytelling through lighting",
  SIGGRAPH 96 course 30. Its objectives — direct the eye, create depth, convey time of day, set the mood — are
  the frame for the rules below.

## The rules

**Every light has a job (Birn).** Build one light at a time and look at it alone.
1. *Key* — the sun or the moon: the brightest light, the one that casts the shadows. Put it 15-45° to the side of the
   usual camera and 15-45° up, so it models form; never straight from the camera (flat) (Birn, Blender Studio).
2. *Spill* — a softer, dimmer, **more saturated** copy of the key that wraps past the terminator and into the edges
   of shadows. It is what makes sunlight feel warm (Birn). Illustrators redden the terminator (TF2).
3. *Sky fill* — a dome, blue, brighter and paler at the horizon. The sun's shadows are left black; the **sky** tints
   them blue (Birn). Up-facing planes in shadow are the bluest (Gurney).
4. *Kick* — an extra sky light from behind the subject, opposite the key: it defines the dark side (Birn).
5. *Bounce* — light off the lit ground, aimed up, in the ground's colour (green-yellow off a lawn), no shadows, dim.
   It lights the undersides and ties sun and sky together (Birn, Gurney). Flat ambient has no shape: never use a
   single ambient colour (Yang, Unity). TF2's "ambient cube" is the same idea: ambient that depends on the normal.
6. *Occlusion* — sky and bounce do not reach contact points; without it nothing sits on the ground (Unity, Sable).
7. *Practicals* — lamps and windows. One practical is several lights: the glowing source, a hot pool, and a wider,
   dimmer spill with a redder edge (Birn, "throw patterns").
8. *Rim* — an edge light that separates a silhouette from the background; on characters, not dark outlines alone
   (TF2: "silhouettes are emphasized with rim highlights").

**Ratios.** Key to fill between 2:1 (soft, cheerful) and 8:1 (shadowy) (Birn). Sun and sky together should come out
near white where they overlap; only the shadows read blue (Birn). Change a light by halves and doubles first, then
refine (Blender Studio).

**Colour.** Shading shifts warm to cool, shadows go cool, not black (TF2). Shadows lean to the complement of the light
(Gurney). The environment is muted and lower in contrast than the characters; saturation is spent on small areas
(TF2: world "desaturated relative to players"; highest contrast where the eye should go).

**Depth (Birn, Gurney).** Pick a scheme and keep it: bright foreground to dark background, or the reverse, or
light-dark-light. Atmosphere is a veil that lightens darks and pulls everything toward the sky colour with distance;
the value range narrows. Do not light a natural scene evenly: clouds, shade and pools of light divide the space.

**Guiding the player (Yang, Valve).** Players follow light. Light the path and the goals more than the rest ("light
islands"); few areas of contrast, not many (Left 4 Dead threw out its busy early lighting).

**Night (Birn, Gurney, Valve, Yang).**
- "Not to underexpose the entire scene, but to use a lot of contrast": mostly shadow, broken by bright highlights,
  rims and glints. It should feel dark, not be dark.
- Moonlight is neutral light seen by eyes that have lost colour: paint it cool and greyish, low chroma, shadows
  unified into one mass, never pure black. Reds go dark, blue-greens go light (Purkinje shift).
- Moonlight looks blue **because** warm lamps stand next to it: every warm practical makes the night bluer.
- Light fog behind dark figures: a lighter haze in the distance lets a zombie read as a silhouette (Left 4 Dead).
- A back or side moon gives rims and long shadows toward the camera; a moon behind the camera is flat.

## What was wrong with our picture

- By day the sun stood north-east: the morgue's front wall (the one with the door and the sign, which players look
  at all day) was in shade, and nothing cast a visible shadow toward the camera's side.
- No sky dome, no bounce, no kick: one flat "shadow colour" on every unlit face, whatever way it pointed.
- The lawn was one saturated green from fence to fence: no cloud shade, no pool of light, more chroma than the crew.
- By night the moon stood behind the usual camera (flat, frontal), the ground was evenly bright teal (no contrast,
  high chroma), and the lanterns made small pools with no spill; the windows glowed but lit nothing.

## The rig

One table in `toon.js` (`RIG`), three keys each: night, dusk, day. Values are linear multipliers of the surface colour.

| Light | Day | Dusk | Night | Notes |
|---|---|---|---|---|
| Key direction | sun in the south-east, 32° up | sun low | moon in the north-west, 30° up | by day the front of the morgue and the yard are lit three-quarter; by night the moon hangs over the morgue and back-lights the yard |
| Key | warm yellow 1.05 / 0.86 / 0.52 | orange 1.25 / 0.62 / 0.26 | cool grey-blue 0.38 / 0.52 / 0.84 | casts the shadow map, day and night; cloud cookie on top |
| Spill | orange 0.30 / 0.14 / 0.05 | red 0.55 / 0.18 / 0.08 | blue 0.05 / 0.09 / 0.20 | on the band past the terminator and in shadow edges |
| Sky dome (up) | blue 0.34 / 0.46 / 0.74 | violet 0.30 / 0.24 / 0.48 | navy 0.13 / 0.16 / 0.36 | by the normal's y; sun + sky on a flat lit plane is close to white |
| Bounce (down) | lawn green 0.40 / 0.44 / 0.22 | 0.34 / 0.22 / 0.22 | 0.08 / 0.08 / 0.20 | stronger near the ground |
| Kick | blue 0.10 / 0.16 / 0.30 | 0.16 / 0.12 / 0.34 | 0.05 / 0.08 / 0.18 | from opposite the key, 25° up |
| Hall ambient | warm 0.62 / 0.52 / 0.44 | 0.30 / 0.22 / 0.30 | 0.12 / 0.11 / 0.24 | under the roof instead of sky and bounce |
| Key : fill | about 3 : 1 | | about 4.5 : 1 | cheerful day, contrasty night |

Also:
- **Cloud cookie** (`cloudCookie`): slow cloud shadows take up to 40-60% off the key in soft-edged patches, so the
  ground is never one value; the middle of the yard keeps most of its light (a light island around the plots).
- **Contact occlusion** (`contactAO`): sky and bounce fade along the foot of the morgue's walls.
- **Practicals** (`rigPractical`): each lantern is a hot pool plus a wide red-orange spill; each lit window and the
  open door throw warm light onto the ground and the wall outside (`MORGUE.wins`); the hall's lamps as before.
- **Night eye** (`nightEye`): under the moon, colours lose chroma and reds darken; lamp light keeps full colour.
  This is what makes lamp-lit things pop. The ground and the plants wear night colours of their own, so under a lamp
  they show a warm version of themselves (`lampBase`), or a lantern's pool on dark blue grass would hardly show.
- **Rim**: characters get an edge light in the key's colour where they face it (moon rims at night).
- **Atmosphere**: night fog is lighter than the moonlit ground far away, so distant figures are dark on light.
- **Grade** (`post.js`): a little saturation by day, none added by night, a stronger vignette at night.

## How to tune

1. Look at one light alone (`?light=key|fill|practical` paints only that part).
2. Fix direction before colour, colour before strength; change strengths by halves and doubles.
3. Squint: the picture should fall into three or four values. If the lawn or the night ground is one value from
   edge to edge, the cookie or the pools are too weak.
4. Check from where players stand: at the plots looking at the morgue, inside the hall, at the fence at night.
