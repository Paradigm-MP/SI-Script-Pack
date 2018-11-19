# Unfinished Packages Information
We were working on a lot more packages that didn't quite get finished, or had some issues that prevented them from being released. They're here now in various states of development in `packages_unfinished`.

## chatbubbles
- This packages was basically finished, and appeared on the Survival Island server for a while. It mostly works, except the chatbubbles sometimes appear over the wrong people's heads.
- Not recommended for production use.

## crafting
- Not finished in any form. This is one the most advanced UIs on the server.
- We had planned to implement crafting in the future, and this would have been the UI that pops up when you open a crafting table.
- Feel free to drag `crafting/client_package/ui/index.html` into your browser to get a preview of what it would have looked like. You will need to replace `MY RESOURCE PATH` with wherever you uploaded the resources for it to work, though.
- Not recommended for production use.

## cursed
- We planned on having a questline that eventually leads you to a portal to the Cursed Dimension.
- You can just drop this into your packages and type `/cursed` to go to the Cursed Dimension.
- Not recommended for production use.

## ingame2jpg
- Creates an image using the map of Medici with specified points from ingame coordinates. Finished package, but only recommended for using to create displays of ingame points.
- Run `npm i` inside to install the required node modules.
- To use, call `jcmp.ingame2jpg(arr_of_points, file_name)`
```js
    jcmp.ingame2jpg([
        {x: 3395.3984375, y: 1064.1610107421875, z: 1372.6422119140625},
        {x: 3423.0615234375, y: 1043.75439453125, z: 1323.706787109375},
        {x: 3467.94140625, y: 1033.394775390625, z: 1304.8284912109375},
        {x: 3514.7705078125, y: 1032.289794921875, z: 1304.802978515625},
        {x: 3545.154296875, y: 1061.0911865234375, z: 1274.36474609375},
        {x: 3612.150390625, y: 1107.8687744140625, z: 1229.8140869140625},
        {x: 3626.260009765625, y: 1159.3128662109375, z: 1162.7203369140625},
        {x: 3636.3076171875, y: 1174.8187255859375, z: 1038.796630859375},
        {x: 3572.567138671875, y: 1237.83056640625, z: 1011.0767822265625},
        {x: 3538.57080078125, y: 1274.1905517578125, z: 1005.8734130859375},
        {x: 3488.95849609375, y: 1257.8818359375, z: 1003.8023071289062},
        {x: 3313.521728515625, y: 1095.2508544921875, z: 932.124755859375},
        {x: 3266.412109375, y: 1085.840576171875, z: 957.7787475585938}
    ], 'test')
```

## markers
- Basically finished package, except that it doesn't save the markers anywhere.
- Replace `MY RESOURCE PATH` with your resource path to install.
- Press F2 to open and use.


### There are a couple more that were not included here because they are highly, highly WIP.