import { champRow } from "../table.interface";
import { TotalChampStats } from "../../../api/players/player.interface";
import { Box } from "@mui/material";
import "./championDetail.css";

export function MatchDateCell({
  date,
  matchId,
  matchNavigateFunction = () => {},
}: {
  date: number;
  matchId: string;
  matchNavigateFunction?: (id: string) => void;
}) {
  const stringDate = new Date(Number(date)).toLocaleDateString();

  function handleClick() {
    matchNavigateFunction(matchId);
  }

  return (
    <div id="matchDateCell">
      <Box
        component="span"
        sx={{
          backgroundColor: "rgb(205,127,50)",
          borderRadius: "0.25rem",
          color: "#fff",
          p: "0.25rem",
          cursor: "pointer",
        }}
        onClick={handleClick}
      >
        {stringDate}
      </Box>
    </div>
  );
}

export function PerMinuteLabelCell({ label }: { label: string }) {
  return (
    <div className="perMinuteLabelCell">
      <div>{label}</div>
      <div className="perMinute">/min</div>
    </div>
  );
}

const MULTIKILL_NAME_MAP: { [key: number]: keyof TotalChampStats } = {
  2: "doublekills",
  3: "triplekills",
  4: "quadrakills",
  5: "pentakills",
};

export default function ChampionDetail({
  champData,
  navigateFunction,
}: {
  champData: champRow;
  navigateFunction: (matchId: string) => void;
}) {
  let biggestMultikillText = champData.highs.biggestMultikill.value.toString();
  const biggestMultikillName =
    champData.highs.biggestMultikill.value > 1
      ? MULTIKILL_NAME_MAP[
          champData.highs.biggestMultikill.value as 2 | 3 | 4 | 5
        ]
      : "";
  champData.totalStats;
  if (biggestMultikillName) {
    const highestMultkillOccurrences =
      champData.totalStats[biggestMultikillName];
    biggestMultikillText = `${biggestMultikillText} (x${highestMultkillOccurrences})`;
  }

  return (
    <div id="champDetailMain">
      <div id="picRow">
        <h1 id="champTitle"> {champData.champName}</h1>
        <img
          id="champPic"
          src={`static://assets/champion/${champData.champName}_0.jpg`}
        ></img>
        <div id="picStatsRow">
          <div id="wlRow">
            <h3>W: {champData.wins}</h3>
            <h3>L: {champData.losses}</h3>
            <h3>WR: {Number(champData.winRate).toFixed(0)}%</h3>
            <h3>KDA: {Number(champData.stats.kda).toFixed(2)}</h3>
          </div>
        </div>
      </div>
      <div id="statsRow">
        <table className="champStatsTable" id="perGameStats">
          <thead>
            <tr>
              <th className="textHeader">KDA</th>
              <th className="numberCell">Per Game</th>
              <th className="numberCell">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Kills</td>
              <td className="numberCell">
                {Number(champData.stats.killsPerGame).toFixed(1)}
              </td>
              <td className="numberCell">{champData.totalStats.totalKills}</td>
            </tr>
            <tr>
              <td>Deaths</td>
              <td className="numberCell">
                {Number(champData.stats.deathsPerGame).toFixed(1)}
              </td>
              <td className="numberCell">{champData.totalStats.totalDeaths}</td>
            </tr>
            <tr>
              <td>Assists</td>
              <td className="numberCell">
                {Number(champData.stats.assistsPerGame).toFixed(1)}
              </td>
              <td className="numberCell">
                {champData.totalStats.totalAssists}
              </td>
            </tr>
          </tbody>
        </table>
        <table className="champStatsTable" id="damageStats">
          <thead>
            <tr>
              <th className="textHeader">Damage</th>
              <th className="numberCell">Per Minute</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Enemy Champions</td>
              <td className="numberCell">
                {Number(champData.stats.damagePerMinute).toFixed(1)}
              </td>
              <td className="numberCell">{champData.totalStats.totalDamage}</td>
            </tr>
            <tr>
              <td>Objectives</td>
              <td className="numberCell">
                {Number(champData.stats.objectiveDamagePerMinute).toFixed(1)}
              </td>
              <td className="numberCell">
                {champData.totalStats.totalObjectiveDamage}
              </td>
            </tr>
            <tr>
              <td>Taken</td>
              <td className="numberCell">
                {Number(champData.stats.damageTakenPerMinute).toFixed(1)}
              </td>
              <td className="numberCell">
                {champData.totalStats.totalDamageTaken}
              </td>
            </tr>
            <tr>
              <td>Self Mitigated</td>
              <td className="numberCell">
                {Number(champData.stats.selfMitigatedPerMinute).toFixed(1)}
              </td>
              <td className="numberCell">
                {champData.totalStats.totalSelfMitigated}
              </td>
            </tr>
          </tbody>
        </table>
        <table className="champStatsTable" id="perMinuteStats">
          <thead>
            <tr>
              <th className="textHeader">Stats</th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Gold</td>
              <td className="numberCell">
                {Number(champData.stats.goldPerMinute).toFixed(1)}
              </td>
              <td className="numberCell">{champData.totalStats.totalGold}</td>
            </tr>
            <tr>
              <td>Healing</td>
              <td className="numberCell">
                {Number(champData.stats.healingPerMinute).toFixed(1)}
              </td>
              <td className="numberCell">
                {champData.totalStats.totalHealing}
              </td>
            </tr>
            <tr>
              <td>Shielding</td>
              <td className="numberCell">
                {Number(champData.stats.shieldingPerMinute).toFixed(1)}
              </td>
              <td className="numberCell">
                {champData.totalStats.totalShielding}
              </td>
            </tr>
            <tr>
              <td>CC Time</td>
              <td className="numberCell">
                {Number(champData.stats.ccPerMinute).toFixed(1)}
              </td>
              <td className="numberCell">{champData.totalStats.totalCCTime}</td>
            </tr>
          </tbody>
        </table>
        <table className="champStatsTable" id="percentageStats">
          <thead>
            <tr>
              <th className="textHeader">Team Shares</th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Damage Share</td>
              <td className="numberCell">
                {Number(champData.stats.damageShare * 100).toFixed(1)}%
              </td>
              <td></td>
            </tr>
            <tr>
              <td>Gold Share</td>
              <td className="numberCell">
                {Number(champData.stats.goldShare * 100).toFixed(1)}%
              </td>
              <td></td>
            </tr>
            <tr>
              <td>Kill Participation</td>
              <td className="numberCell">
                {Number(champData.stats.killParticipation * 100).toFixed(1)}%
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div id="highlightsRow">
        <div id="gameHighsTitle">Game Highs</div>
        <table id="highlightsTable">
          <thead>
            <tr>
              <th></th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Kills</td>
              <td className="numberCell">
                {Number(champData.highs.mostKills.value)}
              </td>
              <td>
                <MatchDateCell
                  date={champData.highs.mostKills.date}
                  matchNavigateFunction={navigateFunction}
                  matchId={champData.highs.mostKills.matchId}
                />
              </td>
            </tr>
            <tr>
              <td>Deaths</td>
              <td className="numberCell">
                {Number(champData.highs.mostDeaths.value)}
              </td>
              <td>
                <MatchDateCell
                  date={champData.highs.mostDeaths.date}
                  matchNavigateFunction={navigateFunction}
                  matchId={champData.highs.mostDeaths.matchId}
                />
              </td>
            </tr>
            <tr>
              <td>Assists</td>
              <td className="numberCell">
                {Number(champData.highs.mostAssists.value)}
              </td>
              <td>
                <MatchDateCell
                  date={champData.highs.mostAssists.date}
                  matchNavigateFunction={navigateFunction}
                  matchId={champData.highs.mostAssists.matchId}
                />
              </td>
            </tr>
            <tr>
              <td>
                <PerMinuteLabelCell label="Damage" />
              </td>
              <td className="numberCell">
                {Number(champData.highs.mostDamage.value).toFixed(0)}
              </td>
              <td>
                <MatchDateCell
                  date={champData.highs.mostDamage.date}
                  matchNavigateFunction={navigateFunction}
                  matchId={champData.highs.mostDamage.matchId}
                />
              </td>
            </tr>
            <tr>
              <td>Total Damage</td>
              <td className="numberCell">
                {Number(champData.highs.mostTotalDamage.value).toFixed(0)}
              </td>
              <td>
                <MatchDateCell
                  date={champData.highs.mostTotalDamage.date}
                  matchNavigateFunction={navigateFunction}
                  matchId={champData.highs.mostTotalDamage.matchId}
                />
              </td>
            </tr>
            <tr>
              <td>
                <PerMinuteLabelCell label="Damage Taken" />
              </td>
              <td className="numberCell">
                {Number(champData.highs.mostDamageTaken.value).toFixed(0)}
              </td>
              <td>
                <MatchDateCell
                  date={champData.highs.mostDamageTaken.date}
                  matchNavigateFunction={navigateFunction}
                  matchId={champData.highs.mostDamageTaken.matchId}
                />
              </td>
            </tr>
            <tr>
              <td>
                <PerMinuteLabelCell label="Healing" />
              </td>
              <td className="numberCell">
                {Number(champData.highs.mostHealing.value).toFixed(0)}
              </td>
              <td>
                <MatchDateCell
                  date={champData.highs.mostHealing.date}
                  matchNavigateFunction={navigateFunction}
                  matchId={champData.highs.mostHealing.matchId}
                />
              </td>
            </tr>
            <tr>
              <td>
                <PerMinuteLabelCell label="Shielding" />
              </td>
              <td className="numberCell">
                {Number(champData.highs.mostShielding.value).toFixed(0)}
              </td>
              <td>
                <MatchDateCell
                  date={champData.highs.mostShielding.date}
                  matchNavigateFunction={navigateFunction}
                  matchId={champData.highs.mostShielding.matchId}
                />
              </td>
            </tr>
            <tr>
              <td>CC Time</td>
              <td className="numberCell">
                {Number(champData.highs.mostTotalCCTime.value).toFixed(0)}
              </td>
              <td>
                <MatchDateCell
                  date={champData.highs.mostTotalCCTime.date}
                  matchNavigateFunction={navigateFunction}
                  matchId={champData.highs.mostTotalCCTime.matchId}
                />
              </td>
            </tr>
            <tr>
              <td>
                <PerMinuteLabelCell label="Gold" />
              </td>
              <td className="numberCell">
                {Number(champData.highs.mostGold.value).toFixed(0)}
              </td>
              <td>
                <MatchDateCell
                  date={champData.highs.mostGold.date}
                  matchNavigateFunction={navigateFunction}
                  matchId={champData.highs.mostGold.matchId}
                />
              </td>
            </tr>
            <tr>
              <td>CS</td>
              <td className="numberCell">
                {Number(champData.highs.mostTotalCS.value).toFixed(0)}
              </td>
              <td>
                <MatchDateCell
                  date={champData.highs.mostTotalCS.date}
                  matchNavigateFunction={navigateFunction}
                  matchId={champData.highs.mostTotalCS.matchId}
                />
              </td>
            </tr>
            <tr>
              <td>Damage Share</td>
              <td className="numberCell">
                {Number(champData.highs.mostDamageShare.value * 100).toFixed(1)}
                %
              </td>
              <td>
                <MatchDateCell
                  date={champData.highs.mostDamageShare.date}
                  matchNavigateFunction={navigateFunction}
                  matchId={champData.highs.mostDamageShare.matchId}
                />
              </td>
            </tr>
            <tr>
              <td>Gold Share</td>
              <td className="numberCell">
                {Number(champData.highs.mostGoldShare.value * 100).toFixed(1)}%
              </td>
              <td>
                <MatchDateCell
                  date={champData.highs.mostGoldShare.date}
                  matchNavigateFunction={navigateFunction}
                  matchId={champData.highs.mostGoldShare.matchId}
                />
              </td>
            </tr>
            <tr>
              <td>Critical Strike</td>
              <td className="numberCell">
                {Number(champData.highs.biggestCrit.value)}
              </td>
              <td>
                <MatchDateCell
                  date={champData.highs.biggestCrit.date}
                  matchNavigateFunction={navigateFunction}
                  matchId={champData.highs.biggestCrit.matchId}
                />
              </td>
            </tr>
            <tr>
              <td>Killing Spree</td>
              <td className="numberCell">
                {Number(champData.highs.biggestKillingSpree.value)}
              </td>
              <td>
                <MatchDateCell
                  date={champData.highs.biggestKillingSpree.date}
                  matchNavigateFunction={navigateFunction}
                  matchId={champData.highs.biggestKillingSpree.matchId}
                />
              </td>
            </tr>
            <tr>
              <td>Multikill</td>
              <td className="numberCell">{biggestMultikillText}</td>
              <td>
                <MatchDateCell
                  date={champData.highs.biggestMultikill.date}
                  matchNavigateFunction={navigateFunction}
                  matchId={champData.highs.biggestMultikill.matchId}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div id="matchHistoryRow">Match History</div>
    </div>
  );
}
