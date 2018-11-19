let ui;


jcmp.events.Add('load/ready', () => 
{
    ui = new WebUIWindow('events-status', `${jcmp.resource_path}events-status/ui/index.html${jcmp.GRPQ()}`, new Vector2(jcmp.viewportSize.x, jcmp.viewportSize.y));
    ui.autoResize = true;
})