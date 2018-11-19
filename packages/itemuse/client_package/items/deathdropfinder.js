let death_marker;

jcmp.events.AddRemoteCallable('itemuse/set_death_marker', (x,y,z) => 
{
    if (death_marker)
    {
        death_marker.minDistance = 99999;
        death_marker.Destroy();
        death_marker = null;
    }

    death_marker = new POI(19, new Vector3f(x,y,z), 'Death Point');
    death_marker.minDistance = 2;
    death_marker.maxDistance = 9999999;
    death_marker.clampedToScreen = true;
})

jcmp.ui.AddEvent('SecondTick', () => 
{
    if (death_marker && jcmp.localPlayer.position.sub(death_marker.position).length < 5)
    {
        death_marker.minDistance = 99999;
        death_marker.Destroy();
        death_marker = null;
    }
})