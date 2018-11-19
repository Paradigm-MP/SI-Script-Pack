
jcmp.events.AddRemoteCallable('storages/menu_ready', (player) => 
{
    player.c.storages = [];

    const steam_id = player.c.general.steam_id;
    const storage_data = []; // Sync data of storages for the player's menu

    // Go through all storages and find those that are owned by this player
    loot.storages.forEach((storage) => 
    {
        if (String(storage.owner_steam_id) === String(steam_id))
        {
            player.c.storages.push(storage);

            storage_data.push({
                id: storage.id,
                name: storage.name,
                num_items: storage.lootbox.contents.length,
                max_slots: storage.get_max_slots(),
                access_level: storage.access_level,
                lock_type: storage.get_lock_type(),
                position: {x: storage.lootbox.position.x, y: storage.lootbox.position.y, z: storage.lootbox.position.z}
            })
        }
    });

    jcmp.events.CallRemote('storages/sync/init', player, JSON.stringify(storage_data));
    jcmp.events.CallRemote('storages/sync/update_max', player, loot.config.storages.max[player.c.exp.level]);
})