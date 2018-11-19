jcmp.events.Add('character/exp/GainLevel', (player, level) => 
{
    const old_max = JSON.parse(JSON.stringify(veh.config.max_vehicles[level - 1]));
    const new_max = JSON.parse(JSON.stringify(veh.config.max_vehicles[level]));

    if (new_max > old_max) // If maximum number of vehicles increased
    {
        const diff = new_max - old_max;

        veh.chat.send(player, `Gained ${diff} extra vehicle space.`, new RGBA(0,255,195,255), {channel: 'Log'});
    }

    jcmp.events.CallRemote('vehicles/sync/update_max', player, new_max);
})