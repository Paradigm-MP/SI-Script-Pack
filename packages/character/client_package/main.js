let ui;

jcmp.events.Add('load/ready', () => 
{
    ui = new WebUIWindow('character_manager', `${jcmp.resource_path}character/ui/main_ui/index.html${jcmp.GRPQ()}`, new Vector2(jcmp.viewportSize.x, jcmp.viewportSize.y));
    //ui.Reload(true);
    ui.autoResize = true;
    ui.hidden = false;
})


let exp_ui;

// Array of all synced character data, using their networkid as index
jcmp.cp = [];

// Array of all our character data
jcmp.c = {};

// Pending data - used when the server sends all data for character cards, then we take it from the player we picked
jcmp.c_pend = {};

jcmp.localPlayer.frozen = true;
jcmp.ui.HideHud();

jcmp.localPlayer.controlsEnabled = false;


jcmp.localPlayer.camera.attachedToPlayer = false;
jcmp.localPlayer.camera.position = new Vector3f(3363, 1030, 2042);
jcmp.localPlayer.camera.rotation = new Vector3f(-0.00775, 0.11522, 0);

jcmp.dev_mode = false;

jcmp.events.AddRemoteCallable('set_dev_mode', (enabled) => 
{
    jcmp.dev_mode = enabled;
})

// Once our UI is ready to use, tell the server to send us data
jcmp.ui.AddEvent('character/ui_loaded', () => 
{
    jcmp.localPlayer.camera.attachedToPlayer = false;
    jcmp.localPlayer.camera.position = new Vector3f(3363, 1030, 2042);
    jcmp.localPlayer.camera.rotation = new Vector3f(-0.00775, 0.11522, 0);
    jcmp.events.CallRemote('character/client_loaded_ui');

    jcmp.events.Call('load/package_loaded', 'character');
})

jcmp.ui.AddEvent('character/create_new', (name, id) => 
{
    // If something went wrong and we didn't get what we need
    if (name == undefined || id == undefined || id < 1 || id > 3)
    {
        return;
    }

    jcmp.events.CallRemote('character/client_create_new', name, id);
})

// When a player clicks on an existing character to login
jcmp.ui.AddEvent('character/login', (id) => 
{
    jcmp.loading = jcmp.loading + 1;
    jcmp.events.CallRemote('character/login', id);
    jcmp.c = JSON.parse(JSON.stringify(jcmp.c_pend[id - 1])); // Copy data
    jcmp.c_pend = undefined;

    jcmp.localPlayer.healthEffects.regenRate = 50;
    jcmp.localPlayer.healthEffects.regenCooldown = 120;

    jcmp.events.Call('load/character_login');

    jcmp.events.Call('sound/Play', 'comlink_mod_unlock.ogg', 0.5);
})

jcmp.ui.AddEvent('character/mouse_hidden_on_load', () => 
{
    ui.Destroy();
})

jcmp.events.AddRemoteCallable('character/login_new', () => 
{
    jcmp.loading = jcmp.loading + 1;
    jcmp.events.Call('load/character_login');
})

jcmp.events.AddRemoteCallable('character/bad_name', () => 
{
    jcmp.ui.CallEvent('character/reset_name');
})

jcmp.events.AddRemoteCallable('character/send_characters_data', (data) => 
{
    jcmp.c_pend = JSON.parse(data);
    jcmp.ui.CallEvent('character/create_char_entries', data);
    jcmp.loading = jcmp.loading - 1;
})

// Only freeze player on PlayerReady, otherwise other packages may reset it
jcmp.events.AddRemoteCallable('character/freeze_initial', () => 
{
    FreezePlayer();
})

function FreezePlayer()
{
    jcmp.localPlayer.frozen = true;
    
    jcmp.localPlayer.camera.attachedToPlayer = false;
    jcmp.localPlayer.camera.position = new Vector3f(3363, 1030, 2042);
    jcmp.localPlayer.camera.rotation = new Vector3f(-0.00775, 0.11522, 0);
}

jcmp.ui.AddEvent('SecondTick', () => 
{
    if (!jcmp.active)
    {
        FreezePlayer();
    }
})

// Let load handle controlsEnabled
jcmp.events.AddRemoteCallable('character/Loaded', (id, name, steam_id) => 
{
    jcmp.active = true;
    //jcmp.localPlayer.frozen = false;
    //jcmp.localPlayer.camera.attachedToPlayer = true; // Advanced load handles this
    jcmp.name = name;
    jcmp.steam_id = steam_id;
    jcmp.events.Call('character/Loaded', name);
    jcmp.ui.CallEvent('character/Loaded');
    jcmp.loading = jcmp.loading - 1;

    exp_ui = new WebUIWindow('exp_ui', `${jcmp.resource_path}character/ui/exp_ui/index.html${jcmp.GRPQ()}`, new Vector2(jcmp.viewportSize.x, jcmp.viewportSize.y));
    exp_ui.autoResize = true;
    exp_ui.hidden = false;
    //exp_ui.Reload(true);
    jcmp.ui.ShowHud();

    jcmp.localPlayer.controlsEnabled = true;
})

// Called when a player's level changes
jcmp.events.AddRemoteCallable('character/exp/broadcast_level', (id, level) => 
{
    if (jcmp.cp[id] == undefined)
    {
        jcmp.cp[id] = {};

        if (jcmp.cp[id].exp == undefined)
        {
            jcmp.cp[id].exp = {};
        }
    }

    jcmp.cp[id].exp.level = level;

    jcmp.events.Call('character/exp/player_level_sync', id, level);
})

jcmp.events.AddRemoteCallable('character/exp/sync_player_levels', (data) => 
{
    data = JSON.parse(data);

    for (const id in data)
    {
        if (jcmp.cp[id] == undefined)
        {
            jcmp.cp[id] = {};

            if (jcmp.cp[id].exp == undefined)
            {
                jcmp.cp[id].exp = {};
            }
        }

        jcmp.cp[id].exp.level = data[id];

        jcmp.events.Call('character/exp/player_level_sync', id, data[id]);

        // If we already initilizaed our character's exp, use this data!
        if (id == jcmp.localPlayer.networkId && jcmp.c.exp != undefined)
        {
            jcmp.c.exp.level = data[id];
        }
    }
})

// Called when the server updates our player's exp (experience, level, or max)
jcmp.events.AddRemoteCallable('character/exp/update_exp', (exp) => 
{
    if (jcmp.c.exp && jcmp.c.exp.level != JSON.parse(exp).level)
    {
        jcmp.localPlayer.baseState = 2125404273; // Make em do a backflip
    }

    jcmp.c.exp = JSON.parse(exp);
    jcmp.ui.CallEvent('character/exp/exp_change', exp);

    if (exp_ui)
    {
        exp_ui.BringToFront();
    }
})

jcmp.ui.AddEvent('survival-hud/Ready', () => 
{
    jcmp.ui.CallEvent('character/exp/exp_change', JSON.stringify(jcmp.c.exp));
})

jcmp.ui.AddEvent('character/exp/ui_loaded', () => 
{
    jcmp.events.CallRemote('character/exp/ui_loaded');
    jcmp.events.Call('load/package_loaded', 'character_exp');
})

jcmp.events.AddRemoteCallable('character/AddEntry', () => 
{
    jcmp.ui.CallEvent('character/add_entry');
})