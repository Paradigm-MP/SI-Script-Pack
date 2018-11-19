jcmp.events.Add('character/exp/GainLevel', (player, level) => 
{
    const old_max = JSON.parse(JSON.stringify(loot.config.storages.max[level - 1]));
    const new_max = JSON.parse(JSON.stringify(loot.config.storages.max[level]));

    if (new_max > old_max) // If maximum number of storages increased
    {
        const diff = new_max - old_max;

        loot.chat.send(player, `Gained ${diff} extra storage slots.`, new RGBA(0,255,195,255), {channel: 'Log'});
    }

    jcmp.events.CallRemote('storages/sync/update_max', player, new_max);
})