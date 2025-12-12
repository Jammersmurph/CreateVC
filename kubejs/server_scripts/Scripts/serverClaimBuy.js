const OpenPACServerAPI = Java.loadClass("xaero.pac.common.server.api.OpenPACServerAPI")
const PlayerConfigOptions = Java.loadClass("xaero.pac.common.server.player.config.api.PlayerConfigOptions")

const buyableConfigIndex = 2
const chunkPrice = 32 // price in spurs

ServerEvents.commandRegistry(event => {
  let { commands: Commands, arguments: Arguments, builtinSuggestions: Suggestions } = event

  event.register(
    Commands.literal('usePlotBoard')
      .requires(source => source.hasPermission(0))
      .executes(ctx => {
        const player = ctx.source.playerOrException

        const api = OpenPACServerAPI.get(player.server)
        const ClaimManager = api.getServerClaimsManager()
        const PlayerConfigs = api.getPlayerConfigs()

        // figure out which chunk we're in
        const chunkX = Math.floor(player.x / 16)
        const chunkZ = Math.floor(player.z / 16)
        const ServerClaimInfo = ClaimManager.get(
          player.level.getDimension(),
          chunkX,
          chunkZ
        )

        // only allow buying if it's on sale
        try {
          if (
            ServerClaimInfo.playerId.toString() !==
              '00000000-0000-0000-0000-000000000000'
            || ServerClaimInfo.subConfigIndex !== buyableConfigIndex
          ) {
            throw ''
          }
        } catch (error) {
          ctx.source.server.runCommandSilent(
            `tellraw ${player.name.string} {"text":"That chunk is not for sale.","color":"red"}`
          )
          return 1
        }

        // check wallet
        let canAfford = false
        let spurStack
        for (const item of player.inventory.allItems) {
          if (item.id === 'numismatics:spur' && item.count >= chunkPrice) {
            spurStack = item
            canAfford = true
            break
          }
        }

        if (!canAfford) {
          ctx.source.server.runCommandSilent(
            `tellraw ${player.name.string} {"text":"You dont have enough spurs.","color":"red"}`
          )
          return 1
        }

        // unclaim then claim to be safe
        ClaimManager.unclaim(
          player.level.getDimension(),
          chunkX,
          chunkZ
        )
        spurStack.setCount(spurStack.count - chunkPrice)
        ClaimManager.claim(
          player.level.getDimension(),
          player.getUuid(),
          PlayerConfigs.getLoadedConfig(player.id).getSubIndex(),
          chunkX,
          chunkZ,
          false
        )

        // success message + sound
        ctx.source.server.runCommandSilent(
          `tellraw ${player.name.string} {"text":"Successfully bought and claimed!","color":"green"}`
        )
        ctx.source.server.runCommandSilent(
          `execute at ${player.name.string} run playsound create:stock_ticker_trade player @a`
        )

        // fill the chunk from y=71 to y=74 with air
        const xStart = chunkX * 16
        const zStart = chunkZ * 16
        const xEnd = xStart + 15
        const zEnd = zStart + 15
        ctx.source.server.runCommandSilent(
          `execute as ${player.name.string} at ${player.name.string} run fill ${xStart} 71 ${zStart} ${xEnd} 74 ${zEnd} air`
        )

        return 1
      })
  )
})


BlockEvents.rightClicked(event => {
    const { block, player, server } = event;
    const shopBlocks = [
        'brassworks:shop_1',
        'brassworks:shop_2',
        'brassworks:shop_3',
        'brassworks:shop_4'
    ];
    if (shopBlocks.includes(block.id)) {
        server.runCommandSilent(`openguiscreen shop ${player.name.string}`);
        server.runCommandSilent(`execute at ${player.name.string} run playsound minecraft:ui.cartography_table.take_result player @a ~ ~ ~ 0.5`);
    }
});
