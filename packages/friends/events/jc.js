jcmp.events.Add('PlayerDestroyed', (player) => 
{
    if (!player.c || !player.friends || !player.c.ready)
    {
        return;
    }

    jcmp.events.CallRemote('friends/network/remove_entry', null, JSON.stringify({id: player.networkId}));
})
