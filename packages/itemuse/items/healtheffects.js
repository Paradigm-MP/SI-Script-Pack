
// Fires when a player equips or unequips an item
jcmp.events.Add('inventory/events/equip_item', (player, item) => 
{
    const item_name = item.name;
    const equipped = item.equipped;

    if (item_name == 'Ring of Regeneration')
    {
        player.ring = (equipped) ? item_name : null;
        jcmp.events.CallRemote('itemuse/healtheffects/set', player, 
            equipped ? JSON.stringify(iu.config.healtheffects[item_name]) : JSON.stringify(iu.config.healtheffects.default));
    }

})

jcmp.events.AddRemoteCallable('itemuse/healtheffects/mod_ring_dura', (player, mod) => 
{
    if (mod < 0 || !player.ring) {return;}

    player.c.inventory.modify_dura_equipped(player.ring, -mod);
})

jcmp.events.Add('character/Loaded', (player) => 
{
    jcmp.events.CallRemote('itemuse/healtheffects/set', player, JSON.stringify(iu.config.healtheffects.default));
})