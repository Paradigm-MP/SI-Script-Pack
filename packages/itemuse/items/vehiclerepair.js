
jcmp.events.AddRemoteCallable('itemuse/complete_item', (player) => 
{
    if (player.iu.item && player.iu.item.name == 'Vehicle Repair' 
        && player.iu.using && player.iu.completed)
    {

        if (!player.vehicle)
        {
            jcmp.notify(player, {
                title: 'Cannot use item',
                subtitle: 'You must be in a vehicle to use a Vehicle Repair!',
                prest: 'warn'
            })
            return;
        }

        if (!player.vehicle.max_health)
        {
            jcmp.notify(player, {
                title: 'Repair failed',
                subtitle: 'Something went wrong. Code: 837',
                preset: 'warn_red',
                time: 5000
            })
            return;
        }

        player.c.inventory.remove_item(player.iu.item, player.iu.index);

        player.vehicle.health = player.vehicle.max_health;
        // TODO maybe make it respawn the car to remove visual damage

        jcmp.notify(player, {
            title: 'Vehicle repaired',
            subtitle: 'You successfully repaired your vehicle',
            preset: 'success'
        })

    }

})