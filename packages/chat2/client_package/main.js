const max_characters = 1000;
let ui;
let my_name;

jcmp.ui.AddEvent('chat_input_state', (s) => {
    jcmp.ui.CallEvent('mainui_prevent_open_menu', s);
    jcmp.localPlayer.controlsEnabled = !s;
    ui.BringToFront();
});

jcmp.events.Add('character/Loaded', () => 
{
    ui = new WebUIWindow('chat2', `${jcmp.resource_path}chat2/ui/index.html${jcmp.GRPQ()}`, new Vector2(jcmp.viewportSize.x, jcmp.viewportSize.y));
    ui.autoResize = true;
    ui.hidden = true;
})

jcmp.ui.AddEvent('chat_submit_message', (msg, channel, stack) => {
    const returns = jcmp.events.Call('LocalPlayerChat', msg, channel, stack);
    if (returns.some(r => r === false)) // Return false to LocalPlayerChat to stop msg from sending
    {
        return;
    }

    msg = msg.substring(0, max_characters);
    jcmp.events.CallRemote('chat_submit_message', msg, channel, stack);
});

jcmp.events.Add('guipm/AddMessagedPlayer', (name) => 
{
    jcmp.ui.CallEvent('chat2/AddMessagedPlayer', name);
})

jcmp.events.Add('chat2/AddPlayer', (name) => 
{
    jcmp.ui.CallEvent('chat2/AddPlayer', name);
})

jcmp.events.AddRemoteCallable('chat2/RemovePlayer', (name) => 
{
    jcmp.ui.CallEvent('chat2/RemovePlayer', name);
})

jcmp.ui.AddEvent('chat_ready', () => {
    ui.hidden = false;
    jcmp.events.CallRemote('chat_ready');
    jcmp.events.Call('chat_ready');
    jcmp.ui.CallEvent('chat2/StoreName', my_name);
    jcmp.ui.CallEvent('chat2/SyncLevels', JSON.stringify(jcmp.cp));
    jcmp.events.Call('load/package_loaded', 'chat2');
})

jcmp.events.AddRemoteCallable('chat_message', (obj, r, g, b) => {
    jcmp.ui.CallEvent('chat_message', obj, r, g, b);
});

jcmp.events.AddRemoteCallable('chat/InitConfig', (config) => {
    jcmp.ui.CallEvent('chat/InitConfig', config);
    config = JSON.parse(config);
    //max_characters = config.max_characters;
    jcmp.ui.CallEvent('chat2/StoreName', my_name);
})

jcmp.events.Add('LocalPlayerChat', (msg) => {
    if (msg == "/clear")
    {
        jcmp.ui.CallEvent('chat/ClearChat');
        return false;
    }
})

jcmp.events.Add('disable_menus', (enabled) => 
{
    jcmp.ui.CallEvent('chat2/ToggleEnabled', enabled);
})

jcmp.events.Add('character/exp/player_level_sync', (id, level) => 
{
    jcmp.ui.CallEvent('chat2/sync_level', id, level);
})

jcmp.events.Add('inventory/events/drop_item_chat', (stack, index) => 
{
    jcmp.ui.CallEvent('chat2/drop_item_chat', stack, index);
})

jcmp.events.Add('character/Loaded', (name) => 
{
    my_name = name;
    jcmp.ui.CallEvent('chat2/StoreName', my_name);
})