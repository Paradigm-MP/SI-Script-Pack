let ui;


jcmp.events.Add('load/ready', () => 
{
    ui = new WebUIWindow('timechange', `${jcmp.resource_path}timechange/ui/index.html${jcmp.GRPQ()}`, new Vector2(1,1));
    //ui.Reload(true);
})

jcmp.ui.AddEvent('timechange/loaded', () => 
{
    jcmp.events.Call('load/package_loaded', 'timechange');
})