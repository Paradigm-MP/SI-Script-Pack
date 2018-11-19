jcmp.events.Add('character/exp/GainLevel', (player, level) => 
{
    const old_max = loot.config.storages.max[level - 1];
    const new_max = loot.config.storages.max[level];

    if (new_max > old_max) // If maximum number of vehicles increased
    {
        loot.chat.send(player, `Gained ${new_max - old_max} extra storage slots.`, new RGBA(0,255,195,255), {channel: 'Log'});
    }

    //jcmp.events.CallRemote('vehicles/sync/update_max', player, new_max);

})