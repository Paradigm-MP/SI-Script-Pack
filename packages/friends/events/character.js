
jcmp.events.Add('character/Loaded', (player) => 
{
    player.friends = {};

    // returns bool representing if two players are friends or not
    player.is_friends = function (steamid)
    {
        return (this.friends['game_friends_str'].indexOf(steamid) > -1);
    };

    // returns true if this player has sent a friend request to steamid and it is still pending
    player.friends_has_invited = function (steamid)
    {
        return (this.friends['invites_sent_str'].indexOf(steamid) > -1);
    }

    // returns true if someone sent this player a friend request and it is pending
    player.friends_was_requested = function (steamid)
    {
        return (this.friends['friend_invites_str'].indexOf(steamid) > -1);
    }

    const player_steam_id = player.c.general.steam_id;
	const player_name = player.c.general.name;
	let sql = `SELECT * FROM friends WHERE steam_id = '${player_steam_id}'`;
	
	friends.pool.query(sql).then((result) =>
	{
		if (result != undefined && result.length > 0)
		{
			let db_game_friends = result[0].game_friends.toString();
			let db_friend_invites = result[0].friend_invites.toString(); 
			let db_invites_sent = result[0].invites_sent.toString();

			player.friends['game_friends_str'] = db_game_friends;
			player.friends['friend_invites_str'] = db_friend_invites;
			player.friends['invites_sent_str'] = db_invites_sent;
		}
		else // player does not have friends data
		{
			player.friends['game_friends_str'] = "";
			player.friends['friend_invites_str'] = "";
			player.friends['invites_sent_str'] = "";
			
			sql = `INSERT INTO friends (steam_id, name, game_friends, friend_invites, invites_sent) VALUES ('${player_steam_id}', '${player_name}', '', '', '')`;
			friends.pool.query(sql);
		}

        AddPlayerOnJoin(player);
	})
});

// Update menu when a player gains a level
jcmp.events.Add('character/exp/GainLevel', (player, level) => 
{
	const data = 
	{
		id: player.networkId,
		steam_id: player.c.general.steam_id,
		level: level
	}

	jcmp.events.CallRemote('friends/network/modify_entry', null, JSON.stringify(data));
})


/**
 * Adds an entry to everyone's menu who is already on the server with the new player
 */
function AddPlayerOnJoin(player)
{
    jcmp.players.forEach((p) =>
    {
        if (p.c && p.c.ready && p.friends && p.networkId != player.networkId)
        {
            const data = {
                name: player.c.general.name,
                id: player.networkId,
                level: player.c.exp.level,
                steam_id: player.c.general.steam_id,
                ping: player.client.ping,
                friend_status: p.is_friends(player.c.general.steam_id) ? "Friends" : 
                    p.friends_has_invited(player.c.general.steam_id) ? "Pending" : 
                    p.friends_was_requested(player.c.general.steam_id) ? "Requested" : "None",
                color: player.c.general.color
            };

            if (player.tag && player.tag.name && player.tag.color)
            {
                data.tag = 
                {
                    tagname: player.tag.name,
                    tagcolor: player.tag.color
                }
            }

            jcmp.events.CallRemote('friends/network/add_entry', p, JSON.stringify(data));
        }
    })
}