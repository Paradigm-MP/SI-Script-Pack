
let radar_ui;

jcmp.events.Add('character/Loaded', () => 
{
    //radar_ui = new WebUIWindow('itemuse_radar', `${jcmp.resource_path}itemuse/ui/radar/index.html${jcmp.GRPQ()}`, new Vector2(jcmp.viewportSize.x, jcmp.viewportSize.y));
    //radar_ui.autoResize = true;
    //radar_ui.hidden = true;
    jcmp.events.Call('load/package_loaded', 'itemuse radar');
})

let render_event;


jcmp.events.AddRemoteCallable('itemuse/update_radar', (data) => 
{
    data = JSON.parse(data);

    const my_rot = new Vector3f(0,-jcmp.localPlayer.camera.rotation.y, 0);
    const my_pos = jcmp.localPlayer.position;

    for (let i = 0; i < data.length; i++)
    {
        const pos = new Vector3f(data[i].x, data[i].y, data[i].z);
        const relative = my_pos.sub(pos);

        const new_entry = {x: relative.x, y: relative.z, id: data[i].id};
        data[i] = new_entry;
    }

    jcmp.ui.CallEvent('itemuse/radar/update', JSON.stringify(data));
})

let range = 500;
let radar_delta = 0;

jcmp.events.AddRemoteCallable('itemuse/open_radar', (_range) => 
{
    radar_ui = new WebUIWindow('itemuse_radar', `${jcmp.resource_path}itemuse/ui/radar/index.html${jcmp.GRPQ()}`, new Vector2(jcmp.viewportSize.x, jcmp.viewportSize.y));
    radar_ui.autoResize = true;
    radar_ui.hidden = true;
    range = _range;
    radar_delta = 0;
})

jcmp.ui.AddEvent('itemuse/radar/ready', () => 
{
    jcmp.ui.CallEvent('itemuse/radar/update_range', range);
    jcmp.ui.CallEvent('itemuse/radar/update_rotation', jcmp.localPlayer.camera.rotation.y);

    render_event = jcmp.events.Add('Render', () => 
    {
        radar_delta++;

        if (radar_delta % 2 == 0)
        {
            jcmp.ui.CallEvent('itemuse/radar/update_rotation', jcmp.localPlayer.camera.rotation.y);
        }
        
    })

    radar_ui.hidden = false;
})

jcmp.events.AddRemoteCallable('itemuse/close_radar', () => 
{
    jcmp.events.Remove(render_event);
    //using_item = false;
    radar_ui.Destroy();
    //jcmp.localPlayer.controlsEnabled = true;
})


/*let can_cancel_radar = true;

jcmp.ui.AddEvent('chat_input_state', s => {
    can_cancel_radar = !s;
});

jcmp.ui.AddEvent('KeyPress', (key) => 
{
    if (using_item && key == 102 && can_cancel_radar && !radar_ui.hidden) // F
    {
        jcmp.events.CallRemote('itemuse/close_radar');
        using_item = false;
        jcmp.localPlayer.controlsEnabled = true;
        radar_ui.hidden = true;
    }
})
*/