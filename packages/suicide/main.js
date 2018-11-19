// suicide server main.js

jcmp.events.AddRemoteCallable('SuicideDeath', (player) =>
{
    player.suiciding = true;
    player.health = 10;

    setTimeout(function() 
    {
        player.health = 0;
    }, 1000);
});