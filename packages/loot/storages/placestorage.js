
jcmp.events.AddRemoteCallable('itemuse/complete_item', (player) => 
{
    if (player.iu.item && player.iu.using && player.iu.completed && loot.config.storages.types[player.iu.item.name])
    {
        const pos = player.position;

        // If they have maximum storages placed already
        if (player.c.storages.length >= loot.config.storages.max[player.c.exp.level])
        {
            jcmp.notify(player, {
                title: 'Cannot place storage',
                subtitle: 'You already have too many storages.',
                preset: 'warn_red',
                time: 5000
            })
            return;
        }

        // Check to see if the storage is in a blacklisted area
        for (let i = 0; i < loot.config.storages.blacklisted_areas.length; i++)
        {
            const area = loot.config.storages.blacklisted_areas[i];
            const area_pos = new Vector3f(area.pos.x, area.pos.y, area.pos.z);

            if (pos.sub(area_pos).length < area.radius)
            {
                jcmp.notify(player, {
                    title: 'Cannot place storage',
                    subtitle: 'This area is blacklisted. Try moving to a different location.',
                    preset: 'warn_red',
                    time: 5000
                })
                return;
            }
        }

        // Check if it is too close to another storage
        for (let i = 0; i < loot.storages.length; i++)
        {
            if (pos.sub(loot.storages[i].lootbox.position).length < 0.75)
            {
                jcmp.notify(player, {
                    title: 'Cannot place storage',
                    subtitle: 'You are placing this storage too close to another one.',
                    preset: 'warn_red',
                    time: 5000
                })
                return;
            }
        }

        if (pos.y < loot.config.storages.min_y)
        {
            jcmp.notify(player, {
                title: 'Cannot place storage',
                subtitle: 'You cannot place a storage underwater.',
                preset: 'warn_red',
                time: 5000
            })
            return;
        }

        player.c.inventory.remove_item(player.iu.item, player.iu.index);

        PlaceStorage(pos, player.rotation, player.iu.item.name, player);
    }

})

/**
 * Called when a player uses a storage item in their inventory and tries to place it at their position. 
 * This is done after blacklisted areas have been checked, so it inserts into the DB and creates it.
 * @param {*} pos 
 * @param {*} type 
 * @param {*} player 
 */
function PlaceStorage(pos, rot, type, player)
{
    const steam_id = player.c.general.steam_id;

    const access_level = 'Only Me';

    const sql = `INSERT INTO storages (owner_steam_id, x, y, z, x_r, y_r, z_r, type, contents, access_level, upgrades, code, name) 
    VALUES ('${steam_id}', '${pos.x}', '${pos.y}', '${pos.z}', '${rot.x}', '${rot.y}', '${rot.z}', 
            '${type}', '', '${access_level}', ' ', '${loot.config.storages.default_code}', '${loot.config.storages.default_name}')`;

    loot.pool.query(sql).then((result) =>
    {
        // Create the storage in the game world and sync to all players
        const lootbox = loot.CreateStorage(result.insertId, steam_id, type, pos, rot, [], access_level, [], loot.config.storages.default_name, loot.config.storages.default_code);

        player.c.storages.push(lootbox.storage);
        loot.storages.push(lootbox.storage);

        const storage_data = {
            id: lootbox.storage.id,
            type: lootbox.storage.type,
            name: lootbox.storage.name,
            num_items: lootbox.contents.length,
            max_slots: lootbox.storage.get_max_slots(),
            lock_type: lootbox.storage.get_lock_type(),
            access_level: lootbox.storage.access_level,
            position: {x: lootbox.storage.lootbox.position.x, y: lootbox.storage.lootbox.position.y, z: lootbox.storage.lootbox.position.z}
        }

        jcmp.events.CallRemote('storages/sync/add_entry', player, JSON.stringify(storage_data));
        jcmp.events.Call('log', 'loot', 
            `${player.c.general.name} placed ${type} at ${pos.x} ${pos.y} ${pos.z}.`);
    });


}