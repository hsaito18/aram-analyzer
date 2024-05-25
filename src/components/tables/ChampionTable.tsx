import { useMemo, useState, useEffect } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";
import { Box, Typography } from "@mui/material";
import ChampionDetail from "./championDetail/ChampionDetail";
import { champRow } from "./table.interface";
import "./championTable.css";

const ChampionTable = () => {
  const [data, setData] = useState<champRow[]>([]);
  useEffect(() => {
    playerAPI.onTableChampStats("champTableData", (newData: champRow[]) => {
      setData(newData);
    });

    return () => {
      playerAPI.onTableChampStats("champTableData", () => {}); // remove listener
    };
  }, []);

  //should be memoized or stable
  const columns = useMemo<MRT_ColumnDef<champRow>[]>(
    () => [
      {
        accessorKey: "champName", //access nested data with dot notation
        header: "Champion",
        size: 150,
      },
      {
        id: "games",
        header: "Win Rates",
        columns: [
          {
            accessorKey: "wins",
            header: "Wins",
            size: 50,
          },
          {
            accessorKey: "losses", //normal accessorKey
            header: "Losses",
            size: 50,
          },
          {
            accessorFn: (row) => `${Number(row.winRate).toFixed(0)}`,
            header: "Win Rate",
            size: 50,
          },
        ],
      },
      {
        id: "perGame",
        header: "Per Game",
        columns: [
          {
            accessorFn: (row) => `${Number(row.stats.killsPerGame).toFixed(1)}`,
            header: "Kills",
            size: 80,
          },
          {
            accessorFn: (row) =>
              `${Number(row.stats.deathsPerGame).toFixed(1)}`,
            header: "Deaths",
            size: 80,
          },
          {
            accessorFn: (row) =>
              `${Number(row.stats.assistsPerGame).toFixed(1)}`,
            header: "Assists",
            size: 80,
          },
        ],
      },
      {
        id: "perMinute",
        header: "Per Minute",
        columns: [
          {
            accessorFn: (row) =>
              `${Number(row.stats.damagePerMinute).toFixed(0)}`,
            header: "Damage",
            size: 80,
          },
          {
            accessorFn: (row) =>
              `${Number(row.stats.goldPerMinute).toFixed(0)}`,
            header: "Gold",
            size: 80,
          },
        ],
      },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data,
    enablePagination: false,
    renderDetailPanel: ({ row }) => (
      <div id="detailBoxContainer">
        <ChampionDetail champData={row.original} />
      </div>
    ),
  });

  return <MaterialReactTable table={table} />;
};

export default ChampionTable;
