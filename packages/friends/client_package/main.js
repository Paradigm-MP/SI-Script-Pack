let ui;

let can_receive_entries = false;

const circle = new WebUIWindow(
'friends-circle', 
'package://friends/ui/circle/index.html', 
new Vector2(256, 256)
);

circle.autoResize = false;
circle.hidden = true;
circle.autoRenderTexture = false;

const circle_div = new Vector2f(2,2);
const circle_size = new Vector2f(25,25);
const up = new Vector3f(0, 1.5, 0);


function DrawFriendCircle(r, pos, size)
{
	// If the circle is off our screen, don't draw it.
	if (pos.x == -1 && pos.y == -1)
	{
		return;
	}

	r.DrawTexture(circle.texture, pos.sub(size.div(circle_div)), size);
}

// Create the window when we load into the game
jcmp.events.Add('character/Loaded', () => 
{
    ui = new WebUIWindow('friends_menu', 'package://friends/ui/index.html', new Vector2(jcmp.viewportSize.x, jcmp.viewportSize.y));
    ui.autoResize = true;
    ui.hidden = false;

	ui.AddEvent('friends/ready', () => 
	{
		jcmp.events.CallRemote('friends/ready');
	})
});

jcmp.friends = {};
const player_data = {};

// Pure friends tables, no additional player data
jcmp.events.AddRemoteCallable('friends/network/friend_data_sync', (data) => 
{
	jcmp.friends = JSON.parse(data);
	jcmp.events.Call('friends/friends_update');
})

jcmp.events.AddRemoteCallable('friends/network/set_max', (max) => 
{
	jcmp.ui.CallEvent('friends/ui/set_max', max);
})

jcmp.ui.AddEvent('friends/ToggleOpen', (open) => 
{
	jcmp.localPlayer.controlsEnabled = !open;
})

jcmp.ui.AddEvent('chat_input_state', (s) => 
{
    jcmp.ui.CallEvent('friends/ToggleEnabled', !s);
})


jcmp.events.Add('disable_menus', (enabled) => 
{
    jcmp.ui.CallEvent('friends/ToggleEnabled', enabled);
})

// Initial sync of all friends/player list data
jcmp.events.AddRemoteCallable('friends/network/init', (data) => 
{
	ui.CallEvent('init', data);
	can_receive_entries = true;
	jcmp.events.Call('load/package_loaded', 'friends');

	data = JSON.parse(data);

	for (let i = 0; i < data.length; i++)
	{
		const entry = data[i];

		if (entry.offline || entry.id == undefined) {continue;}

		player_data[entry.id] = entry;
	}
})

jcmp.events.AddRemoteCallable('friends/network/add_entry', (data) => 
{
	if (!can_receive_entries) {return;}
	jcmp.ui.CallEvent('friends/add_entry', data);

	data = JSON.parse(data);
	if (data.offline || data.id == undefined) {return;}
	player_data[data.id] = data;
})

jcmp.events.AddRemoteCallable('friends/network/remove_entry', (data) => 
{
	jcmp.ui.CallEvent('friends/remove_entry', data);

	data = JSON.parse(data);
	for (const id in player_data)
	{
		if (id == data.id)
		{
			delete player_data[id];
		}
	}
})

jcmp.events.AddRemoteCallable('friends/network/modify_entry', (data) => 
{
	jcmp.ui.CallEvent('friends/modify_entry', data);
})

jcmp.events.AddRemoteCallable('friends/network/modify_entries', (data) => 
{
	jcmp.ui.CallEvent('friends/modify_entries', data);
})

jcmp.ui.AddEvent('friends/ui/add_friend', (steam_id) => 
{
	jcmp.events.CallRemote('friends/add_friend', steam_id);
})

jcmp.ui.AddEvent('friends/ui/remove_friend', (steam_id) => 
{
	jcmp.events.CallRemote('friends/remove_friend', steam_id);
})

jcmp.ui.AddEvent('friends/ui/cancel_friend_request', (steam_id) => 
{
	jcmp.events.CallRemote('friends/cancel_friend_request', steam_id);
})

jcmp.ui.AddEvent('friends/ui/accept_friend_request', (steam_id) => 
{
	jcmp.events.CallRemote('friends/accept_friend_request', steam_id);
})

jcmp.events.Add('Render', (r) => 
{
	for (let i = 0; i < jcmp.players.length; i++)
	{
		const p = jcmp.players[i];
		const data = player_data[p.networkId];

		if (!data) {continue;}

		const steam_id = data.steam_id;

		if (data && steam_id && jcmp.friends && jcmp.friends["game_friends_str"] && jcmp.friends["game_friends_str"].indexOf(steam_id) > -1)
		{
			DrawFriendCircle(r, r.WorldToScreen(p.GetRenderTransform(r.dtf).position.add(up)), circle_size);
		}
	}
})