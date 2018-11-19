

let current_cell = {x: -1, y: -1}
let cell_size = 0;
let ready_for_cell = false;

jcmp.events.Add('character/Loaded', () => 
{
    ready_for_cell = true;
})

jcmp.events.AddRemoteCallable('loot/config/cell_size', (size) => 
{
    cell_size = size;
})

jcmp.ui.AddEvent('SecondTick', () => 
{
    if (cell_size == 0) {return;}
    if (!ready_for_cell) {return;}

    const cell = GetCell(jcmp.localPlayer.position);

    if (cell.x != current_cell.x || cell.y != current_cell.y)
    {
        const old_adjacent = GetAdjacentCells(current_cell.x, current_cell.y);
        old_adjacent.push(current_cell);

        const new_adjacent = GetAdjacentCells(cell.x, cell.y);
        new_adjacent.push(cell);

        update_cells = JSON.parse(JSON.stringify(old_adjacent));

        for (let i = 0; i < new_adjacent.length; i++)
        {
            update_cells = update_cells.filter((c) => c.x != new_adjacent[i].x || c.y != new_adjacent[i].y);
        }

        for (const id in lootboxes)
        {
            let deleted = false;
            const lootbox_cell = lootboxes[id].cell;
            if (!deleted)
            {
                update_cells.forEach((check_cell) => 
                {
                    // Remove lootboxes from old cells
                    if (!deleted && lootbox_cell.x == check_cell.x && lootbox_cell.y == check_cell.y)
                    {
                        delete lootboxes[id];
                        deleted = true;
                    }
                });
            }
        }

        current_cell = cell;
        jcmp.events.CallRemote('loot/cell/update');

    }
})


function GetCell(pos)
{
    return {x: ~~((pos.x + 16400) / cell_size), y: ~~((pos.z + 16400) / cell_size)};
}

/**
 * Returns an array containing objects with x and y of cells that are adjacent to the one given
 * @param {*} x 
 * @param {*} y 
 */
function GetAdjacentCells(x, y) // X and Y of a cell
{
    const max = ~~(32800 / cell_size); // Maximum cell x or y value

    const adjacent = [];

    if (x < max) {adjacent.push({x: x + 1, y: y})} // left
    if (x < max && y < max) {adjacent.push({x: x + 1, y: y + 1})} // left top
    if (x < max && y > 0) {adjacent.push({x: x + 1, y: y - 1})} // left bottom

    if (x > 0) {adjacent.push({x: x - 1, y: y})} // right
    if (x > 0 && y < max) {adjacent.push({x: x - 1, y: y + 1})} // right top
    if (x > 0 && y > 0) {adjacent.push({x: x - 1, y: y - 1})} // right bottom

    if (y > 0) {adjacent.push({x: x, y: y - 1})} // bottom
    if (y < max) {adjacent.push({x: x, y: y + 1})} // top

    return adjacent;
}
