const min_dim = 100;
const max_dim = 200; // Uses dimensions 100-200
let dim = min_dim;
const lootbox_pos = new Vector3f(3541.30859375, 1032.2952880859375, 1300.013427734375);
const mysql = require('promise-mysql');
const config = jcmp.events.Call('GetDatabase')[0];


const pool = mysql.createPool({
    connectionLimit : 100, //important
    host     : config.host,
    user     : config.user,
    password : config.password,
    database : config.name,
    debug    :  false
});


const sql1 = `CREATE TABLE IF NOT EXISTS tutorial (steam_id VARCHAR(20))`;

pool.query(sql1).then(function(result)
{
});

jcmp.events.Add('character/Loaded', (player) => 
{
    const steam_id = player.c.general.steam_id;

    let sql = `SELECT * FROM tutorial WHERE steam_id = '${steam_id}'`;
    pool.query(sql).then((result) =>
    {
        let sql;

        if (result == undefined || result.length == 0 || !result)
        {
            if (player.c.general.time_online < 3)
            {
                jcmp.events.CallRemote('tutorial/load', player);
                player.tutorial_not_complete = true;
            }
            else
            {
                sql = `INSERT INTO tutorial (steam_id) VALUES ('${steam_id}')`;
                return pool.query(sql);
            }
        }
    })
})

jcmp.events.AddRemoteCallable('tutorial/start', (player) => 
{
    if (player.tutorial)
    {
        jcmp.notify(player, {
            title: 'Cannot start tutorial',
            subtitle: 'You are already taking the tutorial right now',
            preset: 'warn',
            time: 5000
        })
        return;
    }
    else if (!in_sz(player.position))
    {
        jcmp.notify(player, {
            title: 'Cannot start tutorial',
            subtitle: 'You must be in the safezone to start the tutorial',
            preset: 'warn',
            time: 5000
        })
        return;
    }

    player.tutorial = true;
    player.dimension = (dim > max_dim) ? min_dim : dim + 1;
})

jcmp.events.AddRemoteCallable('tutorial/spawn_box', (player) => 
{
    if (!player.tutorial || player.tutorial_box_spawned) {return;}

    player.tutorial_box_spawned = true;
    player.tutorial_box = new jcmp.lootbox(lootbox_pos, new Vector3f(0,0,0), 1);
    player.tutorial_box.dimension = player.dimension;
    player.tutorial_box.sync(player);
})


jcmp.events.Add('inventory/events/equip_item', (player, item) => 
{
    const item_name = item.name;
    const equipped = item.equipped;

    if (player.tutorial && player.tutorial_box_spawned && !player.tutorial_box 
        && !player.tutorial_equipped && item_name == 'Grapplehook' && equipped)
    {
        player.tutorial_equipped = true;
        jcmp.events.CallRemote('tutorial/equipped_grapple', player);
    }
})

jcmp.events.Add('loot/lootbox_emptied', (id) => 
{
    let done = false;
    jcmp.players.forEach((player) => 
    {
        if (!done && player.tutorial && player.tutorial_box && player.tutorial_box.id == id)
        {
            player.tutorial_box.remove();
            player.tutorial_box = null;

            jcmp.events.CallRemote('tutorial/box_complete', player);
            done = true;
        }
    });
})

jcmp.events.AddRemoteCallable('tutorial/end', (player) => 
{
    if (player.tutorial_not_complete)
    {
        const steam_id = player.c.general.steam_id;
        const sql = `INSERT INTO tutorial (steam_id) VALUES ('${steam_id}')`;
        pool.query(sql);
        player.tutorial_not_complete = false;
    }

    if (!player.tutorial) {return;}

    player.tutorial = null;
    player.tutorial_box_spawned = null;
    player.dimension = 0;

    if (player.tutorial_box)
    {
        player.tutorial_box.remove();
        player.tutorial_box = null;
    }

})

// Safezone stuff
const center = new Vector3f(3422.76318359375, 1033.217041015625, 1329.4124755859375);
const radius = 100;

function in_sz(pos)
{
    return dist(pos, center) < radius;
}


// vector2 distance
function dist(v1, v2)
{
    v1.y = 0;
    v2.y = 0;
    return v1.sub(v2).length;
    //const vec1 = new Vector3f(v1.x, 0, v1.z);
    //const vec2 = new Vector3f(v2.x, 0, v2.z);
    //return vec1.sub(vec2).length;
}