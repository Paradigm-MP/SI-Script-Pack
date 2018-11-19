let fake_players = [];

jcmp.events.AddRemoteCallable('itemuse/init_fake_players', (data) => 
{
    data = JSON.parse(data);

    for (let i = 0; i < data.length; i++)
    {
        // If we own it
        if (data[i].owner == jcmp.steam_id)
        {
            const marker = new POI(5, new Vector3f(data[i].x,data[i].y,data[i].z), 'Fake Player');
            marker.minDistance = 1;
            marker.maxDistance = 2000;
            data[i].marker = marker;
        }
    
        fake_players.push(data[i]);

    }
})


jcmp.events.AddRemoteCallable('itemuse/place_fake_player', (data) => 
{
    data = JSON.parse(data);
    
    if (data.owner == jcmp.steam_id)
    {
        const marker = new POI(5, new Vector3f(data.x,data.y,data.z), 'Fake Player');
        marker.minDistance = 1;
        marker.maxDistance = 2000;
        data.marker = marker;
    }

    fake_players.push(data);

})

jcmp.events.AddRemoteCallable('itemuse/remove_fake_player', (id) => 
{
    for (let i = 0; i < fake_players.length; i++)
    {
        if (fake_players[i].id == id)
        {
            if (fake_players[i].marker)
            {
                fake_players[i].marker.minDistance = 99999;
                fake_players[i].marker.Destroy();
            }

            fake_players.splice(i, 1);
        }
    }
})
