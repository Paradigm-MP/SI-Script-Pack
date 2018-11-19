const ui = new WebUIWindow('ping_indicator', `package://ping/ui/index.html`, new Vector2(jcmp.viewportSize.x, jcmp.viewportSize.y));
ui.autoResize = true;
ui.hidden = true;

ui.AddEvent('ready', () => 
{
    //
})

jcmp.events.AddRemoteCallable('ping/show', () => 
{
    ui.CallEvent('show');
    ui.hidden = false;
})

jcmp.events.AddRemoteCallable('ping/hide', () => 
{
    ui.CallEvent('hide');
    ui.hidden = true;
})

jcmp.events.Add('Render', () => 
{
    if (!ui.hidden)
    {
        ui.BringToFront();
    }
})