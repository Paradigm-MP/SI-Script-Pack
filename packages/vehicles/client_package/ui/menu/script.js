$(document).ready(function() 
{
    $('.window').draggable({handle: ".title", disabled: false});
    
    let open_key = 117; // F6
    let open = false;
    let my_position = {x: 0, y: 0, z: 0};
    let transfer_data;
    let max_vehicles = 0;

    $("div.tooltip").fadeOut(1);
    $("div.transfer").fadeOut(1);

    if (!open)
    {
        $('.window').fadeOut(1, function() {$('.window').css('visibility', 'hidden');});
    }

    $('html').css('visibility', 'visible');

    /**
     * Creates a vehicle entry in the menu from data.
     * 
     * @param {object} data - The data of the vehicle.
     */

    function CreateEntry(data)
    {
        const health = Math.round(data.health / data.max_health * 100);
        const distance = GetDistanceText(my_position, data.position);

        $('div.entries')
            .append(
                $(`<div class='vehicle-entry' id='v_${data.vehicle_id}'></div>`)
                .append($(`<span class='text name'>${data.name}</span>`))
                .append($(`<span class='button remove'>Delete</span>`))
                .append($(`<span class='button transfer'>Transfer</span>`))
                .append($(`<span class='button waypoint'>Waypoint</span>`))
                .append($(`<span class='button spawn'>Spawn</span>`))
                .append($(`<span class='text distance'>${distance}</span>`))
                .append($(`<span class='text health'>${health}%</span>`))
                .data('vehicle', data)

        )

        if (data.spawned == true)
        {
            $(`#v_${data.vehicle_id}`).find('.spawn').addClass('disabled');
        }

        const vehicles = $('div.entries .vehicle-entry').length;
        $('div.title-text').text(`My Vehicles (${vehicles}/${max_vehicles})`);
    }

    // Click spawn button
    $(".entries").on("click", ".spawn", function()
    {
        if ($(this).hasClass('disabled') || $(this).parent().data('vehicle').spawned == true)
        {
            return;
        }

        const data = $(this).parent().data('vehicle');
        data.spawned = true;
        $(this).parent().data('vehicle', data);
        $(this).addClass('disabled');

        jcmp.CallEvent('vehicles/ui/spawn', data.vehicle_id);
    });

    // Click remove button
    $(".entries").on("click", ".remove", function()
    {
        if ($(this).hasClass('disabled') || $(this).parent().data('vehicle').removed == true)
        {
            return;
        }

        const data = $(this).parent().data('vehicle');
        data.removed = true;
        $(this).parent().data('vehicle', data);
        $(this).addClass('disabled');

        jcmp.CallEvent('vehicles/ui/remove', data.vehicle_id);
    });

    // Click transfer button
    $(".entries").on("click", ".transfer", function()
    {
        transfer_data = $(this).parent().data('vehicle');

        $('div.transfer').find('input').val('');
        $('#transfer-name').text(transfer_data.name);


        $("div.main").fadeOut(1, function()
        {
            $('div.transfer').fadeIn(1);
        });

        jcmp.CallEvent('vehicles/disable_menus', false);

    });

    
    // Click confirm button
    $("div.transfer").on("click", "span.confirm", function()
    {
        let target = $('div.transfer').find('input').val();
        target = target.trim();

        if (target.length > 2)
        {
            jcmp.CallEvent('vehicles/ui/transfer', transfer_data.vehicle_id, target);
        }

        $("div.transfer").fadeOut(1, function()
        {
            $('div.main').fadeIn(1);
        });

        jcmp.CallEvent('vehicles/disable_menus', true);
        
    });

    // Click confirm button
    $("div.main").on("click", "span.waypoint", function()
    {
        let create = true;
        if ($(this).hasClass('active'))
        {
            create = false;
        }

        $('span.waypoint').removeClass('active');

        if (create)
        {
            $(this).addClass('active');
        }

        const data = $(this).parent().data('vehicle');
        jcmp.CallEvent('vehicles/ui/waypoint', data.position.x, data.position.y, data.position.z, data.name, create);
        
    });


    // Close window when X is pressed
    $(".close-icon").click(function()
    {
        $("div.transfer").fadeOut(1, function()
        {
            $('div.main').fadeIn(1);
        });

        if ($(this).attr('id') != 'close-button2')
        {
            open = !open;
            $('.window').fadeOut(1, function() {$('.window').css('visibility', 'hidden'); $("#close-button").css("color", "white");});
            jcmp.HideCursor();
            jcmp.CallEvent('vehicles/ToggleOpen', open);
        }
        else
        {
            jcmp.CallEvent('vehicles/disable_menus', true);
        }
    });

    // Make X red when hovered
    $(".close-icon").hover(function()
    {
        $("#close-button").css("color", "red");
        $("#close-button2").css("color", "red");
    }, function()
    {
        $("#close-button").css("color", "white");
        $("#close-button2").css("color", "white");
    });

    function ToggleOpen()
    {
        $("div.transfer").fadeOut(1, function()
        {
            $('div.main').fadeIn(1);
        });

        open = !open;
        if (open) 
        {
            $('.window').css('visibility', 'visible');
            $('.window').fadeIn(1);
            jcmp.ShowCursor(); 
        } 
        else 
        {
            $('.window').fadeOut(1, function() {$('.window').css('visibility', 'hidden');});
            jcmp.HideCursor();
        }
        jcmp.CallEvent('vehicles/ToggleOpen', open);
    }
    
    document.onkeyup = (e) => 
    {
        const keycode = (typeof e.which === 'number') ? e.which : e.keyCode;
        if (keycode == open_key)
        {
            ToggleOpen();
        }

    };


    jcmp.AddEvent('vehicles/ui/init', (vehicles) => 
    {
        vehicles = JSON.parse(vehicles);

        for (let i = 0; i < vehicles.length; i++)
        {
            const data = vehicles[i];

            CreateEntry(data);
        }
    })

    jcmp.AddEvent('vehicles/ui/update_position', (pos, vehicles) => 
    {
        my_position = JSON.parse(pos);

        if (vehicles != undefined)
        {
            vehicles = JSON.parse(vehicles);
        }

        $('div.vehicle-entry').each(function() 
        {
            const data = $(this).data('vehicle');

            // Go through vehicles
            if (vehicles != undefined && vehicles.length > 0)
            {
                for (let v_id in vehicles)
                {
                    // If it matches, update the data

                    if (parseInt(v_id) === parseInt(data.vehicle_id) && vehicles[v_id] != undefined)
                    {
                        data.position = {x: vehicles[v_id].x, y: vehicles[v_id].y, z: vehicles[v_id].z};
                        data.health = vehicles[v_id].health;

                        const health = Math.round(data.health / data.max_health * 100);
                        $(this).find('span.health').text(`${health}%`);
                        $(this).data('vehicle', data);
                    }
                }
            }


            const dist = GetDistanceText(my_position, data.position);

            $(this).find('span.distance').text(`${dist}`);

        })
    })

    jcmp.AddEvent('vehicles/ui/add_entry', (data) => 
    {
        CreateEntry(JSON.parse(data));
    })

    jcmp.AddEvent('vehicles/ui/remove_entry', (id) => 
    {
        $(`#v_${id}`).remove();
        
        const vehicles = $('div.entries .vehicle-entry').length;
        $('div.title-text').text(`My Vehicles (${vehicles}/${max_vehicles})`);
    })

    jcmp.AddEvent('vehicles/ui/set_max', (max) => 
    {
        max_vehicles = max;

        const vehicles = $('div.entries .vehicle-entry').length;
        $('div.title-text').text(`My Vehicles (${vehicles}/${max_vehicles})`);
    })

    function GetDistanceText(a, b)
    {
        let dist = Distance(a, b);

        if (dist > 1000)
        {
            dist = dist / 1000;
            dist = round(dist, 1);
            dist = parseFloat(dist.toFixed(1));
            return `${dist} KM`;
        }
        else
        {
            dist = Math.round(dist);
            return `${dist} M`;
        }
    }

    function round(value, precision) 
    {
        const multiplier = Math.pow(10, precision || 0);
        const val = Math.round(value * multiplier) / multiplier;
        return val;
    }
    
    function Distance(a, b)
    {
        let vector = {x: a.x - b.x, y: a.y - b.y, z: a.z - b.z};
        return Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
    }


    jcmp.CallEvent('vehicles/ui/menu_ready');

})
