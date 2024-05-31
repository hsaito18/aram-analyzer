import { champRow } from "../table.interface";
import placeholder from "../../../../public/assets/placeholder.jpg";
import useImage from "../../../hooks/useImage";
import "./championDetail.css";

export default function ChampionDetail({ champData }: { champData: champRow }) {
  const { loading, error, image } = useImage(
    `champion/${champData.champName}_0.jpg`
  );
  return (
    <div id="champDetailMain">
      <div id="picRow">
        <h1 id="champTitle"> {champData.champName}</h1>
        <img id="champPic" src={image}></img>
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
              <th>KDA</th>
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
              <th>Damage</th>
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
              <th>Stats</th>
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
              <th>Team Shares</th>
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
      <div id="highlightsRow">Highlights</div>
      <div id="matchHistoryRow">Match History</div>
    </div>
  );
}
