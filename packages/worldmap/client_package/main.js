let map_ui;

jcmp.events.AddRemoteCallable('worldmap/load', () => 
{
    map_ui = new WebUIWindow('map', `package://worldmap/ui/map/index.html`, new Vector2(jcmp.viewportSize.x, jcmp.viewportSize.y));
    map_ui.autoResize = true;
    map_ui.hidden = false;

    map_ui.AddEvent('set_marker', (x, z) => 
    {
        waypoint_marker = new POI(10, new Vector3f(ConvertFromMap(x),1025,ConvertFromMap(z)), '');
        waypoint_marker.minDistance = 5;
        waypoint_marker.maxDistance = 9999999;
        waypoint_marker.clampedToScreen = true;
    })

    map_ui.AddEvent('hide_marker', () => 
    {
        waypoint_marker.minDistance = 9999999;
    })

    map_ui.AddEvent('toggle_map', (open) => 
    {
        jcmp.localPlayer.controlsEnabled = !open;
        map_ui.BringToFront();
    })
    
    map_ui.AddEvent('teleport', (x, z) => 
    {
        jcmp.events.CallRemote('worldmap/teleport', ConvertFromMap(x), ConvertFromMap(z));
    })
    
    map_ui.AddEvent('ready', () => 
    {
        map_ui.CallEvent('set_id', jcmp.localPlayer.networkId);
    
        jcmp.events.CallRemote('worldmap/map_ready');
    })
    
})

let waypoint_marker;

jcmp.events.Add('LocalPlayerChat', (msg) => 
{
    if (msg == '/worldmap' && map_ui)
    {
        map_ui.CallEvent('toggle');
    }
})

jcmp.ui.AddEvent('chat_input_state', (s) => {
    //map_ui.CallEvent('toggle_enabled', s);
})

jcmp.events.AddRemoteCallable('worldmap/sync', (data) => 
{
    data = JSON.parse(data);

    data.forEach((entry) => 
    {
        entry.pos = new Vector3f(entry.x, 0, entry.z);

        const d = JSON.stringify({
            x: ConvertToMap(entry.pos.x),
            y: ConvertToMap(entry.pos.z),
            name: entry.name,
            color: entry.color,
            id: entry.id
        });

        map_ui.CallEvent('add', d);

    });

})

jcmp.events.AddRemoteCallable('worldmap/remove_player', (id) => 
{
    if (!map_ui) {return;}
    map_ui.CallEvent('remove_player', id);
})

jcmp.ui.AddEvent('SecondTick', () => 
{
    if (!map_ui) {return;}
    UpdateLocalPlayerPos();
})


// Update localplayer position on map
function UpdateLocalPlayerPos()
{
    if (!map_ui) {return;}
    const pos = jcmp.localPlayer.position;
    UpdateMapPos(pos);
}

function ConvertToMap(pos)
{
    return Math.max(0, Math.min(100 * ((pos + 16383) / 32767), 100)); // Convert to percent
}

function ConvertFromMap(pos)
{
    return (pos / 100) * 32767 - 16383; // Convert to coords
}

// Update player position on the map
function UpdateMapPos(pos)
{
    if (!map_ui) {return;}
    map_ui.CallEvent('update_pos', JSON.stringify({
        x: ConvertToMap(pos.x),
        y: ConvertToMap(pos.z),
        id: jcmp.localPlayer.networkId
    }));
}