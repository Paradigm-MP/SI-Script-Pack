
jcmp.events.AddRemoteCallable('itemuse/complete_item', (player) => 
{
    if (player.iu.item && iu.config.usables[player.iu.item.name] && player.iu.using && player.iu.completed
        && player.iu.item.name == 'Binoculars')
    {
        jcmp.events.CallRemote('itemuse/open_binoculars', player);

        player.using_binoculars = setInterval(function() 
        {
            UpdateBinoculars(player);
        }, 2000);

    }

})

/*jcmp.events.AddRemoteCallable('itemuse/close_radar', (player) => 
{
    clearInterval(player.using_radar)
    player.using_radar = null;
    player.radar_range = null;
})*/

function UpdateBinoculars(player)
{
    if (!player.using_binoculars) {return;}

    const bino_data = jcmp.inv.FindItem('Batteries');
    bino_data.amount = 1;
    const binoculars = new jcmp.inv.item(bino_data);
    const has_bino = player.c.inventory.has_item(binoculars, true);

    if (has_bino === false || has_bino == -1)
    {
        jcmp.events.CallRemote('itemuse/close_binoculars', player);
        clearInterval(player.using_binoculars);
        player.using_binoculars = null;
        return;
    }
    else
    {
        player.c.inventory.modify_durability(
            player.c.inventory.contents[bino_data.category][has_bino],
            has_bino,
            -1
        )
    }
    
}