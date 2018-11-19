/**
 * Creates a new storage in the world. Used when loading from DB or when a player places a new one.
 * 
 * @param {*} owner_steam_id - Steam id of the owner of this storage
 * @param {*} type - Type of storage, eg Small Storage, Large Storage, Locked Storage
 * @param {*} pos - Must be Vector3f
 * @param {*} rot - Must be Vector3f
 * @param {*} contents - Can be undefined
 * @param {*} access_level - String of access level (Friends, Only Me, or Everyone)
 * 
 * @returns {*} - Returns the storage (lootbox) that was created.
 */
module.exports = function(id, owner_steam_id, type, pos, rot, contents, access_level, upgrades, name, code)
{
    // Create a new lootbox for the storage
    const lootbox = new loot.lootbox(pos, rot, 6);
    lootbox.contents = contents;
    lootbox.storage = new loot.storage(id, owner_steam_id, lootbox, access_level, type, upgrades, name, code);
    loot.cells[lootbox.cell.x][lootbox.cell.y].push(lootbox);

    lootbox.sync_nearby(); // Sync to nearby

    return lootbox;
}