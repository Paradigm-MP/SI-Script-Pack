
jcmp.events.AddRemoteCallable('itemuse/complete_item', (player) => 
{
    if (player.iu.item && player.iu.item.name == 'ING' 
        && player.iu.using && player.iu.completed)
    {

        let closest_vehicle = null;
        let closest_dist = 10;

        const player_pos = player.position;

        jcmp.vehicles.forEach((v) => 
        {
            const dist = v.position.sub(player_pos).length;
            if (dist < closest_dist)
            {
                closest_dist = dist;
                closest_vehicle = v;
            }
        });

        if (closest_vehicle && closest_vehicle.pvehicle && closest_vehicle.pvehicle.owner_steam_id == player.c.general.steam_id)
        {
            player.c.inventory.remove_item(player.iu.item, player.iu.index);

            closest_vehicle.angularVelocity = new Vector3f(12, 0, 0);

            jcmp.notify(player, {
                title: 'Vehicle flipped',
                subtitle: 'You successfully flipped your vehicle',
                preset: 'success'
            })
        }
        else
        {
            jcmp.notify(player, {
                title: 'Cannot use ING',
                subtitle: 'No valid vehicles are nearby.',
                preset: 'warn_red'
            })
        }


    }

})