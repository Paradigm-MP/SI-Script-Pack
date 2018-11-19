// When a player clicks an item
jcmp.events.Add('inventory/events/use_item', (player, stack, index) => 
{
    const item = stack.get_first().duplicate();
    item.amount = 1;

    if (loot.config.lootbags[item.name] != undefined && player.c.inventory)
    {
        jcmp.notify(player, {
            title: `Opened ${item.name}!`,
            icon: `<i class='fa fa-gift'></i>`,
            icon_color: '#F768DB',
            time: 7500
        })

        const stacks = loot.generator.GetLootBagLoot(item.name);

        let msg = `Opened ${item.name} and got: `;
        const drops = [];

        for (let i = 0; i < stacks.length; i++)
        {
            msg = msg + `[${stacks[i].prop('name')} x${stacks[i].get_amount()}] `;
            drops.push(stacks[i].duplicate().to_array_chat());
        }

        loot.chat.send(player, msg, new RGBA(255,255,255,255), {stack: JSON.stringify(drops)});

        player.c.inventory.remove_item(item, index);

        for (let i = 0; i < stacks.length; i++)
        {
            // Create dropboxes if we can't add all the items
            const return_stack = player.c.inventory.add_stack(stacks[i]);

            if (return_stack && return_stack.contents && return_stack.contents.length > 0)
            {
                loot.CreateDropbox({
                    pos: player.position,
                    rot: player.rotation,
                    stack: return_stack
                })
            }

        }

    }
})
