
const max_dist = 50;

const bubbles = {}; // indexed by player network id - .ui .size
const players = {};
const names = [];

jcmp.ui.AddEvent('SecondTick', (s) => 
{
    // Refresh nearby players every second
    for (let i = 0; i < jcmp.players.length; i++)
    {
        const player = jcmp.players[i];
        players[player.networkId] = {player: player, i: i};
    }
})

jcmp.events.AddRemoteCallable('chat_message', (obj, r, g, b) => 
{
    const pid = (JSON.parse(obj)).pid;

    if (pid === undefined) // 
    {
        //jcmp.print(`No pid was found, cannot create chatbubble.`)
        return;
    }

    if (bubbles[pid] && bubbles[pid].ui) // If we already have a ui, just update it
    {
        bubbles[pid].ui.CallEvent('add', obj, r, g, b);
        return;
    }

    const ui_data = {};
    ui_data.ui_size = new Vector2f(0,0);
    ui_data.up = new Vector3f(0, 0, 0);
    ui_data.ui = new WebUIWindow(
        `chatbubble_${pid}`, 
        `package://chatbubbles/ui/index.html`, 
        new Vector2(604, jcmp.viewportSize.y));
    ui_data.ui.autoResize = true;
    ui_data.ui.hidden = true;
    ui_data.ui.autoRenderTexture = false;

    ui_data.is_me = (pid === jcmp.localPlayer.networkId)

    ui_data.ui.AddEvent('chatbubbles/ui/update_size', (w, h) => 
    {
        ui_data.ui_size = new Vector2f(w, h);
        const base = (pid === jcmp.localPlayer.networkId) ? 0.325 : 0.475;
        ui_data.up.y = base + h * 0.0009;
    })

    ui_data.ui.AddEvent('chatbubbles/bubble_ready', () => 
    {
        ui_data.ui.CallEvent('set_name', jcmp.name, JSON.stringify(names));
        ui_data.ui.CallEvent('add', obj, r, g, b);
    })

    bubbles[pid] = ui_data;
    
});


jcmp.events.Add('Render', (r) => 
{
    const cam_pos = jcmp.localPlayer.camera.position;

    for (let id in bubbles)
    {
        const ui_data = bubbles[id];

        if (!players[id]) {continue;} // If the player isn't nearby, don't render
        if (!jcmp.players[players[id].i]) {continue;} // If the player doesn't exist, don't render

        const m = jcmp.players[players[id].i].GetBoneTransform(0xA1C96158, r.dtf).Translate(ui_data.up);

        if (!m || !m.position) {continue;}

        const dist_to_cam = dist(m.position, cam_pos);

        if (dist_to_cam > max_dist) {continue;} // If it's not within range, don't render

        const pos = r.WorldToScreen(m.position);

        // If it is off the screen, don't draw it
        if (pos.x == -1 && pos.y == -1) {continue;}
        if (ui_data.ui_size.x == 0 || ui_data.ui_size.y == 0) {continue;}

        RenderBubble(r, pos, ui_data, dist_to_cam);
    }

})

function RenderBubble(r, pos, ui_data, dist_to_cam)
{
    const d = (ui_data.is_me) ? dist_to_cam * 0.4 : dist_to_cam * 0.3; // 0.375

    const new_pos = new Vector2f(pos.x - (ui_data.ui_size.x / 2) / d, pos.y - ui_data.ui_size.y / 2 / d);
    const new_size = new Vector2f(ui_data.ui.size.x / d, ui_data.ui.size.y / d);

    // DrawTexture uses floats so ui doesn't shake and glitch
    r.DrawTexture(ui_data.ui.texture, new_pos, new_size);
}

jcmp.events.Add('chat2/AddPlayer', (name) => 
{
    names.push(name);
    jcmp.ui.CallEvent('chatbubble/AddPlayer', name);
})

jcmp.events.AddRemoteCallable('chatbubbles/remove_player', (id) => 
{
    if (bubbles[id])
    {
        bubbles[id].ui.Destroy();
        delete bubbles[id];
    }
})

function dist(v1, v2)
{
    return v2.sub(v1).length;
}