$(document).ready(function() 
{

    let range = 500; // or 1000
    const fade_time = 3000;
    const blips = [];
    let id = 1;
    let rot_offset = 0;

    $('html').css('visibility', 'visible');

    setInterval(function() 
    {
        //let theta = GetDegrees() + rot_offset;
        let theta = GetDegrees();

        if (theta > 360) {theta -= 360;}

        for (let i = 0; i < blips.length; i++)
        {
            const entry = blips[i];

            if (Math.abs(entry.theta - theta) <= 5 && !entry.gone && !entry.disabled)
            {
                $(`#b_${entry.id}`).fadeIn(1);
                $(`#b_${entry.id}`).fadeOut(fade_time, function()
                {
                    blips.splice(i, 1);
                    $(`#b_${entry.id}`).remove();
                })

                entry.gone = true;

            }
        }
    }, 75);

    function CreateBlip(x, y, blip_id)
    {
        let disabled = false;

        for (let i = 0; i < blips.length; i++)
        {
            if (blips[i].blip_id == blip_id)
            {
                if ($(`#b_${blips[i].id}`).css('display') == 'none')
                {
                    $(`#b_${blips[i].id}`).remove();
                    blips.splice(i, 1);
                }
                else if ($(`#b_${blips[i].id}`).length)
                {
                    disabled = true;
                }
            }
        }


        x = x / range;
        y = y / range;

        let new_x = x * Math.sqrt(1 - 0.5 * Math.pow(y, 2)) * 95;
        let new_y = y * Math.sqrt(1 - 0.5 * Math.pow(x, 2)) * 95;

        $('div.blip-container').append(
            $(`<div class='blip' id='b_${id}' 
            style='transform: translate(calc(-50% + ${new_x}px),calc(-50% + ${new_y}px));'></div>`));

        let theta = Math.atan(new_x / new_y) * 180 / Math.PI; // Angle in degrees
        const old_theta = theta;

        theta = GetTheta(old_theta, x, y);

        const data = {
            x: new_x,
            y: new_y,
            theta: theta,
            old_theta: old_theta,
            id: id,
            blip_id: blip_id,
            disabled: disabled
        }

        blips.push(data);

        setTimeout(function() 
        {
            data.disabled = false;
        }, 500);

        id++;

    }

    // Adapted from https://codepen.io/jjeaton/pen/bzolH
    function GetDegrees() 
    {
        var el = document.getElementById('moving-line');
        var st = window.getComputedStyle(el, null);
        var tr = st.getPropertyValue("-webkit-transform") ||
            st.getPropertyValue("-moz-transform") ||
            st.getPropertyValue("-ms-transform") ||
            st.getPropertyValue("-o-transform") ||
            st.getPropertyValue("transform") ||
            "fail...";

        if( tr !== "none") 
        {

            var values = tr.split('(')[1];
            values = values.split(')')[0];
            values = values.split(',');
            var a = values[0];
            var b = values[1];
            var c = values[2];
            var d = values[3];

            var scale = Math.sqrt(a*a + b*b);

            // First option, don't check for negative result
            // Second, check for the negative result
            /** /
            var radians = Math.atan2(b, a);
            var angle = Math.round( radians * (180/Math.PI));
            /*/
            var radians = Math.atan2(b, a);
            if ( radians < 0 ) {
            radians += (2 * Math.PI);
            }
            var angle = Math.round( radians * (180/Math.PI));
            /**/
            
        } 
        else 
        {
            var angle = 0;
        }

        return angle;
    }

    function GetTheta(old, x, y)
    {
        let theta = old;

        if (x < 0 && y < 0) // quadrant 4
        {
            theta = 270 - Math.abs(theta) + rot_offset - 90;
            //theta = 270 - Math.abs(theta) - 90;
            if (rot_offset > 180) {theta -= 90;}
            if (rot_offset < 180) {theta -= 90;}
        }
        else if (x > 0 && y < 0) // quadrant 3
        {
            theta = 180 + Math.abs(theta) + rot_offset - 90;
            //theta = 180 + Math.abs(theta) - 90;
        }
        else if (x > 0 && y > 0) // quadrant 2
        {
            theta = 90 - Math.abs(theta) + rot_offset - 90;
            //theta = 90 - Math.abs(theta) - 90;
            if (rot_offset > 180) {theta -= 90;}
            if (rot_offset < 180) {theta -= 90;}
        }
        else if (x < 0 && y > 0)
        {
            theta = Math.abs(theta) + rot_offset - 90;
            //theta = Math.abs(theta) - 90;
        }


        while (theta > 360) {theta = theta - 360;}
        while (theta < 0) {theta = theta + 360;}

        return theta;
    }

    // Relative, so it goes from -500 to 500 (or -1000 to 1000)
    jcmp.AddEvent('itemuse/radar/update', (data) => 
    {
        data = JSON.parse(data);

        for (let i = 0; i < data.length; i++)
        {
            CreateBlip(data[i].x, data[i].y, data[i].id);
        }
    })

    jcmp.AddEvent('itemuse/radar/update_rotation', (rot) => 
    {
        if (rot < 0) {rot = (Math.PI - Math.abs(rot)) + Math.PI;}

        rot_offset = 180 - rot * 180 / Math.PI;

        while(rot_offset < 0) {rot_offset += 360;}

        $('div.blip-container-wrap').css('transform', `rotate(${rot_offset}deg)`);

        for (let i = 0; i < blips.length; i++)
        {
            const entry = blips[i];

            entry.theta = GetTheta(entry.old_theta, entry.x, entry.y);
        }
    })

    jcmp.AddEvent('itemuse/radar/update_range', (r) => 
    {
        range = r;
        $('div.infotext').text(`${r}m`);
    })

    jcmp.CallEvent('itemuse/radar/ready');

})
