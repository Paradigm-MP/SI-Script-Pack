let ui;
jcmp.events.Add('character/Loaded', () => 
{
    ui = new WebUIWindow('crafting', 'package://crafting/ui/index.html', new Vector2(jcmp.viewportSize.x, jcmp.viewportSize.y));
    ui.autoResize = true;
    ui.hidden = true;

    ui.hidden = false;
    jcmp.ui.CallEvent('crafting/Enable');
})

jcmp.ui.AddEvent('crafting/ToggleOpen', (o) => 
{
    jcmp.localPlayer.controlsEnabled = !o;
})