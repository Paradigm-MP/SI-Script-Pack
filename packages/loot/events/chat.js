/*jcmp.events.Add('chat_command', (player, msg) => 
{
    if (msg.startsWith('/loot '))
    {
        const tier = parseInt(msg.replace('/loot ', ''));

        if (tier < 1 || tier > 4) {return;}

        const lootbox = new loot.lootbox(5, 5, tier);

        lootbox.open(player, lootbox.id);
    }
})*/