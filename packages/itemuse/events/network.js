// When a player tries to use an item but is not standing still
jcmp.events.AddRemoteCallable('itemuse/cancel_item', (player, reason) => 
{
    if (player.iu.using && player.iu.item)
    {
        if (reason == 1)
        {
            jcmp.notify(player, {
                title: 'Cannot use item!',
                subtitle: `You must be standing still to use ${player.iu.item.name}!`,
                preset: 'warn'
            })

            /*iu.chat.send(player, 
                `<b>You must be standing still to use [#FFFF00]${player.iu.item.name}[#FF0000]!</b>`, 
                new RGBA(255,0,0,255), {timeout: 10});*/
            player.c.inventory.can_drop = true;
        }
        else if (reason == 2)
        {
            jcmp.notify(player, {
                title: 'Item usage cancelled!',
                subtitle: `You took damage, so usage of ${player.iu.item.name} was cancelled.`,
                preset: 'warn'
            })

            /*iu.chat.send(player, 
                `<b>Damage taken. Usage of [#FFFF00]${player.iu.item.name}[#FF0000] aborted.</b>`, 
                new RGBA(255,0,0,255), {timeout: 10});*/
            player.c.inventory.can_drop = true;
        }
        else if (reason == 3)
        {
            jcmp.notify(player, {
                title: 'Item usage cancelled!',
                subtitle: `Usage of ${player.iu.item.name} was cancelled.`,
                preset: 'warn'
            })

            /*iu.chat.send(player, 
                `<b>Usage of [#FFFF00]${player.iu.item.name}[#FF0000] cancelled.</b>`, 
                new RGBA(255,0,0,255), {timeout: 10});*/
            player.c.inventory.can_drop = true;
        }
    }

    clearTimeout(player.iu.timeout);
    player.iu = {};
})

jcmp.events.AddRemoteCallable('itemuse/complete_item', (player) => 
{
    setTimeout(function() 
    {
        player.iu = {};
    }, 100);

    setTimeout(function() 
    {
        player.c.inventory.can_drop = true;
    }, 1000);
        
})