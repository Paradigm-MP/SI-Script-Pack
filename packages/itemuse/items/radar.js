
// Fires when a player equips or unequips an item
jcmp.events.Add('inventory/events/equip_item', (player, item, index) => 
{
    const item_name = item.name;
    const equipped = item.equipped;

    if (item_name == 'Radar' || item_name == 'Upgraded Radar')
    {
        // If it was unequipped
        if (!equipped)
        {
            if (player.using_radar)
            {
                jcmp.events.CallRemote('itemuse/close_radar', player);
                clearInterval(player.using_radar);
                
            }
            player.using_radar = null;
            player.radar_range = null;
            return;
        }

        
        const battery_data = jcmp.inv.FindItem('Batteries');
        battery_data.amount = 1;
        const battery = new jcmp.inv.item(battery_data);
        const has_battery = player.c.inventory.has_item(battery, true);

        if (has_battery == -1)
        {
            jcmp.notify(player, {
                title: 'Batteries required',
                subtitle: 'You need Batteries to use a Radar.',
                preset: 'warn'
            })
            
            player.c.inventory.set_not_equipped(item.category, item.name);
            return;
        }

        let range;

        if (item_name == 'Radar')
        {
            range = 500;
        }
        else if (item_name == 'Upgraded Radar')
        {
            range = 1000;
        }

        jcmp.events.CallRemote('itemuse/open_radar', player, range);
        player.radar_range = range;

        player.using_radar = setInterval(function() 
        {
            UpdateRadar(player);
        }, 2000);

    }

})

/*jcmp.events.AddRemoteCallable('itemuse/close_radar', (player) => 
{
    clearInterval(player.using_radar)
    player.using_radar = null;
    player.radar_range = null;
})*/

function UpdateRadar(player)
{
    if (!player.using_radar || !player.radar_range) {return;}

    const battery_data = jcmp.inv.FindItem('Batteries');
    battery_data.amount = 1;
    const battery = new jcmp.inv.item(battery_data);
    const has_battery = player.c.inventory.has_item(battery, true);

    let radar_name = 'Radar';

    if (player.radar_range == 1000)
    {
        radar_name = 'Upgraded Radar';
    }

    const radar_data = jcmp.inv.FindItem(radar_name);
    radar_data.amount = 1;
    radar_data.equipped = true;
    const radar = new jcmp.inv.item(radar_data);
    const has_radar = player.c.inventory.has_item(radar, true);

    if (has_radar === false || has_radar == -1)
    {
        jcmp.events.CallRemote('itemuse/close_radar', player);
        clearInterval(player.using_radar);
        player.using_radar = null;
        player.radar_range = null;
        return;
    }
    else
    {
        /*player.c.inventory.modify_durability(
            player.c.inventory.contents[radar_data.category][has_radar],
            has_radar,
            -2
        )*/
        player.c.inventory.modify_dura_equipped(radar_name, -2);
    }
    
    if (has_battery === false || has_battery == -1)
    {
        jcmp.events.CallRemote('itemuse/close_radar', player);

        jcmp.notify(player, {
            title: 'Batteries required',
            subtitle: 'You need Batteries to use a Radar.',
            preset: 'warn'
        })

        /*iu.chat.send(player, `<b>You need [#FFFF00]Batteries[#FF0000] to use a [#FFFF00]Radar[#FF0000]!</b>`, 
            new RGBA(255,0,0,255), {timeout: 10});*/
        player.c.inventory.set_not_equipped(radar_data.category, radar_name);
        clearInterval(player.using_radar);
        player.using_radar = null;
        player.radar_range = null;
        return;
    }
    else
    {
        player.c.inventory.modify_durability(
            player.c.inventory.contents[battery_data.category][has_battery],
            has_battery,
            -4
        )

    }

    const data = [];

    const my_pos = player.position;
    jcmp.players.forEach((p) => 
    {
        const pos = p.position;
        if (iu.utils.Distance(pos, my_pos) < player.radar_range && p.networkId != player.networkId && player.c 
            && player.c.inventory && p.dimension == player.dimension)
        {
            data.push({x: pos.x, y: pos.y, z: pos.z, id: p.networkId});
        }
    });

    iu.fakeplayer.fake_players.forEach((entry) => 
    {
        const pos = new Vector3f(entry.x, entry.y, entry.z);
        if (entry.owner != player.c.general.steam_id && iu.utils.Distance(pos, my_pos) < player.radar_range)
        {
            data.push({x: pos.x, y: pos.y, z: pos.z, id: entry.id})
        }
    })

    if (data.length > 0)
    {
        jcmp.events.CallRemote('itemuse/update_radar', player, JSON.stringify(data));
    }
}