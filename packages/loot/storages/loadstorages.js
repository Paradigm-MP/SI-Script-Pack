module.exports = function()
{
    // Loads all storages from DB into game world
    const sql = `SELECT * FROM storages`;
    loot.pool.query(sql).then((result) =>
    {
        if (result.length > 0)
        {
            for (let i = 0; i < result.length; i++)
            {
                // Create storage, which automatically adds to game world and syncs
                const lootbox = loot.CreateStorage(
                    parseInt(result[i].storage_id), 
                    `${result[i].owner_steam_id}`, 
                    `${result[i].type}`, 
                    new Vector3f(result[i].x, result[i].y, result[i].z), 
                    new Vector3f(result[i].x_r, result[i].y_r, result[i].z_r), 
                    loot.storage.convert_string(`${result[i].contents}`), 
                    `${result[i].access_level}`,
                    loot.storage.convert_upgrades(`${result[i].upgrades}`),
                    `${result[i].name}`,
                    `${result[i].code}`
                );

                loot.storages.push(lootbox.storage);
            }

            console.log(`${result.length} storages loaded.`);

        }
    })

}