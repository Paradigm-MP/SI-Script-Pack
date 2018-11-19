
jcmp.events.AddRemoteCallable('itemuse/complete_item', (player) => 
{
    if (player.iu.item && player.iu.using && player.iu.completed && loot.config.storages.upgrades[player.iu.item.name])
    {
        const item_name = player.iu.item.name;
        // Check all conditions again
        if (!player.current_box || !player.current_box.is_storage || !player.current_box.storage)
        {
            jcmp.notify(player, {
                title: 'Cannot use item!',
                subtitle: `You must open a storage to use ${item_name}!`,
                preset: 'warn'
            })
            return;
        }

        if (!player.current_box.storage.can_use_item(item_name, player))
        {
            return;
        }

        player.c.inventory.remove_item(player.iu.item, player.iu.index);
        player.current_box.storage.apply_upgrade(item_name, player);

        jcmp.notify(player, {
            title: 'Upgrade Applied',
            subtitle: `You successfully applied ${item_name} to the storage`,
            time: 5000,
            preset: 'success'
        })
    }
})