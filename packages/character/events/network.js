// Custom network events

// Once the player's UI is ready, send them data
jcmp.events.AddRemoteCallable('character/client_loaded_ui', (player) => 
{
    if (!player) {return;}
    // Create a character property on the player
    player.c = {active: false};

    // If they are staff, add another space for them
    if (c.tags.tagged[`${player.client.steamId}_1`] != undefined)
    {
        const tag = c.tags.tagged[`${player.client.steamId}_1`];
        
        if (tag.tagname == 'Mod' || tag.tagname == 'Admin')
        {
            jcmp.events.CallRemote('character/AddEntry', player);
        }
    }

    Promise.all(
    [  
        GetCharacterData(`${player.client.steamId}_1`, player),
        GetCharacterData(`${player.client.steamId}_2`, player)
        //GetCharacterData(`${player.client.steamId}_3`) // No 3rd characters anymore
    ])
    .then((data) => 
    {
        jcmp.events.CallRemote('character/send_characters_data', player, JSON.stringify(data));
        player.c_pend = data;
        player.pend_loaded = true;
    })
    .catch((err) => {console.log('error from network.js 32'); console.log(err)});

})

/**
 * Get character data from a specific steamid (12098382103_1) with promises.
 * 
 * @param {string} steam_id - Steam id and suffix of the character we want data from.
 * @param {Player} player - The player that we are getting data from. Only used for banned people.
 * @returns {Promise} - Promise of the data we got.
 */
function GetCharacterData(steam_id, player)
{
    let con;
    const data = {};

    return new Promise((resolve, reject) => 
    {
        let sql = `SELECT steam_id FROM general WHERE steam_id = '${steam_id}'`;
        c.pool.query(sql).then((result) =>
        {
            // If the player exists
            if (result != undefined && result.length > 0)
            {
                // Get their general data
                sql = `SELECT * FROM general WHERE steam_id = '${steam_id}'`;
                return c.pool.query(sql);
            }
            else
            {
                return null;
            }
            
        }).then((result) =>
        {
            if (result != undefined && result.length > 0)
            {
                // Store deletion data
                data.general = result[0];

                // Query banned data
                sql = `SELECT * FROM banned WHERE steam_id = '${steam_id}'`;
                return c.pool.query(sql);
            }
            else
            {
                return null;
            }
        }).then((result) =>
        {
            if (result != undefined && result.length > 0)
            {
                const ban_date = (result[0].ban_date == "Forever") ? 
                    9999999999999999 : c.util.FormatBanDate(result[0].ban_date);

                const split = ban_date.split("-");
                    
                const unban_time = (result[0].ban_date == "Forever") ? "" : 
                    new Date(parseInt(split[0]), (parseInt(split[1]) - 1 > -1) ? parseInt(split[1]) - 1 : 11, parseInt(split[2])).getTime();
                const current_time = new Date().getTime();

                if (result[0].ban_date == "Forever" || unban_time > current_time || unban_time == NaN)
                {
                    // Store banned data
                    data.banned = result[0];
                    player.banned = true;
                    jcmp.events.Call('log', 'connections', `A player with steam_id ${steam_id} just loaded, but they 
                        are banned until ${result[0].ban_date}.`);
                }
                else if (unban_time < current_time) // If their temp ban is over
                {
                    c.ban.Unban(steam_id);
                }


            }
            sql = `SELECT * FROM tags WHERE steam_id = '${steam_id}'`;
            return c.pool.query(sql);
        }).then((result) =>
        {
            if (result != undefined && result.length > 0)
            {
                data.tag = 
                {
                    name: result[0].tagname,
                    color: result[0].tagcolor
                }
            }
            sql = `SELECT * FROM exp WHERE steam_id = '${steam_id}'`;
            return c.pool.query(sql);
        }).then((result) =>
        {
            if (result != undefined && result.length > 0)
            {
                data.exp = 
                {
                    experience: result[0].experience,
                    level: result[0].level,
                    max: c.exp.GetMaxExp(result[0].level)
                }
            }
            sql = `SELECT * FROM hungerthirst WHERE steam_id = '${steam_id}'`;
            return c.pool.query(sql);
        }).then((result) => 
        {
            if (result != undefined && result.length > 0)
            {
                data.hunger = result[0].hunger;
                data.thirst = result[0].thirst;
            }
            //con.end();
            resolve(data);
        })
    })
    

}

// Player hits 'Confirm' on the new character name dialogue to lock in their new character.
jcmp.events.AddRemoteCallable('character/client_create_new', (player, name, id) => 
{
    const steam_id = `${player.client.steamId}_${id}`;

    // Insurance in case something went wrong and we got a weird name.
    name = name.replace(/\\/g, '');
    name = name.replace(/\s\s+/g, ' ');

    // If something is wrong, don't do anything
    if (id < 1 || id > 3 || name.length < 3 || name.length > 30 || !c.util.ProcessNameInput(name))
    {
        jcmp.events.Call('log', 'character', `Player with steam_id ${steam_id} tried to create new 
            character, but their name or id does not fit requirements. Name: ${name} id: ${id}`);
        jcmp.events.CallRemote('character/bad_name', player);
        return;
    }

    // If someone tries to hack a new character
    if (!player.pend_loaded || player.banned || player.c_pend[0] && player.c_pend[0].banned)
    {
        jcmp.events.Call('log', 'character', `Player with steam_id ${player.client.steamId} tried to create new 
            character, but they are banned.`);
        player.Kick('Error when creating character.');
        return;
    }


    let sql = `SELECT steam_id FROM general WHERE steam_id = '${steam_id}'`;
    c.pool.query(sql).then((result) =>
    {
        // If this player exists
        if (result != undefined && result.length > 0)
        {
            console.log(`Player ${player.name} tried to create new character with name ${name} and id ${id},
                but they already existed. Aborting!`);
            jcmp.events.Call('log', 'character', `Player with steam_id ${player.client.steamId} tried to 
                create character, but they already existed. Name: ${name} id: ${id}`);
            player.Kick('Error when creating character.');
            return;
        }
        else
        {  
            // Now that we know they don't have a player in this spot, let's make em one!
            jcmp.events.CallRemote('character/login_new', player);
            c.names.push(name);
            return CreateNewCharacter(player, name, id);
        }

    }).then((result) => 
    {
        if (result != undefined)
        {
            return c.tags.TagNewCharacter(player, steam_id);
        }
        else
        {
            console.log(`Player ${player.name} tried to create new character with name ${name} and id ${id},
                but there was a generic error. Aborting!`);
            jcmp.events.Call('log', 'character', `Player with steam_id ${steam_id} tried to create 
                character, but there was a generic error.`);
            player.Kick('Error in creating character. Code: 442');
            return;
        }

    }).then((result) => 
    {
        LoadCharacter(player, id);
        
        jcmp.events.Call('log', 'character', `Player with steam_id ${steam_id} created a new character with name 
            ${name}.`);

        //con.end();
        return;
    })

})

/**
 * Creates a new character in the database with given information and returns an object with all player information.
 * 
 * @param {Player} player - The player who is creating a character.
 * @param {string} name - The name of the character to be created.
 * @param {number} id - The id of the character to be created. 1-3
 * 
 * @returns {object} - An object of all data, similar to that taken from the databases on connect.
 */
function CreateNewCharacter(player, name, id)
{
    // If for some reason they disconnect and their player dies
    if (!c.util.exists(player) || id < 1 || id > 2)
    {
        return;
    }

    const steam_id = player.client.steamId + `_${id}`;
    const ip = player.client.ipAddress;
    const date = c.util.GetCurrentDate();
    const color = c.randomcolor();
    let con;

    const data = {};

    return new Promise((resolve, reject) => 
    {
        // First, insert them into positions
        let sql = `INSERT INTO positions (steam_id, x, y, z, x_r, y_r, z_r) VALUES 
                ('${steam_id}', '${c.config.default_spawn.x}', '${c.config.default_spawn.y}', '${c.config.default_spawn.z}',
                    '${c.config.default_spawn.x}', '${c.config.default_spawn.y}', '${c.config.default_spawn.z}')`;
        c.pool.query(sql).then((result) => 
        {
            // Next, insert them into positions
            sql = `INSERT INTO general (steam_id, name, boxes_looted, time_online, last_played, items_crafted,
                deaths, last_login_ip, color, kills, objects_placed, health, chat_banned) 
                VALUES ('${steam_id}', '${name}', '0', '0', '${date}', '0',
                '0', '${ip}', '${color}', '0', '0', '800', '0')`;
            return c.pool.query(sql);
        }).then((result) => 
        {
            // Next, insert them into positions
            sql = `INSERT INTO exp (steam_id, experience, level) VALUES ('${steam_id}', '0', '1')`;
            return c.pool.query(sql);
        }).then((result) => 
        {
            // Next, insert them into hunger
            sql = `INSERT INTO hungerthirst (steam_id, hunger, thirst) VALUES ('${steam_id}', '100', '100')`;
            return c.pool.query(sql);
        }).then((result) => 
        {
            const spawn = c.config.default_spawn;

            data.general = 
            {
                steam_id: steam_id,
                name: name,
                boxes_looted: 0,
                time_online: 0,
                last_played: date,
                items_crafted: 0,
                deaths: 0,
                last_login_ip: ip,
                color: color,
                kills: 0,
                objects_placed: 0,
                respawn_pos: new Vector3f(spawn.x, spawn.y, spawn.z),
                health: 800,
                chat_banned: 0
            }
            player.c.general = data.general;
            player.c.hunger = 100;
            player.c.thirst = 100;

            data.exp = 
            {
                experience: 0,
                level: 1,
                max: c.exp.GetMaxExp(1)
            }
            player.c.exp = data.exp;

            //con.end();
            resolve(data);
        })
    })

}

// When a player tries to login as one of their characters
jcmp.events.AddRemoteCallable('character/login', (player, id) => 
{
    if (player.c_pend[id - 1] != undefined)
    {
        if (player.banned || (player.c_pend[id - 1].banned && player.c_pend[id - 1].banned.ban_date))
        {
            console.log(`Player with steam id ${player.client.steamId} is trying to login with banned character!`);
            player.Kick('Login failed.');
            return;
        }

        player.c.general = player.c_pend[id - 1].general;
        player.tag = player.c_pend[id - 1].tag;
        player.c.exp = player.c_pend[id - 1].exp;
        player.c.hunger = player.c_pend[id - 1].hunger;
        player.c.thirst = player.c_pend[id - 1].thirst;
        LoadCharacter(player, id);
        jcmp.events.Call('log', 'character', `Player with steam_id ${player.client.steamId} logged in to character 
            with id ${id}.`);
    }
    else
    {
        console.log(`Player ${player.name} tried to login to nonexisting character id ${id}.`);
        jcmp.events.Call('log', 'character', `Player with steam_id ${steam_id} tried to login to nonexisting 
            character id ${id}.`);
        player.Kick('Login failed.');
    }
})

/**
 * Loads the rest of a character's data (such as position), sets their position, and fires an event so other modules can load data.
 */
function LoadCharacter(player, id)
{
    const steam_id = `${player.client.steamId}_${id}`;
    const ip = player.client.ipAddress;

    let sql = `SELECT x,y,z,x_r,y_r,z_r FROM positions WHERE steam_id = '${steam_id}'`;
    c.pool.query(sql).then((result) => 
    {
        player.health = (player.c.general.health > 0) ? player.c.general.health : 800;

        const spawn_position = new Vector3f(result[0].x, result[0].y, result[0].z);

        player.respawnPosition = new Vector3f(result[0].x_r, result[0].y_r, result[0].z_r);

        jcmp.events.CallRemote('set_dev_mode', player, jcmp.dev_mode);

        player.c.general.respawn_pos = player.respawnPosition;
        player.c.ready = true;

        // Slight delay on initialization after setting position and health for combat log reasons
        setTimeout(() => {
            if (player && player.c && player.c.general)
            {
                jcmp.events.Call('character/Loaded', player, id, player.c.general.name);
                jcmp.events.CallRemote('character/Loaded', player, id, player.c.general.name, player.c.general.steam_id, JSON.stringify(player.c.general));

                setTimeout(() => {
                    if (player && player.c && player.c.general) {SetPos(player, spawn_position);}
                }, 1500);
            }
        }, 2000);

        player.desired_dimension = 0; // Dimension they should go to after loading
        player.c.active = true;
        player.c_pend = null;
        player.c.dead = false;

        // Exp stuff
        c.exp.SyncPlayerLevels(player);
        c.exp.BroadcastLevel(player);
        c.exp.UpdatePlayer(player);

        c.hunger.UpdateHunger(player);

        console.log(`${c.util.GetCurrentDateAndTime()} ${player.c.general.name} joined.`);

        player.c.interval_60 = setInterval(() => 
        {
            jcmp.events.Call('character/interval_60', player);
        }, 60 * 1000);

        const date = c.util.GetCurrentDate();

        let sql = `UPDATE general SET last_played = '${date}' WHERE steam_id = '${steam_id}'`;
        return c.pool.query(sql);
    }).then((result) => 
    {
        let sql = `UPDATE general SET last_login_ip = '${ip}' WHERE steam_id = '${steam_id}'`;
        return c.pool.query(sql);
    }).then((result) => 
    {
        // Check position to see if they got desynced in the crane or not
        /*setTimeout(() => 
        {
            if (player.position.sub(new Vector3f(3634.4101, 1181.5830, 1151.5611)).length < 1)
            {
                jcmp.events.Call('log', 'connections', 
                    `${player.c.general.name} [${steam_id}] desynced and was stuck in the crane. Kicking.`);
                player.Kick('A desync error occurred. Please try again later.');
                return;
            }
        }, 1000);*/
        //con.end();
    })
}

function SetPos(player, pos)
{
    if (player && player.AdvancedTeleport)
    {
        player.AdvancedTeleport(pos);
    }
    else if (player)
    {
        setTimeout(() => 
        {
            SetPos(player, pos);
        }, 1000);
    }
}