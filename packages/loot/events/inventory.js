const dropbox_queue = [];
let queue_interval;

// Called when a player drops an item from their inventory
jcmp.events.Add('inventory/drop_stack', (player, stack, overflow) => 
{
    const nearby_boxes = loot.cells[player.cell.x][player.cell.y].filter((box) => box.dropbox == true).length;
    const dropping_in_storage = player.current_box && player.current_box.is_storage && player.current_box.storage;

    // If there are too many lootboxes in this cell
    if (nearby_boxes > loot.config.max_dropboxes_per_cell && !overflow && !dropping_in_storage)
    {
        jcmp.notify(player, {
            title: 'Cannot drop items',
            subtitle: 'There are too many dropboxes already in this area. Please try again elsewhere.',
            preset: 'warn'
        })
        player.c.inventory.add_stack(stack);
        jcmp.events.Call('log', 'loot',
            `${player.c.general.name} tried to drop items, but there are too many dropboxes in their cell.`);
        return;
    }


    // Make sure they are not still equipped
    for (let i = 0; i < stack.contents.length; i++)
    {
        stack.contents[i].equipped = false;
    }

    // If they are trying to drop an item in a storage
    if (dropping_in_storage && player.current_box.storage.can_open(player) && !overflow)
    {
        player.current_box.storage.add_stack(stack, player); // automatically adds back to player inventory if it overflows

        return;
    }

    // Use a queue to make sure dropboxes spawn correctly if multiple items are dropped on death
    AddToDropboxQueue({
        pos: player.position,
        rot: player.rotation,
        stack: stack
    });
})

function CreateDropbox(data)
{
    let updated = false;
    const cell = loot.cell.GetCell(data.pos);

    for (let i = 0; i < loot.cells[cell.x][cell.y].length; i++)
    {
        const lootbox = loot.cells[cell.x][cell.y][i];

        if (!updated && lootbox.type == 5 && lootbox.position.sub(data.pos).length < 2)
        {
            lootbox.contents.push(data.stack); // Put dropped items in nearby lootboxes
            lootbox.update('loot/sync/init', JSON.stringify(lootbox.to_array()), lootbox.id); // Update for people who have it open
            updated = true;
            return; // Don't spawn a new one
        }
    }

    if (updated) {return;}

    const dropbox = new loot.lootbox(data.pos, data.rot, 5);
    dropbox.contents.push(data.stack);
    loot.cells[dropbox.cell.x][dropbox.cell.y].push(dropbox);

    dropbox.sync_nearby(); // Basic sync to nearby players

    jcmp.events.Call('loot/create_dropbox', dropbox);
}

/**
 * When something else calls this, like when a storage is removed
 * @param {*} d 
 */
function AddToDropboxQueue(d)
{
    // Use a queue to make sure dropboxes spawn correctly if multiple items are dropped on death
    dropbox_queue.push(d)

    if (!queue_interval)
    {
        queue_interval = setInterval(() => 
        {
            if (dropbox_queue.length > 0)
            {
                const data = dropbox_queue.splice(0, 1)[0];
                CreateDropbox(data);
            }
            else
            {
                clearInterval(queue_interval);
                queue_interval = null;
            }
        }, 50);
    }
}

module.exports = AddToDropboxQueue;