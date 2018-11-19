


let oldWeather;
let in_cursed = false;


jcmp.events.AddRemoteCallable('CursedWorldEnter', () => {

    oldWeather = jcmp.world.weather;
    jcmp.world.moonColor = new RGBA(255,0,0,255);
    jcmp.world.sunColor = new RGBA(255,0,0,255);
    //jcmp.world.sunPosition = new Vector2f(-50000,-50000);
    jcmp.world.sunPosition = new Vector2f(0,-50000);
    jcmp.world.SetTime(18,30, 0);
    jcmp.world.weather = 3;
    in_cursed = true;

})



jcmp.events.AddRemoteCallable('CursedWorldExit', () => {

    jcmp.world.weather = oldWeather;
    jcmp.world.moonColor = new RGBA(255,255,255,255);
    jcmp.world.sunColor = new RGBA(255,255,255,255);
    jcmp.world.ResetSunPosition();
    in_cursed = false;

})


jcmp.events.Add("GameUpdateRender", (renderer) => {
    if (!in_cursed)
    {
        return;
    }

    let radius = 2000000;
    let cam = jcmp.localPlayer.camera.rotation;
    let m = new Matrix();
    let pos = new Vector3f(jcmp.localPlayer.position.x, 1023.4, jcmp.localPlayer.position.z);
    //m = m.LookAt(jcmp.localPlayer.camera.position, jcmp.localPlayer.position, new Vector3f(0,0,1));
    m = m.Translate(pos);
    m = m.Rotate(Math.PI / 2, new Vector3f(1,0,0));
    //m = m.Rotate(1, new Vector3f(0, Math.PI / 2,0));
    renderer.SetTransform(m);
    renderer.DrawRect(new Vector3f(-radius,-radius,0), new Vector2f(radius*2,radius*2), new RGBA(255,0,0,255)); // top*/


    /*m = new Matrix();
    pos = new Vector3f(jcmp.localPlayer.position.x, jcmp.localPlayer.position.y + 100, jcmp.localPlayer.position.z);
    //m = m.LookAt(jcmp.localPlayer.camera.position, jcmp.localPlayer.position, new Vector3f(0,0,1));
    m = m.Translate(pos);
    m = m.Rotate(Math.PI / 2, new Vector3f(1,0,0));
    //m = m.Rotate(1, new Vector3f(0, Math.PI / 2,0));
    renderer.SetTransform(m);
    renderer.DrawRect(new Vector3f(-radius,-radius,0), new Vector2f(radius*2,radius*2), new RGBA(255,0,0,255)); // top*/
});
