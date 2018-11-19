friends.pool = friends.mysql.createPool({
    connectionLimit : 100, //important
    host     : friends.config.database.host,
    user     : friends.config.database.user,
    password : friends.config.database.password,
    database : friends.config.database.name,
    debug    :  false
});


const sql = `CREATE TABLE IF NOT EXISTS friends (steam_id VARCHAR(20), name VARCHAR(30), game_friends BLOB, friend_invites BLOB, invites_sent BLOB)`;
friends.pool.query(sql);