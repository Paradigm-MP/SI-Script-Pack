// Called when the player drags items around in the vehicle's inventory
jcmp.events.AddRemoteCallable('vinventory/sync/change_index', (player, category, old_index, new_index, stack) => 
{
    if (!player.c || !player.c.inventory || !inv.utils.exists(player) || old_index < 0 || new_index < 0 || !category
        || !stack || !player.vehicle || !player.vehicle.inventory)
    {
        console.log(`vA player just tried to swap items but something was wrong!`);
        console.log(`${player.name} ${player.client.steamId}`);
        console.log(`${old_index} ${new_index} ${stack}`);
        return;
    }

    player.vehicle.inventory.change_index(category, old_index, new_index, JSON.parse(stack), player);
})


jcmp.events.AddRemoteCallable('vinventory/sync/click_item', (player, stack, index) => 
{
    if (!inv.utils.exists(player) || !stack || typeof(index) != 'number' || !player.c || !player.c.inventory
        || !player.vehicle || !player.vehicle.inventory)
    {
        console.log(`vPlayer tried to click item without proper arguments.`);
        return;
    }

    player.vehicle.inventory.click_item(JSON.parse(stack), index, player);
})


jcmp.events.AddRemoteCallable('vinventory/sync/shift_item', (player, stack, index) => 
{
    if (!inv.utils.exists(player) || !stack || typeof(index) != 'number' || !player.c || !player.c.inventory
        || !player.vehicle || !player.vehicle.inventory)
    {
        console.log(`vPlayer tried to shift item without proper arguments.`);
        return;
    }

    player.vehicle.inventory.shift_item(JSON.parse(stack), index, player);
})