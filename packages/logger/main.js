const fs = require('fs');

jcmp.events.Add('log', (name, msg) => 
{
    msg = `${GetCurrentDate()} ${msg}`;
    let existing_msg = '';
    
    if (fs.existsSync(__dirname + `/logs/${name}.txt`))
    {
        existing_msg = fs.readFileSync(__dirname + `/logs/${name}.txt`, 'utf8');
    }

    existing_msg += msg + '\n';
    fs.writeFileSync(__dirname + `/logs/${name}.txt`, existing_msg);
})


jcmp.events.Add('ScriptError', (file, line, err, trace) => {
    jcmp.events.Call('log', 'reports', 
        `**AUTOMATED SERVER ERROR:**\n\nFILE: ${file}\nLINE: ${line}\nERROR: ${err}\nTRACE: ${trace}`);
})

function GetCurrentDate()
{
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();
    return `[${year}-${month}-${day}|${hour}:${minute}:${second}]`;
}