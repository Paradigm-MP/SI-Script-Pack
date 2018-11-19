
let using_item = false;
let require_vehicle = false;
let localplayer;
let current_health;

jcmp.events.Add('character/Loaded', () => 
{
    localplayer = jcmp.players.find((p) => p.networkId === jcmp.localPlayer.networkId);
})


jcmp.events.AddRemoteCallable('itemuse/use_item', (name, time, in_vehicle) => 
{
    if (using_item == true) {return;}

    const basestate = jcmp.localPlayer.baseState;
    require_vehicle = in_vehicle;

    if (basestate != 29430622 && basestate != 673842132 && !in_vehicle)
    {
        jcmp.events.CallRemote('itemuse/cancel_item', 1);
        return;
    }

    if (!localplayer)
    {
        localplayer = jcmp.players.find((p) => p.networkId === jcmp.localPlayer.networkId);
    }

    current_health = localplayer.health;

    jcmp.events.Call('inventory/ToggleOpen');
    jcmp.events.Call('inventory/ToggleDrag', false);

    jcmp.ui.CallEvent('itemuse/ui/use_item', name, time);
    jcmp.localPlayer.controlsEnabled = false;
    using_ui.BringToFront();

    using_ui.hidden = false;

    using_item = true;
})

jcmp.ui.AddEvent('itemuse/ui/item_complete', () => 
{
    const basestate = jcmp.localPlayer.baseState;

    if (basestate != 29430622 && basestate != 673842132 && !require_vehicle)
    {
        jcmp.events.CallRemote('itemuse/cancel_item', 1);
        jcmp.events.Call('inventory/ToggleDrag', true);
        using_ui.hidden = true;
        using_item = false;
        jcmp.localPlayer.controlsEnabled = true;
        return;
    }

    jcmp.events.CallRemote('itemuse/complete_item');
    jcmp.events.Call('inventory/ToggleDrag', true);
    using_ui.hidden = true;
    using_item = false;
    jcmp.localPlayer.controlsEnabled = true;
})