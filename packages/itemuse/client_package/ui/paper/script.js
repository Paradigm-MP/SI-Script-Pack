$(document).ready(function() 
{
    const canvas = document.getElementById('main-canvas');
    const cx = canvas.getContext("2d");
    const offset = $('div.canvas-container').offset();
    const draw_width = 5;
    let drawing = false;
    let current_pen = null;
    let drawing_interval;
    const pen_dura_per_sec = 0.5; // Amount of durability that is taken away per second of using a pen
    const COMPRESSION = 0.75; // between 0 and 1, 1 is no compression

    const pens = 
    {
        'Black Pen': {c: 'black', d: 0},
        'Blue Pen': {c: 'blue', d: 0},
        'Red Pen': {c: 'red', d: 0},
        'Orange Pen': {c: 'orange', d: 0},
        'Yellow Pen': {c: 'yellow', d: 0},
        'Green Pen': {c: 'green', d: 0},
        'Purple Pen': {c: 'purple', d: 0},
        'Gray Pen': {c: 'gray', d: 0},
        'Brown Pen': {c: 'brown', d: 0},
        'Pink Pen': {c: '#ff48c2', d: 0},
        'Lawngreen Pen': {c: 'lawngreen', d: 0},
        'Turqouise Pen': {c: 'turquoise', d: 0},
        'Magic Eraser Pen': {c: 'white', d: 0},
        'Rainbow Pen': {c: 'rainbow', d: 0}
    }

    cx.fillStyle = "white";
    cx.fillRect(0, 0, canvas.width, canvas.height);

    $('div.pen-container').empty(); // Clear all pens
    $('div.pen-container').append(`<div class='pen-entry selected' id='nopen'>No Pens Found</div>`)

    // Start drawing when they click
    $('div.canvas-container #main-canvas').mousedown(function()
    {
        if (current_pen != null)
        {
            StartDrawing();
        }
    })

    function DrawDot()
    {
        cx.beginPath();
        cx.fillStyle = GetColor(current_pen);
        cx.arc(
            currentMousePos.x - offset.left, 
            currentMousePos.y - offset.top, 
            draw_width / 2, 0, Math.PI * 2);
        cx.fill();
    }

    // Stop drawing when they release click
    $('html').mouseup(function()
    {
        if (drawing && current_pen)
        {
            StopDrawing();
        }
    })

    function StopDrawing()
    {
        drawing = false;
        window.requestAnimationFrame(DrawDot); // Doing it on the same frame makes it bigger idk, but this works
        clearInterval(drawing_interval);
        drawing_interval = null;

        if (current_pen)
        {
            jcmp.CallLocalEvent('mod_pen_dura', current_pen, Math.ceil(pens[current_pen].d));
        }


        // Timeout to wait for the drawdot above
        setTimeout(() => 
        {
            jcmp.CallLocalEvent('save', canvas.toDataURL('image/jpeg', COMPRESSION));
        }, 50);
    }

    // Called every drawing frame
    function DrawInterval()
    {
        cx.lineTo(currentMousePos.x - offset.left, currentMousePos.y - offset.top);
        cx.stroke();
        
        oldMousePos.x = currentMousePos.x;
        oldMousePos.y = currentMousePos.y;

        if (drawing) 
        {
            if (current_pen == 'Rainbow Pen')
            {
                cx.beginPath();
                cx.strokeStyle = GetColor(current_pen);
                cx.lineWidth = draw_width;
                cx.moveTo(currentMousePos.x - offset.left, currentMousePos.y - offset.top);
            }
            window.requestAnimationFrame(DrawInterval);
        }
    }

    function StartDrawing()
    {
        drawing = true;
        DrawDot();

        drawing_interval = setInterval(() => 
        {
            pens[current_pen].d -= pen_dura_per_sec;

            if (pens[current_pen].d <= 0)
            {
                StopDrawing();
            }
        }, 1000);

        cx.beginPath();
        cx.strokeStyle = GetColor(current_pen);
        cx.lineWidth = draw_width;
        cx.moveTo(currentMousePos.x - offset.left, currentMousePos.y - offset.top);

        window.requestAnimationFrame(DrawInterval);
    }

    let currentMousePos = { x: -1, y: -1 };
    let oldMousePos = { x: -1, y: -1 };

    $(document).mousemove(function(event) 
    {
        if (oldMousePos.x == -1 && oldMousePos.y == -1)
        {
            oldMousePos.x = currentMousePos.x;
            oldMousePos.y = currentMousePos.y;
        }

        currentMousePos.x = event.pageX;
        currentMousePos.y = event.pageY;
    });

    $(document).on('click', 'div.pen-entry', function()
    {
        if (pens[$(this).data('pen')].d <= 0) {return;}

        $('div.pen-entry').removeClass('selected');
        $(this).addClass('selected');

        current_pen = $(this).data('pen');
    })

    // To load drawings from a data URL:
    function LoadImage(base64)
    {
        const img = new Image;
        img.onload = function()
        {
            cx.drawImage(img,0,0); // Or at whatever offset you like
        };
        img.src = base64;
    }

    /**
     * Adds a pen to the UI.
     */
    function AddPen(pen_data)
    {
        if (!pens[pen_data.name]) {return;}

        $('#nopen').remove();

        let selected = !current_pen;
        const $entry = $(`<div class='pen-entry${selected ? ' selected' : ''}'><span class='pen-dot'></span> ${pen_data.name}</div>`);
        $entry.data('pen', pen_data.name);
        $entry.attr('id', `pen_${pen_data.name.replace(' ', '_').replace(' ', '_')}`);

        pens[pen_data.name].d = pen_data.d; // Set durability to pen durability

        if (pen_data.name == 'Rainbow Pen')
        {
            $entry.find('span.pen-dot').css('background-color', 'none');
            $entry.find('span.pen-dot').addClass('rainbow');
        }
        else
        {
            $entry.find('span.pen-dot').css('background-color', pens[pen_data.name].c);
        }

        $('div.pen-container').append($entry);

        if (selected)
        {
            current_pen = pen_data.name;
        }
    }

    const rainbow_color = {r: 255, g: 0, b: 0};
    const rainbow_speed = 5;

    function GetColor(pen)
    {
        if (pen != 'Rainbow Pen')
        {
            return pens[pen].c;
        }
        else
        {
            IncrementColor();
            return `rgb(${rainbow_color.r}, ${rainbow_color.g}, ${rainbow_color.b})`;
        }
    }

    function IncrementColor()
    {
        if (rainbow_color.r > 255) {rainbow_color.r = 255;}
        if (rainbow_color.g > 255) {rainbow_color.g = 255;}
        if (rainbow_color.b > 255) {rainbow_color.b = 255;}
        if (rainbow_color.r < 0) {rainbow_color.r = 0;}
        if (rainbow_color.g < 0) {rainbow_color.g = 0;}
        if (rainbow_color.b < 0) {rainbow_color.b = 0;}

        if (rainbow_color.r == 255 && rainbow_color.g < 255 && rainbow_color.b == 0)
            rainbow_color.g += rainbow_speed;
        else if (rainbow_color.r > 0 && rainbow_color.g == 255 && rainbow_color.b == 0)
            rainbow_color.r -= rainbow_speed;
        else if (rainbow_color.r == 0 && rainbow_color.g == 255 && rainbow_color.b < 255)
            rainbow_color.b += rainbow_speed;
        else if (rainbow_color.r == 0 && rainbow_color.g > 0 && rainbow_color.b == 255)
            rainbow_color.g -= rainbow_speed;
        else if (rainbow_color.r < 255 && rainbow_color.g == 0 && rainbow_color.b == 255)
            rainbow_color.r += rainbow_speed;
        else if (rainbow_color.r == 255 && rainbow_color.g == 0 && rainbow_color.b > 0)
            rainbow_color.b -= rainbow_speed;
    }

    $('div.x-container').click(function()
    {
        jcmp.HideCursor();
        jcmp.CallLocalEvent('close', $('#name_input').val().trim());
    })

    jcmp.AddEvent('init_pens', (data) => 
    {
        data = JSON.parse(data);

        for (let i = 0; i < data.length; i++)
        {
            AddPen(data[i]);
        }
    })
    
    jcmp.AddEvent('load', (data, name) => 
    {
        LoadImage(data);
        $('#name_input').val(name);
        jcmp.ShowCursor();
    })

    jcmp.AddEvent('remove_pen', (pen_name) => 
    {
        console.log('remove pen ' + pen_name);
        current_pen = null;
        $(`#pen_${pen_name.replace(' ', '_').replace(' ', '_')}`).remove();
    })

    jcmp.AddEvent('update_pen_dura', (name, dura) => 
    {
        pens[name].d = dura;

        if (dura <= 0)
        {
            $(`#pen_${name}`).remove();
        }
    })

    jcmp.AddEvent('close', () => 
    {
        jcmp.CallLocalEvent('save', canvas.toDataURL('image/jpeg', 0.75));
        jcmp.HideCursor();
        jcmp.CallLocalEvent('close', $('#name_input').val().trim());
    })

    jcmp.CallLocalEvent('ready');

})
