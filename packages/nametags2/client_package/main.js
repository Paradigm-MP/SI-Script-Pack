
jcmp.playerData = [];

let ui_id = 1;

const levels = [];
const tags = [];
const friends = {};
let raw_data = [];
let display_tags = true;
const max_distance = 100;


jcmp.events.Add('LocalPlayerChat', (msg) => {
    if (msg == "/tags")
    {
        display_tags = !display_tags;
    }
})

let playersCache = {};

function createCache(id, name, color, tagname, tagcolor, friend) 
{
    let c = color;
    let c2 = tagcolor;
    let n = name;
    c = c.replace(']', '');
    c = c.replace('[', '');

    if (tagcolor != null)
    {
        c2 = c2.replace(']', '');
        c2 = c2.replace('[', '');
    }

    const ui = new WebUIWindow("nametagui_" + ui_id, 
        `${jcmp.resource_path}nametags2/ui/nametag.html`, 
        new Vector2(600, 150));

    ui.AddEvent('nametags/loadedtag', () => 
    {
        ui.CallEvent('nametags/updatetag', id, name, color, levels[id], tagname, tagcolor, friend);
    })

    ui.autoRenderTexture = false;
    ui.hidden = true;
    
    playersCache[id] = {
        ui_id: ui_id,
        id: id,
        ui: ui
    };

    ui_id++;

    return playersCache[id];
}

jcmp.events.AddRemoteCallable('nametags/remove', (id) => 
{
    if (playersCache[id])
    {
        playersCache[id].ui.Destroy();
        delete playersCache[id];
    }

    if (close_players[id])
    {
        delete close_players[id];
    }
})

jcmp.events.AddRemoteCallable('nametags/Nametags_init', (data) => 
{
    playersCache = {};
    data = JSON.parse(data);

    raw_data = data;

    data.forEach((p) => 
    {
        const friend = jcmp.friends && jcmp.friends["game_friends_str"] && jcmp.friends["game_friends_str"].indexOf(data.steam_id) > -1;
        let playerCache = createCache(p.id, p.name, p.color, p.tagname, p.tagcolor, friend);
    });

});

jcmp.events.AddRemoteCallable('nametags/Nametags_add', (data) => 
{
    data = JSON.parse(data);
    raw_data.push(data);

    const friend = jcmp.friends && jcmp.friends["game_friends_str"] && jcmp.friends["game_friends_str"].indexOf(data.steam_id) > -1;

    let playerCache = createCache(data.id, data.name, data.color, data.tagname, data.tagcolor, friend);
});

const up = new Vector3f(0, 1, 0);
const nametag_size = new Vector2f(0.75,0.1875);
const pos_adj = new Vector3f(-nametag_size.x / 2, -nametag_size.y / 2 - 0.27, 0);

// Nametags
function RenderNametag(renderer, playerCache) 
{
    const ui = playerCache.ui;

    if (ui && playerCache.id != jcmp.localPlayer.networkId)
    {
        renderer.DrawTexture(ui.texture, pos_adj, nametag_size);
    }
}

jcmp.events.Add('GameUpdateRender', (renderer) => 
{
    if (!display_tags) {return;}

    const cam = jcmp.localPlayer.camera.position;

    for (const id in close_players)
    {
        const player = close_players[id];
        if (player && player.health > 0) 
        {
            const playerCache = playersCache[id];

            if (playerCache) 
            {
                let head = player.GetBoneTransform(0xA877D9CC, renderer.dtf);

                const mat = head.LookAt(head.position, cam, up);
                renderer.SetTransform(mat);

                RenderNametag(renderer, playerCache);
            }
        }
    }
});

const close_players = {};

jcmp.ui.AddEvent('SecondTick', () => 
{
    const cam = jcmp.localPlayer.camera.position;

    for (const id in close_players)
    {
        if (!close_players[id] || !close_players[id].position || dist(close_players[id].position, cam) > max_distance)
        {
            delete close_players[id];
        }
    }

    jcmp.players.forEach((player) => 
    {
        if (dist(player.position, cam) < max_distance && !close_players[player.networkId]) 
        {
            close_players[player.networkId] = player;
        }
    })

})

jcmp.events.Add('character/exp/player_level_sync', (id, level) => 
{
    levels[id] = level;
    jcmp.ui.CallEvent('nametags/update_level_' + id, level);
    
})

jcmp.events.Add('character/Loaded', () => 
{
    jcmp.events.CallRemote('nametags/Init_Nametags');
})

// When someone changes their friend status
jcmp.events.Add('friends/friends_update', () => 
{
    for (let i = 0; i < raw_data.length; i++)
    {
        const data = raw_data[i];

        jcmp.ui.CallEvent('nametags/update_friend_' + data.id, 
            jcmp.friends["game_friends_str"].indexOf(data.steam_id) > -1);
    }
})


function dist(a, b) 
{
    return b.sub(a).length;
}