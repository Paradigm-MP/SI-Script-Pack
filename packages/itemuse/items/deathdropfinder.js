
jcmp.events.AddRemoteCallable('itemuse/complete_item', (player) => 
{
    if (player.iu.item && player.iu.item.name == 'Death Drop Finder' 
        && player.iu.using && player.iu.completed)
    {

        let death_point = player.death_point;

        if (!death_point)
        {
            death_point = iu.jc.death_points[player.c.general.steam_id];
        }

        player.c.inventory.remove_item(player.iu.item, player.iu.index);

        if (death_point)
        {
            const pos = death_point;
            jcmp.events.CallRemote('itemuse/set_death_marker', player, pos.x, pos.y, pos.z);

            jcmp.notify(player, {
                title: 'Death point marked!',
                subtitle: 'Last death point has been marked.',
                preset: 'success',
                time: 7500
            })

            //iu.chat.send(player, `<b>Last death point has been marked.</b>`, new RGBA(255,96,28,255), {timeout: 30});
        }
        else
        {
            jcmp.notify(player, {
                title: 'Item failed',
                subtitle: 'Unable to mark last death point.',
                time: 15000
            })
            //iu.chat.send(player, `<b>Unable to mark last death point.</b>`, new RGBA(255,0,0,255), {timeout: 30});
        }

    }

})