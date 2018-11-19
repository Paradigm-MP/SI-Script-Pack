function UpdatePing(player)
{
    const players = [];

    jcmp.players.forEach((p) =>
    {
        if (p.c && p.c.ready && p.friends)
        {
            players.push(
            {
                id: p.networkId,
                steam_id: p.c.general.steam_id,
                ping: p.client.ping
            })
        }
    })

    jcmp.events.CallRemote('friends/network/modify_entries', player, JSON.stringify(players));
}


// When the friends menu has finished loading for a player
jcmp.events.AddRemoteCallable('friends/ready', (player) => 
{
    const interval = setInterval(function() 
    {
        if (player && player.c && player.name)
        {
            UpdatePing(player);
        }
        else
        {
            clearInterval(interval);
        }
    }, 15000);

    const players = [];
	
    jcmp.players.forEach((p) =>
    {
        if (p.c && p.c.ready && p.friends)
        {   
            const data = {
                name: p.c.general.name,
                id: p.networkId,
                level: p.c.exp.level,
                steam_id: p.c.general.steam_id,
                ping: p.client.ping,
                friend_status: player.is_friends(p.c.general.steam_id) ? "Friends" : 
                    player.friends_has_invited(p.c.general.steam_id) ? "Pending" : 
                    player.friends_was_requested(p.c.general.steam_id) ? "Requested" : "None",
                color: p.c.general.color,
                is_me: p.networkId === player.networkId
            };

            if (p.tag && p.tag.name && p.tag.color)
            {
                data.tag = 
                {
                    tagname: p.tag.name,
                    tagcolor: p.tag.color
                }
            }

            players.push(data);
        }
    })

    GetOfflineFriends(player);

    const steam_id = player.c.general.steam_id;
	
    // Send scoreboard info
    jcmp.events.CallRemote('friends/network/init', player, JSON.stringify(players));
	
    // Send friends raw data
    jcmp.events.CallRemote('friends/network/friend_data_sync', player, JSON.stringify(player.friends));
    jcmp.events.CallRemote('friends/network/set_max', player, JSON.parse(jcmp.server.config).maxPlayers);

});

/**
 * When a player connects, it gets offline friends and puts them in the player's menu
 */
function GetOfflineFriends(player)
{
    let total_friends_str = 
        player.friends["game_friends_str"] + player.friends["friend_invites_str"] + player.friends["invites_sent_str"];

    for (let i = 0; i < jcmp.players.length; i++)
    {
        const p = jcmp.players[i];

        if (p.c && p.c.ready)
        {
            total_friends_str = total_friends_str.replace(`${p.c.general.steam_id}`, '');
        }
    }

    total_friends_str = total_friends_str.substring(1, total_friends_str.length); // Cut off first comma

    const split = total_friends_str.split(','); // Split by commas to get steam_ids

    for (let i = 0; i < split.length; i++)
    {
        const steam_id = split[i];

        if (steam_id.length < 6) {continue;} // Something is bad

        // get name and level (friends status using player.is_friends, etc)
        let name, color, level;

        let sql = `SELECT name, color FROM general WHERE steam_id = '${steam_id}'`;

        friends.pool.query(sql).then((result) =>
        {
            name = result[0].name.toString();
            color = result[0].color.toString();

            sql = `SELECT level FROM exp WHERE steam_id = '${steam_id}'`;
            return friends.pool.query(sql);
        }).then((result) => 
        {
            level = result[0].level.toString();

            sql = `SELECT tagname, tagcolor FROM tags WHERE steam_id = '${steam_id}'`;
            return friends.pool.query(sql);
        }).then((result) => 
        {
            const data = 
            {
                name: name,
                level: level,
                steam_id: steam_id,
                friend_status: player.is_friends(steam_id) ? "Friends" : 
                    player.friends_has_invited(steam_id) ? "Pending" : 
                    player.friends_was_requested(steam_id) ? "Requested" : "None",
                offline: true,
                ping: '--',
                color: color
            }

            if (result && result[0] && result[0].tagname)
            {
                data.tag = 
                {
                    tagname: result[0].tagname.toString(),
                    tagcolor: result[0].tagcolor.toString()
                }
            }

            jcmp.events.CallRemote('friends/network/add_entry', player, JSON.stringify(data));
        })

    }
}

// ADD FRIEND BUTTON
jcmp.events.AddRemoteCallable('friends/add_friend', (player, steam_id) => 
{
    const player_steam_id = player.c.general.steam_id;

    if (steam_id == player_steam_id) {return;}

    // If they aren't friends, requested, or pending
    if (!player.is_friends(steam_id) && !player.friends_has_invited(steam_id) && !player.friends_was_requested(steam_id))
    {
        player.friends["invites_sent_str"] += `,${steam_id}`; // Add to friend invites sent

        UpdateFriendsDB(player);

        jcmp.events.CallRemote('friends/network/modify_entry', player, 
            JSON.stringify({steam_id: steam_id, friend_status: "Pending"}));
        jcmp.events.CallRemote('friends/network/friend_data_sync', player, JSON.stringify(player.friends));


        // Now update SQL for other player
        const sql = `SELECT * FROM friends WHERE steam_id = '${steam_id}'`;

        // Now we must update the player who requested to be friends with this player
        friends.pool.query(sql).then((result) =>
        {
            const f_data = 
            {
                "game_friends_str": result[0].game_friends.toString(),
                "friend_invites_str": result[0].friend_invites.toString(),
                "invites_sent_str": result[0].invites_sent.toString()
            }

            f_data["friend_invites_str"] += `,${player_steam_id}`; // Add to requested invites

            UpdateFriendsDBSteamID(steam_id, f_data);

            const target = FindPlayerBySteamId(steam_id);

            if (target) // If the player we friended is online, then update them
            {
                target.friends = f_data;

                jcmp.events.CallRemote('friends/network/modify_entry', target, 
                    JSON.stringify({steam_id: player_steam_id, friend_status: "Requested"}))
                jcmp.events.CallRemote('friends/network/friend_data_sync', target, JSON.stringify(target.friends));
            }

            jcmp.events.Call('log', 'friends', `${player_steam_id} requested to be friends with ${steam_id}`);
        })
    }
})

// REMOVE FRIEND BUTTON
jcmp.events.AddRemoteCallable('friends/remove_friend', (player, steam_id) => 
{
    const player_steam_id = player.c.general.steam_id;

    // They must be friends to remove friend
    if (player.is_friends(steam_id))
    {
        player.friends["game_friends_str"] = player.friends["game_friends_str"].replace(`,${steam_id}`, ''); // Remove from friends

        UpdateFriendsDB(player);

        jcmp.events.CallRemote('friends/network/modify_entry', player, 
            JSON.stringify({steam_id: steam_id, friend_status: "None"}));
        jcmp.events.CallRemote('friends/network/friend_data_sync', player, JSON.stringify(player.friends));


        // Now update SQL for other player
        const sql = `SELECT * FROM friends WHERE steam_id = '${steam_id}'`;

        // Now we must update the player who requested to be friends with this player
        friends.pool.query(sql).then((result) =>
        {
            const f_data = 
            {
                "game_friends_str": result[0].game_friends.toString(),
                "friend_invites_str": result[0].friend_invites.toString(),
                "invites_sent_str": result[0].invites_sent.toString()
            }

            // Remove from friends from other player
            f_data["game_friends_str"] = f_data["game_friends_str"].replace(`,${player_steam_id}`, '');

            UpdateFriendsDBSteamID(steam_id, f_data);

            const target = FindPlayerBySteamId(steam_id);

            if (target) // If the player we friended is online, then update them
            {
                target.friends = f_data;

                jcmp.events.CallRemote('friends/network/modify_entry', target, 
                    JSON.stringify({steam_id: player_steam_id, friend_status: "None"}))
                jcmp.events.CallRemote('friends/network/friend_data_sync', target, JSON.stringify(target.friends));
            }

            jcmp.events.Call('log', 'friends', `${player_steam_id} removed friend ${steam_id}`);
        })
    }
})

jcmp.events.AddRemoteCallable('friends/cancel_friend_request', (player, steam_id) => 
{
    const player_steam_id = player.c.general.steam_id;

    // They must be invited to cancel invite
    if (player.friends_has_invited(steam_id))
    {
        player.friends["invites_sent_str"] = player.friends["invites_sent_str"].replace(`,${steam_id}`, '');

        UpdateFriendsDB(player);

        jcmp.events.CallRemote('friends/network/modify_entry', player, 
            JSON.stringify({steam_id: steam_id, friend_status: "None"}));
        jcmp.events.CallRemote('friends/network/friend_data_sync', player, JSON.stringify(player.friends));


        // Now update SQL for other player
        const sql = `SELECT * FROM friends WHERE steam_id = '${steam_id}'`;

        // Now we must update the player who requested to be friends with this player
        friends.pool.query(sql).then((result) =>
        {
            const f_data = 
            {
                "game_friends_str": result[0].game_friends.toString(),
                "friend_invites_str": result[0].friend_invites.toString(),
                "invites_sent_str": result[0].invites_sent.toString()
            }

            // Remove from friends from other player
            f_data["friend_invites_str"] = f_data["friend_invites_str"].replace(`,${player_steam_id}`, '');

            UpdateFriendsDBSteamID(steam_id, f_data);

            const target = FindPlayerBySteamId(steam_id);

            if (target) // If the player we friended is online, then update them
            {
                target.friends = f_data;

                jcmp.events.CallRemote('friends/network/modify_entry', target, 
                    JSON.stringify({steam_id: player_steam_id, friend_status: "None"}))
                jcmp.events.CallRemote('friends/network/friend_data_sync', target, JSON.stringify(target.friends));
            }

            jcmp.events.Call('log', 'friends', `${player_steam_id} cancelled friend request to ${steam_id}`);
        })
    }
})

jcmp.events.AddRemoteCallable('friends/accept_friend_request', (player, steam_id) => 
{
    const player_steam_id = player.c.general.steam_id;

    // They must be requested to accept request
    if (player.friends_was_requested(steam_id))
    {
        player.friends["friend_invites_str"] = player.friends["friend_invites_str"].replace(`,${steam_id}`, '');
        player.friends["game_friends_str"] += `,${steam_id}`;

        UpdateFriendsDB(player);

        jcmp.events.CallRemote('friends/network/modify_entry', player, 
            JSON.stringify({steam_id: steam_id, friend_status: "Friends"}));
        jcmp.events.CallRemote('friends/network/friend_data_sync', player, JSON.stringify(player.friends));


        // Now update SQL for other player
        const sql = `SELECT * FROM friends WHERE steam_id = '${steam_id}'`;

        // Now we must update the player who requested to be friends with this player
        friends.pool.query(sql).then((result) =>
        {
            const f_data = 
            {
                "game_friends_str": result[0].game_friends.toString(),
                "friend_invites_str": result[0].friend_invites.toString(),
                "invites_sent_str": result[0].invites_sent.toString()
            }

            // Remove from friends from other player
            f_data["invites_sent_str"] = f_data["invites_sent_str"].replace(`,${player_steam_id}`, '');
            f_data["game_friends_str"] += `,${player_steam_id}`;

            UpdateFriendsDBSteamID(steam_id, f_data);

            const target = FindPlayerBySteamId(steam_id);

            if (target) // If the player we friended is online, then update them
            {
                target.friends = f_data;

                jcmp.events.CallRemote('friends/network/modify_entry', target, 
                    JSON.stringify({steam_id: player_steam_id, friend_status: "Friends"}))
                jcmp.events.CallRemote('friends/network/friend_data_sync', target, JSON.stringify(target.friends));
            }

            jcmp.events.Call('log', 'friends', `${player_steam_id} accepted friend request from ${steam_id}`);
        })
    }
})

/**
 * Updates the DB with all friend values on the player.
 */
function UpdateFriendsDB(player)
{
    if (!player || !player.name || !player.c || !player.friends) {return;}

    const steam_id = player.c.general.steam_id;
    const f_data = player.friends;

    const sql = `UPDATE friends SET game_friends = '${f_data["game_friends_str"]}', friend_invites = '${f_data["friend_invites_str"]}', invites_sent = '${f_data["invites_sent_str"]}' WHERE steam_id = '${steam_id}'`;
    
    friends.pool.query(sql).then((result) =>
    {
        //jcmp.events.Call('log', 'friends', `Updated friends for ${player.c.general.name} [${player.c.general.steam_id}]`);
    })
}

/**
 * Updates the DB with all friend values on the player.
 */
function UpdateFriendsDBSteamID(steam_id, f_data)
{
    if (!steam_id || !f_data) {return;}

    const sql = `UPDATE friends SET game_friends = '${f_data["game_friends_str"]}', friend_invites = '${f_data["friend_invites_str"]}', invites_sent = '${f_data["invites_sent_str"]}' WHERE steam_id = '${steam_id}'`;
    
    friends.pool.query(sql).then((result) =>
    {
        //jcmp.events.Call('log', 'friends', `Updated friends for ${steam_id} using UpdateFriendsDBSteamID`);
    })
}

function FindPlayerBySteamId(steam_id)
{
    for (let i = 0; i < jcmp.players.length; i++)
    {
        const player = jcmp.players[i];

        if (player.c && player.c.ready && player.c.general.steam_id == steam_id)
        {
            return player;
        }
    }
}