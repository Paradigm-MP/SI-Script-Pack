
// init default database

inv.pool = inv.mysql.createPool({
    connectionLimit : 100, //important
    host     : inv.config.database.host,
    user     : inv.config.database.user,
    password : inv.config.database.password,
    database : inv.config.database.name,
    debug    :  false
});

// Connect to database
const sql = `CREATE TABLE IF NOT EXISTS inventory (steam_id VARCHAR(20), data TEXT)`;

inv.pool.query(sql).then(function(result)
{
    //con.release();
})



function UpdateDatabase(player, t)
{
    let tries = (t) ? t : 1;

    if (!inv.utils.exists(player) || !player.c || !player.c.inventory)
    {
        jcmp.events.Call('log', 'inventory', `Tried to UpdateDatabase for player with steam id 
            ${player.client.steamId}, but something went wrong.`);
        return;
    }

    if (tries > 5)
    {
        jcmp.events.Call('log', 'inventory', `Tried to UpdateDatabase for player with steam id 
            ${player.client.steamId}, but ran out of tries.`);
        return;
    }

    const inv_str = inv.inventory.convert_inv(player.c.inventory);
    const steam_id = player.c.general.steam_id;

    let con;

    let sql = `SELECT steam_id FROM inventory WHERE steam_id = '${steam_id}'`;

    inv.pool.query(sql).then(function(result)
    {
        if (result && result[0]) // If their inventory exists
        {
            sql = inv.sqlstring.format('UPDATE inventory SET data = ? WHERE steam_id = ?', [inv_str, steam_id]);
    
            //const sql = `UPDATE inventory SET data = '${inv_str}' WHERE steam_id = '${steam_id}'`;

            return inv.pool.query(sql);
        }
        else // If their inventory does not exist
        {
            sql = `INSERT INTO inventory (steam_id, data) VALUES ('${steam_id}', '${inv_str}')`;

            return inv.pool.query(sql);
        }
    }).then(function(result)
    {
        //con.release();
    }).catch((err) => 
    {
        jcmp.events.Call('log', 'inventory', err);
        console.log(err);
        UpdateDatabase(player, tries + 1);
    })
}

module.exports = 
{
    UpdateDatabase
}