import { useMemo, useState, useEffect } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from "material-react-table";

const ChampionTable = () => {
  const [data, setData] = useState<object[]>([]);
  useEffect(() => {
    playerAPI.onTableChampStats("champTableData", (newData: any) => {
      setData(newData);
    });

    return () => {
      playerAPI.onTableChampStats("champTableData", () => {}); // remove listener
    };
  }, []);

  //should be memoized or stable
  const columns = useMemo<MRT_ColumnDef<object>[]>(
    () => [
      {
        accessorKey: "champName", //access nested data with dot notation
        header: "Champion",
        size: 150,
      },
      {
        accessorKey: "wins",
        header: "Wins",
        size: 150,
      },
      {
        accessorKey: "losses", //normal accessorKey
        header: "Losses",
        size: 150,
      },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data, //data must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
  });

  return <MaterialReactTable table={table} />;
};

export default ChampionTable;
