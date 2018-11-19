jcmp.events.AddRemoteCallable('afk/kick', (player) => 
{
    player.Kick('You were AFK for too long.');
    jcmp.events.Call('log', 'connections', `Player ${player.name} [${player.client.steamId}] was kicked for being AFK.`);
})