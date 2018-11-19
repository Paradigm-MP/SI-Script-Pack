jcmp.events.Add('chat_command', (player, msg) => 
{
    if (msg.startsWith('/item ') && (inv.utils.is_staff(player) || jcmp.dev_mode))
    {
        const item = msg.replace('/item ', '');
        const data = inv.utils.FindItem(item);

        if (data)
        {
            data.amount = 1;
            if (data.durable)
            {
                data.durability = Math.round(data.max_durability * Math.random());
            }

            if (item.indexOf('Dogtag') > -1)
            {
                data.custom_data.dogtag = item.replace(`'s Dogtag`, '').trim();
            }
            
            const g = new inv.item(data);
            player.c.inventory.add_item(g);
            inv.chat.send(player, `Added ${item} to your inventory.`, new RGB(0,255,0), {timeout: 10});
        }


    }
    else if (msg == '/bav' && (inv.utils.is_staff(player) || jcmp.dev_mode))
    {
        
        const data = inv.utils.FindItem('Bavarium');

        if (data)
        {
            data.amount = 99;
            const g = new inv.item(data);
            player.c.inventory.add_item(g);
            inv.chat.send(player, `Added Bavarium to your inventory.`, new RGB(0,255,0), {timeout: 10});
        }


    }
})

