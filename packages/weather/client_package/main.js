jcmp.events.AddRemoteCallable('weather/sync', (weather) => 
{
    jcmp.world.weather = weather;
})