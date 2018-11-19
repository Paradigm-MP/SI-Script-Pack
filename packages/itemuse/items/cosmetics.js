jcmp.events.Add('character/Loaded', (player) => 
{
    player.c.cosmetics = [];

    jcmp.players.forEach((p) => 
    {
        if (p && p.c && p.c.ready && p.c.cosmetics)
        {
            jcmp.events.CallRemote('itemuse/cosmetics/sync', player, p.networkId, JSON.stringify(p.c.cosmetics));
        }
    });
})



// Fires when a player equips or unequips an item
jcmp.events.Add('inventory/events/equip_item', (player, item) => 
{
    const item_name = item.name;
    const equipped = item.equipped;

    if (iu.config.cosmetics[item_name])
    {
        if (equipped)
        {
            player.c.cosmetics.push({
                name: item_name,
                type: iu.config.cosmetics[item_name].type
            })
        }
        else
        {
            player.c.cosmetics = player.c.cosmetics.filter((e) => e.name != item_name);
        }

        jcmp.events.CallRemote('itemuse/cosmetics/sync', null, player.networkId, JSON.stringify(player.c.cosmetics));
    }
})