// Host-only AI teammates. Bots are ordinary diggers in the Sim (sim.addPlayer), driven by writing their input
// every tick exactly like a human's (sim.setInput), so guests see them like any other player.
// createBots(sim) returns:
//   add(name)   — spawn a bot digger, returns its entity id
//   remove(id)  — take a bot out of the game
//   ids         — array of live bot ids
//   update(dt)  — call once per frame BEFORE sim.update(dt); decides and writes each bot's input
export function createBots(sim) {
  const bots = new Map();
  return {
    add(name) {
      const p = sim.addPlayer(name);
      bots.set(p.id, { id: p.id });
      return p.id;
    },
    remove(id) { if (bots.delete(id)) sim.removePlayer(id); },
    get ids() { return [...bots.keys()]; },
    update() {},
  };
}
