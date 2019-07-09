# How to set up the server
These steps will guide you in getting the server up and running. If you just try to run it right now, it won't work. You should be well versed in running a JC3MP server and installing packages before continuing. If you do not know how to do these things, please check out the links below:
- [How to create a JC3MP server](https://steamcommunity.com/sharedfiles/filedetails/?id=1094953641)
- [Slightly outdated, but still relevant video guide on setting up a server](https://www.youtube.com/watch?v=ZYX_ixGmrqA&t=0s&index=5&list=PLuIwpfh4OKaX3rzC2S1E7kcS9rU-592VP)
- [Video guide on how to install packages](https://www.youtube.com/watch?v=bFEyHj8UxII&t=0s&index=4&list=PLuIwpfh4OKaX3rzC2S1E7kcS9rU-592VP)


## Essential Steps
These steps are essential to getting the server up and running.

1. Copy all packages from `packages` to your own packages directory.

2. Run `npm i` in the following packages:
- backup
- character
- discord-bot
- friends
- inventory
- itemuse
- loot
- tutorial
- vehicles
- watchlist

4. Upload all the files within `resources` to some host IP or website. You should be able to access them by going to `my_host_ip/resources/...`.

5. Change all references to `MY RESOURCE PATH` to your own host IP or website.

6. Inside `resource/client_package/package.json`, add your resource path (where you hosted the resources) to the `"websites"` section so that your resources can be whitelisted.

7. Change all channel, server, and role ids in the `discord-bot` package to your own.
8. Survival Island packages use MySQL as their database of choice. You'll need to install MySQL and (highly recommended) MySQL Workbench.

    1. Install MySQL on your Windows computer. We use version `5.17.18`, but you can use another close version, like `5.7.24`. Download it from [here](https://dev.mysql.com/downloads/installer/) under "Looking for previous GA versions?". Make sure to install the MySQL Workbench as well, because that allows you to remotely manage the database. Make sure to write down your database name, username, and password.
    2. Install MySQL on your server's environment. We're going to assume that you are using a Linux environment for this. You can follow [this](https://support.rackspace.com/how-to/installing-mysql-server-on-ubuntu/) guide for setting it up. Make sure to create a user with the same credentials as you did in step 1 so that you can connect to your database.

9.  Take your database name, username, and password from step 8 and insert it into `packages/character/config.js`. This will allow various packages on the server to connect to the database so they can store and retrieve information.
10. Add yourself as an Admin by adding an entry into `packages/character/events/tags.js`. You can see a few example nametags there as well. Feel free to add whatever kinds of nametags you want there. Only players with the tags `Admin` or `Mod` receive special privileges.

## Optional Steps
1. Change all loading tips within `packages/load/client_package/ui/script.js` to your own tips, including Steam groups and Discord servers.
2. Change the URL inside of `packages/discord-integration/client_package/main.js` on line 18 to your own Discord invite link. This will make your own server pop up when you press F4.
3. Change the `BETA` text at the bottom of the screen to something else by changing the text in `packages/events-status/client_package/ui/index.html`.
4. Change all the text and graphics that point to Survival Island in the `load` package and `character` package to your own title and graphics.
