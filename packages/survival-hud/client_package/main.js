let ui;
let localplayer;

jcmp.events.Add('character/Loaded', () => 
{
    ui = new WebUIWindow('survival-hud', `${jcmp.resource_path}survival-hud/ui/index.html${jcmp.GRPQ()}`, new Vector2(jcmp.viewportSize.x, jcmp.viewportSize.y));
    ui.autoResize = true;
    ui.hidden = true;

})

jcmp.events.AddRemoteCallable('inventory/sync/init', (contents, slots) => 
{
    contents = JSON.parse(contents);

    for (const category in contents)
    {
        for (let i = 0; i < contents[category].length; i++)
        {
            const stack = contents[category][i];

            CheckStack(JSON.stringify(stack));
        }
    }

})


jcmp.events.AddRemoteCallable('itemuse/grapple_toggle', (toggled) => 
{
    jcmp.ui.CallEvent('survival-hud/ui/grapple_toggle', toggled);
})

jcmp.events.AddRemoteCallable('itemuse/para_toggle', (toggled) => 
{
    jcmp.ui.CallEvent('survival-hud/ui/para_toggle', toggled);
})

jcmp.events.AddRemoteCallable('itemuse/wingsuit_toggle', (toggled) => 
{
    jcmp.ui.CallEvent('survival-hud/ui/wingsuit_toggle', toggled);
})


jcmp.events.AddRemoteCallable('inventory/sync/update', (stack) => 
{
    CheckStack(stack);
})

function CheckStack(stack)
{
    const _stack = JSON.parse(stack);

    for (let i = 0; i < _stack.contents.length; i++)
    {
        if (_stack.contents[i].name == 'Grapplehook' || _stack.contents[i].name == 'DuraGrapple' || _stack.contents[i].name == 'Parachute' || _stack.contents[i].name == 'Wingsuit')
        {
            jcmp.ui.CallEvent('survival-hud/ui/update_equipped', stack);
            break;
        }
    }
}

jcmp.ui.AddEvent('inventory/ToggleOpen', (o) => 
{
    jcmp.localPlayer.controlsEnabled = !o;
    jcmp.ui.CallEvent('survival-hud/Toggle', o);
})

jcmp.ui.AddEvent('survival-hud/Ready', () => 
{
    ui.hidden = false;
    jcmp.events.CallRemote('survival-hud/Ready');
    jcmp.events.Call('load/package_loaded', 'survival-hud');
})

jcmp.events.Add('GameUpdateRender', (r) => 
{
    if (localplayer)
    {
        jcmp.ui.CallEvent('survival-hud/update_health', localplayer.health / localplayer.maxHealth);
    }
    else
    {
        localplayer = jcmp.players.find((p) => p.networkId == jcmp.localPlayer.networkId);
    }
})

jcmp.events.AddRemoteCallable('character/hunger/update', (hunger, thirst) => 
{
    jcmp.ui.CallEvent('survival-hud/update_hunger', hunger);
    jcmp.ui.CallEvent('survival-hud/update_thirst', thirst);
})