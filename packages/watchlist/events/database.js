
watchlist.pool = watchlist.mysql.createPool({
    connectionLimit : 100, //important
    host     : watchlist.config.database.host,
    user     : watchlist.config.database.user,
    password : watchlist.config.database.password,
    database : watchlist.config.database.name,
    debug    :  false
});


const sql = `CREATE TABLE IF NOT EXISTS watchlist (steam_id VARCHAR(20), strikes INTEGER)`;

watchlist.pool.query(sql).then(function(result)
{
    const sql = `CREATE TABLE IF NOT EXISTS watchlist_reasons (id INTEGER PRIMARY KEY AUTO_INCREMENT, 
        steam_id VARCHAR(20), date VARCHAR(20), reason VARCHAR(200))`;

    return watchlist.pool.query(sql);
}).then(function(result)
{
    //con.end();
})
