
function Distance(a, b)
{
    return a.sub(b).length;
}

function RemoveWeapons(p)
{
    if (p.weapons != undefined)
    {
        p.weapons.forEach((weapon) =>
        {
            p.RemoveWeapon(weapon.modelHash);
        });
    }
}

module.exports = 
{
    Distance,
    RemoveWeapons
}