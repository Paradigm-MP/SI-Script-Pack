jcmp.events.Add('PlayerDeath', (player, killer, reason) => 
{
    if (!player.c) {return;}

    player.c.inventory.death_drop(killer != undefined && killer.networkId != player.networkId);

})