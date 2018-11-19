$(document).ready(function() 
{
    $('html').css('visibility', 'visible');

    let level = 1;
    let first = true;

    $('div.new-level').css('visibility', 'hidden');

    jcmp.AddEvent('character/exp/exp_change', (exp) => 
    {
        exp = JSON.parse(exp);
        $('div#debug').html(`Level: ${exp.level}<br>Experience: ${exp.experience}/${exp.max}`);

        if (!first && level != exp.level)
        {
            jcmp.CallEvent('sound/Play', 'jc3_gui_mission_success.ogg', 1);
            
            $('div.new-level').text(`Level ${exp.level}!`);

            $('div.new-level').css(
            {
                'animation': 'grow 0.75s ease-in-out 1',
                'transform-origin': '50% 70%',
                'visibility': 'visible'
            })

            setTimeout(function() 
            {
                $('div.new-level').css(
                {
                    'animation': 'grow-slow 3s linear 1',
                    'transform-origin': '50% 20%'
                })
            }, 750);

            setTimeout(function() 
            {
                $('div.new-level').css(
                {
                    'transform': 'scale(1.1)',
                    'animation': 'shrink 0.75s ease-in-out 1',
                    'transform-origin': '50% 20%'
                })

                setTimeout(function() 
                {
                    $('div.new-level').css('visibility', 'hidden');
                }, 750);
            }, 3750);
        }
        level = exp.level;

        first = false;
    })

    jcmp.CallEvent('character/exp/ui_loaded');

})
