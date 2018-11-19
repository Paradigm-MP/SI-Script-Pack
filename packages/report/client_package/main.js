let ui;

jcmp.events.Add('LocalPlayerChat', (msg) => 
{
    if (msg.toLowerCase().trim().startsWith('/report'))
    {
        jcmp.ui.CallEvent('report/open', msg.replace('/report', '').trim());

        return false;
    }
})

jcmp.ui.AddEvent('report/submit', (option, details) => 
{
    details = details.substring(0, 10000); // Max length 10000

    if (option && option.length > 3 && details && details.length > 10)
    {
        jcmp.events.CallRemote('report/submit', option, details);
    }
})

/*jcmp.events.AddRemoteCallable('report/success', () => 
{
    jcmp.ui.CallEvent('report/success');
})*/

jcmp.ui.AddEvent('report/ToggleOpen', (o) => {
    jcmp.localPlayer.controlsEnabled = !o;
    ui.BringToFront();

    jcmp.events.Call('disable_menus', !o);
})

jcmp.ui.AddEvent('report/Ready', () => {
    ui.hidden = false;
    jcmp.events.Call('load/package_loaded', 'report');
})

jcmp.events.Add('character/Loaded', () => {
    ui = new WebUIWindow('report_window', `${jcmp.resource_path}report/ui/index.html${jcmp.GRPQ()}`, new Vector2(jcmp.viewportSize.x, jcmp.viewportSize.y));
    ui.autoResize = true;
    ui.hidden = true;
})

jcmp.events.Add('ScriptError', (file, line, error, trace) => 
{
    jcmp.events.CallRemote('report/submit_auto', `**AUTOMATED CLIENT ERROR:**\n\nFILE: ${file}\nLINE: ${line}\nERROR: ${error}\nTRACE: ${trace}`);

    jcmp.notify({
        title: 'Error!',
        subtitle: 'An error has occurred! Please notify a staff member.',
        preset: 'warn_red',
        time: 15000
    })
})
