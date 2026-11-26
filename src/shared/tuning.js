// The loop's numbers in one place (Coffin Crew, iteration 1). Every value here is a starting point for playtests:
// change it here, not where it is used. The sim reads them on the host; the view only reads what it draws (gate HP).
export const TUNING = {
  // --- the gates where the road crosses the fence (see GATES in layout.js) ---
  gateHp: 100,            // per gate; does not come back overnight or in the morning
  gateRepair: 25,         // HP one repair gives back
  gateRepairTime: 2,      // seconds of holding F for one repair
  gateRepairCost: { boards: 1, nails: 2 },
  hammerEvery: 0.4,       // seconds between hammer blows while repairing or nailing
  defeatDelay: 2.5,       // seconds from a gate breaking to the "Zombies in town" screen

  // --- supplies ---
  startBoards: 6,
  startNails: 18,
  morningBoards: 3,       // the morning hearse brings these
  morningNails: 6,

  // --- day and night ---
  dayLen: (day) => Math.min(480, 150 + 90 * (day - 1)), // 2:30, 4:00, 5:30, 7:00, then 8:00
  nightLen: (day) => 80 + 0 * (day - 1),                // 1:20; raise the 0 to 10..15 if nights prove too short
  sunsetWarn: 60,         // seconds before sunset: red sky, faster music, blinking timer, warnings
  bodies: (day, players) => day + players - 1,          // the hearse's load for the day (plus defeated specials lying about)

  // --- normal zombies (from the old headstones inside the fence) ---
  normals: (day, players) => 4 + 2 * (day - 1) + 2 * (players - 1),
  waves: 4,               // the night's normals come in this many equal waves
  waveGap: 20,            // seconds between waves
  normalHp: 2,            // shovel hits
  // Gate damage: the spec's 2 / 5 every 1.5 s broke a gate within the first night with nobody defending. Measured
  // with idle crews (no defence at all): these values lose on night 3 alone or with two, as the spec's acceptance asks.
  normalGateDmg: 1,       // spec start value 2
  specialHp: 5,
  specialSpeed: 1.3,      // times a normal walker's speed
  specialGateDmg: 2.5,    // spec start value 5
  gateHitEvery: 3,        // seconds between blows on a gate (spec start value 1.5)
  aggro: 4,               // a player closer than this (m) gets attacked
  giveUp: 8,              // past this the zombie goes back to the gate
  knockBack: 1,           // meters a shovel hit sends a zombie back
  knockDown: 1.5,         // seconds it lies there, harmless
  crumble: 1,             // seconds a beaten normal lies before it turns to dust
  noSpawnNear: 3,         // normals never come up this close to a player
  digOut: 20,             // seconds a special takes to dig itself out of a bad grave
  digHelp: 0.25,          // each normal zombie helping it speeds that up by this much
  helperShare: 0.35,      // share of normals that go and help a grave before heading for a gate
  playerGetUp: 2.5,       // seconds a digger knocked down by a zombie lies before getting up

  // --- co-op ---
  pairCoffinSpeed: 6.2 * 0.9, // two carrying a coffin: running speed x 0.9, no stamina
  crewWork: (n) => (n >= 3 ? 2.5 : n === 2 ? 2 : 1), // digging, filling, repairing together: total speed

  // --- plots ---
  plotsStart: 10,         // marked at the start (2 rows of 5); more rows are marked when the morning needs them
};
