
let storage_ui;


jcmp.events.Add('character/Loaded', () => 
{
    storage_ui = new WebUIWindow('storage_menu', `${jcmp.resource_path}loot/ui/menu/index.html${jcmp.GRPQ()}`, new Vector2(jcmp.viewportSize.x, jcmp.viewportSize.y));
    storage_ui.autoResize = true;
    storage_ui.hidden = true;
})



// Network events
jcmp.events.AddRemoteCallable('storages/sync/init', (storages) => 
{
    jcmp.ui.CallEvent('storages/ui/init', storages);
})

jcmp.events.AddRemoteCallable('storages/sync/update_max', (max) => 
{
    jcmp.ui.CallEvent('storages/ui/update_max', max);
})

jcmp.events.AddRemoteCallable('storages/sync/add_entry', (entry) => 
{
    jcmp.ui.CallEvent('storages/ui/add_entry', entry);
})

jcmp.events.AddRemoteCallable('storages/sync/remove_entry', (id) => 
{
    jcmp.ui.CallEvent('storage/ui/remove', id);
})

jcmp.events.AddRemoteCallable('storages/sync/set_max', (max) => 
{
    jcmp.ui.CallEvent('storages/ui/set_max', max);
})

jcmp.events.AddRemoteCallable('storages/sync/update_entry', (data) => 
{
    jcmp.ui.CallEvent('storages/ui/update_entry', data);
})

jcmp.events.AddRemoteCallable('loot/storage/update_extra_sync', (data) => 
{
    jcmp.ui.CallEvent('storages/ui/update_extra_sync', data);
})

jcmp.events.AddRemoteCallable('loot/storage/update', (data) => 
{
    jcmp.ui.CallEvent('loot/storage/ui/update', data);
})

jcmp.events.AddRemoteCallable('storage/sync/update_menu', (data) => 
{
    jcmp.ui.CallEvent('storage/ui/update_menu', data);
})

jcmp.events.AddRemoteCallable('storages/sync/update_access', (id, access) => 
{
    if (lootboxes[id])
    {
        lootboxes[id].storage.access_level = access;
    }
    
    jcmp.ui.CallEvent('storage/ui/update_access', access);
})

let hacking_ui;

jcmp.events.AddRemoteCallable('storages/sync/start_hack', (id) => 
{
    hacking_ui = new WebUIWindow('hacking_ui', `${jcmp.resource_path}loot/ui/hacking/index.html${jcmp.GRPQ()}`, new Vector2(jcmp.viewportSize.x, jcmp.viewportSize.y));
    hacking_ui.autoResize = true;
    hacking_ui.hidden = true;

    hacking_ui.AddEvent('ready', () => 
    {
        hacking_ui.hidden = false;
        hacking_ui.CallEvent('start', id);
    })

    jcmp.events.Call('disable_menus', false);
})

// UI events

/*jcmp.ui.AddEvent('storages/ui/remove', (id) => 
{
    jcmp.events.CallRemote('storages/sync/remove' + id, id);
})*/

jcmp.ui.AddEvent('storages/ui/hacking/close', (success, dots_completed, num_misses, current_time, id) => 
{
    hacking_ui.Destroy();

    if (success)
    {
        jcmp.events.CallRemote('storages/sync/hacking_attempt' + id, 'yo i got it', dots_completed, num_misses, current_time, id);
    }
    else
    {
        jcmp.events.CallRemote('storages/sync/hacking_attempt' + id, false);
    }

    jcmp.events.Call('disable_menus', true);
})

jcmp.ui.AddEvent('storages/ui/enter_keypad_code', (id, code) => 
{
    jcmp.events.CallRemote('storages/sync/enter_keypad_code_' + id, id, code);
})

jcmp.ui.AddEvent('storages/ui/set_name', (id, name) => 
{
    jcmp.events.CallRemote('storages/sync/set_name_' + id, id, name);
})

jcmp.ui.AddEvent('storages/ui/remove_upgrade', (id, upgrade) => 
{
    jcmp.events.CallRemote('storages/sync/remove_upgrade_' + id, id, upgrade);
})

jcmp.ui.AddEvent('storages/ui/menu_ready', () => 
{
    jcmp.events.Call('load/package_loaded', 'storage-menu');
    jcmp.events.CallRemote('storages/menu_ready');
})

jcmp.ui.AddEvent('storages/ui/change_access', (_id, access) => 
{
    jcmp.events.CallRemote('storages/sync/change_access' + _id, access);
})

jcmp.ui.AddEvent('storages/ToggleOpen', (o) => 
{
    storage_ui.BringToFront();
    storage_ui.hidden = false;
    jcmp.localPlayer.controlsEnabled = !o;
})

jcmp.ui.AddEvent('loot/toggle_menus', (enabled) => 
{
    jcmp.events.Call('disable_menus', enabled);
})

jcmp.events.Add('disable_menus', (enabled) => 
{
    jcmp.ui.CallEvent('loot/ToggleEnabled', enabled);
})


jcmp.ui.AddEvent('SecondTick', (s) => 
{
    // Update distance every 10 seconds
    if (s % 10 == 0)
    {
        const pos = jcmp.localPlayer.position;
        jcmp.ui.CallEvent('storages/ui/update_position', JSON.stringify({x: pos.x, y: pos.y, z: pos.z}));
    }

    if (s % 2 == 0 && waypoint != undefined && waypoint.position)
    {
        const pos = jcmp.localPlayer.position;
        const distance = dist(pos, waypoint.position);
    
        if (distance < 2)
        {
            waypoint.minDistance = 999999;
            waypoint.maxDistance = 9999999;
            waypoint.Destroy();
            waypoint = null;
        }
    }
    
})

let waypoint;

jcmp.ui.AddEvent('storage/ui/waypoint', (x, y, z, name, create) => 
{
    if (waypoint)
    {
        waypoint.minDistance = 999999;
        waypoint.maxDistance = 9999999;
        waypoint.Destroy();
        waypoint = null;
    }

    if (create)
    {
        waypoint = new POI(10, new Vector3f(x,y,z), name);
        waypoint.minDistance = 2;
        waypoint.maxDistance = 9999999;
        waypoint.clampedToScreen = true;
    }
})

jcmp.events.Add('LocalPlayerChat', (msg) => 
{
    if (msg == '/clearwaypoint')
    {
        if (waypoint != undefined)
        {
            waypoint.minDistance = 999999;
            waypoint.maxDistance = 9999999;
            waypoint.Destroy();
            waypoint = null;
        }
        return false;
    }
})


function dist(a, b)
{
    return a.sub(b).length;
    //let vector = new Vector3f(a.x - b.x, a.y - b.y, a.z - b.z);
    //return Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
}
