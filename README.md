# Hadeswap Sales Bot
Works for both Discord and Twitter.

___

### Setup:
1. Create .env file, or add Environmental Variables on your hosting. Necessary ENVs:
    > - process.env.PORT - application creates a simple Express.js server to host generated banners. We need to get port that app will work on.
    > - process.env.MAINNET_URL - Solana Mainnet RPC url.
    > - process.env.STARTING_SIGNATURE - the first Hadeswap transaction that you want the bot to start from.
    > - process.env.GUILD_ID - ID of the server that you want the bot to forward transaction alerts to.
    > - process.env.CHANNEL_ID - ID of the channel that you want the bot to forward transaction alerts to. The channel **has to be on the server, ID of which you added as GUILD_ID**.
    > - process.env.TOKEN - Discord Bot Token
    > - process.env.CONSUMER_KEY - Twitter API Key
    > - process.env.CONSUMER_SECRET - Twitter API Key Secret
    > - process.env.ACCESS_TOKEN - Twitter Bot Access Token
    > - process.env.ACCESS_SECRET - Twitter Bot Access Secret
    > - process.env.DOMAIN - Domain under which your app is hosted. All generated banners will be hosted under this domain in /static directory.
2. Do not change anything in yarn commands. Some of these commands copy static files to the build folder, so dynamic banners are generated without fetching files from external sources.