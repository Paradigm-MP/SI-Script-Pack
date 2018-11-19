const weathers = ['base','rain','overcast','thunderstorm','fog','snow'];
jcmp.current_weather = 0;

setInterval(() => 
{
    let random = Math.random();
    if (jcmp.current_weather != 0 && random < 0.8)
    {
        jcmp.current_weather = 0;
    }
    else if (jcmp.current_weather == 0 && random > 0.95)
    {
        jcmp.current_weather = Math.floor(Math.random() * 6);
    }
    else if (random > 0.97)
    {
        jcmp.current_weather = Math.floor(Math.random() * 6);
    }
    jcmp.events.CallRemote('weather/sync', null, jcmp.current_weather);
}, 1000 * 60 * 60)

jcmp.events.Add('PlayerReady', (player) => 
{
    jcmp.events.CallRemote('weather/sync', player, jcmp.current_weather);
})