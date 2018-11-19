$(document).ready(function() 
{
    $('html').css('visibility', 'visible');

    // 00BFFF
    // FF0000
    // 00FF00

    const offset = parseFloat($('svg.progress circle.fill').css('stroke-dasharray').replace('px', '')); // 2 * pi * r
    // also change CSS at bottom
    let current_time;
    const max_time = 30 * 1000;
    let interval;
    let num_misses = 0;
    const max_misses = 3;
    const trigger_distance = 12;
    let id = -1;

    const colors = [
        '#00BFFF',
        '#FFFF00',
        '#00FF00'
    ]

    const red_colors = {
        0: '#3D3D3D',
        1: '#453030',
        2: '#571F1F',
        3: '#820A0A'
    }

    const min_distance = 15;
    const dots_per_level = 9;
    let dots_completed = 0;

    let dots = 
    {
        1: [],
        2: [],
        3: []
    }

    function GenerateGame()
    {
        dots = 
        {
            1: [],
            2: [],
            3: []
        }
    
        for (let i = 0; i < 3; i++)
        {
            for (let j = 0; j < dots_per_level; j++)
            {
                CreateDot(i + 1, colors[j % colors.length]);
            }
        }

        current_time = 0;
        num_misses = 0;
        dots_completed = 0;

        $('div.circle-1').append($(`<div class='dot enabled controller'></div>`));
        UpdateControllerColor();
        
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
            $('div.container svg.progress circle.fill').css("stroke-dashoffset", (percent) * offset);

            if (current_time >= max_time)
            {
                jcmp.CallEvent('sound/Play', 'hud_encounter_failed.ogg', '0.25');
                clearInterval(interval);
                interval = null;
                $('div.dot.controller').remove();
                $('div.container div.countdown').text('Failed');
                $('svg.progress circle.fill').css('stroke', red_colors[3]);

                $('div.circle').css('border-color', red_colors[3]);
                
                $('div.circle-container').css('transform', 'translate(-50%, -50%) scale(0)');
                $('div.countdown-container').css('transform', 'translate(-50%, -50%) scale(0)');
                $('body').css('background', 'transparent');
                $('div.info-container').fadeOut(1000);

                setTimeout(() => {
                    jcmp.CallEvent('storages/ui/hacking/close', false);
                }, 1000);
            }

        }, 50);
    }

    function CreateDot(level, color)
    {
        const $dot = $(`<div class='dot enabled static'></div>`);
        const degree = GetRandomDegree(level);
        $dot.data('degree', degree).data('color', color);
        $dot.css('transform', 
            `translate(-50%, -50%) rotate(${degree}deg) translate(0, -35vh) translate(0, -50%)`);
        $dot.css('background', color);

        $(`div.circle-${level}`).append($dot);
    }

    function GetRandomDegree(level)
    {
        const degree = Math.round(Math.random() * 360);

        for (let i = 0; i < dots[level].length; i++)
        {
            if (Math.abs(dots[level][i] - degree) < min_distance || 360 - Math.abs(dots[level][i] - degree) < min_distance)
            {
                return GetRandomDegree(level);
            }
        }

        dots[level].push(degree);

        return degree;
    }
    
    let cooldown = null;

    document.onkeyup = (e) => 
    {
        const keycode = (typeof e.which === 'number') ? e.which : e.keyCode;
        if (keycode == 32 && !cooldown && interval && num_misses < max_misses)
        {
            const current_level = Math.floor(dots_completed / 9) + 1;
            const this_degree = getRotationDegrees($('div.dot.enabled.controller'));
            const this_color = $('div.dot.controller').data('color');

            let got_one = false;
            let $closest;
            let closest_dist = trigger_distance;

            $(`div.circle-${current_level} div.dot.enabled.static`).each(function(index)
            {
                let degree = $(this).data('degree');
                const color = $(this).data('color');
                degree += 7;

                if (degree > 360)
                {
                    degree -= 360;
                }

                const dist = (Math.abs(degree - this_degree) < 360 - Math.abs(degree - this_degree)) ? 
                    Math.abs(degree - this_degree) : 360 - Math.abs(degree - this_degree);

                if (dist < trigger_distance && dist < closest_dist && color == this_color)
                {
                    $closest = $(this);
                    closest_dist = dist;
                }
            })

            if ($closest)
            {
                jcmp.CallEvent('sound/Play', 'msg_box_scroll.ogg', '0.25');
                $closest.removeClass('enabled');
                $closest.css('transform',
                    `translate(-50%, -50%) rotate(${$closest.data('degree')}deg) translate(0, -35vh) translate(0, -50%) scale(0.5)`);
                dots_completed++;
                got_one = true;

                const new_level = Math.floor(dots_completed / 9) + 1;

                if (new_level > current_level)
                {
                    $('div.dot.controller').remove();
                    $(`div.circle-${new_level}`).append($(`<div class='dot enabled controller'></div>`));
                }
            }

            UpdateControllerColor();

            if (!got_one)
            {
                jcmp.CallEvent('sound/Play', 'msg_box_show_hide.ogg', '0.25');
                num_misses++;
                $('div.circle').css('border-color', red_colors[num_misses]);

                if (num_misses >= max_misses)
                {
                    jcmp.CallEvent('sound/Play', 'hud_encounter_failed.ogg', '0.25');
                    clearInterval(interval);
                    interval = null;
                    $('div.dot.controller').css('animation', 'none').remove();
                    $('div.container div.countdown').text('Failed');
                    
                    $('div.circle-container').css('transform', 'translate(-50%, -50%) scale(0)');
                    $('div.countdown-container').css('transform', 'translate(-50%, -50%) scale(0)');
                    $('body').css('background', 'transparent');
                    $('div.info-container').fadeOut(1000);

                    setTimeout(() => {
                        jcmp.CallEvent('storages/ui/hacking/close', false);
                    }, 1000);
                }
            }
            else if (dots_completed == dots_per_level * 3)
            {
                jcmp.CallEvent('sound/Play', 'hud_encounter_won.ogg', '0.25');
                clearInterval(interval);
                interval = null;
                $('div.dot.controller').remove();
                $('div.container div.countdown').text('Done');
                $('svg.progress circle.fill').css('stroke', 'green');

                $('div.circle').css('border-color', 'green');
                $('div.circle-container').css('transform', 'translate(-50%, -50%) scale(0)');
                $('div.countdown-container').css('transform', 'translate(-50%, -50%) scale(0)');
                $('body').css('background', 'transparent');
                $('div.info-container').fadeOut(1000);

                
                setTimeout(() => {
                    jcmp.CallEvent('storages/ui/hacking/close', true, dots_completed, num_misses, current_time, id);
                }, 1000);

            }

            cooldown = setTimeout(() => {
                cooldown = null;
            }, 100);
        }
    }

    function UpdateControllerColor()
    {
        const controller_color = colors[Math.floor(((dots_completed % 9)) / 3)];
        $('div.dot.controller').css('background', controller_color).data('color', controller_color);
    }

    // From https://stackoverflow.com/questions/8270612/get-element-moz-transformrotate-value-in-jquery
    function getRotationDegrees(obj) {
        var matrix = obj.css("-webkit-transform") ||
        obj.css("-moz-transform")    ||
        obj.css("-ms-transform")     ||
        obj.css("-o-transform")      ||
        obj.css("transform");
        if(matrix !== 'none') {
            var values = matrix.split('(')[1].split(')')[0].split(',');
            var a = values[0];
            var b = values[1];
            var angle = Math.round(Math.atan2(b, a) * (180/Math.PI));
        } else { var angle = 0; }
        return (angle < 0) ? angle + 360 : angle;
    }
    
    $('html').css('visibility', 'visible');

    jcmp.AddEvent('start', (_id) => 
    {
        //console.log('hacking ui start event received, create game');
        id = _id;
        GenerateGame();
    })

    //console.log('hacking ui ready');
    jcmp.CallLocalEvent('ready');

})
