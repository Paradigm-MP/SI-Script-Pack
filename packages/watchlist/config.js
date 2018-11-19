module.exports =
{
    autoban: false, // If true, then players will automatically be banned according to the config below
    bans:
    {
        auto:
        {
            5: 7, // 5 strikes = 7 day ban
            10: 14,
            15: 21,
            20: "Forever"
        }
    }
}