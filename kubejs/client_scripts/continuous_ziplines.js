
const Zipline = Java.loadClass(
  'dev.simulated_team.simulated.content.blocks.rope.strand.client.ZiplineClientManager'
)
const RopeManager = Java.loadClass(
  'dev.simulated_team.simulated.content.blocks.rope.strand.client.ClientLevelRopeManager'
)
const Minecraft = Java.loadClass('net.minecraft.client.Minecraft')
const Vec3 = Java.loadClass('net.minecraft.world.phys.Vec3')

const TRANSFER_DISTANCE = 1.5
const MIN_ALIGNMENT = 0.4

let cooldown = 0

ClientEvents.tick(event => {
  if (cooldown > 0) cooldown--

  const mc = Minecraft.getInstance()
  const player = mc.player
  if (!player || !mc.level || cooldown > 0) return

  const active = Zipline.ridingRope
  if (active == null || player.isShiftKeyDown()) return

  const velocity = player.getDeltaMovement()
  if (velocity.lengthSqr() < 0.01) return

  const manager = RopeManager.getOrCreate(mc.level)
  const current = manager.getStrand(active)
  if (current == null) return

  const points = current.getPoints()
  if (points.size() < 2) return

  const anchor = player.position().add(
    0, player.getBoundingBox().getYsize() + 0.5 * player.getScale(), 0
  )

  const first = points.get(0).position()
  const last = points.get(points.size() - 1).position()

  const nearFirst = distance(anchor, first) < TRANSFER_DISTANCE
  const nearLast = distance(anchor, last) < TRANSFER_DISTANCE

  if (!nearFirst && !nearLast) return

  const endpoint = nearFirst ? first : last
  const motion = velocity.normalize()

  let best = null
  let bestScore = -Infinity

  for (const strand of manager.getAllStrands()) {
    if (String(strand.getUuid()) === String(active)) continue

    const candidatePoints = strand.getPoints()
    if (candidatePoints.size() < 2) continue

    const a = candidatePoints.get(0).position()
    const b = candidatePoints.get(candidatePoints.size() - 1).position()

    for (const [start, next] of [[a, b], [b, a]]) {
      const gap = distance(endpoint, start)
      if (gap > TRANSFER_DISTANCE) continue

      const dx = next.x() - start.x()
      const dy = next.y() - start.y()
      const dz = next.z() - start.z()
      const len = Math.sqrt(dx*dx + dy*dy + dz*dz)
      if (len < 0.01) continue

      const alignment = (
        motion.x * dx + motion.y * dy + motion.z * dz
      ) / len

      if (alignment < MIN_ALIGNMENT) continue

      const query = Zipline.getClosestPointOnStrand(
        strand, player
      )

      if (!Zipline.canStartRiding(query, player, false)) continue

      const score = alignment * 2 - gap
      if (score > bestScore) {
        bestScore = score
        best = strand
      }
    }
  }

  if (best != null) {
    Zipline.embark(best.getUuid())
    cooldown = 8
  }
})

function distance(a, b) {
  const dx = a.x() - b.x()
  const dy = a.y() - b.y()
  const dz = a.z() - b.z()
  return Math.sqrt(dx*dx + dy*dy + dz*dz)
}
