jcmp.events.Add('PlayerReady', (player) => 
{
    player.iu = {};
})

const death_points = {};

jcmp.events.Add('PlayerDeath', (player, killer, reason) => 
{
    player.death_point = player.position;
    death_points[player.c.general.steam_id] = player.position;
})

module.exports = 
{
    death_points
}