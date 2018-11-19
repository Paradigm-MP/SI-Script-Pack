let ui = new WebUIWindow('sounds', 'package://sounds/ui/index.html', new Vector2(1, 1));
ui.hidden = true;

jcmp.events.Add('sound/Play', (name, volume) => 
{
    ui.CallEvent('sound/Play', name, volume);
})

jcmp.events.AddRemoteCallable('sound/Play', (name, volume) => 
{
    ui.CallEvent('sound/Play', name, volume);
})

jcmp.ui.AddEvent('sound/Play', (name, volume) => 
{
    ui.CallEvent('sound/Play', name, volume);
})