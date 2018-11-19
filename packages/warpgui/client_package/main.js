let ui;

jcmp.events.Add('character/Loaded', () => 
{
    ui = new WebUIWindow('warpgui', 'package://warpgui/ui/index.html', new Vector2(jcmp.viewportSize.x, jcmp.viewportSize.y));
    ui.autoResize = true;
    ui.hidden = true;
})

jcmp.ui.AddEvent('warpgui/AcceptWarp', (id) => {
    jcmp.events.CallRemote('warpgui/AcceptWarp', id);
})

jcmp.ui.AddEvent('warpgui/WarpHere', (id) => {
    jcmp.events.CallRemote('warpgui/WarpHere', id);
})

jcmp.ui.AddEvent('warpgui/WarpTo', (id) => {
    jcmp.events.CallRemote('warpgui/WarpTo', id);
})

jcmp.events.AddRemoteCallable('warpgui/AddAcceptWarp', (id) => {
    jcmp.ui.CallEvent('warpgui/AddAcceptWarp', id);
})

jcmp.events.AddRemoteCallable('warpgui/AddPlayer', (id, name) => {
    AddPlayer(id, name);
})

jcmp.events.AddRemoteCallable('warpgui/RemovePlayer', (id) => {
    jcmp.ui.CallEvent('warpgui/RemovePlayer', id);
})

jcmp.events.AddRemoteCallable('warpgui/InitPlayers', (data) => {
    data = JSON.parse(data);
    data.forEach(function(entry) 
    {
        AddPlayer(entry.id, entry.name);
    });
})

jcmp.events.AddRemoteCallable('warpgui/InitConfig', (c) => {
    jcmp.ui.CallEvent('warpgui/InitConfig', c);

    c = JSON.parse(c);
    if ((c.admin_only && c.admin) || !c.admin_only)
    {
        ui.hidden = false;
    }
    else
    {
        ui.Destroy();
    }
})

jcmp.ui.AddEvent('warpgui/ToggleOpen', (open) => {
    jcmp.localPlayer.controlsEnabled = open;
})

jcmp.ui.AddEvent('warpgui/Ready', () => {
    jcmp.events.CallRemote('warpgui/GUIReady');
})


function AddPlayer(id, name)
{
    if (id != jcmp.localPlayer.networkId)
    {
        jcmp.ui.CallEvent('warpgui/AddPlayer', id, name);
    }
}