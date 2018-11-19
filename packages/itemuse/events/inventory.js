// When a player clicks an item
jcmp.events.Add('inventory/events/use_item', (player, stack, index) => 
{
    const item = stack.get_first().duplicate();
    item.amount = 1;

    if (iu.config.usables[item.name] && !player.iu.using)
    {
        if (iu.config.usables[item.name].vehicle && !player.vehicle)
        {
            jcmp.notify(player, {
                title: 'Cannot use item!',
                subtitle: `You must be in a vehicle to use ${item.name}!`,
                preset: 'warn'
            })
            return;
        }

        if (iu.config.usables[item.name].storage && 
            (!player.current_box || !player.current_box.is_storage || !player.current_box.storage))
        {
            jcmp.notify(player, {
                title: 'Cannot use item!',
                subtitle: `You must open a storage to use ${item.name}!`,
                preset: 'warn'
            })
            return;
        }

        // Check if they can hack the storage or apply upgrades, etc
        if (iu.config.usables[item.name].storage)
        {
            if (!player.current_box.storage.can_use_item(item.name, player))
            {
                return;
            }
        }


        const usage_time = (iu.config.usables[item.name].flag && item[flag] != undefined) ?
            iu.config.usables[item.name].usage_time_after : iu.config.usables[item.name].usage_time;
            
        player.c.inventory.can_drop = false;
        
        player.iu.using = true;
        player.iu.health = player.health;
        player.iu.item = item;
        player.iu.usage_time = usage_time;
        player.iu.index = index;
        player.iu.stack = stack;
        
        const in_vehicle = (iu.config.usables[item.name].vehicle) ? true : false; // Can't send undefined

        jcmp.events.CallRemote('itemuse/use_item', player, item.name, usage_time, in_vehicle);
        
        player.iu.timeout = setTimeout(() => 
        {
            if (player.iu.using && player.iu.health <= player.health)
            {
                player.iu.completed = true;
            }
            else
            {
                player.iu.using = false;
            }
        }, usage_time * 1000);
    }
})
