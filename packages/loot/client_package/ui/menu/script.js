$(document).ready(function() 
{
    $('.window').draggable({handle: ".title", disabled: false});
    
    let open_key = 118; // F7
    let open = false;
    let my_position = {x: 0, y: 0, z: 0};
    let max_storages = 0;

    const access_colors = 
    {
        'Everyone': 'yellow',
        'Friends': '#32C94E',
        'Only Me': 'orange'
    }

    const lock_colors = 
    {
        'Unlocked': '#32C94E',
        'Keypad Lock': 'yellow',
        'Identity Lock': 'orange'
    }

    if (!open)
    {
        $('.window').fadeOut(1, function() {$('.window').css('visibility', 'hidden');});
        $('div.entries').empty();
    }

    $('html').css('visibility', 'visible');

    /**
     * Creates a storage entry in the menu from data.
     * 
     * @param {object} data - The data of the storage. Contains:
     *  - Max capacity
     *  - Current amount
     *  - Position
     *  - Type
     *  - id
     */

    function CreateEntry(data)
    {
        const distance = GetDistanceText(my_position, data.position);

        const percent_full = data.num_items / data.max_slots;
        const capacity_color = (percent_full < 0.5) ? '#00FF00' : percent_full <= 0.9 ? 'orange' : 'red';

        $('div.entries')
            .append(
                $(`<div class='storage-entry' id='s_${data.id}'></div>`)
                .append($(`<span class='text name'>${data.name}</span>`))
                //.append($(`<span class='button remove'>Dismount</span>`))
                .append($(`<span class='button waypoint'>Waypoint</span>`))
                .append($(`<span class='text distance'>${distance}</span>`))
                .append($(`<span class='text capacity' style='color: ${capacity_color}'>${data.num_items}/${data.max_slots}</span>`))
                .append($(`<span class='text access-level' style='color: ${lock_colors[String(data.lock_type).trim()]}'>${data.lock_type}</span>`))
                .data('storage', data)

        )

        const storages = $('div.entries .storage-entry').length;
        $('div.title-text').text(`My Storages (${storages}/${max_storages})`);
    }

    // Click remove button
    /*$(".entries").on("click", ".remove", function()
    {
        if ($(this).hasClass('disabled') || $(this).parent().data('storage').removed == true)
        {
            return;
        }

        const data = $(this).parent().data('storage');
        data.removed = true;
        $(this).parent().data('storage', data);
        $(this).addClass('disabled');

        jcmp.CallEvent('storages/ui/remove', data.id);
    });*/

    
    // Click waypoint button
    $("div.entries").on("click", "span.waypoint", function()
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

        const data = $(this).parent().data('storage');
        jcmp.CallEvent('storage/ui/waypoint', data.position.x, data.position.y, data.position.z, data.name, create);
        
    });

    // Close window when X is pressed
    $(".close-icon").click(function()
    {
        if (!open) {return;}
        ToggleOpen();
    });

    // Make X red when hovered
    $(".close-icon").hover(function()
    {
        $("#close-button").css("color", "red");
    }, function()
    {
        $("#close-button").css("color", "white");
    });

    function ToggleOpen()
    {
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
        jcmp.CallEvent('storages/ToggleOpen', open);
    }
    
    document.onkeyup = (e) => 
    {
        const keycode = (typeof e.which === 'number') ? e.which : e.keyCode;
        if (keycode == open_key)
        {
            ToggleOpen();
        }

    };


    jcmp.AddEvent('storages/ui/init', (storages) => 
    {
        storages = JSON.parse(storages);

        for (let i = 0; i < storages.length; i++)
        {
            const data = storages[i];

            CreateEntry(data);
        }
    })

    jcmp.AddEvent('storage/ui/update_menu', (data) => 
    {
        data = JSON.parse(data);
        const $storage = $(`#s_${data.id}`);

        const percent_full = data.num_items / data.max_slots;
        const capacity_color = (percent_full < 0.5) ? '#00FF00' : percent_full <= 0.75 ? 'orange' : 'red';

        $storage.find('span.text.capacity').css('color', capacity_color).text(`${data.num_items}/${data.max_slots}`);
        $storage.find('span.text.access-level').css('color', lock_colors[String(data.access_level).trim()]).text(`${data.access_level}`);
        $storage.find('span.text.name').text(data.name);
    })

    jcmp.AddEvent('storages/ui/update_position', (pos, storages) => 
    {
        my_position = JSON.parse(pos);

        if (storages != undefined)
        {
            storages = JSON.parse(storages);
        }

        $('div.storage-entry').each(function() 
        {
            const data = $(this).data('storage');

            // Go through vehicles
            /*if (storages != undefined && storages.length > 0)
            {
                for (let v_id in storages)
                {
                    // If it matches, update the data

                    if (parseInt(v_id) === parseInt(data.vehicle_id) && storages[v_id] != undefined)
                    {
                        data.position = {x: storages[v_id].x, y: storages[v_id].y, z: storages[v_id].z};

                        const health = Math.round(data.health / data.max_health * 100);
                        $(this).find('span.health').text(`${health}%`);
                        $(this).data('vehicle', data);
                    }
                }
            }*/


            const dist = GetDistanceText(my_position, data.position);

            $(this).find('span.distance').text(`${dist}`);

        })
    })

    jcmp.AddEvent('storages/ui/add_entry', (data) => 
    {
        CreateEntry(JSON.parse(data));
    })

    jcmp.AddEvent('storage/ui/remove', (id) => 
    {
        $(`#s_${id}`).remove();
        
        const storages = $('div.entries .storage-entry').length;
        $('div.title-text').text(`My Storages (${storages}/${max_storages})`);
    })

    jcmp.AddEvent('storages/ui/update_max', (max) => 
    {
        max_storages = max;

        const storages = $('div.entries .storage-entry').length;
        $('div.title-text').text(`My Storages (${storages}/${max_storages})`);
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


    jcmp.CallEvent('storages/ui/menu_ready');

})
