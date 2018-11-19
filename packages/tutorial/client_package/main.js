let ui;
let tutorial_enabled = false;

const lootbox_pos = new Vector3f(3541.30859375, 1032.2952880859375, 1300.013427734375);

jcmp.events.AddRemoteCallable('tutorial/load', () => 
{
    tutorial_enabled = true;
})

function CreateTutorialUI()
{
    ui = new WebUIWindow('tutorial-devbot', 'package://tutorial/ui/index.html', new Vector2(jcmp.viewportSize.x, jcmp.viewportSize.y));
    ui.hidden = true;
    ui.autoResize = true;

    ui.AddEvent('ready', () => 
    {
        ui.hidden = false;
    })

    ui.AddEvent('toggle-controls', (enabled) => 
    {
        jcmp.localPlayer.controlsEnabled = enabled;
    })

    ui.AddEvent('start', () => 
    {
        jcmp.events.CallRemote('tutorial/start');
    })

    ui.AddEvent('spawn_box', () => 
    {
        jcmp.events.CallRemote('tutorial/spawn_box');
    })

    ui.AddEvent('set_marker1', () => 
    {
        waypoint = new POI(10, lootbox_pos, ' ');
        waypoint.clampedToScreen = true;
        waypoint.minDistance = 5;
        waypoint.maxDistance = 999999;
    })

    ui.AddEvent('close', () => 
    {
        // sync to sql
        ui.Destroy();
        ui = null;
        jcmp.events.CallRemote('tutorial/end');
    })

}

let first_open = true;

jcmp.ui.AddEvent('inventory/ToggleOpen', (o) => 
{
    if (!box_complete) {return;}

    if (first_open)
    {
        ui.CallEvent('inventory_open');
        jcmp.events.Call('disable_menus', false);
    }

    first_open = false;
})

jcmp.events.AddRemoteCallable('tutorial/equipped_grapple', () => 
{
    ui.CallEvent('equipped_grapple');
    jcmp.events.Call('disable_menus', true);
})

let box_complete = false;


jcmp.events.AddRemoteCallable('tutorial/box_complete', () => 
{
    ui.CallEvent('box_complete');
    box_complete = true;
})

jcmp.events.Add('character/Loaded', () => 
{
    jcmp.events.Add('load/Hide', () => 
    {
        if (tutorial_enabled)
        {
            CreateTutorialUI();
        }
    })
})

jcmp.events.Add('LocalPlayerChat', (msg) => 
{
    if (msg == '/tutorial')
    {
        if (!in_sz())
        {
            jcmp.notify({
                title: 'Cannot start tutorial',
                subtitle: 'You must be in the safezone to start the tutorial',
                preset: 'warn',
                time: 5000
            })
        }
        else
        {
            CreateTutorialUI();
        }
    }
})

let waypoint;

jcmp.ui.AddEvent('SecondTick', () => 
{
    if (waypoint)
    {
        if (distv3(jcmp.localPlayer.position, waypoint.position) < 5)
        {
            waypoint.minDistance = 9999999;
            waypoint.Destroy();
            waypoint = null;
            ui.CallEvent('got_waypoint');
        }
    }
})

function distv3(v1, v2)
{
    return v1.sub(v2).length;
}


// Safezone stuff
const center = new Vector3f(3422.76318359375, 1033.217041015625, 1329.4124755859375);
const radius = 100;

function in_sz()
{
    return dist(jcmp.localPlayer.position, center) < radius;
}


// vector2 distance
function dist(v1, v2)
{
    v1.y = 0;
    v2.y = 0;
    return v1.sub(v2).length;
}