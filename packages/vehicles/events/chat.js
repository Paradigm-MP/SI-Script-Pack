jcmp.events.Add('chat_command', (player, msg) => 
{
    if (msg.startsWith('/spawnv ') && player.tag && (player.tag.name == "Admin" || player.tag.name == "Mod"))
    {
        const hash = parseInt(msg.replace('/spawnv ', ''));

        const pvehicle = new veh.PVehicle(hash, player.position, player.rotation);
        pvehicle.command_spawned = true;

        veh.chat.send(`Spawned ${hash}.`, new RGB(0,255,0));
        return;
    }


    if (msg == '/savev' && player.tag && player.tag.name == "Admin" && veh.config.edit_mode)
    {
        const data = {};

        jcmp.vehicles.forEach(function(v) 
        {
            if (!data[v.modelHash])
            {
                data[v.modelHash] = [];
            }

            data[v.modelHash].push({
                pos: `${veh.utils.round(v.position.x)} ${veh.utils.round(v.position.y)} ${veh.utils.round(v.position.z)}`,
                rot: `${veh.utils.round(v.rotation.x)} ${veh.utils.round(v.rotation.y)} ${veh.utils.round(v.rotation.z)}`
            })
        });

        const date = veh.utils.GetCurrentDate();
        const file_name = `spawns-old-${date}.json`;

        // Make a copy of the last vehicles each day
        if (!veh.fs.existsSync(__dirname + `./../data/${file_name}`))
        {
            const old_data = JSON.parse(veh.fs.readFileSync(__dirname + './../data/spawns.json', 'utf8'));
            veh.fs.writeFileSync(__dirname + `./../data/${file_name}`, JSON.stringify(old_data, null, '\t'));
        }

        veh.fs.writeFileSync(__dirname + './../data/spawns.json', JSON.stringify(data, null, '\t'));

        veh.chat.broadcast('Saved vehicles!', new RGB(0,255,0));

        jcmp.events.Call('log', 'vehicle_save', 
            `Player ${player.c.general.name} [${player.client.steamId}] saved vehicles.`);
    }
    else if (msg.startsWith('/remover') && player.tag && player.tag.name == "Admin" && veh.config.edit_mode)
    {
        let split = msg.split(' ');
        if (typeof split[1] != 'undefined')
        {
            let radius = parseInt(split[1]);
            for (let i = 0; i < jcmp.vehicles.length; i++)
            {
                let v = jcmp.vehicles[i];
                if (veh.utils.Distance(v.position, player.position) < radius)
                {
                    v.Destroy();
                }
            };
        }
    }
})

