veh.fs.readFile(__dirname + '/../data/new_vehicles.json', 'utf8', function (err, data) 
{
    if (err) throw err;
    let vehicle_data = JSON.parse(data);

    veh.vehicle_data = vehicle_data;

    for (let hash in vehicle_data)
    {
        if (!vehicle_data[hash].nice_name || vehicle_data[hash].number_of_seats == 0)
        {
            continue;
        }

        veh.client_vehicle_data[hash] = 
        {
            name: vehicle_data[hash].nice_name,
            seats: vehicle_data[hash].number_of_seats,
            aa_box: vehicle_data[hash].aa_box.max
        }
        
    }

    veh.vehicle_spawner.SpawnVehicles();

});
