jcmp.events.Add('character/exp/GainLevel', (player, level) => 
{
    player.c.inventory.update_slots(inv.utils.GetSlots(player.c.exp.level, player.c.inventory));

    const old_slots = JSON.parse(JSON.stringify(inv.config.default_slots[level - 1]));
    const new_slots = JSON.parse(JSON.stringify(inv.config.default_slots[level]));

    for (let cat in old_slots)
    {
        if (new_slots[cat] > old_slots[cat]) // If a slot was gained in a category
        {
            const diff = new_slots[cat] - old_slots[cat];
            const plural = (diff > 1) ? 'slots' : 'slot';

            inv.chat.send(player, `Gained ${diff} ${plural} in the ${cat} category.`, new RGBA(0,255,0,255), {channel: 'Log'});
        }
    }

})