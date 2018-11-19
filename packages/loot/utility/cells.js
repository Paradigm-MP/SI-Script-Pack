
jcmp.events.AddRemoteCallable('loot/cell/update', (player) => 
{
    if (player && player.cell) // If they are already in a cell, remove them from that one
    {
        RemovePlayerFromCell(player.cell, player.networkId);
    }

    if (!player) {return;}// wat

    player.old_cell = player.cell;
    player.cell = GetCell(player.position);
    //console.log(`Player entered new cell: ${player.cell.x} ${player.cell.y}`);
    loot.players_in_cells[player.cell.x][player.cell.y].push(player);
    UpdateLootInCells(player);
})

jcmp.events.Add('PlayerDestroyed', (player) => 
{
    if (player.cell) // Remove from cell when they leave the server
    {
        RemovePlayerFromCell(player.cell, player.networkId);
    }
})

/**
 * Called when a player enters a new cell. Sends player loot data for new adjacent cells.
 * @param {*} player 
 */
function UpdateLootInCells(player, refresh)
{
    if (!player || !player.cell) {return;}

    //console.log('Updating loot in cell for ' + player.c.general.name);

    let update_cells = [];

    if (!player.old_cell) // No old cell, so update all cells adjacent to them
    {
        update_cells = GetAdjacentCells(player.cell.x, player.cell.y);
        update_cells.push(player.cell);
    }
    else // Old cell, so only update new adjacent cells
    {
        const old_adjacent = GetAdjacentCells(player.old_cell.x, player.old_cell.y);
        old_adjacent.push(player.old_cell);

        const new_adjacent = GetAdjacentCells(player.cell.x, player.cell.y);
        new_adjacent.push(player.cell);

        update_cells = JSON.parse(JSON.stringify(new_adjacent));

        if (!refresh)
        {
            for (let i = 0; i < old_adjacent.length; i++)
            {
                update_cells = update_cells.filter((c) => c.x != old_adjacent[i].x || c.y != old_adjacent[i].y);
            }
        }

    }

    // Sync all lootboxes in cells that need to be updated to the player
    update_cells.forEach((cell) => 
    {
        loot.cells[cell.x][cell.y].forEach((lootbox) => 
        {
            lootbox.sync(player);
        });
    });
}

/**
 * Removes a player from a cell using their network id
 * @param {*} cell 
 * @param {*} id 
 */
function RemovePlayerFromCell(cell, id)
{
    for (let i = 0; i < loot.players_in_cells[cell.x][cell.y].length; i++)
    {
        if (loot.players_in_cells[cell.x][cell.y][i].networkId == id)
        {
            loot.players_in_cells[cell.x][cell.y].splice(i, 1);
            break; // Remove the player from their old cell
        }
    }
}

/**
 * Generates a two dimensional array so that all the loot can be stored in cells
 */
function GenerateCellArray()
{
    console.log(`[Loot] Generating cell array...`);
    loot.cells = {};

    for (let x = 0; x <= 32800; x += loot.config.cell_size)
    {
        loot.cells[~~(x / loot.config.cell_size)] = {};
        for (let y = 0; y <= 32800; y += loot.config.cell_size)
        {
            loot.cells[~~(x / loot.config.cell_size)][~~(y / loot.config.cell_size)] = [];
        }
    }

    loot.players_in_cells = JSON.parse(JSON.stringify(loot.cells)); // Copy cells to players in cells 2d array

    const cell_amt = ~~(32800 / loot.config.cell_size);

    console.log(`[Loot] Cell array of ${cell_amt}x${cell_amt} generated! Cell size: ${loot.config.cell_size}x${loot.config.cell_size}`);
}

/**
 * Returns an object containing x and y of a cell that the position is in
 * @param {*} pos 
 */
function GetCell(pos)
{
    return {x: ~~((pos.x + 16400) / loot.config.cell_size), y: ~~((pos.z + 16400) / loot.config.cell_size)}; // Keep it positive
}

/**
 * Returns an array containing objects with x and y of cells that are adjacent to the one given
 * @param {*} x 
 * @param {*} y 
 */
function GetAdjacentCells(x, y) // X and Y of a cell
{
    const max = ~~(32800 / loot.config.cell_size); // Maximum cell x or y value

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

GenerateCellArray();

module.exports = 
{
    GetCell,
    GetAdjacentCells,
    UpdateLootInCells,
    GenerateCellArray
}