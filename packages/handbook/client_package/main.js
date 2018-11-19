let ui;
let can_open = 0;
let ready = false;

jcmp.events.Add('character/Loaded', () => 
{
    jcmp.events.Call('load/package_loaded', 'handbook');
    ready = true;
})

jcmp.ui.AddEvent('KeyPress', (key) => 
{
    if ((key == 104 || key == 72) && can_open == 0 && ready) // H
    {
        if (ui)
        {
            ui.Destroy();
            ui = null;
            ToggleOpen(false);
        }
        else
        {
            ui = new WebUIWindow("handbook", `MY RESOURCE PATH/resources/handbook/content${jcmp.GRPQ()}`, new Vector2(jcmp.viewportSize.x, jcmp.viewportSize.y));
            ui.autoResize = true;
            ui.hidden = false;
            ui.Reload(true);
            ui.BringToFront();

            ToggleOpen(true);
        }
    }
})

function ToggleOpen(o)
{
    jcmp.localPlayer.controlsEnabled = !o;
    jcmp.events.Call('disable_menus', !o);
    can_open = (o) ? can_open - 1 : can_open + 1;
    jcmp.ui.CallEvent('toggle-cursor', o);
}

jcmp.events.Add('disable_menus', (enabled) => 
{
    can_open = (enabled) ? can_open - 1 : can_open + 1;
})

jcmp.ui.AddEvent('chat_input_state', (s) => 
{
    can_open = (s) ? can_open + 1 : can_open - 1;
})

jcmp.ui.AddEvent('handbook/Ready', () => 
{
    ui.hidden = false;
    jcmp.events.Call('load/package_loaded', 'handbook');
})