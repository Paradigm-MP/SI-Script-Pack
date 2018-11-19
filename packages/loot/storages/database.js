
loot.pool = loot.mysql.createPool({
    connectionLimit : 100, //important
    host     : loot.config.database.host,
    user     : loot.config.database.user,
    password : loot.config.database.password,
    database : loot.config.database.name,
    debug    :  false
});

// TODO add health, probably date placed

const sql = `CREATE TABLE IF NOT EXISTS storages (storage_id INTEGER PRIMARY KEY AUTO_INCREMENT, owner_steam_id VARCHAR(20), x DECIMAL(10,3), y DECIMAL(10,3), 
z DECIMAL(10,3), x_r DECIMAL(10,3), y_r DECIMAL(10,3), z_r DECIMAL(10,3), type VARCHAR(20), contents BLOB, 
access_level VARCHAR(10), upgrades BLOB, name VARCHAR(15), code VARCHAR(4))`;

loot.pool.query(sql);