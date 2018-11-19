$(document).ready(function() 
{

    let size_x = 0;
    let size_y = 0;

    $('html').css('visibility', 'visible');

    // owned is either 'Owned' 'Not Owned' or 'Owned By You'
    jcmp.AddEvent('vehicles/ui/update_car_look', (name, owned, bavarium, health, maxhealth) => 
    {
        $('div.name').text(name);
        $('div.owned').text(owned);
        $('div.health').text(`Health: ${Math.round((health / maxhealth) * 100)}%`);

        if (bavarium > 0)
        {
            $('div.cost').text(`Cost: ${bavarium} Bavarium`);
        }
        else
        {
            $('div.cost').text(`Free`);
        }
        

        if (bavarium >= 250 && !$('div.container').hasClass('legendary'))
        {
            $('div.container').addClass('legendary');
        }
        else if (bavarium < 250 && $('div.container').hasClass('legendary'))
        {
            $('div.container').removeClass('legendary');
        }

        if (owned == 'Owned')
        {
            $('div.owned').css('color', '#ED5807'); // Orange
        }
        else if (owned == 'Not Owned')
        {
            $('div.owned').css('color', '#11A7F2'); // Blue
        }
        else if (owned == 'Owned By You' || owned == 'Owned By Friend')
        {
            $('div.owned').css('color', '#21DE28'); // Green
        }

        if (size_x != $('div.container').width() || size_y != $('div.container').height())
        {
            size_x = $('div.container').width();
            size_y = $('div.container').height();
            jcmp.CallLocalEvent('vehicles/ui/update_size', size_x, size_y);
        }
        
    })

    jcmp.CallEvent('vehicles/ui/look_ready');

})
