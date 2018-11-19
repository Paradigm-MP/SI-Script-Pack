const markers = [];
let dimension = 0;
let ui;

// TODO - RESTRICT MAKING MARKERS WHILE IN COMBAT OR DEAD


// Called when the player presses the + button on the UI
jcmp.ui.AddEvent('markers/AddNew', (name) => {
    let data = 
    {
        x: jcmp.localPlayer.position.x,
        y: jcmp.localPlayer.position.y,
        z: jcmp.localPlayer.position.z,
        n: name.substring(0, 30),
        d: jcmp.localPlayer.dimension,
        v: true
    }
    // save data in settings
    jcmp.ui.CallEvent('markers/AddEntry', JSON.stringify(data));
    CreateMarker(data);
})

function CreateMarker(data)
{
    let marker = new POI(16, new Vector3f(data.x, data.y, data.z), data.n);
    marker.maxDistance = 9999999;
    marker.minDistance = (data.v == false || data.d != jcmp.localPlayer.dimension) ? 999999 : 0;
    marker.dimension = data.d;
    marker.v = data.v;
    markers.push(marker);
}

// Called when the player presses the trash can button on the UI
jcmp.ui.AddEvent('markers/Remove', (name) => {
    let index = markers.findIndex(m => m.text == name);
    if (index > -1)
    {
        markers[index].Destroy();
        markers.splice(index, 1);
        // also update settings
    }
})

// Called when the player presses the pencil button on the UI
jcmp.ui.AddEvent('markers/Edit', (old_name, new_name) => {
    let index = markers.findIndex(m => m.text == old_name);
    if (index > -1)
    {
        markers[index].text = new_name;
        // also update settings
    }
})

// Called when the player presses the toggle visibility button on the UI
jcmp.ui.AddEvent('markers/Toggle', (name, visible) => {
    let index = markers.findIndex(m => m.text == name);
    if (index > -1)
    {
        markers[index].minDistance = (!visible) ? 999999 : 0;
        markers[index].v = visible;
        // also update settings
    }
})

// Checks if the player changed dimensions to update icons and markers
jcmp.ui.AddEvent('markers/SecondTick', () => {
    if (jcmp.localPlayer.dimension != dimension)
    {
        dimension = jcmp.localPlayer.dimension;
        jcmp.ui.CallEvent('markers/ChangeDimension', dimension);
        for(let i = 0; i < markers.length; i++) 
        {
            const marker = markers[i];
            marker.minDistance = (marker.v == false || dimension != marker.dimension) ? 999999 : 0;
        };
    }
})

jcmp.ui.AddEvent('markers/ToggleOpen', (o) => {
    jcmp.localPlayer.controlsEnabled = !o;
    ui.BringToFront();
})

jcmp.ui.AddEvent('markers/Ready', () => {
    ui.hidden = false;
    jcmp.events.Call('load/package_loaded', 'markers');
})

jcmp.events.Add('character/Loaded', () => {
    ui = new WebUIWindow('markers', `${jcmp.resource_path}markers/ui/index.html${jcmp.GRPQ()}`, new Vector2(jcmp.viewportSize.x, jcmp.viewportSize.y));
    ui.autoResize = true;
    ui.hidden = true;
})