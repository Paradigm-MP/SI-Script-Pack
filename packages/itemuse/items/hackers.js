
jcmp.events.AddRemoteCallable('itemuse/complete_item', (player) => 
{
    if (!player.current_box || !player.current_box.is_storage) {return;}

    const item_name = player.iu.item.name;
    if (item_name && player.iu.using && player.iu.completed && iu.config.usables[item_name] && iu.config.usables[item_name].hacker)
    {
        player.c.inventory.modify_durability(player.iu.stack, player.iu.index, -iu.config.usables[item_name].durability);

        if (item_name == 'Hacking Module')
        {
            // USE DURABILITY ON HACKING ITEM
            player.hacking_storage = player.current_box.storage.id;
            jcmp.events.CallRemote('storages/sync/start_hack', player, player.current_box.storage.id);
        }
        else if (item_name == 'Disarming Module')
        {
            player.current_box.storage.disarm(player);
        }
        else if (item_name == 'Trap Detector')
        {
            jcmp.events.Call('log', 'storage', 
                `${player.c.general.name} used a Trap Detector on storage ${player.current_box.storage.id}.`);
                
            if (player.current_box.storage.get_trapped())
            {
                jcmp.notify(player, {
                    title: 'Traps Detected!',
                    time: 5000,
                    preset: 'warn'
                })
            }
            else
            {
                jcmp.notify(player, {
                    title: 'No Traps Detected',
                    time: 5000,
                    preset: 'success'
                })
            }
        }
    }
})