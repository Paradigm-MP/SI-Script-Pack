
const fake_players = [];
let id = 1000;

jcmp.events.AddRemoteCallable('itemuse/complete_item', (player) => 
{
    if (player.iu.item && player.iu.item.name == 'Fake Player' 
        && player.iu.using && player.iu.completed)
    {

        player.c.inventory.remove_item(player.iu.item, player.iu.index);

        const fake_player = {x: player.position.x, y: player.position.y, z: player.position.z,
            owner: player.c.general.steam_id, time: 0, id: id}

        id++;

        fake_players.push(fake_player);

        jcmp.events.CallRemote('itemuse/place_fake_player', null, JSON.stringify(fake_player));

        jcmp.notify(player, {
            title: 'Set Fake Player',
            preset: 'success'
        })

        //iu.chat.send(player, `<b>Set Fake Player.</b>`, new RGBA(0,255,0,255), {timeout: 15});
    }

})

setInterval(() => 
{
    for (let i = 0; i < fake_players.length; i++)
    {
        const entry = fake_players[i];

        entry.time += 1;

        if (entry.time >= 30)
        {
            jcmp.events.CallRemote('itemuse/remove_fake_player', null, entry.id);
            fake_players.splice(i, 1);
        }
    }
}, 60 * 1000);

// Create fake players for other players as well
jcmp.events.Add('character/Loaded', (player) => 
{
    if (fake_players.length > 0)
    {
        jcmp.events.CallRemote('itemuse/init_fake_players', player, JSON.stringify(fake_players));
    }
})

module.exports = 
{
    fake_players
}