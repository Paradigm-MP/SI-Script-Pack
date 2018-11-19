
// Basically CallRemote but works for all players in a cell and those in adjacent cells
module.exports = function(name, x, y, ...args)
{
    const cells = loot.cell.GetAdjacentCells(x, y);
    cells.push({x: x, y: y});

    cells.forEach((cell) => 
    {
        for (let i = 0; i < loot.players_in_cells[cell.x][cell.y].length; i++)
        {
            jcmp.events.CallRemote(name, loot.players_in_cells[cell.x][cell.y][i], ...args);
        }
    });
}