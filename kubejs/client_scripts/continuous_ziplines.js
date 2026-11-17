const Zipline = Java.loadClass(
  'dev.simulated_team.simulated.content.blocks.rope.strand.client.ZiplineClientManager'
)
const RopeManager = Java.loadClass(
  'dev.simulated_team.simulated.content.blocks.rope.strand.client.ClientLevelRopeManager'
)
const Minecraft = Java.loadClass('net.minecraft.client.Minecraft')
const RideableItems = Java.loadClass('com.simibubi.create.AllTags$AllItemTags')

const CONFIG = {
  approachDistance: 3.5,
  connectorGap: 2.5,
  minAlignment: 0.25,
  minSpeed: 0.02,
  transferDistance: 0.85,
  lookAheadTicks: 2,
  cooldownTicks: 12,
  recoveryTicks: 2,
  debug: true
}

let previousRope = null
let previousTicks = 0
let lastRide = null
let lastLevel = null
let debugTicks = 0
let errorCount = 0

function log(message) {
  if (CONFIG.debug) {
    console.info('[ContinuousZiplines] ' + message)
  }
}

function dist(a, b) {
  var x = a.x - b.x
  var y = a.y - b.y
  var z = a.z - b.z
  return Math.sqrt(x*x + y*y + z*z)
}

function vec(a, b) {
  return {
    x: b.x - a.x,
    y: b.y - a.y,
    z: b.z - a.z
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

// Copy JOML points: the mod mutates them as the rope moves.
function ropePath(points, anchor) {
  var positions = []
  var lengths = [0]
  var total = 0
  var closest = null
  var bestDistance = Infinity
  var i, p, a, b, segment, length, t, projected, distance

  for (i = 0; i < points.size(); i++) {
    p = points.get(i).position()
    positions.push({x: p.x(), y: p.y(), z: p.z()})
    if (i === 0) continue
    a = positions[i - 1]
    b = positions[i]
    segment = vec(a, b)
    length = Math.sqrt(dot(segment, segment))
    total += length
    lengths.push(total)
    if (length < 0.0001) continue
    t = Math.max(0, Math.min(1, dot(vec(a, anchor), segment) / (length * length)))
    projected = {
      x: a.x + segment.x * t,
      y: a.y + segment.y * t,
      z: a.z + segment.z * t
    }
    distance = dist(anchor, projected)
    if (distance < bestDistance) {
      bestDistance = distance
      closest = {
        along: total - length + length * t,
        tangent: normalize(segment),
        distance: distance
      }
    }
  }
  if (closest == null) return null
  return {positions: positions, lengths: lengths, total: total, closest: closest}
}

// Sample beyond tiny/duplicate end segments instead of relying on one point.
function endDirection(path, fromFirst) {
  var positions = path.positions
  var start = fromFirst ? 0 : positions.length - 1
  var step = fromFirst ? 1 : -1
  var i, direction = null
  for (i = start + step; i >= 0 && i < positions.length; i += step) {
    direction = normalize(vec(positions[start], positions[i]))
    if (Math.abs(path.lengths[i] - path.lengths[start]) >= 0.75) break
  }
  return direction
}

ClientEvents.tick(event => {
  // This Rhino version mishandles block-scoped declarations in a tick's
  // try block. Use function-scoped locals so repeated ticks remain safe.
  try {
    var mc = Minecraft.getInstance()
    var player = mc.player
    if (player == null || mc.level == null || mc.level !== lastLevel) {
      lastRide = null
      previousRope = null
      previousTicks = 0
      lastLevel = mc.level
      if (player == null || mc.level == null) return
    }
    if (mc.isPaused()) return
    if (previousTicks > 0) previousTicks--
    debugTicks++

    var activeID = Zipline.ridingRope
    if (player.isShiftKeyDown() || player.getAbilities().flying
      || !RideableItems.CHAIN_RIDEABLE[
        'matches(net.minecraft.world.item.ItemStack)'
      ](player.getMainHandItem())) {
      lastRide = null
      return
    }

    // The mod may detach before our client tick. Only bridge a very recent
    // endpoint exit, never an ordinary fall or an intentional sneak dismount.
    var recovering = activeID == null
    if (recovering) {
      if (lastRide == null || lastRide.age >= CONFIG.recoveryTicks
        || !lastRide.nearExit || player.onGround()) {
        lastRide = null
        return
      }
      lastRide.age++
      activeID = lastRide.id
    } else if (lastRide == null || String(lastRide.id) !== String(activeID)) {
      lastRide = {id: activeID, age: 0, nearExit: false}
    }
    if (!recovering) lastRide.nearExit = false

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

    var path = ropePath(points, anchor)
    if (path == null) return
    var direction = dot(motion, path.closest.tangent)
    if (Math.abs(direction) < CONFIG.minAlignment) return
    var towardsLast = direction > 0
    var endpoint = path.positions[towardsLast ? path.positions.length - 1 : 0]
    var remaining = towardsLast ? path.total - path.closest.along : path.closest.along
    var exitDirection = endDirection(path, !towardsLast)
    if (exitDirection == null) return
    exitDirection = {x: -exitDirection.x, y: -exitDirection.y, z: -exitDirection.z}
    var alongSpeed = Math.abs(dot(velocity, path.closest.tangent))
    var transferWindow = Math.min(CONFIG.approachDistance,
      CONFIG.transferDistance + alongSpeed * CONFIG.lookAheadTicks)
    if (!recovering) {
      lastRide.age = 0
      lastRide.nearExit = remaining <= transferWindow
        && dist(anchor, endpoint) <= transferWindow + 0.5
    }
    if (CONFIG.debug && debugTicks % 40 === 0) {
      log('Riding rope ' + activeID
        + ', endpoint distance: ' + remaining.toFixed(2))
    }

    // Arc distance avoids transferring across a sag or a folded-back rope.
    if (remaining > transferWindow
      || dist(anchor, endpoint) > transferWindow + 0.5) return

    var best = null
    var bestScore = -Infinity
    var bestID = null

    for (var strand of manager.getAllStrands()) {
      var strandID = String(strand.getUuid())
      if (strandID === String(activeID)
        || (previousTicks > 0 && strandID === previousRope)) {
        continue
      }

      var other = strand.getPoints()
      if (other.size() < 2) continue

      var otherPath = ropePath(other, anchor)
      if (otherPath == null) continue

      for (var endIndex = 0; endIndex < 2; endIndex++) {
        var fromFirst = endIndex === 0
        var start = otherPath.positions[fromFirst ? 0 : otherPath.positions.length - 1]
        var gap = dist(endpoint, start)
        if (gap > CONFIG.connectorGap) continue

        var nextDirection = endDirection(otherPath, fromFirst)
        if (nextDirection == null) continue

        var alignment = dot(exitDirection, nextDirection)
        if (alignment < CONFIG.minAlignment) continue
        // Do not attach at the far end or to a crossing in the rope's middle.
        var entryProgress = fromFirst ? otherPath.closest.along
          : otherPath.total - otherPath.closest.along
        if (entryProgress > transferWindow + CONFIG.connectorGap) continue
        // Native physics immediately detaches a rider moving out of an end.
        if (dot(motion, nextDirection) < 0.05) continue
        var exitRemaining = otherPath.total - entryProgress
        if (exitRemaining < 0.55) continue

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

        var score = alignment * 3 - gap - otherPath.closest.distance * 0.25

        if (score > bestScore + 0.0001
          || (Math.abs(score - bestScore) <= 0.0001
            && (bestID == null || strandID < bestID))) {
          bestScore = score
          best = strand
          bestID = strandID
        }
      }
    }

    if (best != null) {
      log('Transferring from ' + activeID
        + ' to ' + best.getUuid())

      Zipline.embark(best.getUuid())
      previousRope = String(activeID)
      previousTicks = CONFIG.cooldownTicks
      lastRide = {id: best.getUuid(), age: 0, nearExit: false}
    } else if (CONFIG.debug && debugTicks % 10 === 0) {
      log('Junction nearby, no valid outgoing rope found')
    }

  } catch (e) {
    if (errorCount++ < 5) {
      console.error('[ContinuousZiplines] ' + e)
    }
  }
})

log('Continuous zipline script v4 loaded')
