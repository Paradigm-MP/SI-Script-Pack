
jcmp.events.AddRemoteCallable('worldmap/map_ready', (player) => 
{
    if (!is_staff(player)) {return;}

    SyncPlayers(player);

    player.worldmap_interval = setInterval(() => 
    {
        SyncPlayers(player);
    }, 5000);
})

jcmp.events.AddRemoteCallable('worldmap/teleport', (player, x, z) => 
{
    if (!is_staff(player)) {return;}
    player.position = new Vector3f(x, 4200, z);
})

function SyncPlayers(player)
{
    if (!is_staff(player)) {return;}
    if (!player || !player.name || !player.c || !player.c.ready)
    {
        if (player.worldmap_interval)
        {
            clearInterval(player.worldmap_interval);
        }

        return;
    }

    const data = [];

    jcmp.players.forEach((p) => 
    {
        if (p.c && p.c.general && p.c.ready)
        {
            data.push({
                id: p.networkId,
                name: p.c.general.name,
                color: player.c.general.color,
                x: p.position.x,
                z: p.position.z
            })
        }
    });

    jcmp.events.CallRemote('worldmap/sync', player, JSON.stringify(data));
}

jcmp.events.Add('PlayerDestroyed', (player) => 
{
    clearInterval(player.worldmap_interval);
    jcmp.events.CallRemote('worldmap/remove_player', null, player.networkId);
})

jcmp.events.Add('character/Loaded', (player) => 
{
    if (is_staff(player))
    {
        jcmp.events.CallRemote('worldmap/load', player);
    }
})

jcmp.events.Add('chat_command', (player, msg, channel) => 
{
    if (!is_staff(player)) {return;}

    if (msg == '/invul')
    {
        player.invulnerable = true;
    }
    else if (msg == '/heal')
    {
        player.health = 800;
    }
})

function is_staff(player)
{
    return player.tag && (player.tag.name == 'Admin' || player.tag.name == 'Mod');
}