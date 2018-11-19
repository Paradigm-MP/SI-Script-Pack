
function Clamp(num, min, max) 
{
    return num <= min ? min : num >= max ? max : num;
}

/**
 * Checks if a point is in a 2D polygon using raycasting. Adapted from https://wrf.ecse.rpi.edu//Research/Short_Notes/pnpoly.html
 * @param {*} region - Array of Vector3fs, eg [Vector3f(0,0,0), Vector3f(1,5,9), Vector3f(2,5,1)]
 * @param {*} point  - Vector3f point to check
 * 
 * @returns {boolean} - Returns whether the point is in the region
 */
function in_region(region, point)
{
    let i, j = 0;
    let c = false;

    for (i = 0, j = region.length - 1; i < region.length; j = i++)
    {
        if (((region[i].z>point.z) != (region[j].y>point.z)) 
            && (point.x < (region[j].x-region[i].x) * (point.z-region[i].z) / (region[j].z-region[i].z) + region[i].x))
        {
            c = !c;
        }
    }
    return c;
}

module.exports = 
{
    Clamp,
    in_region
}