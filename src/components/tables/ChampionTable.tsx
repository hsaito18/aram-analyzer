import { useMemo, useState, useEffect } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
  MRT_GlobalFilterTextField,
  MRT_ShowHideColumnsButton,
} from "material-react-table";
import { Box, lighten } from "@mui/material";
import ChampionDetail from "./championDetail/ChampionDetail";
import { champRow } from "./table.interface";
import {
  StandardCell,
  PerGameCell,
  PerMinuteCell,
  PercentageCell,
  ChampionNameCell,
} from "./TableCells";
import "./championTable.css";

const allColumns = [
  {
    accessorKey: "champName", //access nested data with dot notation
    header: "Champion",
    size: 125,
    visibleInShowHideMenu: false,
    enableHiding: false,
    Cell: ChampionNameCell,
  },
  {
    accessorKey: "wins",
    header: "Wins",
    size: 100,
    grow: false,
    Cell: StandardCell,
  },
  {
    accessorKey: "losses",
    header: "Losses",
    size: 100,
    Cell: StandardCell,
  },

  {
    accessorFn: (row: champRow) => `${Number(row.winRate).toFixed(0)}`,
    header: "Win Rate",
    size: 100,
    grow: false,
    Cell: PercentageCell,
  },
  {
    accessorFn: (row: champRow) =>
      `${Number(row.stats.killsPerGame).toFixed(1)}`,
    header: "Kills",
    size: 100,
    Cell: PerGameCell,
  },
  {
    accessorFn: (row: champRow) =>
      `${Number(row.stats.deathsPerGame).toFixed(1)}`,
    header: "Deaths",
    size: 100,
    Cell: PerGameCell,
  },
  {
    accessorFn: (row: champRow) =>
      `${Number(row.stats.assistsPerGame).toFixed(1)}`,
    header: "Assists",
    size: 100,
    Cell: PerGameCell,
  },

  {
    accessorFn: (row: champRow) =>
      `${Number(row.stats.damagePerMinute).toFixed(0)}`,
    header: "Damage",
    size: 125,
    Cell: PerMinuteCell,
  },
  {
    accessorFn: (row: champRow) =>
      `${Number(row.stats.goldPerMinute).toFixed(0)}`,
    header: "Gold",
    size: 100,
    Cell: PerMinuteCell,
  },
  {
    accessorKey: "healing",
    accessorFn: (row: champRow) =>
      `${Number(row.stats.healingPerMinute).toFixed(0)}`,
    header: "Healing",
    size: 100,
    Cell: PerMinuteCell,
  },
  {
    accessorKey: "shielding",
    accessorFn: (row: champRow) =>
      `${Number(row.stats.shieldingPerMinute).toFixed(0)}`,
    header: "Shielding",
    size: 100,
    Cell: PerMinuteCell,
  },
  {
    accessorKey: "ccPerMinute",
    accessorFn: (row: champRow) =>
      `${Number(row.stats.ccPerMinute).toFixed(2)}`,
    header: "CC",
    size: 100,
    Cell: PerMinuteCell,
  },
  {
    accessorKey: "objectiveDamage",
    accessorFn: (row: champRow) =>
      `${Number(row.stats.objectiveDamagePerMinute).toFixed(0)}`,
    header: "Objective Damage",
    size: 100,
    Cell: PerMinuteCell,
  },
  {
    accessorKey: "damageTaken",
    accessorFn: (row: champRow) =>
      `${Number(row.stats.damageTakenPerMinute).toFixed(0)}`,
    header: "Damage Taken",
    size: 100,
    Cell: PerMinuteCell,
  },
  {
    accessorKey: "damageMitigated",
    accessorFn: (row: champRow) =>
      `${Number(row.stats.selfMitigatedPerMinute).toFixed(0)}`,
    header: "Damage Mitigated",
    size: 100,
    Cell: PerMinuteCell,
  },
  {
    accessorKey: "damageShare",
    accessorFn: (row: champRow) =>
      `${Number(row.stats.damageShare * 100).toFixed(1)}`,
    header: "Damage Share",
    size: 100,
    Cell: PercentageCell,
  },
  {
    accessorKey: "goldShare",
    accessorFn: (row: champRow) =>
      `${Number(row.stats.goldShare * 100).toFixed(1)}`,
    header: "Gold Share",
    size: 100,
    Cell: PercentageCell,
  },
  {
    accessorKey: "killParticipation",
    accessorFn: (row: champRow) =>
      `${Number(row.stats.killParticipation * 100).toFixed(1)}`,
    header: "Kill Participation",
    size: 100,
    Cell: PercentageCell,
  },
];

const ChampionTable = () => {
  const [data, setData] = useState<champRow[]>([]);

  useEffect(() => {
    const removeFunc = playerAPI.onTableChampStats(
      "champTableData",
      (newData: champRow[]) => {
        setData(newData);
      }
    );

    return () => {
      removeFunc();
    };
  }, []);

  //should be memoized or stable
  const columns = useMemo<MRT_ColumnDef<champRow>[]>(() => allColumns, []);

  const table = useMaterialReactTable({
    columns,
    data,
    initialState: {
      showGlobalFilter: true,
      pagination: { pageSize: 15, pageIndex: 0 },
      columnVisibility: {
        healing: false,
        shielding: false,
        ccPerMinute: false,
        objectiveDamage: false,
        damageTaken: false,
        damageMitigated: false,
        damageShare: false,
        goldShare: false,
      },
    },
    enableColumnActions: false,
    enableColumnOrdering: true,
    displayColumnDefOptions: {
      "mrt-row-expand": {
        visibleInShowHideMenu: false,
        size: 0,
        grow: false,
      },
    },
    muiTableHeadCellProps: {
      sx: {
        //use the `&` syntax to target nested elements by their class
        "& .Mui-TableHeadCell-Content": {
          justifyContent: "center",
        },
        "& .Mui-TableHeadCell-Content-Labels": {},
        padding: "0.2rem !important",
      },
    },
    muiTableBodyCellProps: {
      sx: {
        padding: "0.2rem !important",
      },
    },
    renderDetailPanel: ({ row }) => (
      <div id="detailBoxContainer">
        <ChampionDetail champData={row.original} />
      </div>
    ),
    renderTopToolbar: () => (
      <Box
        sx={(theme: any) => ({
          backgroundColor: lighten(theme.palette.background.default, 0.05),
          display: "flex",
          gap: "0.5rem",
          p: "8px",
          justifyContent: "space-between",
        })}
      >
        <Box>
          <Box sx={{ display: "flex", gap: "0.5rem" }}>
            <h3>Champion Statistics</h3>
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <MRT_GlobalFilterTextField table={table} />
        </Box>
        <Box sx={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <MRT_ShowHideColumnsButton table={table} />
        </Box>
      </Box>
    ),
  });

  return (
    <div id="tableMain">
      <div className="content">
        {data.length > 0 ? (
          <MaterialReactTable table={table} />
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </div>
  );
};

export default ChampionTable;
