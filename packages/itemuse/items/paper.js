const images = {};
const default_name = 'My Awesome Artwork';
const max_name_length = 20;
let item_category = 'Utility';

// When a player clicks the item to display the drawing
jcmp.events.Add('inventory/events/use_item', (player, stack, index) => 
{
    const item = player.c.inventory.contents[stack.get_first().category][index].get_first();

    if (item.name == 'Paper' && !player.iu.using && player.loaded_drawing == null)
    {
        item_category = item.category;
        player.drawing_index = index;
        // If this is the first time the paper is being used
        if (item.custom_data.drawing_id == undefined)
        {
            // Generate a new id for it
            Promise.all(
            [  
                AddImageToDBOnCreate()
            ])
            .then((data) => 
            {
                const id = data[0];
                item.custom_data.drawing_id = String(id);
                item.custom_data.drawing_name = default_name;
                player.c.inventory.update();
                player.c.inventory.update_index(item_category, index);
                LoadImage(player, item.custom_data.drawing_id);
            })
        }
        else
        {
            LoadImage(player, item.custom_data.drawing_id);
        }
    }
})

// Called after every stroke
jcmp.events.AddRemoteCallable('itemuse/paper/save', (player, id, data) => 
{
    if (images[String(id)])
    {
        UpdateImage(player, id, data, images[String(id)].name);
    }
})

// When the player closes the picture
jcmp.events.AddRemoteCallable('itemuse/paper/close', (player, id, name) => 
{
    name = name.trim().substring(0, max_name_length);

    if (images[String(id)])
    {
        UpdateImage(player, id, images[String(id)].data, name);
    }

    player.loaded_drawing = null;
})

jcmp.events.AddRemoteCallable('itemuse/paper/mod_pen_dura', (player, pen_name, dura) => 
{
    const data = jcmp.inv.FindItem(pen_name);
    data.amount = 1;
    const item = new jcmp.inv.item(data);

    // If they have the type of pen
    const index = player.c.inventory.has_item(item, true);
    if (item && index > -1)
    {
        const pen_stack = player.c.inventory.contents[item.category][index];
        if (dura < pen_stack.get_first().durability)
        {
            const broke = player.c.inventory.modify_durability(pen_stack, index, dura - pen_stack.get_first().durability);

            // If the item broke because it ran out of durability
            if (broke)
            {
                // If they have the type of pen
                const index2 = player.c.inventory.has_item(item, true);

                if (index2 > -1) // If they have another one, update the durability
                {
                    jcmp.events.CallRemote('itemuse/paper/update_pen_dura', player, pen_name, 
                        player.c.inventory.contents[item.category][index2].get_first().durability);
                }
                else // Otherwise, remove pen entry
                {
                    jcmp.events.CallRemote('itemuse/paper/pen_broke', player, pen_name);
                }
            }
        }
    }
})

/**
 * Updates an image to DB and memory when a player draws on the canvas.
 * @param {*} player - The player who drew on the canvas
 * @param {*} id - The unique id of the image corresponding to an item.
 * @param {*} image_data - The base64 data of the image.
 * @param {*} name - The name of the image.
 */
function UpdateImage(player, id, image_data, name)
{
    if (player.loaded_drawing != undefined && String(player.loaded_drawing) == String(id))
    {
        if (name.length < 3 || name.length > max_name_length || !ProcessName(name))
        {
            name = images[String(id)].name; // Set to old name if new one is not valid
        }

        const sql = iu.sqlstring.format('UPDATE drawings SET image_data = ?, name = ? WHERE drawing_id = ?', [image_data, name, id]);

        iu.pool.query(sql).then((result) =>
        {
            images[String(id)] = {data: image_data, name: name};

            for (let i = 0; i < player.c.inventory.contents['Utility'].length; i++)
            {
                const stack = player.c.inventory.contents['Utility'][i];

                if (stack.prop('name') != 'Paper') {continue;}

                for (let i = 0; i < stack.contents.length; i++)
                {
                    const item = stack.contents[i];
                    if (String(item.custom_data.drawing_id) == String(id))
                    {
                        item.custom_data.drawing_name = name;
                        player.c.inventory.update();
                        player.c.inventory.update_index(item_category, player.drawing_index);
                    }
                }
            }

            //player.c.inventory.update(); // Update inventory too when we update num strokes
        })
    }
}

/**
 * Adds a new entry to the DB with blank image data and returns the insert id. Used when a player first 
 * opens up a paper.
 */
function AddImageToDBOnCreate()
{
    return new Promise((resolve, reject) => 
    {
        const sql = `INSERT INTO drawings (image_data, name) VALUES (' ', '${default_name}')`;

        iu.pool.query(sql).then((result) =>
        {
            images[String(result.insertId)] = {data: ' ', name: default_name};
            resolve(result.insertId);
        })
    })
}

/**
 * Called when a player opens up a drawing from their inventory and sends them the image data.
 * @param {*} player 
 * @param {*} id 
 */
function LoadImage(player, id)
{
    if (images[String(id)] !== undefined)
    {
        player.loaded_drawing = String(id);

        const pens = []; // Keep track of all pens that the player can use

        iu.config.pens.forEach((pen) => 
        {
            const data = jcmp.inv.FindItem(pen);
            data.amount = 1;
            const item = new jcmp.inv.item(data);

            // If they have the type of pen
            const index = player.c.inventory.has_item(item, true);
            if (item && index > -1)
            {
                pens.push({name: pen, d: player.c.inventory.contents[item.category][index].get_first().durability});
            }
        });

        jcmp.events.CallRemote('itemuse/paper/load', player, String(id), String(images[String(id)].data), String(images[String(id)].name));
        jcmp.events.CallRemote('itemuse/paper/init_pens', player, JSON.stringify(pens));
    }
    else
    {
        console.log(`Could not load image id ${id} for player ${player.c.general.steam_id}`);
    }
}

function LoadImagesFromDB()
{
    // Loads all images from DB into memory
    const sql = `SELECT * FROM drawings`;
    iu.pool.query(sql).then((result) =>
    {
        if (result.length > 0)
        {
            for (let i = 0; i < result.length; i++)
            {
                images[String(result[i].drawing_id)] = {data: String(result[i].image_data), name: String(result[i].name)};
            }
        }
    })

}

function ProcessName(input)
{
    for (let i = 0; i < input.length; i++)
    {
        if (input.charCodeAt(i) > 125 || input.charCodeAt(i) < 32 || input.indexOf('`') > -1 || input.indexOf(`'`) > -1
            || input.indexOf(`"`) > -1)
        {
            return false;
        }
    }
    return true;
}

iu.pool = iu.mysql.createPool({
    connectionLimit : 100, //important
    host     : iu.config.database.host,
    user     : iu.config.database.user,
    password : iu.config.database.password,
    database : iu.config.database.name,
    debug    :  false
});

const sql = `CREATE TABLE IF NOT EXISTS drawings (drawing_id INTEGER PRIMARY KEY AUTO_INCREMENT, image_data MEDIUMBLOB, name VARCHAR(20))`;

iu.pool.query(sql);
LoadImagesFromDB();

