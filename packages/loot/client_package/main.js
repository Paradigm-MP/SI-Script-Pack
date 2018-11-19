include('loot.js');
include('cell.js');
include('storage.js');

let ui;


jcmp.events.Add('character/Loaded', () => 
{
    ui = new WebUIWindow('loot_window', `${jcmp.resource_path}loot/ui/index.html${jcmp.GRPQ()}`, new Vector2(jcmp.viewportSize.x, jcmp.viewportSize.y));
    ui.autoResize = true;
    ui.hidden = true;
    
})

let open = false;

jcmp.ui.AddEvent('loot/ui/ready', () => 
{
    open = true;
    ui.hidden = false;
    jcmp.localPlayer.controlsEnabled = false;
})

jcmp.ui.AddEvent('loot/ui/first_init', () => 
{
    jcmp.events.Call('load/package_loaded', 'loot');
})

let id;

jcmp.events.AddRemoteCallable('loot/sync/init', (contents, _id, storage_info) => 
{
    id = _id;

    const data = 
    {
        contents: (contents != 'Locked') ? JSON.parse(contents) : contents,
        id: id,
        demo: (lootboxes[_id]) ? lootboxes[_id].demo == true : false,
        is_storage: lootboxes[_id] && lootboxes[_id].is_storage,
        storage: (lootboxes[_id] && lootboxes[_id].is_storage) ? lootboxes[_id].storage : {}
    }

    // Assign all additional storage info 
    storage_info = JSON.parse(storage_info);
    for (var attrname in storage_info) { data.storage[attrname] = storage_info[attrname]; }

    data.storage.is_mine = data.storage.owner_id == jcmp.steam_id;
    data.storage.unlocked = data.contents != 'Locked';

    jcmp.ui.CallEvent('loot/ui/init', JSON.stringify(data));
    jcmp.ui.CallEvent('loot/ui/init_ammo_types', jcmp.ammo_types);
})

jcmp.events.AddRemoteCallable('loot/sync/update', (s, index, _id) => 
{
    if (id !== _id) {return;}

    jcmp.ui.CallEvent('loot/ui/update', s, index, _id);
})

jcmp.events.AddRemoteCallable('loot/sync/remove', (index, _id) => 
{
    if (id !== _id) {return;}

    jcmp.ui.CallEvent('loot/ui/remove', index, _id);
})

jcmp.ui.AddEvent('loot/ui/take_item', (stack, index, _id) => 
{
    if (id !== _id) {return;} // Maybe eventually add strike here

    jcmp.events.CallRemote('lootbox/sync/take' + _id, stack, index, _id);
})

jcmp.ui.AddEvent('loot/ui/close', () => 
{
    open = false;
    ui.hidden = true;
    jcmp.localPlayer.controlsEnabled = true;
    jcmp.events.CallRemote('lootbox/sync/close_key' + id);
})

jcmp.events.AddRemoteCallable('loot/sync/close', (_id) => 
{
    if (_id == undefined && open) // If we are force closing someone manually from a storage
    {
        CloseBox();
        return;
    }

    if (id !== _id || !open) {return;}

    CloseBox();
})

function CloseBox()
{
    open = false;
    ui.hidden = true;
    jcmp.localPlayer.controlsEnabled = true;

    jcmp.ui.CallEvent('loot/ui/close');
}