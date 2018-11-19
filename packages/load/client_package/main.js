const ui = new WebUIWindow("loader", `package://load/ui/index.html`, new Vector2(jcmp.viewportSize.x, jcmp.viewportSize.y));
ui.autoResize = true;
ui.hidden = false;

let old_loading;
let showing = false;
let ready = false;

//jcmp.GRPQ = function() {return `?${Math.round(Math.random() * 10000000)}=1`;}
jcmp.GRPQ = function() {return '';}

jcmp.active = false;
jcmp.localPlayer.frozen = true;

// Set our loading value to 1 so that the loader appears
jcmp.loading = 1 + 3; // + 3 for loading resources

jcmp.ui.AddEvent('load/uiready', () => 
{
    ready = true;
})

jcmp.events.Add('character/Loaded', () => 
{
    jcmp.loading = jcmp.loading + 17;
})

jcmp.events.Add('load/character_login', () => 
{
    jcmp.ui.CallEvent('load/reset2');
})

jcmp.ui.AddEvent('load/uiready', () => 
{
    jcmp.events.Call('load/ready');
    jcmp.events.CallRemote('load/uiready');
})

jcmp.events.Add('load/package_loaded', (name) => 
{
    jcmp.ui.CallEvent('load/package_loaded', name);
})

jcmp.ui.AddEvent('load/package_load_delay', () => 
{
    jcmp.loading = jcmp.loading - 1;
})

jcmp.ui.AddEvent('load/increase_load', () => 
{
    jcmp.loading = jcmp.loading + 1;
})

jcmp.ui.AddEvent('load/decrease_load', () => 
{
    jcmp.loading = jcmp.loading - 1;
})

// Just toggle frozen so the player doesn't see themself invisible
jcmp.ui.AddEvent('load/ToggleFrozen', (frozen) => 
{
    jcmp.localPlayer.frozen = frozen;
})

jcmp.events.AddRemoteCallable('advancedtp/begin', (x, y, z) => 
{
    jcmp.loading = jcmp.loading + 1;

    jcmp.localPlayer.camera.attachedToPlayer = false;
    jcmp.localPlayer.camera.position = new Vector3f(x, y, z);
})

jcmp.events.AddRemoteCallable('advancedtp/end', () => 
{
    jcmp.loading = jcmp.loading - 1;
    jcmp.localPlayer.camera.attachedToPlayer = true;
})

jcmp.events.AddRemoteCallable('load/set_cam', () => 
{
    jcmp.localPlayer.camera.attachedToPlayer = true;
})

// Toggle controls and invulnerability
/*jcmp.ui.AddEvent('load/ToggleControl', (control) => 
{
    if (jcmp.active)
    {
        jcmp.localPlayer.controlsEnabled = control;
        jcmp.print(`toggle control: ${control}`);
    }
    
    if (!control)
    {
        jcmp.events.CallRemote('load/StartLoad');
    }
    else
    {
        jcmp.events.CallRemote('load/StopLoad');
    }
})*/

jcmp.events.Add('Render', (r) => 
{
    if (!ready) {return;}

    if (jcmp.loading > 0)
    {
        // Set frozen here too in case the game resets it on GameTeleportCompleted
        jcmp.localPlayer.frozen = true;
    }
    else if (jcmp.loading < 0)
    {
        jcmp.loading = 0;
    }

    if (jcmp.loading != 0)
    {
        // Makes it so that the load screen is always on top of everything
        ui.BringToFront();
    }

    if (old_loading == undefined && jcmp.loading != undefined)
    {
        old_loading = jcmp.loading;
    }

    if (jcmp.loading != old_loading && old_loading != undefined)
    {
        if (jcmp.loading > 0 && !showing)
        {
            jcmp.ui.CallEvent('load/Show');
            jcmp.events.Call('load/Show');
            showing = true;
            jcmp.events.CallRemote('load/StartLoad');
            jcmp.localPlayer.controlsEnabled = !showing;
        }
        else if (jcmp.loading == 0 && showing)
        {
            jcmp.ui.CallEvent('load/Hide');
            jcmp.events.Call('load/Hide');
            showing = false;
            jcmp.events.CallRemote('load/StopLoad');
            jcmp.localPlayer.frozen = false;
            jcmp.localPlayer.controlsEnabled = !showing;
        }

        old_loading = jcmp.loading;
    }
});


jcmp.events.Add('GameTeleportInitiated', () => 
{
    jcmp.ui.CallEvent('load/GameTeleportInitiated');
    jcmp.localPlayer.frozen = true;
    jcmp.loading = jcmp.loading + 1;
})

jcmp.events.Add('GameTeleportCompleted', () => 
{
    jcmp.ui.CallEvent('load/GameTeleportCompleted');
    jcmp.loading = jcmp.loading - 1;
})