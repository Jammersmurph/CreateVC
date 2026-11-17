const Zipline = Java.loadClass(
  'dev.simulated_team.simulated.content.blocks.rope.strand.client.ZiplineClientManager'
)
const RopeManager = Java.loadClass(
  'dev.simulated_team.simulated.content.blocks.rope.strand.client.ClientLevelRopeManager'
)
const Minecraft = Java.loadClass('net.minecraft.client.Minecraft')

const CONFIG = {
  approachDistance: 3.5,
  connectorGap: 2.5,
  minAlignment: 0.25,
  minSpeed: 0.08,
  cooldownTicks: 12,
  debug: true
}

let cooldown = 0
let debugTicks = 0
let errorCount = 0

function log(message) {
  if (CONFIG.debug) {
    console.info('[ContinuousZiplines] ' + message)
  }
}

function dist(a, b) {
  const x = a.x() - b.x()
  const y = a.y() - b.y()
  const z = a.z() - b.z()
  return Math.sqrt(x*x + y*y + z*z)
}

function vec(a, b) {
  return {
    x: b.x() - a.x(),
    y: b.y() - a.y(),
    z: b.z() - a.z()
  }
}

function dot(a, b) {
  return a.x*b.x + a.y*b.y + a.z*b.z
}

function normalize(v) {
  const len = Math.sqrt(dot(v, v))
  if (len < 0.0001) return null
  return {
    x: v.x/len,
    y: v.y/len,
    z: v.z/len
  }
}

ClientEvents.tick(event => {
  // This Rhino version mishandles block-scoped declarations in a tick's
  // try block. Use function-scoped locals so repeated ticks remain safe.
  try {
    if (cooldown > 0) {
      cooldown--
      return
    }

    var mc = Minecraft.getInstance()
    var player = mc.player
    if (player == null || mc.level == null) return
    if (mc.isPaused()) return

    var activeID = Zipline.ridingRope
    if (activeID == null) return
    if (player.isShiftKeyDown()) return

    var velocity = player.getDeltaMovement()
    if (velocity.length() < CONFIG.minSpeed) return

    var motion = normalize({
      x: velocity.x,
      y: velocity.y,
      z: velocity.z
    })
    if (motion == null) return

    var manager = RopeManager.getOrCreate(mc.level)
    var current = manager.getStrand(activeID)
    if (current == null) return

    var points = current.getPoints()
    if (points.size() < 2) return

    // Simulated positions the rider's attachment
    // above the player's bounding box.
    var anchor = player.position().add(
      0,
      player.getBoundingBox().getYsize()
        + 0.5 * player.getScale(),
      0
    )

    var first = points.get(0).position()
    var last = points.get(points.size() - 1).position()

    // Only examine the endpoint we're travelling toward.
    var endpoint = null

    var towardsLast = normalize(vec(first, last))
    if (towardsLast == null) return

    var direction = dot(motion, towardsLast)

    if (direction > CONFIG.minAlignment) {
      endpoint = last
    } else if (direction < -CONFIG.minAlignment) {
      endpoint = first
    } else {
      return
    }

    var remaining = dist(
      {x: () => anchor.x, y: () => anchor.y, z: () => anchor.z},
      endpoint
    )

    debugTicks++
    if (CONFIG.debug && debugTicks % 40 === 0) {
      log('Riding rope ' + activeID
        + ', endpoint distance: ' + remaining.toFixed(2))
    }

    if (remaining > CONFIG.approachDistance) return

    var best = null
    var bestScore = -Infinity

    for (var strand of manager.getAllStrands()) {
      if (String(strand.getUuid()) === String(activeID)) {
        continue
      }

      var other = strand.getPoints()
      if (other.size() < 2) continue

      var a = other.get(0).position()
      var b = other.get(other.size() - 1).position()

      var choices = [
        {start: a, next: other.get(1).position()},
        {start: b, next: other.get(other.size()-2).position()}
      ]

      for (var choice of choices) {
        var gap = dist(endpoint, choice.start)
        if (gap > CONFIG.connectorGap) continue

        var nextDirection = normalize(
          vec(choice.start, choice.next)
        )
        if (nextDirection == null) continue

        var alignment = dot(motion, nextDirection)
        if (alignment < CONFIG.minAlignment) continue

        // Select the Vec3 overload explicitly: KubeJS can also coerce a
        // player to Vec3, making the ordinary overloaded call ambiguous.
        var query = Zipline[
          'getClosestPointOnStrand(dev.simulated_team.simulated.content.blocks.rope.strand.client.ClientRopeStrand,net.minecraft.world.phys.Vec3)'
        ](
          strand, anchor
        )

        if (!Zipline.canStartRiding(query, player, false)) {
          continue
        }

        var score = alignment * 3 - gap

        if (score > bestScore) {
          bestScore = score
          best = strand
        }
      }
    }

    if (best != null) {
      log('Transferring from ' + activeID
        + ' to ' + best.getUuid())

      Zipline.embark(best.getUuid())
      cooldown = CONFIG.cooldownTicks
    } else if (CONFIG.debug && debugTicks % 10 === 0) {
      log('Junction nearby, no valid outgoing rope found')
    }

  } catch (e) {
    if (errorCount++ < 5) {
      console.error('[ContinuousZiplines] ' + e)
    }
  }
})

log('Continuous zipline script v3 loaded')
