// Everything beyond the fence: distant hills, silhouettes, far set pieces. Players never get there,
// so nothing here needs colliders.
// buildBackdrop(scene) returns { update(time, dt, camera) }.
export function buildBackdrop(scene) {
  return { update() {} };
}
