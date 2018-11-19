/**
 * Generates lootbox objects from spawn data, and removes old ones if they exist
 */
function GenerateLoot()
{
    console.log('[Loot] Generating loot...');

    if (loot.spawns.length > 0)
    {
        for (let i = 0; i < loot.spawns.length; i++)
        {
            loot.spawns[i].remove();
        }

        loot.spawns = [];
        loot.cell.GenerateCellArray();
    }

    for (let i = 0; i < loot.spawn_data.length; i++)
    {
        const data = JSON.parse(JSON.stringify(loot.spawn_data[i]));
        data.pos = new Vector3f(data.pos.x, data.pos.y, data.pos.z);
        data.rot = new Vector3f(data.rot.x, data.rot.y, data.rot.z);

        const demo = dist(data.pos, sz_center) < sz_radius;
        
        const lootbox = new loot.lootbox(data.pos, data.rot, data.type, demo);
        loot.cells[lootbox.cell.x][lootbox.cell.y].push(lootbox);
        loot.spawns.push(lootbox);
    }

    console.log(`[Loot] ${loot.spawns.length} lootboxes generated!`);
    jcmp.events.Call('loot/finished_generating', JSON.parse(JSON.stringify(loot.spawn_data)));

    loot.LoadStorages(); // After loot has been generated, load storages
}

module.exports = GenerateLoot;

const sz_center = new Vector3f(3422.76318359375, 1033.217041015625, 1329.4124755859375);
const sz_radius = 100;


// Vector 2 distance
function dist(v1, v2)
{
    const vec1 = new Vector3f(v1.x, 0, v1.z);
    const vec2 = new Vector3f(v2.x, 0, v2.z);
    return vec1.sub(vec2).length;
}

