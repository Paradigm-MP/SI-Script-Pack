
jcmp.events.AddRemoteCallable('itemuse/complete_item', (player) => 
{
    if (player.iu.item && iu.config.usables[player.iu.item.name] && player.iu.using && player.iu.completed
        && iu.config.usables[player.iu.item.name].item && player.iu.item.name == 'Rainwater Collector')
    {

        if (player.iu.item.durability != undefined)
        {
            player.c.inventory.modify_durability(player.iu.stack, player.iu.index, 
                -iu.config.usables[player.iu.item.name].durability);
        }
        else
        {
            player.c.inventory.remove_item(player.iu.item, player.iu.index);
        }

        if (jcmp.current_weather == 1 || jcmp.current_weather == 3)
        {
            const item_data = jcmp.inv.FindItem(iu.config.usables[player.iu.item.name].item);
            item_data.amount = Math.ceil(iu.config.usables[player.iu.item.name].max_amt * Math.random());
            const item = new jcmp.inv.item(item_data);
            const stack = new jcmp.inv.stack([item]);

            player.c.inventory.add_item(item);

            jcmp.notify(player, {
                title: 'Rainwater obtained!',
                subtitle: `You obtained [${item_data.name} x${item_data.amount}]`,
                preset: 'success',
                time: 5000
            })

            /*iu.chat.send(player, `Obtained [${item_data.name} x${item_data.amount}]`, new RGBA(255,255,255,255), 
                {stack: JSON.stringify([stack.to_array_chat()])});*/
        }
        else
        {
            jcmp.notify(player, {
                title: 'No rainwater obtained',
                subtitle: `Try catching rainwater when it's raining outside.`,
                time: 7500
            })

            /*iu.chat.send(player, `No rainwater was obtained.`, new RGBA(255,255,255,255), 
                {timeout: 15});*/
        }

    }

})