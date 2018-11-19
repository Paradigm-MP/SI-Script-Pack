// Called when the player drags items around in their inventory
jcmp.events.AddRemoteCallable('inventory/sync/change_index', (player, category, old_index, new_index, stack) => 
{
    if (!player.c || !player.c.inventory || !inv.utils.exists(player) || old_index < 0 || new_index < 0 || !category
        || !stack)
    {
        console.log(`A player just tried to swap items but something was wrong!`);
        console.log(`${player.name} ${player.client.steamId}`);
        console.log(`${old_index} ${new_index} ${stack}`);
        return;
    }

    player.c.inventory.change_index(category, old_index, new_index, JSON.parse(stack));
})


jcmp.events.AddRemoteCallable('inventory/sync/click_item', (player, stack, index) => 
{
    if (!inv.utils.exists(player) || !stack || typeof(index) != 'number' || !player.c || !player.c.inventory)
    {
        console.log(`Player tried to click item without proper arguments.`);
        return;
    }

    player.c.inventory.click_item(JSON.parse(stack), index);
})


jcmp.events.AddRemoteCallable('inventory/sync/drop_item', (player, stack, index, amount) => 
{
    if (!inv.utils.exists(player) || !stack || typeof(index) != 'number' || !player.c || !player.c.inventory || !amount
        || amount < 1 || amount > 99)
    {
        console.log(`Player tried to drop item without proper arguments.`);
        return;
    }

    player.c.inventory.drop_item(JSON.parse(stack), index, amount);
})


jcmp.events.AddRemoteCallable('inventory/sync/shift_item', (player, stack, index) => 
{
    if (!inv.utils.exists(player) || !stack || typeof(index) != 'number' || !player.c || !player.c.inventory)
    {
        console.log(`Player tried to shift item without proper arguments.`);
        return;
    }

    player.c.inventory.shift_item(JSON.parse(stack), index);
})


// Called when the player loads the UI and is ready to receive inventory data
jcmp.events.AddRemoteCallable('inventory/Ready', (player) => 
{
    jcmp.events.CallRemote('inventory/init/ammo_types', player, JSON.stringify(jcmp.iu_config.weapons));
    LoadInventory(player, 1);
})

function LoadInventory(player, t)
{
    if (t >= 5)
    {
        jcmp.events.Call('log', 'inv_db_error', `Could not load inventory for ${player.c.general.steam_id}.`);
        console.log(`Could not load inventory for ${player.c.general.steam_id}.`);
        player.Kick('an error occurred');
        return;
    }


    const steam_id = player.c.general.steam_id;

    const sql = `SELECT data FROM inventory WHERE steam_id = '${steam_id}'`;

    inv.pool.query(sql).then(function(result)
    {
        if (result && result[0] && result[0].data != undefined)
        {
            const inv_str = (result[0].data.length > 0) ? result[0].data : ' ';
            

            const inv_data = inv.inventory.convert_string(inv_str, player.c.exp.level);
            const inventory = new inv.inventory(inv_data.data, inv_data.slots, player);

        }
        else
        {
            const default_inventory = inv.utils.GenerateDefaultInventory();

            const inventory = new inv.inventory(default_inventory, inv.config.default_slots[player.c.exp.level], player);
            inventory.update(); // Update so that it is saved in SQL

        }
        
        //con.release();
    }).catch((err) => 
    {
        console.log(err);
        jcmp.events.Call('log', 'inv_db_error', `Inventory load error for ${player.c.general.steam_id}: ${err}`);
        LoadInventory(player, t+1);
    })

}