
jcmp.events.AddRemoteCallable('itemuse/complete_item', (player) => 
{
    if (player.iu.item && player.iu.item.name.indexOf('Ping') > -1 
        && player.iu.using && player.iu.completed)
    {

        player.c.inventory.remove_item(player.iu.item, player.iu.index);
        let dist;

        if (player.iu.item.name == 'Ping (1km)')
        {
            dist = 1000;
        }
        else if (player.iu.item.name == 'Ping (2km)')
        {
            dist = 2000;
        }
        else if (player.iu.item.name == 'Ping (5km)')
        {
            dist = 5000;
        }

        const players = [];

        const my_pos = player.position;

        const pong_decoy_data = jcmp.inv.FindItem('Pong Decoy');
        pong_decoy_data.amount = 1;
        pong_decoy_data.equipped = true;
        const pong_decoy = new jcmp.inv.item(pong_decoy_data);

        const pong_decoy_upgraded_data = jcmp.inv.FindItem('Upgraded Pong Decoy');
        pong_decoy_upgraded_data.amount = 1;
        pong_decoy_upgraded_data.equipped = true;
        const pong_decoy_upgraded = new jcmp.inv.item(pong_decoy_upgraded_data);

        jcmp.players.forEach(function(p) 
        {
            if (p.c && p.c.inventory && p.networkId != player.networkId && iu.utils.Distance(p.position, my_pos) < dist
                && p.dimension == player.dimension)
            {
                let pos = p.position;

                const has_pong = p.c.inventory.has_item(pong_decoy, true);
                const has_pong_upgraded = p.c.inventory.has_item(pong_decoy_upgraded, true);

                // If the player has a pong equipped, scramble the position
                if (has_pong !== false && has_pong !== undefined)
                {
                    const range = 100;

                    p.c.inventory.modify_dura_equipped('Pong Decoy', 
                        -iu.config.usables[player.iu.item.name].durability);

                    pos.x = pos.x + (Math.random() * range - range / 2);
                    pos.z = pos.z + (Math.random() * range - range / 2);
                    pos.y = pos.y + (Math.random() * 50 - 25);
                }
                else if (has_pong_upgraded !== false && has_pong_upgraded !== undefined)
                {
                    const range = 300;

                    p.c.inventory.modify_dura_equipped('Upgraded Pong Decoy', 
                        -iu.config.usables[player.iu.item.name].durability);

                    pos.x = pos.x + (Math.random() * range - range / 2);
                    pos.z = pos.z + (Math.random() * range - range / 2);
                    pos.y = pos.y + (Math.random() * 100 - 50);
                }

                players.push({x: pos.x, y: pos.y, z: pos.z});
            }
        });

        // Insert fake players that are in range too
        iu.fakeplayer.fake_players.forEach((entry) => 
        {
            const pos = new Vector3f(entry.x, entry.y, entry.z);
            if (entry.owner != player.c.general.steam_id && iu.utils.Distance(pos, my_pos) < dist)
            {
                players.push({x: pos.x, y: pos.y, z: pos.z})
            }
        })

        if (players.length > 0)
        {
            jcmp.events.CallRemote('itemuse/ping_players', player, JSON.stringify(players));
        }

    }

})