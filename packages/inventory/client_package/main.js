let ui;

jcmp.ui.AddEvent('chat_input_state', (s) => 
{
    jcmp.ui.CallEvent('inventory/ToggleEnabled', !s);
})

jcmp.events.Add('load/package_loaded', (name) => 
{
    // Wait for survival hud before loading
    if (name == 'survival-hud')
    {
        ui = new WebUIWindow('inventory', `${jcmp.resource_path}inventory/ui/index.html${jcmp.GRPQ()}`, new Vector2(jcmp.viewportSize.x, jcmp.viewportSize.y));
        ui.autoResize = true;
        ui.hidden = true; // TODO enable when inventory data is received
    }
    
})

jcmp.ui.AddEvent('inventory/ToggleOpen', (o) => 
{
    jcmp.localPlayer.controlsEnabled = !o;
    jcmp.events.Call('inventory/OpenedClosed', o);
})

jcmp.events.Add('inventory/ToggleOpen', () => 
{
    jcmp.ui.CallEvent('inventory/ToggleOpenOutside');
})

jcmp.events.Add('inventory/ToggleDrag', (can_drag) => 
{
    jcmp.ui.CallEvent('inventory/ui/ToggleDrag', can_drag);
})

jcmp.ui.AddEvent('inventory/Ready', () => 
{
    ui.hidden = false;
    jcmp.events.CallRemote('inventory/Ready');
    jcmp.events.Call('load/package_loaded', 'inventory');
})

jcmp.events.Add('disable_menus', (enabled) => 
{
    jcmp.ui.CallEvent('inventory/ToggleEnabled', enabled);
})

// INVENTORY EVENTS

jcmp.ammo_types = "";

jcmp.events.AddRemoteCallable('inventory/init/ammo_types', (data) => 
{
    jcmp.ammo_types = data;
    jcmp.ui.CallEvent('inventory/ui/init_ammo_types', data);
})

jcmp.events.AddRemoteCallable('inventory/sync/init', (contents, slots) => 
{
    jcmp.ui.CallEvent('inventory/ui/init', contents, slots);
})

jcmp.events.AddRemoteCallable('inventory/sync/update', (stack, index) => 
{
    jcmp.ui.CallEvent('inventory/ui/update', stack, index);
})

jcmp.events.AddRemoteCallable('inventory/sync/add', (stack, index) => 
{
    jcmp.ui.CallEvent('inventory/ui/add', stack, index);
})

jcmp.events.AddRemoteCallable('inventory/sync/remove', (category, index) => 
{
    jcmp.ui.CallEvent('inventory/ui/remove', category, index);
})

jcmp.events.AddRemoteCallable('inventory/sync/change_id', (category, old_id, new_id) => 
{
    jcmp.ui.CallEvent('inventory/ui/change_id', category, old_id, new_id);
})

jcmp.events.AddRemoteCallable('inventory/sync/update_slots', (slots) => 
{
    jcmp.ui.CallEvent('inventory/ui/update_slots', slots);
})

jcmp.ui.AddEvent('inventory/ui/change_index', (category, old_index, new_index, stack) => 
{
    jcmp.events.CallRemote('inventory/sync/change_index', category, old_index, new_index, stack);
})

jcmp.ui.AddEvent('inventory/ui/click_item', (stack, index) => 
{
    jcmp.events.CallRemote('inventory/sync/click_item', stack, index);
})

jcmp.ui.AddEvent('inventory/ui/drop_item', (stack, index, amount) => 
{
    jcmp.events.CallRemote('inventory/sync/drop_item', stack, index, amount);
})

jcmp.ui.AddEvent('inventory/ui/shift_item', (stack, index) => 
{
    jcmp.events.CallRemote('inventory/sync/shift_item', stack, index);
})

jcmp.ui.AddEvent('inventory/ui/drop_item_chat', (stack, index) => 
{
    jcmp.events.Call('inventory/events/drop_item_chat', stack, index);
})

// VEHICLE INVENTORY EVENTS

jcmp.events.AddRemoteCallable('vinventory/sync/init', (contents, slots) => 
{
    jcmp.ui.CallEvent('vinventory/ui/init', contents, slots);
})

jcmp.events.AddRemoteCallable('vinventory/sync/update', (stack, index) => 
{
    jcmp.ui.CallEvent('vinventory/ui/update', stack, index);
})

jcmp.events.AddRemoteCallable('vinventory/sync/add', (stack, index) => 
{
    jcmp.ui.CallEvent('vinventory/ui/add', stack, index);
})

jcmp.events.AddRemoteCallable('vinventory/sync/remove', (category, index) => 
{
    jcmp.ui.CallEvent('vinventory/ui/remove', category, index);
})

jcmp.events.AddRemoteCallable('vinventory/sync/change_id', (category, old_id, new_id) => 
{
    jcmp.ui.CallEvent('vinventory/ui/change_id', category, old_id, new_id);
})

jcmp.ui.AddEvent('vinventory/ui/change_index', (category, old_index, new_index, stack) => 
{
    jcmp.events.CallRemote('vinventory/sync/change_index', category, old_index, new_index, stack);
})

jcmp.ui.AddEvent('vinventory/ui/click_item', (stack, index) => 
{
    jcmp.events.CallRemote('vinventory/sync/click_item', stack, index);
})

jcmp.ui.AddEvent('vinventory/ui/shift_item', (stack, index) => 
{
    jcmp.events.CallRemote('vinventory/sync/shift_item', stack, index);
})

jcmp.events.AddRemoteCallable('PlayerVehicleEntered', () => 
{
    jcmp.ui.CallEvent('inventory/ui/ToggleVehicleMenu', true);
})

jcmp.events.AddRemoteCallable('PlayerVehicleExited', () => 
{
    jcmp.ui.CallEvent('inventory/ui/ToggleVehicleMenu', false);
})

jcmp.events.AddRemoteCallable('inventory/sync/show_desync', () => 
{
    jcmp.localPlayer.frozen = true;
    jcmp.localPlayer.controlsEnabled = false;
    
    ui.BringToFront();
    jcmp.ui.CallEvent('inventory/ui/show_desync');
})