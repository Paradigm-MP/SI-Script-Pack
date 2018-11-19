
jcmp.events.AddRemoteCallable('character/exp/ui_loaded', (player) => 
{
    UpdatePlayer(player);
})

jcmp.events.Add('chat_command', (player, msg, channel) => 
{
    if (msg.startsWith('/exp ') && (c.util.is_admin(player) || jcmp.dev_mode))
    {
        let exp = parseInt(msg.replace('/exp ', ''));
        c.chat.send(player, `You received ${exp} experience.`);
        GiveExp(player, exp);
    }
})



/**
 * Returns an integer that is the amount of experience needed to reach the next level.
 * 
 * @param {integer} level - Level that the player is currently.
 * 
 * @returns {integer} - Amount of experience needed to reach the next level.
 */

function GetMaxExp(level)
{
    return Math.ceil(Math.pow(level, 5) * 0.0015 + level * 12 + 80) * 2; // old: level * 200
}

/**
 * Updates a player's current experience when they kill another player.
 * 
 * @param {Player} killer - The player that killed another player.
 * @param {Player} killed - The Player that was killed.
 */

function UpdateExpOnKill(killer, killed)
{
    if (killed.c.exp.level != c.config.exp.max_level && !killed.suiciding && !jcmp.in_neutralzone(killed))
    {
        killed.c.exp.experience = Math.round(killed.c.exp.experience / 2); // Player loses half their exp
        UpdatePlayer(killed);
        UpdateDatabase(killed);
    }

    if (killer != undefined && killer.networkId != killed.networkId && !jcmp.in_neutralzone(killed)
        && !jcmp.in_neutralzone(killer))
    {
        // Give killer exp
        GiveExp(killer, c.config.exp.kill);
    }

}


/**
 * Checks if a player has gained a new level, and updates experience, level, and max experience if so.
 * Also updates database, so please do not update database and call this.
 * Recursive in case a player gets a ton of experience at once and gains multiple levels.
 * 
 * @param {Player} player - The player that we want to check if they gained a level.
 */

function CheckExperience(player)
{
    const old_level = player.c.exp.level;
    let new_level = old_level;
    while (player.c.exp.experience >= player.c.exp.max && player.c.exp.level < c.config.exp.max_level)
    {
        player.c.exp.level = Math.min(player.c.exp.level + 1, c.config.exp.max_level);
        player.c.exp.experience -= player.c.exp.max;
        player.c.exp.max = GetMaxExp(player.c.exp.level);

        if (player.c.exp.level === c.config.exp.max_level)
        {
            player.c.exp.experience = player.c.exp.max;
        }

        c.chat.send(player, `<b>Level Up! You are now level ${player.c.exp.level}!</b>`, new RGBA(0,255,0,255), {channel: 'Log'});
        
        jcmp.events.Call('log', 'character', 
            `Player ${player.c.general.name} gained a level! They are now level ${player.c.exp.level}.`);

        UpdatePlayer(player);
        BroadcastLevel(player);
        UpdateDatabase(player);

        new_level = player.c.exp.level;
        jcmp.events.Call('character/exp/GainLevel', player, player.c.exp.level);
        
    }

    UpdatePlayer(player);
    BroadcastLevel(player);
    UpdateDatabase(player);
}


/**
 * Sends a certain player a message with their current experience, level, and max experience.
 * 
 * @param {Player} player - The player that we want to update.
 */

function UpdatePlayer(player)
{
    jcmp.events.CallRemote('character/exp/update_exp', player, JSON.stringify(player.c.exp));
}


/**
 * Gives a player a specified amount of experience.
 * 
 * @param {Player} player - The player that is receiving the experience.
 */

function GiveExp(player, amount)
{
    if (typeof amount != 'number' || isNaN(amount) || amount == undefined || amount == null)
    {
        console.log(`[WARN] Tried to give bad exp to player ${player.c.general.name}! Rejecting!`);
        return;
    }

    if (!c.util.exists(player) || player.c == undefined)
    {
        return;
    }

    // No exp gain for max level people
    if (player.c.exp.level === c.config.exp.max_level)
    {
        return;
    }

    player.c.exp.experience = player.c.exp.experience + amount;

    jcmp.events.Call('log', 'character', 
        `Player ${player.c.general.name} gained ${amount} exp.`);

    //UpdatePlayer(player);
    CheckExperience(player);

}

/**
 * Broadcasts a player's current level to everyone in the game.
 * 
 * @param {Player} player - The player whose level we want to broadcast.
 */

function BroadcastLevel(player)
{
    jcmp.events.CallRemote('character/exp/broadcast_level', null, player.networkId, player.c.exp.level);
}

/**
 * Syncs all players' levels in the game for a player.
 * This should be called when a player logs in.
 * 
 * @param {Player} player - The player we want to sync all the data to.
 */

function SyncPlayerLevels(player)
{
    const data = [];

    jcmp.players.forEach((p) =>
    {
        if (p.c != undefined && p.c.exp != undefined)
        {
            data[p.networkId] = p.c.exp.level;
        }
    });

    jcmp.events.CallRemote('character/exp/sync_player_levels', player, JSON.stringify(data));
}

/**
 * Updates the exp database with a player's current experience and level.
 * 
 * @param {Player} player - The player whose experience and level we want to update.
 */

function UpdateDatabase(player)
{

    const char = player.c;
    const steam_id = char.general.steam_id;

    let sql = `UPDATE exp SET experience = '${char.exp.experience}', 
        level = '${char.exp.level}' WHERE steam_id = '${steam_id}'`;
    c.pool.query(sql).then((result) => 
    {
        //con.end();
    }).catch((err) => {console.log('error from exp.js 186'); console.log(err)});
}



module.exports = 
{
    GetMaxExp,
    UpdateExpOnKill,
    SyncPlayerLevels,
    BroadcastLevel,
    UpdatePlayer,
    GiveExp
}