jcmp.events.Add('sound/Play', (player, name, volume) => 
{
    jcmp.events.CallRemote('sound/Play', player || null, name, volume);
})