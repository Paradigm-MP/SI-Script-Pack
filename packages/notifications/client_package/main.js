let ui;


jcmp.events.Add('character/Loaded', () => 
{
    ui = new WebUIWindow('notifications', 'package://notifications/ui/index.html', new Vector2(jcmp.viewportSize.x, jcmp.viewportSize.y));
    ui.hidden = false;
    ui.autoResize = true;

    ui.AddEvent('ready', () => 
    {
        jcmp.events.Call('load/package_loaded', 'notifications');
    })
})

/**
 * Puts a notification in the queue.
 * @param {*} message 
 * @param {*} args 
 */
function Notify(args)
{
    if (typeof args != 'string')
    {
        args = JSON.stringify(args);
    }

    if (!ui) {return;}
    ui.CallEvent('add', args);
}

jcmp.notify = Notify;

jcmp.ui.AddEvent('notify', (args) => 
{
    if (ui)
    {
        ui.BringToFront();
    }
    jcmp.notify(args);
})

jcmp.events.AddRemoteCallable('notifications/notify', (args) => 
{
    if (ui)
    {
        ui.BringToFront();
    }
    jcmp.notify(args);
})
