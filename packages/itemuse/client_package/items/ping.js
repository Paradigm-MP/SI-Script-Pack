let pings = [];

jcmp.events.AddRemoteCallable('itemuse/ping_players', (data) => 
{
    data = JSON.parse(data);

    data.forEach(function(entry) 
    {
        const marker = new POI(15, new Vector3f(entry.x,entry.y,entry.z), ' ');
        marker.minDistance = 0;
        marker.maxDistance = 9999999;
        marker.clampedToScreen = true;

        pings.push({
            marker: marker,
            time: 0
        })
    });


})


jcmp.ui.AddEvent('SecondTick', () => 
{
    for (let i = 0; i < pings.length; i++) 
    {
        const entry = pings[i];

        entry.time += 1;

        if (entry.time >= 30)
        {
            entry.marker.minDistance = 99999;
            entry.marker.Destroy();
            pings.splice(i, 1);
        }
    };
})