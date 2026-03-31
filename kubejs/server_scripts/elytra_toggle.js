// toggle command
ServerEvents.commandRegistry(event => {
    const { commands: Commands } = event;

    event.register(
        Commands.literal("elytratoggle")
            .executes(ctx => {
                const player = ctx.source.player;

                let enabled = player.persistentData.elytra_enabled ?? true;
                enabled = !enabled;

                player.persistentData.elytra_enabled = enabled;

                player.tell(`Elytra Slot: ${enabled ? "ENABLED" : "DISABLED"}`);
                return 1;
            })
    );
});


// force remove from curios when disabled
PlayerEvents.tick(event => {
    const player = event.player;

    if (player.level.isClientSide()) return;

    const enabled = player.persistentData.elytra_enabled ?? true;
    if (enabled) return;

    const curios = player.getCapability("curios:inventory");
    if (!curios) return;

    const stacks = curios.getCurios();

    stacks.forEach(slot => {
        slot.stacks.forEach(stack => {
            if (stack.id == "minecraft:elytra") {

                let copy = stack.copy();

                // remove from slot
                stack.count = 0;

                // give back safely
                if (!player.inventory.add(copy)) {
                    player.drop(copy, false);
                }
            }
        });
    });
});