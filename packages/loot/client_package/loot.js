const zero = new Vector3f(0,0,0);

//const max_render_distance = 200; // Maximum distance at which the lootboxes are rendered
let max_render_distance = 300; // Maximum distance at which the lootboxes are rendered
const max_check_distance = 20; // Distance to start checking box distances on render
const indicator_display_disance = 1.85; // Distance to display the open indicator
const place_circle_size = new Vector2f(20, 20);
const indicator_display_radius = 225; // px radius within center to display, depends on box size as well
const colors = 
{
    1: 'yellow', // tier 1
    2: 'green', // tier 2
    3: 'purple', // tier 3
    5: '#0051FF', // dropbox
    6: '#ED621C' // storage
}

// TEMP
jcmp.events.Add('LocalPlayerChat', (msg) => 
{
    if (msg.startsWith('/boxdist ') && jcmp.dev_mode)
    {
        max_render_distance = parseInt(msg.replace('/boxdist ', ''));
        jcmp.ui.CallEvent('chat_message', {msg: `Set lootbox render distance to ${max_render_distance}`});
        return false;
    }
})

const sizes = 
{
    1: new Vector2f(0.65, 0.65),
    2: new Vector2f(0.5, 0.5),
    3: new Vector2f(0.4, 0.4),
    5: new Vector2f(0.5, 0.5),
    6: new Vector2f(0.35, 0.8)
}

const indicator_sizes = 
{
    1: indicator_display_radius * sizes[1].x,
    2: indicator_display_radius * sizes[2].x,
    3: indicator_display_radius * sizes[3].x,
    5: indicator_display_radius * sizes[5].x,
    6: indicator_display_radius * sizes[6].x
}

const textures = 
{
    1: new Texture(`package://loot/textures/crate.jpg`),
    2: new Texture(`package://loot/textures/metal.jpg`),
    3: new Texture(`package://loot/textures/bars.jpg`),
    5: new Texture(`package://loot/textures/dropbox.jpg`),
    6: new Texture(`package://loot/textures/storage2.jpg`)
}

const adjs = {}
adjs[1] = GenerateAdj(1);
adjs[2] = GenerateAdj(2);
adjs[3] = GenerateAdj(3);
adjs[5] = GenerateAdj(5);
adjs[6] = GenerateAdj(6);


function GenerateAdj(type)
{
    return {
        left: new Vector3f(-1 * sizes[type].x / 2, 0, 0),
        right: new Vector3f(-1 * sizes[type].x / 2, 0, -1 * sizes[type].x),
        forward: new Vector3f(0, 0, 1 * sizes[type].x / 2),
        backward: new Vector3f(0, 0, -1 * sizes[type].x / 2),
        up: new Vector3f(0, -1 * sizes[type].x / 2, 0),
        down: new Vector3f(0, -1 * sizes[type].x / 2, -1 * sizes[type].x),
        up_adj: new Vector3f(0, 1 * sizes[type].y / 2, 0),
        z_adj: new Vector3f(-1 * sizes[type].x / 2, 0, 0)
    };
}

const rot = new Vector3f(0, 1, 0);
const rot2 = new Vector3f(1, 0, 0);

let indicator_ui;
const indicator_size = new Vector2f(50, 50);
const indicator_adj = indicator_size.div(new Vector2f(2, 2));
let indicator_color = '';
let screen_middle = new Vector2f(jcmp.viewportSize.x / 2, jcmp.viewportSize.y / 2);

jcmp.events.Add('character/Loaded', () => 
{
    indicator_ui = new WebUIWindow(`loot-indicator`, 'package://loot/ui/indicator.html', new Vector2(300, 300));

    indicator_ui.autoResize = false;
    indicator_ui.hidden = true;
    indicator_ui.autoRenderTexture = false;
})

let lootbox_id = 0;
const lootboxes = {};
const close_lootboxes = [];
const very_close_lootboxes = []; // Boxes that need to be distance checked on render to display open indicators
const matricies = {};

let closest_box_id = -1; // ID of closest box if there is one

function RenderLootbox(r, box)
{
    if (!matricies[box.id])
    {
        const pos = box.pos.add(adjs[box.type].z_adj).add(adjs[box.type].up_adj);
        matricies[box.id] = {};
        matricies[box.id].m1 = new Matrix().Translate(pos);
        matricies[box.id].m2 = new Matrix().Translate(pos).Rotate(Math.PI / 2, rot);
        matricies[box.id].m3 = new Matrix().Translate(pos).Rotate(Math.PI / 2, rot2);
        matricies[box.id].size_top = sizes[box.type];

        if (box.type == 6) // Storage
        {
            matricies[box.id].size_top = new Vector2f(sizes[6].x, sizes[6].x);
        }
    }

    r.SetTransform(matricies[box.id].m1);
    r.DrawTexture(textures[box.type], adjs[box.type].forward, sizes[box.type]);
    r.DrawTexture(textures[box.type], adjs[box.type].backward, sizes[box.type]);

    r.SetTransform(matricies[box.id].m2);
    r.DrawTexture(textures[box.type], adjs[box.type].left, sizes[box.type]);
    r.DrawTexture(textures[box.type], adjs[box.type].right, sizes[box.type]);

    r.SetTransform(matricies[box.id].m3);
    r.DrawTexture(textures[box.type], adjs[box.type].up, matricies[box.id].size_top);
    r.DrawTexture(textures[box.type], adjs[box.type].down, matricies[box.id].size_top);
}

jcmp.events.Add('GameUpdateRender', (r) => 
{
    close_lootboxes.forEach((id) => 
    {
        if (lootboxes[id] && lootboxes[id].active)
        {
            RenderLootbox(r, lootboxes[id]);
        }
    });
})

let circles_enabled = false;

jcmp.events.Add('Render', (r) => 
{
    // Indicators
    const pos = jcmp.localPlayer.position;
    const look_pos = jcmp.localPlayer.lookAt;
    let near_box = false;

    if (!open) // If we already have a box open, don't display indicator
    {
        let close_box_id = -1;
        let close_look_dist = 9999;
        let close_box_pos;

        // Find closest lootbox
        very_close_lootboxes.forEach((id) => 
        {
            if (lootboxes[id] && lootboxes[id].active)
            {
                const box_pos = lootboxes[id].pos;
                const dist = pos.sub(box_pos).length;
                const look_dist = look_pos.sub(box_pos).length;

                // If we are close enough, render indicator
                if (dist < indicator_display_disance && look_dist < close_look_dist)
                {
                    close_look_dist = look_dist;
                    close_box_pos = box_pos;
                    close_box_id = id;
                }
            }
        });

        // If we found a box that is close
        if (close_box_id > -1)
        {
            // Change color if necessary
            if (indicator_color != colors[lootboxes[close_box_id].type])
            {
                indicator_color = colors[lootboxes[close_box_id].type];
                indicator_ui.CallEvent('set_color', indicator_color);
            }

            const box_pos2d = r.WorldToScreen(close_box_pos);

            if (box_pos2d.sub(screen_middle).length < indicator_sizes[lootboxes[close_box_id].type] && !near_box)
            {
                r.DrawTexture(indicator_ui.texture, box_pos2d.sub(indicator_adj), indicator_size);
                closest_box_id = close_box_id;
                near_box = true;
                return; // Only render 1 at a time
            }
        }
    }

    if (!near_box) {closest_box_id = -1;} // Reset if we are not near any

    // TEMP - ONLY USE WHEN PLACING LOOTBOXES
    // Debug circles
    if (!circles_enabled) {return;}

    for (let id in lootboxes)
    {
        const box = lootboxes[id];
        const pos = r.WorldToScreen(box.pos);
        
        jcmp.DrawCircle(r, pos, place_circle_size, colors[box.type]);
    }
})

jcmp.ui.AddEvent('loot/ui/try_open', () => 
{
    if (chat_open || closest_box_id == -1 || jcmp.loading != 0) {return;}

    jcmp.events.CallRemote('lootbox/sync/open' + closest_box_id, closest_box_id);
})

// Check for lootboxes that are close enough
jcmp.ui.AddEvent('SecondTick', () => 
{
    const pos = jcmp.localPlayer.position;
    for (let id in lootboxes)
    {
        const dist = pos.sub(lootboxes[id].pos).length;
        if (!close_lootboxes.includes(id) && dist < max_render_distance) // If it's close and not in the close array, add it
        {
            close_lootboxes.push(id);
        }
        else if (close_lootboxes.includes(id) && dist >= max_render_distance) // If it's not close and in the close array, remove it
        {
            close_lootboxes.splice(close_lootboxes.indexOf(id), 1);
        }

        
        if (!very_close_lootboxes.includes(id) && dist < max_check_distance) // If it's close and not in the close array, add it
        {
            very_close_lootboxes.push(id);
        }
        else if (very_close_lootboxes.includes(id) && dist >= max_check_distance) // If it's not close and in the close array, remove it
        {
            very_close_lootboxes.splice(very_close_lootboxes.indexOf(id), 1);
        }
    }

    // Make sure viewport size is good
    if (jcmp.viewportSize.x != screen_middle.x || jcmp.viewportSize.y != screen_middle.y)
    {
        screen_middle = new Vector2f(jcmp.viewportSize.x / 2, jcmp.viewportSize.y / 2);
    }
})

function AddLootbox(data)
{
    data.pos = new Vector3f(data.pos.x, data.pos.y, data.pos.z);
    data.pos = data.pos.add(adjs[data.type].up_adj);
    data.cell = GetCell(data.pos);
    lootboxes[data.id] = data;
}

// Removes lootbox - used for placing
jcmp.events.AddRemoteCallable('loot/sync/remove_total', (id) => 
{
    if (lootboxes[id]) {delete lootboxes[id];}
    if (close_lootboxes.includes(id)) {close_lootboxes.splice(close_lootboxes.indexOf(id), 1);}
})

jcmp.events.AddRemoteCallable('loot/cell/clear', (x, y) => 
{
    for (const id in lootboxes)
    {
        const lootbox = lootboxes[id];
        if (lootbox.cell.x == x && lootbox.cell.y == y)
        {
            delete lootboxes[lootbox.id];
        }
    };
})

jcmp.events.AddRemoteCallable('loot/sync/set_active', (id, active) => 
{
    if (lootboxes[id])
    {
        lootboxes[id].active = active;
    }
})

jcmp.events.AddRemoteCallable('loot/sync/basic', (data) => 
{
    data = JSON.parse(data);
    AddLootbox(data);
})

let chat_open = false;

jcmp.ui.AddEvent('chat_input_state', (s) => 
{
    chat_open = s;
})

jcmp.ui.AddEvent('KeyPress', (key) => 
{
    if ((key == 49 || key == 50 || key == 51) && !chat_open && jcmp.dev_mode) // 1
    {
        jcmp.events.CallRemote('loot/place', key - 48);
    }
})

jcmp.events.Add('LocalPlayerChat', (msg) => 
{
    if (msg == '/displayboxes' && jcmp.dev_mode)
    {
        circles_enabled = !circles_enabled;
    }
})