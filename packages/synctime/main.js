
// Every second realtime is a minute gametime

// Use jcmp.events.Call('GetTime')[0] to get a table of the current time (eg. timetable.hour)
// Use jcmp.events.Call('ChangeTime', minute, hour, timestep) to change time for everyone

let second = 0; // Default start second
let minute = 0; // Default start minute
let hour = 13; // Default start hour
let timestep = 1; // Default timestep (how fast time goes)

setInterval(function(){
    UpdateTime();
}, 60)


function UpdateTime() // Increment our server time
{
    second += timestep;

    if (second >= 60)
    {
        minute += 1;
        second = 0;
    }

    if (minute >= 60)
    {
        hour += 1;
        minute = 0;
    }

    if (hour >= 24)
    {
        hour = 0;
    }
}

jcmp.events.Add('PlayerReady', player => {
    jcmp.events.CallRemote('synctime/SyncTime', player, second, minute, hour, timestep);
})

jcmp.events.Add('ChangeTime', (s, m, h, ts) => {
    second = s || second;
    minute = m || minute;
    hour = h || hour;
    timestep = ts || timestep;
    jcmp.events.CallRemote('synctime/SyncTime', null, second, minute, hour, timestep);
})

jcmp.events.Add('GetTime', () => {
    return {hour: hour, minute: minute, second: second, timestep: timestep};
})