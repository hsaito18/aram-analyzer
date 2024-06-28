import { Box } from "@mui/material";
import "./matchHistoryShort.css";

export default function MatchHistoryShort({
  participant,
  matchId,
  matchNavigateFunction = () => {},
}: {
  participant: any;
  matchId: string;
  matchNavigateFunction?: (id: string) => void;
}) {
  function handleClick() {
    matchNavigateFunction(matchId);
  }
  const dateObj = new Date(Number(participant.gameCreationTime));
  const stringDate = dateObj.toLocaleDateString();
  const stringTime = dateObj.toLocaleString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const stringDuration = matchTimeFormatter(participant.gameDuration);

  function matchTimeFormatter(seconds: number, roundToSeconds = true): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = roundToSeconds
      ? Number(Number(seconds % 60).toFixed(0))
      : seconds % 60;
    return `${minutes}m ${
      remainingSeconds < 10 ? "0" : ""
    }${remainingSeconds}s`;
  }

  function statFormatter(stat: number): string {
    const thousands = Math.floor(stat / 1000);
    return thousands > 0 ? `${thousands}k` : `${stat}`;
  }

  return (
    <div>
      <Box
        onClick={handleClick}
        className="matchHistoryShortGrid"
        sx={{ backgroundColor: participant.win ? "lightblue" : "salmon" }}
      >
        <div className="matchHistoryChampIcon">
          <img
            className="championIcon"
            src={`static://assets/champion_icons/${participant.championName}.jpg`}
          ></img>
        </div>

        <div className="matchHistoryChampSpells">
          <img
            className="matchHistorySpellIcon"
            src={`static://assets/summoner_spells/${participant.spell1}.png`}
          />
          <img
            className="matchHistorySpellIcon"
            src={`static://assets/summoner_spells/${participant.spell2}.png`}
          />
        </div>
        <div className="matchHistoryKDA">
          {participant.kills}/{participant.deaths}/{participant.assists}
        </div>
        <div className="matchHistoryChampStats">
          <div className="champDamage champStat">
            <div className="matchHistoryDamageIcon">
              <img
                className="matchHistoryShortIcon"
                src="static://assets/match/icon_damage.png"
              />
            </div>
            {statFormatter(participant.damage)}
          </div>
          <div className="champGold champStat">
            <div className="matchHistoryGoldIcon">
              <img
                className="matchHistoryShortIcon"
                src="static://assets/match/icon_gold_single.png"
              />
            </div>
            {statFormatter(participant.gold)}
          </div>
        </div>
        <div className="matchHistoryItems">
          {participant.items.map((item: any, index: number) => (
            <img
              key={item.id}
              className="matchHistoryItemIcon"
              src={`static://assets/item/${item.imageUrl}.png`}
            ></img>
          ))}
        </div>

        <div className="matchHistoryInfo">
          <div className="matchHistoryDate">{stringDate}</div>
          <div className="matchHistoryTime">{stringTime}</div>
        </div>
        <div className="matchHistoryDuration">
          <div className="matchHistoryDuration">{stringDuration}</div>
        </div>
      </Box>
    </div>
  );
}
