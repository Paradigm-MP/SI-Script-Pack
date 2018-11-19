jcmp.events.Add('character/Loaded', (player) => 
{
    if (player.c.general.time_online < 120)
    {
        jcmp.events.CallRemote('tips/enable_beginner', player);
    }
})