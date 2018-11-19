require('./arrows');

jcmp.events.Add('character/Loaded', (player) => 
{
    jcmp.events.CallRemote('combat/set_ready', player);
})