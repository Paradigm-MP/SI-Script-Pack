jcmp.events.Add('character/BanPlayer', (steam_id, unban_date) => 
{
    if (!steam_id || !unban_date)
    {
        console.log('Failed to ban player, missing data!');
        return;
    }

    jcmp.events.Call('log', 'bans', `${steam_id} banned until ${unban_date}.`);
    
    let sql = `INSERT INTO banned (steam_id, ban_date) VALUES ('${steam_id}', '${unban_date}')`;

    c.pool.query(sql).then((result) => 
    {
        console.log('A player was banned and added to database.');
        jcmp.events.Call('log', 'bans', `A player was banned with steam_id ${steam_id} until ${unban_date}.`);
        //con.end();
    })
})

jcmp.events.Add('character/UnbanPlayer', (steam_id) => 
{
    Unban(steam_id);
})

/**
 * Unbans a player.
 * 
 * @param {steam_id}
 */

function Unban(steam_id)
{

    if (!steam_id)
    {
        console.log("Failed to unban player.");
        return;
    }

    let sql = `DELETE FROM banned WHERE steam_id='${steam_id}'`;

    c.pool.query(sql).then((result) => 
    {
        console.log('A player was unbanned.');
        jcmp.events.Call('log', 'bans', `A player was unbanned with steam_id ${steam_id}.`);
        //con.end();
    }).catch((err) => 
    {
        console.log('Unable to unban player with steam id ' + steam_id);
        console.log(err);
    })
}

module.exports = 
{
    Unban
}