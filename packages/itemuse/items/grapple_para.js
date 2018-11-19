
// Fires when a player equips or unequips an item
jcmp.events.Add('inventory/events/equip_item', (player, item) => 
{
    const item_name = item.name;
    const equipped = item.equipped;

    if (item_name == 'Grapplehook' || item_name == 'DuraGrapple')
    {
        player.grapple = item_name;
        jcmp.events.CallRemote('itemuse/grapple_toggle', player, equipped);
    }
    else if (item_name == 'Parachute')
    {
        jcmp.events.CallRemote('itemuse/para_toggle', player, equipped);
    }
    else if (item_name == 'Wingsuit')
    {
        jcmp.events.CallRemote('itemuse/wingsuit_toggle', player, equipped);
    }

})

jcmp.events.AddRemoteCallable('itemuse/grapple_change', (player, change) => 
{
    if (change < 0 && player.grapple)
    {
        player.c.inventory.modify_dura_equipped(player.grapple, change);
    }
})

jcmp.events.AddRemoteCallable('itemuse/para_change', (player, change) => 
{
    if (change < 0)
    {
        player.c.inventory.modify_dura_equipped('Parachute', change);
    }
})

jcmp.events.AddRemoteCallable('itemuse/wingsuit_change', (player, change) => 
{
    if (change < 0)
    {
        player.c.inventory.modify_dura_equipped('Wingsuit', change);
    }
})