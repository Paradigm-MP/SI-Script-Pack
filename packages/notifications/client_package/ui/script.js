$(document).ready(function() 
{

    const messages = [];
    const DEFAULT_TIME = 3000;
    const FADE_TIME = 300;

    const presets = {
        default:
        {
            title_color: 'white',
            icon: `<i class='fa fa-info-circle'></i>`,
            icon_color: 'white'
        },
        tip:
        {
            title_color: '#37EDF0',
            icon: `<i class='fa fa-info-circle'></i>`,
            icon_color: '#37EDF0',
            time: 10000
        },
        warn: 
        {
            title_color: 'yellow',
            icon: `<i class='fa fa-warning'></i>`,
            icon_color: 'yellow'
        },
        warn_red:
        {
            title_color: 'red',
            icon: `<i class='fa fa-warning'></i>`,
            icon_color: 'red'
        },
        atted:
        {
            title_color: 'yellow',
            icon: `<i class='fa fa-at'></i>`,
            icon_color: 'yellow',
            time: 7500
        },
        success:
        {
            title_color: '#20E32D',
            icon: `<i class='fa fa-check-circle'></i>`,
            icon_color: '#20E32D'
        },
        combat_log:
        {
            title_color: 'red',
            icon: `<i class='fa fa-minus-circle' style='text-shadow: 0px 0px 10px red'></i>`,
            icon_color: 'red',
            time: 12000
        },
        craft:
        {
            title_color: '#E024DD',
            icon: `<i class='fa fa-cube'></i>`,
            icon_color: '#E024DD'
        },
        craft_advanced:
        {
            title_color: '#E02424',
            icon: `<i class='fa fa-cube'></i>`,
            icon_color: '#E02424'
        },
        decraft:
        {
            title_color: '#4789E6',
            icon: `<i class='fa fa-cubes'></i>`,
            icon_color: '#4789E6'
        }
    }

    /**
     * Creates a message in the UI using args. Args can have lots of arguments, such as:
     * 
     * * **title (REQUIRED):** the title of the notification. Can contain custom HTML
     * * **subtitle:** the subtitle of the notification. Can contain custom HTML
     * * **icon:** custom HTML defining an icon. It can be a normal font awesome icon, or it can 
     * be something fancier like an image. Anything works.
     * * **time:** the time that the notification should appear on the screen in milliseconds. 
     * Default 3 seconds.
     * * **preset:** a predefined style of the notification, such as warn or warn_red
     * * **title_color:** color of the title in a recognized css format (hex or rgba)
     * * **subtitle_color:** color of the subtitle in a recognized css format (hex or rgba)
     * * **icon_color:** color of the icon in a recognized css format (hex or rgba)
     * 
     * 
     * @param {*} args 
     */
    function CreateMessage(args)
    {
        const $notification = $(`<div class='notification'></div>`);
        const $icon_container = $(`<div class='icon'></i>`);
        const $text_container = $(`<div class='text-container'></div>`);
        const $title = $(`<div class='title'>${args.title}</div>`);
        const $subtitle = $(`<div class='subtitle'></div>`);
        let $icon;

        if (args.subtitle) {$subtitle.html(args.subtitle);}

        if (!args.preset) {args.preset = 'default';}

        if (args.preset != 'none')
        {
            const preset = presets[args.preset];

            if (!preset) {console.log(`Failed to find preset data for ${args.preset}.`);}

            $icon = $(preset.icon);

            if (preset.title_color) {$title.css('color', preset.title_color);}
            if (preset.subtitle_color) {$subtitle.css('color', preset.subtitle_color);}
            if (preset.icon_color) {$icon.css('color', preset.icon_color);}
            if (preset.time && !args.time) {args.time = preset.time;}
        }

        if (!args.time) {args.time = DEFAULT_TIME;}

        if (args.icon) {$icon = $(args.icon);}

        if (args.title_color) {$title.css('color', args.title_color);}
        if (args.subtitle_color) {$subtitle.css('color', args.subtitle_color);}
        if (args.icon_color) {$icon.css('color', args.icon_color);}

        if (!args.subtitle) {$title.css('transform', 'translateY(-25%)')}

        $text_container.append($title).append($subtitle);
        $icon_container.append($icon);
        $notification.append($icon_container).append($text_container);
        $notification.data('index', messages.length);

        $notification.hide();
        $('body').append($notification);

        $notification.fadeIn(FADE_TIME);

        jcmp.CallEvent('sound/Play', 'jc3_gui_challenges_warning_03.ogg', 0.2);

        setTimeout(() => 
        {
            $notification.fadeOut(FADE_TIME, function()
            {
                $notification.trigger('remove').remove();
            });
        }, args.time + FADE_TIME);

        messages.push($notification);
        Rearrange();

    }

    $(document).on('remove', 'div.notification', function()
    {
        const index = $(this).data('index');
        messages.splice(index, 1);

        for (let i = index; i < messages.length; i++)
        {
            messages[i].data('index', i);
        }

        Rearrange();
    })

    function Rearrange()
    {
        for (let i = 0; i < messages.length; i++)
        {
            const $elem = messages[i];
            let scale = 1 - ((messages.length - i - 1) * 0.25);

            let y = 0;

            for (let j = i; j < messages.length; j++)
            {
                y += 15 * (1 - ((messages.length - j - 1) * 0.25));
            }

            scale = (scale <= 0.25) ? 0 : scale;
            y = (scale == 0.25) ? 42 : y;

            $elem.css('transform', 
                `translate(-50%, -${y - 6}vh) scale(${scale})`);
        }
    }

    function AddMessage(args)
    {
        if (!args.title) {return;}

        CreateMessage(args);

        /*if ($('div.notification').length == 0)
        {
            CreateMessage(args);
        }
        else
        {
            messages.push(args);
        }*/
    }

    jcmp.AddEvent('add', (args) => 
    {
        args = JSON.parse(args);

        AddMessage(args);
    })

    jcmp.CallLocalEvent('ready');
})
