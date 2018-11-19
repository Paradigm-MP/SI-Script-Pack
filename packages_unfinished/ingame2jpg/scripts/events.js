
jcmp.ingame2jpg = function(positions, file_name)
{
    i2jpg.img.CreateImage(positions, file_name).then(() => 
    {
        console.log(`[INGAME2JPG] Completed writing ${positions.length} points to ${file_name}.png`);
    })
}
