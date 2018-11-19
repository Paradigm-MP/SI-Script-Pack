$(document).ready(function() 
{
    $('.window').draggable({handle: ".title", disabled: false});
    
    let open_key = 113; // F2
    let open = false;
    let dimension = 0;
    let names = {};
    let edit_name = "";

    //  NAMES OF MARKERS MUST BE UNIQUE

    $("div.tooltip").fadeOut(1);
    $(".icon").fadeOut(1);

    if (!open)
    {
        $('.window').fadeOut(1);
    }

    $('html').css('visibility', 'visible');

    function AddEntry(data)
    {
        data = JSON.parse(data);

        const n_underscore = data.n.replace(/\s/g, "_"); // Regex wut
        if (typeof names[data.n] != 'undefined')
        {
            jcmp.CallEvent('debug', "[MARKERS] Tried to make entry with duplicate name.");
            return;
        }

        $($("<div></div>")
            .data('name', data.n)
            .attr('id', "entry_" + n_underscore)
            .addClass("marker-entry"))
            .insertBefore($('.icon-plus'))
            .append($(`<span class="entry-name" id="${n_underscore}_name">${data.n}</span>`))
            .append($(`<span class="icon" id="${n_underscore}_delete"><i id="icon-trash" class="fa fa-trash"></i></span>`))
            .append($(`<span class="icon" id="${n_underscore}_edit"><i id="icon-edit" class="fa fa-pencil"></i></span>`))
            .append($(`<span class="icon" id="${n_underscore}_toggle"><i id="icon-eye" class="fa fa-eye"></i></span>`))
            .append($(`<span class="icon" id="${n_underscore}_marker"><i id="icon-marker" class="fa fa-map-marker"></i></span>`));

        data.n_underscore = n_underscore;
        names[data.n] = data;
    }

    function RemoveEntry(name)
    {
        
    }

    function ChangeDimension()
    {

    }

    // .click does not work for dynamically generated elements, use .on
    $(".entries").on("click", ".icon", function()
    {
        let id = $(this).attr('id');
        // When someone clicks the delete button
        if (id.substring(id.length - 7, id.length) == '_delete' && $(this).data('removing') != true)
        {
            $(this).data('removing', true);
            let $entry = $(this);
            $(this).parent().hide("slide", { direction: "up" }, 200, function() 
            {
                jcmp.CallEvent('markers/Remove', $entry.parent().data('name'));
                $entry.parent().remove();
            });
        }
        // When someone clicks the edit button
        else if (id.substring(id.length - 5, id.length) == '_edit')
        {
            let n_underscore = id.replace('_edit', '');
            edit_name = $(`#${n_underscore}_name`).text();
            $(this).parent().prepend($(`<input type="text" id="input_placeholder_edit" value="${edit_name}"></input>`));
            $("#input_placeholder_edit").focus();
            $("#input_placeholder_edit").select();
            $(`#${n_underscore}_name`).remove();
        }
        // When someone clicks the toggle visibility button
        else if (id.substring(id.length - 7, id.length) == '_toggle')
        {
            // Don't do anything when it's in a different dimension
            if ($(this).find('i').attr('class') == 'fa fa-ban')
            {
                return;
            }

            let enabled = $(this).find('i').attr('id') == "icon-eye";
            if (enabled)
            {
                $(this).parent().css('opacity', '0.5');
                $(this).find('i').attr('id', 'icon-eye-hidden');
            }
            else
            {
                $(this).parent().css('opacity', '1.0');
                $(this).find('i').attr('id', 'icon-eye');
            }

            names[$(this).parent().data('name')].v = !enabled;
            jcmp.CallEvent('markers/Toggle', $(this).parent().data('name'), !enabled);
        }
        // When someone clicks the waypoint button
        else if (id.substring(id.length - 7, id.length) == '_marker')
        {
            // make map waypoint set to marker position
        }
    })

    // Hover enter ban icon to fade in tooltip
    $(document).on("mouseenter", ".fa.fa-ban", function() {
        $("div.tooltip").finish();
        $('div.tooltip').css(
        {
            'top': $(this).offset().top + $(this).height() + 5,
            'left': $(this).offset().left - $('div.tooltip').width() / 2
        });
        $("div.tooltip").fadeIn('fast');
    });

    // Hover enter ban icon to fade out tooltip
    $(document).on("mouseleave", ".fa.fa-ban", function() {
        $("div.tooltip").fadeOut('fast');
    });


    // Hover over eye to make eye slash appear
    $(document).on("mouseenter", "#icon-eye", function() {
        if ($(this).attr('class') == 'fa fa-ban') {return;}
        $(this).removeClass('fa-eye');
        $(this).addClass('fa-eye-slash');
    });

    // Hover leave eye to make eye normal again
    $(document).on("mouseleave", "#icon-eye", function() {
        if ($(this).attr('class') == 'fa fa-ban') {return;}
        $(this).removeClass('fa-eye-slash');
        $(this).addClass('fa-eye');
    });

    // Hover over eye to make eye slash appear
    $(document).on("mouseenter", "#icon-eye-hidden", function() {
        if ($(this).attr('class') == 'fa fa-ban') {return;}
        $(this).removeClass('fa-eye-slash');
        $(this).addClass('fa-eye');
    });

    // Hover leave eye to make eye normal again
    $(document).on("mouseleave", "#icon-eye-hidden", function() {
        if ($(this).attr('class') == 'fa fa-ban') {return;}
        $(this).removeClass('fa-eye');
        $(this).addClass('fa-eye-slash');
    });

    // Hover enter player entry to fade in icons
    $(document).on("mouseenter", ".marker-entry", function() {
        $(this).find(".icon").finish();
        $(this).find(".icon").fadeIn('fast');
    });

    // Hover enter player entry to fade out icons
    $(document).on("mouseleave", ".marker-entry", function() {
        $(this).find(".icon").finish();
        $(this).find(".icon").fadeOut('fast');
    });

    // Make X red when hovered
    $(".close-icon").hover(function()
    {
        $("#close-button").css("color", "red");
    }, function()
    {
        $("#close-button").css("color", "white");
    });

    // Close window when X is pressed
    $(".close-icon").click(function()
    {
        open = !open;
        $('.window').fadeOut(1, function() {$('.window').css('visibility', 'hidden'); $("#close-button").css("color", "white");});
        jcmp.HideCursor();
        jcmp.CallEvent('markers/ToggleOpen', open);
    });

    // Add placeholder when the + is pressed
    $(".icon-plus").click(function()
    {
        $($("<div></div>").attr('id', 'placeholder').addClass("marker-entry")).insertBefore($('.icon-plus'));

        $("#placeholder").append($('<input type="text" placeholder="Enter a name..." id="input_placeholder"></input>'));
        $("#input_placeholder").focus();

    });

    // When they click away after typing the name of a new marker
    $(document).on('blur', '#input_placeholder', function() 
    {
        let name = $('#input_placeholder').val().trim().substring(0,30);
        $('#placeholder').remove();
        if (name.length > 0)
        {
            jcmp.CallEvent('markers/AddNew', name);
        }
    });

    // When they click away after editing the name of a marker
    $(document).on('blur', '#input_placeholder_edit', function() 
    {
        let name = $('#input_placeholder_edit').val().trim().substring(0,30);
        if (name.length > 0 && name != edit_name && typeof names[name] == 'undefined')
        {
            const n_underscore = name.replace(/\s/g, "_"); // Regex wut
            const old_n_underscore = names[edit_name].n_underscore;

            let old_data = names[edit_name];
            names[name] = old_data;
            names[name].n_underscore = n_underscore;
            names[name].n = name;
            delete names[edit_name];

            $(this).parent().children('span').each(function() 
            {
                $(this).attr('id', $(this).attr('id').replace(old_n_underscore, n_underscore));
            });
            $(this).parent().prepend($(`<span class="entry-name" id="${n_underscore}_name">${name}</span>`));
            $(this).parent().attr('id', `entry_${n_underscore}`);
            $(this).parent().data('name', name);
            jcmp.CallEvent('markers/Edit', edit_name, name);
        }
        else
        {
            const n_underscore = names[edit_name].n_underscore;
            $(this).parent().prepend($(`<span class="entry-name" id="${n_underscore}_name">${edit_name}</span>`));
        }
        $('#input_placeholder_edit').remove();
    });

    document.onkeyup = (e) => 
    {
        const keycode = (typeof e.which === 'number') ? e.which : e.keyCode;
        if (keycode == open_key)
        {
            ToggleOpen();
        }

    };

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
        jcmp.CallEvent('markers/ToggleOpen', open);
    }

    jcmp.AddEvent('markers/AddEntry', (data) => {
        AddEntry(data);
    })

    jcmp.AddEvent('markers/RemoveEntry', (name) => {
        RemoveEntry(id);
    })

    jcmp.AddEvent('markers/ChangeDimension', (dim) => {
        for (const name in names)
        {
            const data = names[name];
            // If it's not in our dimension anymore, give it the banned/hidden icon
            if (data.d != dim)
            {
                let v_icon = (data.v == true) ? 'fa-eye' : 'fa-eye-slash';
                $(`#${data.n_underscore}_toggle`).find('i')
                    .removeClass(v_icon)
                    .addClass('fa-ban');
                $('div#entry_' + data.n_underscore).css('opacity', '0.5');
            }
            // Otherwise, it is in our dimension, so give it the proper icon
            else
            {
                let v_icon = (data.v == true) ? 'fa-eye' : 'fa-eye-slash';
                $(`#${data.n_underscore}_toggle`).find('i')
                    .removeClass('fa-ban')
                    .addClass(v_icon);
                $('div#entry_' + data.n_underscore).css('opacity', ((data.v == true) ? '1.0' : '0.5'));
            }
        };
    })

    jcmp.CallEvent('markers/Ready');

    setInterval(function() 
    {
        jcmp.CallEvent('markers/SecondTick');
    }, 1000);

})
