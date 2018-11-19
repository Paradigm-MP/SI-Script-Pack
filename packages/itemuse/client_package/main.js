include('items/grapple_para.js');
include('items/item_use.js');
include('items/deathdropfinder.js');
include('items/ping.js');
include('items/fakeplayer.js');
include('items/radar.js');
include('items/paper.js');
include('items/cosmetics.js');
include('items/healtheffects.js');
include('events/jc.js');

let using_ui;

jcmp.events.Add('character/Loaded', () => 
{
    using_ui = new WebUIWindow('itemuse_loader', `${jcmp.resource_path}itemuse/ui/index.html${jcmp.GRPQ()}`, new Vector2(jcmp.viewportSize.x, jcmp.viewportSize.y));
    using_ui.autoResize = true;
    using_ui.hidden = true;
})

jcmp.ui.AddEvent('itemuse/ui/initial_ready', () => 
{
    jcmp.events.Call('load/package_loaded', 'itemuse');
})
