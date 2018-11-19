jcmp.events.AddRemoteCallable('survival-hud/Ready', (player) => 
{
    c.hunger.UpdateHunger(player);
})