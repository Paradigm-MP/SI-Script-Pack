$(document).ready(function() 
{

    let max_health = 800;
    let health = 800;

    $('html').css('visibility', 'visible');
    $('html').fadeOut();

    jcmp.AddEvent('vehicles/ui/update_car', (name, health, max_health) => 
    {
        const percent = Math.ceil((health / max_health) * 100);
        $('div.fill').css('width', `${percent}%`);
        $('div.name').text(name);
    })

    jcmp.AddEvent('vehicles/ui/toggle_car', (visible) => 
    {
        if (visible)
        {
            $('html').fadeIn();
        }
        else
        {
            $('html').fadeOut();
        }
    })

    jcmp.CallEvent('vehicles/ui/health_ready');

})
