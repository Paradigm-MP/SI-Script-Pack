$(document).ready(function() 
{

    const offset = 201; // 2 * pi * r
    // also change CSS at bottom
    let name;
    let current_time;
    let max_time;
    let interval;

    $('html').css('visibility', 'visible');

    jcmp.AddEvent('itemuse/ui/use_item', (n, t) => 
    {
        name = n;
        current_time = 0;
        max_time = t * 1000;

        $('div.info-container div.info').text(`Using ${name}`);
        
        if (interval != null)
        {
            clearInterval(interval);
            interval = null;
        }

        interval = setInterval(() =>
        {
            current_time += 50;

            let countdown_time = `${Math.round((max_time - current_time) / 100) / 10}`; // /100 then /10 to get the decimal

            if (countdown_time.indexOf(`.`) == -1)
            {
                countdown_time = `${countdown_time}.0`;
            }

            $('div.container div.countdown').text(countdown_time);

            const percent = current_time / max_time;
            $('div.container svg.progress circle.fill').css("stroke-dashoffset", (1 - percent) * offset);

            if (current_time >= max_time)
            {
                clearInterval(interval);
                interval = null;
                jcmp.CallEvent('itemuse/ui/item_complete');
            }

        }, 50);

    })

    jcmp.AddEvent('itemuse/ui/cancel', () => 
    {
        if (interval != null)
        {
            clearInterval(interval);
            interval = null;
        }

    })

    jcmp.CallEvent('itemuse/ui/initial_ready');

})
