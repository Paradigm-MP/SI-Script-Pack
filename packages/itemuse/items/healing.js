
jcmp.events.AddRemoteCallable('itemuse/complete_item', (player) => 
{
    if (player.iu.item && iu.config.usables[player.iu.item.name] && player.iu.using && player.iu.completed
        && iu.config.usables[player.iu.item.name].restore_hp)
    {
        const restore_amt = (iu.config.usables[player.iu.item.name].restore_hp / 100) * 800;
        const new_hp = Math.min(player.health + restore_amt, 800);

        player.health = new_hp;

        player.c.inventory.remove_item(player.iu.item, player.iu.index);

    }

})