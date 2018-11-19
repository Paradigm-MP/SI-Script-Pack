jcmp.cm_data = {}; // indexed by network id, all data of worn cosmetics by players

const cm_textures = 
{
    'Pixel Thug Glasses': 
    {
        texture: new Texture(`package://itemuse/items/pixelthug.png`),
        bone: 0x4495EABA,
        offset: new Vector3f(0, -0.025, 0.015),
        size: new Vector2f(0.16, 0.032)
    },
    'Googly Eyes': 
    {
        is_eyeball: true,
        texture1: new Texture(`package://itemuse/items/googlyeyesleft.png`),
        texture2: new Texture(`package://itemuse/items/googlyeyesright.png`),
        bone1: 0x96A32E27,
        bone2: 0x24FA932B,
        offset: new Vector3f(0, 0.0075, 0.026),
        size: new Vector2f(0.05, 0.05)
    }
}

for (const name in cm_textures)
{
    const tex = cm_textures[name];
    tex.offset = new Vector3f(-tex.size.x / 2 + tex.offset.x, - tex.size.y / 2 + tex.offset.y, tex.offset.z);
}

jcmp.events.Add('GameUpdateRender', (r) => 
{
    jcmp.players.forEach((p) => 
    {
        const data = jcmp.cm_data[p.networkId];
        if (data)
        {
            ProcessCosmetics(r, p, data);
        }
    });
})

/**
 * Processes cosmetics that players wear, aka updates their positions on render. Supports rendered cosmetics.
 * @param {*} r - The renderer
 * @param {*} p - The player 
 * @param {*} d - The data of the cosmetics on the player
 */
function ProcessCosmetics(r, p, d)
{
    d.forEach((item) => 
    {
        if (item.type == 'texture')
        {
            const tex = cm_textures[item.name];

            if (!tex.is_eyeball)
            {
                const mat = p.GetBoneTransform(tex.bone, r.dtf);
                r.SetTransform(mat);
                r.DrawTexture(tex.texture, tex.offset, tex.size);
            }
            else
            {
                const mat1 = p.GetBoneTransform(tex.bone1, r.dtf);
                r.SetTransform(mat1);
                r.DrawTexture(tex.texture1, tex.offset, tex.size);

                const mat2 = p.GetBoneTransform(tex.bone2, r.dtf);
                r.SetTransform(mat2);
                r.DrawTexture(tex.texture2, tex.offset, tex.size);
            }
        }
    });
}

jcmp.events.AddRemoteCallable('itemuse/cosmetics/sync', (id, data) => 
{
    jcmp.cm_data[id] = JSON.parse(data);
})