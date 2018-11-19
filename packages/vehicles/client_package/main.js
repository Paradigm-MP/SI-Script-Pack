
let car_ui;
let look_ui;
let menu_ui;
let health_visible = false;

let look_ui_size = new Vector2f(0,0);

jcmp.events.Add('character/Loaded', () => 
{
    car_ui = new WebUIWindow('car_ui', `${jcmp.resource_path}vehicles/ui/car_health/index.html${jcmp.GRPQ()}`, new Vector2(jcmp.viewportSize.x, jcmp.viewportSize.y));
    car_ui.autoResize = true;
    

    look_ui = new WebUIWindow('car_look_ui', `${jcmp.resource_path}vehicles/ui/car_look/index.html${jcmp.GRPQ()}`, new Vector2(jcmp.viewportSize.x, jcmp.viewportSize.y));
    look_ui.autoResize = true;
    look_ui.hidden = true;
    look_ui.autoRenderTexture = false;

    look_ui.AddEvent('vehicles/ui/update_size', (w, h) => 
    {
        look_ui_size = new Vector2f(typeof w != 'undefined' ? w : 0, typeof h != 'undefined' ? h : 0);
    })

    menu_ui = new WebUIWindow('vehicles_menu', `${jcmp.resource_path}vehicles/ui/menu/index.html${jcmp.GRPQ()}`, new Vector2(jcmp.viewportSize.x, jcmp.viewportSize.y));
    menu_ui.autoResize = true;
    menu_ui.hidden = true;
})

jcmp.ui.AddEvent('vehicles/ui/health_ready', () => 
{
    jcmp.events.Call('load/package_loaded', 'vehicle health');
})

jcmp.ui.AddEvent('vehicles/ui/look_ready', () => 
{
    jcmp.events.Call('load/package_loaded', 'vehicle look');
})

jcmp.ui.AddEvent('vehicles/ui/menu_ready', () => 
{
    menu_ui.hidden = false;
    jcmp.events.CallRemote('vehicles/ready');
    
    car_ui.hidden = false;

    const pos = jcmp.localPlayer.position;
    jcmp.ui.CallEvent('vehicles/ui/update_position', JSON.stringify({x: pos.x, y: pos.y, z: pos.z}));
    jcmp.events.Call('load/package_loaded', 'vehicle menu');
})

jcmp.events.AddRemoteCallable('vehicles/sync/init', (vehicles) => 
{
    jcmp.ui.CallEvent('vehicles/ui/init', vehicles);
})

jcmp.ui.AddEvent('vehicles/ToggleOpen', (o) => 
{
    menu_ui.BringToFront();
    menu_ui.hidden = false;
    jcmp.localPlayer.controlsEnabled = !o;
})

jcmp.events.Add('inventory/OpenedClosed', (o) => 
{
    if (car_ui)
    {
        car_ui.hidden = o;
    }
})

const font_size = 30;
const color = new RGBA(119,229,237,255);
const black = new RGBA(0,0,0,255);
const font_name = 'Arial';
const up = new Vector3f(0,1.5,0);
const offset = new Vector2f(1,1);

const circle_size = new Vector2f(30,30);

let close_vehicles = [];

jcmp.ui.AddEvent('SecondTick', (seconds) => 
{
    const player_pos = jcmp.localPlayer.position;
    close_vehicles = [];
    for (let i = 0; i < jcmp.vehicles.length; i++)
    {
        if (jcmp.vehicles[i] && jcmp.vehicles[i].position && dist(jcmp.vehicles[i].position, player_pos) < 25)
        {
            close_vehicles[i] = jcmp.vehicles[i];
        }
    }

    // Update positions in menu every 7 seconds
    if (seconds % 7 == 0)
    {
        const update_vehicles = [];
        for (let i = 0; i < jcmp.vehicles.length; i++)
        {
            if (jcmp.vehicles[i] && my_vehicles[jcmp.vehicles[i].networkId] != undefined && my_vehicles[jcmp.vehicles[i].networkId] > -1)
            {
                const pos = jcmp.vehicles[i].position;
                const health = jcmp.vehicles[i].health;
                update_vehicles[my_vehicles[jcmp.vehicles[i].networkId]] = 
                {
                    x: pos.x,
                    y: pos.y,
                    z: pos.z,
                    health: health
                }
            }
        }

        jcmp.ui.CallEvent('vehicles/ui/update_position', 
            JSON.stringify({x: player_pos.x, y: player_pos.y, z: player_pos.z}), JSON.stringify(update_vehicles));
    }

    if (waypoint != undefined)
    {
        const distance = dist(player_pos, waypoint.position);

        if (distance < waypoint.minDistance)
        {
            waypoint.minDistance = 9999999;
            waypoint.maxDistance = 9999999;
            waypoint.Destroy();
            waypoint = null;
        }
    }
})

const old_look_data = {name: 'None', owned: 'Owned', cost: 0, health: 5, maxHealth: 5};
const old_car_data = {name: 'None', health: 5, maxHealth: 5};

jcmp.events.Add('Render', (r) => 
{
    if (client_vehicle_data.length == 0)
    {
        return;
    }

    const player_pos = jcmp.localPlayer.position;
    let hidden = true;
    let found_car = false;

    close_vehicles.forEach(function(v) 
    {
        if (!jcmp.in_vehicle && v && v.position && v.position.x != 0 && v.position.y != 0 && v.position.z != 0
            && client_vehicle_data[v.modelHash] && client_vehicle_data[v.modelHash].aa_box)
        {
            const m = v.GetRenderTransform(r.dtf).Translate(up);

            // temp until raycasts
            if (m && dist(m.position, player_pos) < Math.max(client_vehicle_data[v.modelHash].aa_box.x * 3, 2.5))
            {
                hidden = false;
                let cost = (vehicle_data[v.networkId]) ? vehicle_data[v.networkId].cost : '???';

                let owned = 'Not Owned';

                if (vehicle_data[v.networkId] && vehicle_data[v.networkId].owner_steam_id != undefined)
                {
                    owned = (vehicle_data[v.networkId].owner_steam_id === jcmp.steam_id) ? 'Owned By You' : 
                        jcmp.friends["game_friends_str"].indexOf(vehicle_data[v.networkId].owner_steam_id) > -1 ? 
                        "Owned By Friend" : "Owned";
                }

                if (owned == 'Owned')
                {
                    cost = Math.round(cost * 1.5); // 150% cost to steal a vehicle
                }

                // If we need to update the UI
                if (old_look_data.name != client_vehicle_data[v.modelHash].name || old_look_data.cost != cost
                    || old_look_data.owned != owned || old_look_data.health != v.health || old_look_data.maxHealth != v.maxHealth)
                {
                    look_ui.CallEvent('vehicles/ui/update_car_look', 
                        client_vehicle_data[v.modelHash].name, owned, cost, v.health, v.maxHealth);

                    old_look_data.name = client_vehicle_data[v.modelHash].name;
                    old_look_data.owned = owned;
                    old_look_data.cost = cost;
                    old_look_data.health = v.health;
                    old_look_data.maxHealth = v.maxHealth;
                }

                const pos = r.WorldToScreen(m.position);

                // If it is on the screen, draw it
                if (!(pos.x == -1 && pos.y == -1))
                {
                    // DrawTexture uses floats so ui doesn't shake and glitch
                    r.DrawTexture(look_ui.texture, new Vector2f(
                        pos.x - look_ui_size.x / 2,
                        pos.y - look_ui_size.y / 2), look_ui.size);
                }

            }



        }
        
        if (v && jcmp.in_vehicle === v.networkId && client_vehicle_data[v.modelHash])
        {
            if (old_car_data.name != client_vehicle_data[v.modelHash].name || old_car_data.health != v.health
                || old_car_data.maxHealth != v.maxHealth)
            {
                car_ui.CallEvent('vehicles/ui/update_car', client_vehicle_data[v.modelHash].name, v.health, v.maxHealth);
                old_car_data.name = client_vehicle_data[v.modelHash].name;
                old_car_data.health = v.health;
                old_car_data.maxHealth = v.maxHealth;
            }
            found_car = true;

            if (!health_visible)
            {
                health_visible = true;
                jcmp.ui.CallEvent('vehicles/ui/toggle_car', health_visible);
            }
            
        }

    })

    if (look_ui != undefined)
    {
        look_ui.hidden = hidden && !jcmp.in_vehicle;
    }

    if (health_visible && !found_car)
    {
        health_visible = false;
        jcmp.ui.CallEvent('vehicles/ui/toggle_car', health_visible);
    }

})

let client_vehicle_data = [];

jcmp.events.AddRemoteCallable('vehicles/init/client_vehicle_data', (data) => 
{
    client_vehicle_data = JSON.parse(data);
})

const vehicle_data = [];

jcmp.events.AddRemoteCallable('vehicles/sync/update_cost', (id, cost) => 
{
    if (!vehicle_data[id])
    {
        vehicle_data[id] = {};
    }
    vehicle_data[id].cost = cost;
})

jcmp.events.AddRemoteCallable('vehicles/init/sync_vehicle_data', (data) => 
{
    data = JSON.parse(data);

    for (let id in data)
    {
        vehicle_data[id] = data[id];
    }
})

jcmp.events.AddRemoteCallable('vehicles/sync/update', (data) => 
{
    data = JSON.parse(data);

    vehicle_data[data.networkId] = data;
})

jcmp.events.AddRemoteCallable('vehicles/sync/add_entry', (data) => 
{
    jcmp.ui.CallEvent('vehicles/ui/add_entry', data);
})

jcmp.ui.AddEvent('vehicles/ui/spawn', (vehicle_id) => 
{
    jcmp.events.CallRemote('vehicles/network/spawn', vehicle_id);
})

jcmp.ui.AddEvent('vehicles/ui/remove', (vehicle_id) => 
{
    jcmp.events.CallRemote('vehicles/network/remove', vehicle_id);
})

jcmp.events.AddRemoteCallable('vehicles/sync/remove_entry', (id) => 
{
    jcmp.ui.CallEvent('vehicles/ui/remove_entry', id);
})

const my_vehicles = [];

jcmp.events.AddRemoteCallable('vehicles/sync/send_networkid', (vehicle_id, network_id) => 
{
    my_vehicles[network_id] = vehicle_id;
})

jcmp.in_vehicle = null;
jcmp.vehicle_slots = null;

jcmp.events.AddRemoteCallable('PlayerVehicleEntered', (id, slots) => 
{
    jcmp.in_vehicle = id;
    jcmp.vehicle_slots = slots;
})

jcmp.events.AddRemoteCallable('PlayerVehicleExited', (id) => 
{
    jcmp.in_vehicle = undefined;
})

jcmp.ui.AddEvent('vehicles/ui/transfer', (id, target) => 
{
    jcmp.events.CallRemote('vehicles/network/transfer', id, target);
})

jcmp.ui.AddEvent('vehicles/disable_menus', (enabled) => 
{
    jcmp.events.Call('disable_menus', enabled);
})

jcmp.events.AddRemoteCallable('vehicles/sync/update_max', (max) => 
{
    jcmp.ui.CallEvent('vehicles/ui/set_max', max);
})

let waypoint;

jcmp.ui.AddEvent('vehicles/ui/waypoint', (x,y,z,name,create) => 
{
    if (waypoint)
    {
        waypoint.minDistance = 999999;
        waypoint.maxDistance = 9999999;
        waypoint.Destroy();
        waypoint = null;
    }

    if (create)
    {
        waypoint = new POI(10, new Vector3f(x,y,z), name);
        waypoint.minDistance = 5;
        waypoint.maxDistance = 9999999;
        waypoint.clampedToScreen = true;
    }
})

jcmp.events.Add('LocalPlayerChat', (msg) => 
{
    if (msg == '/clearwaypoint')
    {
        if (waypoint != undefined)
        {
            waypoint.minDistance = 9999999;
            waypoint.maxDistance = 9999999;
            waypoint.Destroy();
            waypoint = null;
        }
        return false;
    }
})


function dist(a, b)
{
    if (!a || !b) {return 999999;}
    if (!a.x || !a.y || !a.z || !b.x || !b.y || !b.z) {return 999999;}
    return a.sub(b).length;
    //let vector = new Vector3f(a.x - b.x, a.y - b.y, a.z - b.z);
    //return Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
}
