
function SpawnVehicles()
{
    veh.fs.readFile(__dirname + '/../data/spawns.json', 'utf8', function (err, data) 
    {
        if (err) throw err;
        let spawns = JSON.parse(data);

        veh.spawns = spawns;

        let count = 0;
        for (let hash in veh.spawns)
        {
            const type = veh.spawns[hash];
            type.forEach((entry) => 
            {
                const pos_split = entry.pos.split(' ');
                const rot_split = entry.rot.split(' ');
                const pos = new Vector3f(parseFloat(pos_split[0]), parseFloat(pos_split[1]), parseFloat(pos_split[2]));
                const rot = new Vector3f(parseFloat(rot_split[0]), parseFloat(rot_split[1]), parseFloat(rot_split[2]));

                const pvehicle = new veh.PVehicle(hash, pos, rot);
                count++;
            });
        };

        console.log(`${count} vehicles spawned.`);
        jcmp.events.Call('log', 'vehicles', `${count} vehicles spawned.`);

    });

}

module.exports = 
{
    SpawnVehicles
}