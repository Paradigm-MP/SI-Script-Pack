
/**
 * Returns the cost of a car when it is spawned, based on the values in bavarium.js
 * 
 * @returns {number} - The number of bavarium needed to unlock this vehicle.
 */

function GetCost(hash, health_percent)
{
    if (veh.bavarium[hash] && veh.bavarium[hash].cost)
    {
        let cost = veh.bavarium[hash].cost;
        cost = (Math.random() > 0.5) ? Math.round(cost * (1 + (0.25 * Math.random()))) : cost;
        //cost = Math.ceil(cost * (health_percent || 1));
        /*cost = (Math.random() > 0.25) ? 
            cost - Math.round(cost * 0.40 * Math.random()) : // Subtract up to 30% of the base cost
            cost + Math.round(cost * 0.10 * Math.random()); // Add up to 10% of the base cost*/
        return cost;
    }
    else
    {
        console.log(`Error! No cost found for hash ${hash}! Aborting!`);
        return null;
    }
}

module.exports = 
{
    GetCost
}