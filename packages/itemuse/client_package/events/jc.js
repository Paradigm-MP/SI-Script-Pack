jcmp.events.Add('Render', () => 
{
    if (using_item)
    {
        // If they took damage while using the item
        if (localplayer.health < current_health)
        {
            jcmp.events.CallRemote('itemuse/cancel_item', 2);
            jcmp.ui.CallEvent('itemuse/ui/cancel');
            jcmp.events.Call('inventory/ToggleDrag', true);
            using_item = false;
            jcmp.localPlayer.controlsEnabled = true;
            using_ui.hidden = true;
            current_health = localplayer.health;
            return;
        }
    }
})
// TODO eventually optimize this by subscribing/unsubscribing


let can_cancel = true;

jcmp.ui.AddEvent('chat_input_state', s => {
    can_cancel = !s;
});

jcmp.ui.AddEvent('KeyPress', (key) => 
{
    if (using_item && key == 102 && can_cancel) // F
    {
        jcmp.events.CallRemote('itemuse/cancel_item', 3);
        jcmp.ui.CallEvent('itemuse/ui/cancel');
        jcmp.events.Call('inventory/ToggleDrag', true);
        using_item = false;
        jcmp.localPlayer.controlsEnabled = true;
        using_ui.hidden = true;
    }
})