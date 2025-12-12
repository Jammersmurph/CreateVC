// kubejs/server_scripts/claim.js
// Forge 1.20.1 & KubeJS 6.x

ServerEvents.commandRegistry(event => {
    const { commands: Commands, arguments: Arguments } = event;
  
    event.register(
      Commands.literal('useSpurs')
        .requires(src => src.hasPermission(0))
        .then(
          Commands.argument('amount', Arguments.INTEGER.create(event))
            .executes(ctx => {
              const player = ctx.source.player;
              const amount = Arguments.INTEGER.getResult(ctx, 'amount');
  
              if (amount <= 0) {
                player.sendSystemMessage(Text.red('Amount must be greater than 0'));
                return 0;
              }
  
              const spurId = 'numismatics:spur';
              const owned = player.inventory.count(Item.of(spurId));
              if (owned < amount) {
                player.sendSystemMessage(
                  Text.red(`You need ${amount} spurs, but only have ${owned}.`)
                );
                return 0;
              }
  
              // Remove spurs via vanilla clear
              ctx.source.server.runCommandSilent(
                `clear ${player.name.string} ${spurId} ${amount}`
              );
  
              // Compute bonus from this transaction
              const bonus = Math.floor(amount / 8);
  
              // Use persistentData as single source of truth
              const pd = player.persistentData;
              const current = typeof pd.bonusClaims === 'number' ? pd.bonusClaims : 0;
              const newTotal = current + bonus;
              pd.bonusClaims = newTotal;
  
              // Build and run the OpenPac set command as the player with OP privileges
              const opCmd = `execute as ${player.name.string} run openpac player-config for ${player.name.string} set claims.bonusChunkClaims ${newTotal}`;
              ctx.source.server.runCommandSilent(opCmd);
              const sound = `execute at ${player.name.string} run playsound create:stock_ticker_trade player @a`;
              ctx.source.server.runCommandSilent(sound);

              player.sendSystemMessage(
                Text.green(`Used ${amount} spurs. Total bonus chunk claims is now ${newTotal}.`)
              );
              return 1;
            })
        )
    );
  });
