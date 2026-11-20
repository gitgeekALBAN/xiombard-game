# Grave Quota — concept

> **Status: a concept pitch on file, not a plan.** Nothing here is decided or scheduled. Do not build from this document
> unless the team asks for a specific piece of it. Translated from the original Russian text.

By day the players dig graves and bury the dead. By night the badly buried rise, and ordinary zombies come with them:
hold out until dawn, keep the gates from being broken, and collect loot from the fallen. A bitten player is secretly
infected: without a serum they turn into a zombie and play against their friends.

## The idea

**Pitch.** You and your friends are gravediggers who have to bury every body properly before dark: at night the ones
that were buried badly, or not buried in time, will rise. Defend yourselves and don't let the risen break the gates and
start a zombie apocalypse.

**Setting.** A new crew at an old city cemetery. A funeral holding recently bought the cemetery: it pays the crew for
every burial and every three days demands a revenue quota. That the dead rise here at night was not mentioned at
hiring. The tone is black humor, not serious horror.

**Genre.** Co-op horror with a quota, for 2–4 players: the team works in a dangerous place, earns toward the quota
before the deadline and fights off the threat.

**The main action is digging.** By day the shovel digs graves; by night the same shovel fights back and buries the
risen again. A screenshot reads at once: four people with shovels by a pit, a coffin next to them — or the view from
inside a dug grave up at four players with shovels around it (like Tarantino's shot from inside a car trunk).

## The rest meter

By day the dead never rise. All of the day's mistakes add up in each grave's rest meter and only go off after sunset.
The meter has three factors, and each one is a game mechanic.

| Factor | Mechanic | Mistake by day | Consequence at night |
|---|---|---|---|
| Depth of the pit | Digging with shovel upgrades | Didn't dig down to the mark (a tape-measure gadget could be added) | The body rises first, right after sunset |
| Coffin carried intact | Clumsy physics | Dropped the coffin, the body fell out in front of the family; it's stuffed back in and the burial goes on | An offended body rises angry and fast |
| Farewell speech | Voice as a mechanic | Nobody said a word into the mic at the grave | It howls and raises the neighbouring dead |
| — | — | Not buried before sunset | Rises straight out of the coffin, the angriest and fastest |

**Voice as a mechanic.** The game does not recognize words; it counts how many seconds someone spoke near the grave.
It is funny exactly because players have to improvise a eulogy for a stranger — a gangster or a bodybuilder.

A grave's state is visible without UI: a calm one is an even mound with a candle, a bad one has a crooked cross and
knocking from under the ground. In the evening the players walk the cemetery and know in advance where trouble will
come from.

## The quota

Every three days the holding collects the revenue quota. If it isn't met, the holding doesn't deliver serum for the
next three days, and the infected have to hold on without it (see "Infection"). The quota and the danger grow with
every cycle.

Money comes from client burials, a small bonus for every zombie buried at night, and selling night loot (see "Loot").

Money goes to shovel upgrades, gate repairs, and — at the end of the game — when a dead one has walked off into the
city.

Hence the main choice of the day: bury fast and many, or fewer but so that fewer dangerous dead rise at night. And
there must be time left to prepare for the night.

## Infection

A player bitten at night slowly turns into a zombie, and only they know it.

- **Secrecy.** Only the infected player sees the infection counter. Telling the team or keeping quiet is their choice.
- **Stages.** Every night without serum is one stage higher. At the third the player turns right in the middle of the
  night, next to their friends.
- **Serum and money.** Burial pay is split into personal wallets. A serum dose is bought at the lodge's first-aid kit
  from your own wallet — in secret. A dose delays turning by one night; the full cure costs several days of work. This
  is the "debt by a deadline" pressure: scrape together a dose before sunset.
- **Symptoms give it away.** The infected player's voice in chat sometimes rasps, and ordinary zombies avoid touching
  them at night. An attentive team can guess.
- **Detector.** The first-aid kit sells an expensive one-shot infection detector. Scan a healthy player and the one who
  scanned pays a double fine. The team can chip in for serum for an exposed infected player.
- **Why hide it.** An unexposed infected player gets bonuses: ordinary zombies leave them alone, and they dig faster
  with every stage. And playing the sudden traitor is fun. So keeping quiet pays, and suspecting a friend is costly.

## The zombie player

A player who has turned doesn't drop out: at night they play against their own — lead the ordinary zombies, break the
gates from the inside, and know where the pits are dug. At dawn they fall like all the dead, and their friends have to
bury them — the same rest meter applies to them. Buried well and given the full cure, they are human again in the
morning. Buried badly, they rise again the next night.

The run ends when every player has turned or a dead one has walked off into the city.

## Night

The night's task: hold the defence until dawn and don't let the gates be broken. There are several gates on the map.
A broken gate means a fine; a dead one walking off means the end of the game (alternative: several dead walk off with
a fine each, and the game ends past a limit). Players have a shovel and a lantern; the dead walk toward the gates and
toward the players' voices.

Two kinds of dead rise at night:

| | Clients | Ordinary zombies |
|---|---|---|
| Where from | The ones the players buried during the day | The old abandoned part of the cemetery |
| When they rise | Only if they were buried badly | Every night, in waves; more every day of the cycle |
| What they are | Unique: every client type has its own behaviour | Simple and slow, they win by numbers |
| Why in the game | Punishment for the day's mistakes: the most dangerous night enemies | Keep the night busy even if the day went perfectly |
| How to lay them to rest | Rebury in their own grave; if deep and solid, they won't rise again | Knock into an open pit and fill it in (below) |

### Burying ordinary zombies without a chore

Ordinary zombies are not buried one by one. They are knocked down with the shovel and pushed into an open pit, and the
pit is filled in all at once.

- **Trap pits are dug by day.** It's the same main action, and it creates a choice: spend daylight on clients (money)
  or on pits by the gates (defence).
- **Physics.** Zombies fall into the pit like rag dolls: you can push three in at once, or fall in yourself and wait
  for friends to pull you out.
- **Mass grave.** The more zombies in one pit when it's filled, the bigger the bonus. The risk: while the pit is open,
  zombies slowly climb out.
- **Filling takes two.** One throws earth, the other fights off the ones pressing in. A co-op moment, not a button
  press.
- **An unfilled pit.** The holding's emergency team fills it shallowly and charges a fine. The next night the zombies
  from that pit rise in the first wave.

## Loot

Fallen zombies drop gold teeth, jewellery and coins. They have to be picked up and carried to the lodge, and sold in the
morning — that's money for the quota, serum and upgrades.

- **Greed has a risk.** The most valuable loot drops from clients and lies where the fight was — often at the gates.
  While one player collects teeth, the others hold the gates.
- Loot not collected by dawn is taken by the holding's emergency team.
- **Personal wallet.** Loot goes to whoever brought it in — so an infected player can quietly save up for serum, and
  their sudden greed becomes one more symptom.

## Gameplay loop

1. **Morning.** The hearse brings the day's clients.
2. **Day.** Dig, carry the coffin, give the speech, bury; with the time left, trap pits by the gates.
3. **Night.** Hold the defence until dawn: rebury risen clients, push ordinary zombies into pits, don't let the gates
   break.
4. **Dawn.** All the dead fall. Fines and bonuses, pay, serum for the infected, shovel upgrades; a friend who turned
   has to be buried.

Every third day is the quota check: met — a new cycle with a higher quota and serum in the first-aid kit; missed —
three days without serum.

## Shovel upgrades

The shovel has two branches, and there's never money for both — even less when someone is secretly saving for serum.

| Branch | Upgrades | What it gives |
|---|---|---|
| Digging | Spade → power auger → mini excavator; tape-measure gadget | Dig faster and deeper, see the pit's depth |
| Fighting | Sight on the shovel, sharpening, weighted blade | The sight highlights a weak spot — a hit there crits and knocks down in one blow; sharpening raises the crit chance; the weighted blade throws zombies further — straight into the pit |

## Starting clients

Each client makes one of the three rest factors harder by day, and if buried badly, rises at night as an exclusive
zombie with its own behaviour.

| Client | What they make harder by day | At night, if risen |
|---|---|---|
| Granny with cats | Speech: the family expects a long farewell. You have to talk twice as long | Brings a pack of fast zombie cats |
| Bodybuilder | Physics: the coffin is so heavy the whole team has to carry it while everything else waits | A slow tank, breaks gates fastest of all |
| Gangster | Depth: the family wants him buried "so nobody ever finds him". The pit is twice as deep | Shoots from afar |
| Clown | Physics: there's a spring in the coffin, like a jack-in-the-box. Shake the coffin (run, stumble, carry out of step) and the lid flies open to music and the clown pops out — that counts as "dropped". Carry slowly and in step | Honks a horn and gathers ordinary zombies around him |

## Key points

| Field | Answer |
|---|---|
| Title | Grave Quota (working title) |
| One-line pitch | You and your friends are gravediggers who have to bury every body properly before dark: at night the badly buried ones rise |
| Genre | Co-op horror with a quota |
| Mechanics | #2 Quota or debt by a deadline — quota and serum before sunset (pressure) · #9 Clumsy physics (clip-worthy) · #8 Hiding, disguise, deception — hidden infection (clip-worthy) · #10 Simple action + tool upgrades (loop) |
| The player's main action | Dig: graves and trap pits by day, burying the risen again by night |
| Which hit it resembles | R.E.P.O. (quota, co-op, threat) and A Game About Digging A Hole (digging with upgrades). The twist: the most dangerous enemies of the night are the ones the players buried themselves during the day, and the quality of the work sets the night's difficulty |
| Clip for a streamer | The coffin is dropped down a slope and the body rolls toward the weeping family; an awkward speech "well, he was a good… gangster" — and that night the gangster rises; a player falls into the mass grave while a friend is already filling it; a player hides a bite for two nights, blaming the rasp on their mic, and on the third turns in the middle of the team and breaks the gates from the inside |
| Scope and price | One cemetery with several gates, 4 exclusive clients, ordinary zombies, a shovel with two upgrade branches (digging and fighting), a lantern, hidden infection and the zombie player, a 3-day cycle with a growing quota; $6.99 |
| Why this idea | An unusual loop: by day the players build the night they will then live through. Every mistake (dropped the coffin, skipped the speech, didn't dig deep enough) comes back at night as a specific zombie, so failure is understandable and funny, not random. Every night is different because the team assembled it. And it all rests on one action — digging — which reads from the first screenshot and works both by day and by night. Hidden infection adds paranoia: any friend may be the next zombie, and losing doesn't kick you out of the game, it changes your side |

**Risk.** Players without a microphone can't give a speech. Alternative: hold a "mourn" button and the character
mumbles indistinct phrases.
