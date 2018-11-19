// Send players the cell size when they load in
jcmp.events.Add('character/Loaded', (player) => 
{
    jcmp.events.CallRemote('loot/config/cell_size', player, loot.config.cell_size);
    player.c.storages = []; // TEMP

    player.keypad_attempts = 0;
})