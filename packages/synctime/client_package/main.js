let ui;

jcmp.events.Add('load/ready', () => 
{
    ui = new WebUIWindow('synctime', `${jcmp.resource_path}synctime/ui/index.html${jcmp.GRPQ()}`, new Vector2(1,1));
    //ui.Reload(true);
})

let s = 0;
let m = 0;
let h = 0;
let ts = 0;
let enabled = true;

function UpdateTime() // Increment our time
{
    if (!enabled) {return;}
    s += ts;

    if (s >= 60)
    {
        m += 1;
        s = 0;
    }

    if (m >= 60)
    {
        h += 1;
        m = 0;
    }

    if (h >= 24)
    {
        h = 0;
    }

    jcmp.world.SetTime(h, m, s);

}

jcmp.ui.AddEvent('synctime/ClientTimeUpdate', () => {
    UpdateTime();
})

jcmp.events.Add('synctime/Disable', () => {
    enabled = false;
})

jcmp.events.AddRemoteCallable('synctime/SyncTime', (second, minute, hour, timestep) => {
    s = second;
    m = minute;
    h = hour;
    ts = timestep;
    jcmp.world.SetTime(h, m, s);
})

jcmp.ui.AddEvent('synctime/loaded', () => 
{
    jcmp.events.Call('load/package_loaded', 'synctime');
})