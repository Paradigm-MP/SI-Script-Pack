jcmp.events.Add('PlayerDeath', (player, killer, reason) => 
{
    if (player.looting_box)
    {
        jcmp.events.CallRemote('loot/sync/close', player, player.looting_box);
    }
})

jcmp.events.Add('PlayerDestroyed', (player) => 
{
    if (player.in_combat && player.c && player.c.inventory)
    {
        player.c.inventory.drop_all();
    }

    if (player.current_box)
    {
        player.current_box.remove_player_opened(player);
    }
})