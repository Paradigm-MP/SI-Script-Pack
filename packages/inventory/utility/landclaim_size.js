const TIER1_LOWER = 50;
const TIER1_UPPER = 150;
const TIER2_LOWER = 100;
const TIER2_UPPER = 250;
const TIER3_LOWER = 200;
const TIER3_UPPER = 400;
/**
 * Gets a random landclaim size for landclaim items.
 */
module.exports = function()
{
    const r = Math.random();

    if (r < 0.75) // TIER 1
    {
        return Math.round(Math.random() * (TIER1_UPPER - TIER1_LOWER) + TIER1_LOWER);
    }
    else if (r < 0.9)
    {
        return Math.round(Math.random() * (TIER2_UPPER - TIER2_LOWER) + TIER2_LOWER);
    }
    else
    {
        return Math.round(Math.random() * (TIER3_UPPER - TIER3_LOWER) + TIER3_LOWER);
    }
}