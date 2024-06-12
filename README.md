# ARAM Analyzer

Electron application to explore a player's ARAM stats.

**WIP**

### Showcase

View stats per champion and sort by a variety of different parameters:
![aram-championpage](https://github.com/hsaito18/aram-analyzer/assets/69827236/7cdf988a-c011-4399-b89b-2f1c7507291e)

View player's overall performance and shared win rate with teammates:
![aram-playerpage](https://github.com/hsaito18/aram-analyzer/assets/69827236/358719c2-9e4f-4672-b9e8-da4bc15f9cc5)

Please note that the application requires a Riot Games API key that is not included in this repo.
Once you have acquired your Riot Games API key, create a directory inside config named API_KEY and create a file inside named apiConfig.ts

Inside apiConfig.ts, write `export const RIOT_API_KEY = "{YOUR_API_KEY}";`.
