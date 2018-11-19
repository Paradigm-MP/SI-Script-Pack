let paper_ui;
let current_paper_id = -1;
let pens = [];


// When the server sends data 
jcmp.events.AddRemoteCallable('itemuse/paper/load', (id, data, name) => 
{
    current_paper_id = id;
    paper_ui = new WebUIWindow('itemuse_paper', `${jcmp.resource_path}itemuse/ui/paper/index.html${jcmp.GRPQ()}`, new Vector2(jcmp.viewportSize.x, jcmp.viewportSize.y));
    paper_ui.autoResize = true;
    paper_ui.hidden = true;
    jcmp.events.Call('inventory/ToggleOpen'); // Close inventory

    paper_ui.AddEvent('ready', () => 
    {
        paper_ui.CallEvent('load', data, name);
        if (pens.length > 0)
        {
            paper_ui.CallEvent('init_pens', JSON.stringify(pens));
        }
        paper_ui.hidden = false;
        jcmp.localPlayer.controlsEnabled = false;
        jcmp.events.Call('disable_menus', false);
    })

    // Called when the player stops a stroke (releases mouse)
    paper_ui.AddEvent('save', (image_data, name) => 
    {
        jcmp.events.CallRemote('itemuse/paper/save', current_paper_id, image_data);
    })

    paper_ui.AddEvent('mod_pen_dura', (pen_name, dura) => 
    {
        jcmp.events.CallRemote('itemuse/paper/mod_pen_dura', pen_name, dura);
    })

    paper_ui.AddEvent('close', (name) => 
    {
        jcmp.events.CallRemote('itemuse/paper/close', current_paper_id, name);
        paper_ui.Destroy();
        paper_ui = null;
        jcmp.localPlayer.controlsEnabled = true;
        current_paper_id = -1;
        jcmp.events.Call('disable_menus', true);
    })

})

// Close the paper if they take damage
jcmp.events.Add('LocalPlayerHealthChange', (old_health, new_health) => 
{
    if (new_health <= 0 && current_paper_id > -1 && paper_ui)
    {
        paper_ui.CallEvent('close');
    }
})

jcmp.events.AddRemoteCallable('itemuse/paper/init_pens', (pens_) => 
{
    pens = JSON.parse(pens_);

    if (paper_ui)
    {
        paper_ui.CallEvent('init_pens', pens_);
    }
})

jcmp.events.AddRemoteCallable('itemuse/paper/pen_broke', (name) => 
{
    if (paper_ui)
    {
        paper_ui.CallEvent('remove_pen', name);
    }
})

jcmp.events.AddRemoteCallable('itemuse/paper/update_pen_dura', (name, dura) => 
{
    if (paper_ui)
    {
        paper_ui.CallEvent('update_pen_dura', name, dura);
    }
})