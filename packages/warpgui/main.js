const config = require("./config");
const chat = jcmp.events.Call('get_chat')[0];
const m_c = "[#AA18C7]"; // Color of chat messages

jcmp.events.Add('character/Loaded', (player) => 
{
    jcmp.players.forEach((p) => 
    {
        if (is_admin(p))
        {
            jcmp.events.CallRemote('warpgui/AddPlayer', p, player.networkId, player.c.general.name);
        }
    })

    //jcmp.events.CallRemote('warpgui/AddPlayer', null, player.networkId, player.name);
})

jcmp.events.AddRemoteCallable('warpgui/WarpHere', (player, id) => {
    id = parseInt(id);
    if (!is_admin(player))
    {
        chat.send(player, m_c + "[Warp] Generic error. Please contact an admin for assistance.");
        return; // Warping other players is only for admins
    }

    let target = jcmp.players.find(p => p.networkId == id);
    if (target == null || typeof target == 'undefined')
    {
        chat.send(player, m_c + "[Warp] Warp player here failed! No valid player was found.");
        return;
    }
    target.position = player.position;
    chat.send(player, m_c + "[Warp] You warped " + target.name + " to you successfully.");
})

jcmp.events.AddRemoteCallable('warpgui/WarpTo', (player, id) => {
    id = parseInt(id);
    let target = jcmp.players.find(p => p.networkId == id);
    if (target == null || typeof target == 'undefined')
    {
        chat.send(player, m_c + "[Warp] Warp to player failed! No valid player was found.");
        return;
    }
    if (is_admin(player))
    {
        player.position = target.position;
        chat.send(player, m_c + "[Warp] You warped to " + target.name + " successfully.");
    }
})

jcmp.events.AddRemoteCallable('warpgui/GUIReady', (player) => 
{
    const c = {
        open_key: config.open_key,
        admin_only: config.admin_only,
        admin: is_admin(player)
    }
    jcmp.events.CallRemote('warpgui/InitConfig', player, JSON.stringify(c));


    if (is_admin(player))
    {
        let data = [];
        jcmp.players.forEach(function(p) 
        {
            if (p.c && p.c.ready && p.c.general)
            {
                data.push({id: p.networkId, name: p.c.general.name});
            }
        });
        jcmp.events.CallRemote('warpgui/InitPlayers', player, JSON.stringify(data));

    }

})

jcmp.events.Add('PlayerDestroyed', (player) => {
    
    jcmp.players.forEach((p) => 
    {
        if (is_admin(p))
        {
            jcmp.events.CallRemote('warpgui/RemovePlayer', p, player.networkId);
        }
    })
})


/**
 * Returns true if the player is an admin, false otherwise.
 * 
 * @param {Player} p - The player to check.
 * @returns {boolean} - True/false
 */

function is_admin(p)
{
    return (p.tag != undefined && p.tag.name != undefined && (p.tag.name === 'Admin' || p.tag.name === 'Mod'));
}
