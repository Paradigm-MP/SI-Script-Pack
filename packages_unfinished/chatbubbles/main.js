jcmp.events.Add('PlayerDestroyed', (player) => 
{
    jcmp.events.CallRemote('chatbubbles/remove_player', null, player.networkId);
})