
const pos = new Vector3f(3405.66333, 1052.375, 1295.37365);
const rotate = new Vector3f(0,1,0);
const orange = new RGBA(255,98,0,255);
const scale = new Vector3f(0.01, 0.01, 0.01);
const black = new RGBA(0,0,0,255);
const zero = new Vector3f(0,0,0);
const offset = new Vector3f(-6,-6,-0.1);
const max_size = new Vector2f(10000, 10000);
const red = new RGBA(255, 0, 0, 150);

const m = new Matrix().Translate(pos).Rotate(0.08, rotate).Scale(scale);

const center = new Vector3f(3422.76318359375, 1033.217041015625, 1329.4124755859375);
const center_2d = new Vector3f(center.x, 0, center.z);
const radius = 100;
const circle_rotate = new Vector3f(1,0,0);

let radius_v2f = new Vector2f(radius * 2,radius * 2);
let m_circle = new Matrix().Translate(center).Rotate(Math.PI / 2, circle_rotate);
const m_zero = new Matrix().Translate(center);

const max_circles = 5;
const circle_height = 100;
const circle_each = circle_height / max_circles;
let delta = 0;


const max_height = center.y + circle_height;

let in_zone = false;
let server_handling_vehicle = false;
let close_to_zone = false; // Within 1000m

const circle = new Texture(`package://safezone/circle.png`);

const discord_ad = 
{
    texture: new Texture(`package://safezone/joindiscord.png`),
    matrix: new Matrix().Translate(new Vector3f(3452.31298, 1051.4003, 1291.1297)).Rotate(0.08, rotate),
    pos_adj: new Vector3f(0, 0, 0),
    size: new Vector2f(17.235, 11.52)
}

const loot_img_size = new Vector2f(3.63 / 2, 5.52 / 2);
const loot_imgs = 
{
    tier1: 
    {
        texture: new Texture(`package://safezone/tier1.png`),
        matrix: new Matrix().Translate(new Vector3f(3419.5522, 1036, 1308.6506)).Rotate(0.08, rotate),
        pos_adj: new Vector3f(-loot_img_size.x / 2, 0, 0)
    },
    tier2: 
    {
        texture: new Texture(`package://safezone/tier2.png`),
        matrix: new Matrix().Translate(new Vector3f(3422.9077, 1036, 1308.3465)).Rotate(0.08, rotate),
        pos_adj: new Vector3f(-loot_img_size.x / 2, 0, 0)
    },
    tier3: 
    {
        texture: new Texture(`package://safezone/tier3.png`),
        matrix: new Matrix().Translate(new Vector3f(3426.2888, 1036, 1308.0141)).Rotate(0.08, rotate),
        pos_adj: new Vector3f(-loot_img_size.x / 2, 0, 0)
    },
}

function RenderLootImages(r)
{
    r.EnableCulling(true);
    r.SetTransform(loot_imgs.tier1.matrix);
    r.DrawTexture(loot_imgs.tier1.texture, loot_imgs.tier1.pos_adj, loot_img_size);
    
    r.SetTransform(loot_imgs.tier2.matrix);
    r.DrawTexture(loot_imgs.tier2.texture, loot_imgs.tier2.pos_adj, loot_img_size);
    
    r.SetTransform(loot_imgs.tier3.matrix);
    r.DrawTexture(loot_imgs.tier3.texture, loot_imgs.tier3.pos_adj, loot_img_size);
    r.EnableCulling(false);
}

let ui;

const msg = `Welcome to Survival Island!\n
    G - Inventory   \t\tF5 - Show/Hide Chat
    E - Open Lootbox   \tF6 - Vehicles Menu
    T - Use Chat   \t\tF7 - Storages Menu
    P - Player List   \tF8 - Private Messages
    H - Handbook (Help)`;

const nz_pos = new Vector3f(3527.00830078125, 1158.5384521484375, 1013.8731689453125);
const nz_pos_2d = new Vector3f(nz_pos.x, 0, nz_pos.z);
const nz_radius = 600;
let ui_hidden = true;
let in_nz = false;
let ui_enabled = false;

jcmp.ui.AddEvent('safezone/ui/loaded', () => 
{
    ui_enabled = true;
})

// Check nz and if close to nz at all
jcmp.ui.AddEvent('SecondTick', () => 
{
    if (!ui_enabled) {return;}

    const player_pos = jcmp.localPlayer.position;
    const d = dist(player_pos, center_2d);

    close_to_zone = d < radius * 10;

    if (close_to_zone)
    {
        // Neutralzone
        const nz_d = dist(player_pos, nz_pos_2d);
        
        if (nz_d < nz_radius && !in_nz)
        {
            in_nz = true;
            nz_enabled = true;
            jcmp.ui.CallEvent('neutralzone/ui/ToggleEnabled', true);
        }
        else if (nz_d > nz_radius && in_nz)
        {
            in_zone = false;
            in_nz = false;
            nz_enabled = false;
            jcmp.ui.CallEvent('neutralzone/ui/ToggleEnabled', false);
        }

    }
    else if (!close_to_zone && in_nz)
    {
        in_nz = false;
        jcmp.ui.CallEvent('neutralzone/ui/ToggleEnabled', false);
    }
    
    //ui.hidden = !(ui_enabled && close_to_zone);
    const hidden = (!in_nz && !in_zone) || !close_to_zone;

    if (ui_hidden !== hidden)
    {
        ui_hidden = hidden;
        jcmp.ui.CallEvent('safezone/ui/set_hidden', ui_hidden);
    }

})

let nz_enabled = false;

jcmp.events.Add('GameUpdateRender', (r) => 
{
    // If we aren't close at all, don't render or do anything
    // eventually maybe unsubscribe events
    if (!close_to_zone)
    {
        return;
    }

    RenderLootImages(r);

    r.SetTransform(m);
    r.DrawText(msg, zero, max_size, black, 200, 'Arial');
    r.DrawText(msg, offset, max_size, orange, 200, 'Arial');

    delta += r.dtf * 0.1;
    delta = (delta > circle_each) ? 0 : delta;

    r.SetTransform(m_circle);

    for (let i = 0; i < max_circles; i++)
    {
        RenderCircle(r, circle, new Vector3f(-radius, -radius, circle_each * i + delta), radius_v2f);
    }

    r.SetTransform(discord_ad.matrix);
    r.DrawTexture(discord_ad.texture, discord_ad.pos_adj, discord_ad.size);
    
    const player_pos = jcmp.localPlayer.position;

    if (in_nz && ui_enabled)
    {
        // Safezone
        const d = dist(player_pos, center_2d);
        if ((d < radius && player_pos.y < max_height) && !in_zone)
        {
            in_zone = true;
            //nz_enabled = false;
            jcmp.ui.CallEvent('safezone/ui/ToggleEnabled', true);
            jcmp.events.CallRemote('safezone/enter');
        }
        else if ((d > radius || player_pos.y > max_height) && in_zone)
        {
            in_zone = false;
            //nz_enabled = false;
            //jcmp.ui.CallEvent('safezone/ui/ToggleEnabled', false);
            jcmp.events.CallRemote('safezone/exit');
            jcmp.ui.CallEvent('neutralzone/ui/ToggleEnabled', true);
        }

    }

})

jcmp.ui.AddEvent('safezone/ui/loaded', () => 
{
    jcmp.events.Call('load/package_loaded', 'safezone');
})

function RenderCircle(r, t, pos, radius)
{
    r.DrawTexture(t, pos, radius);
}

// vector2 distance
function dist(v1, v2)
{
    v1.y = 0;
    v2.y = 0;
    return v1.sub(v2).length;
    //const vec1 = new Vector3f(v1.x, 0, v1.z);
    //const vec2 = new Vector3f(v2.x, 0, v2.z);
    //return vec1.sub(vec2).length;
}