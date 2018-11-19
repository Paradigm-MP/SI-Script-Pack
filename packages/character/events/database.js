// Add event so other packages can get current database name
jcmp.events.Add('GetDatabase', () => 
{
    return c.config.database;
})

let con;

// Create connection to jcmp user
c.mysql.createConnection(
{
    host: c.config.database.host,
    user: c.config.database.user,
    password: c.config.database.password
}).then(function(connection)
{
    con = connection;
    // Create database if it does not exist
    return con.query(`CREATE DATABASE IF NOT EXISTS ${c.config.database.name}`);
}).then(function(result)
{
    
    // After database has been created, connect to it
    c.pool = c.mysql.createPool({
        connectionLimit : 100, //important
        host     : c.config.database.host,
        user     : c.config.database.user,
        password : c.config.database.password,
        database : c.config.database.name,
        debug    :  false
    });
    
    const tbl = c.config.default_tables[0];
    const sql = `CREATE TABLE IF NOT EXISTS ${tbl.name} ${tbl.structure}`;

    c.pool.query(sql).then(function(result)
    {
        const tbl = c.config.default_tables[1];
        const sql = `CREATE TABLE IF NOT EXISTS ${tbl.name} ${tbl.structure}`;

        return c.pool.query(sql);
    }).then(function(result)
    {
        const tbl = c.config.default_tables[2];
        const sql = `CREATE TABLE IF NOT EXISTS ${tbl.name} ${tbl.structure}`;

        return c.pool.query(sql);
    }).then(function(result)
    {
        const tbl = c.config.default_tables[3];
        const sql = `CREATE TABLE IF NOT EXISTS ${tbl.name} ${tbl.structure}`;

        return c.pool.query(sql);
    }).then(function(result)
    {
        const tbl = c.config.default_tables[4];
        const sql = `CREATE TABLE IF NOT EXISTS ${tbl.name} ${tbl.structure}`;

        return c.pool.query(sql);
    }).then(function(result)
    {
        const tbl = c.config.default_tables[5];
        const sql = `CREATE TABLE IF NOT EXISTS ${tbl.name} ${tbl.structure}`;

        return c.pool.query(sql);
    }).then(function(result)
    {
        const sql = `SELECT name, steam_id FROM general`;
        
        return c.pool.query(sql);
    }).then(function(result)
    {
        // Store names so we can determine if a name is unique
        result.forEach(function(data) 
        {
            c.names.push({name: data.name, steam_id: data.steam_id});
        });
        
        //con.end();
    })

    

})