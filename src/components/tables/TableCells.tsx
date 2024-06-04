import { Box } from "@mui/material";
import "./championTable.css";

export function StandardCell({ cell }: { cell: any }) {
  return (
    <Box
      component="span"
      sx={(theme) => ({
        display: "flex",
        justifyContent: "center",
        width: "100%",
        fontSize: "1.2rem",
      })}
    >
      {cell.getValue()}
    </Box>
  );
}

export function PerGameCell({ cell }: { cell: any }) {
  return (
    <Box
      component="span"
      sx={(theme) => ({
        display: "flex",
        justifyContent: "center",
        alignItems: "baseline",
        width: "100%",
        fontSize: "1.2rem",
      })}
    >
      <div>{cell.getValue()}</div>
      <div style={{ fontSize: "0.8rem" }}>/game</div>
    </Box>
  );
}

export function PerMinuteCell({ cell }: { cell: any }) {
  return (
    <Box
      component="span"
      sx={(theme) => ({
        display: "flex",
        justifyContent: "center",
        alignItems: "baseline",
        width: "100%",
        fontSize: "1.2rem",
      })}
    >
      <div>{cell.getValue()}</div>
      <div style={{ fontSize: "0.8rem" }}>/min</div>
    </Box>
  );
}

export function PercentageCell({ cell }: { cell: any }) {
  return (
    <Box
      component="span"
      sx={(theme) => ({
        display: "flex",
        justifyContent: "center",
        alignItems: "baseline",
        width: "100%",
        fontSize: "1.2rem",
      })}
    >
      <div>{cell.getValue()}</div>
      <div style={{ fontSize: "0.8rem" }}>%</div>
    </Box>
  );
}

export function ChampionNameCell({ cell }: { cell: any }) {
  return (
    <Box
      component="span"
      sx={(theme) => ({
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        width: "100%",
        fontSize: "1.2rem",
      })}
    >
      <div
        style={{
          width: "2rem",
          height: "2rem",
          overflow: "hidden", // This will crop the image
          borderRadius: "50%",
          borderStyle: "solid",
          borderWidth: "1px",
          marginRight: "4px",
        }}
      >
        <img
          src={`static://assets/champion_icons/${cell.row.original.champName}.jpg`}
          alt={cell.row.original.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            transform: "scale(1.2)", // This will zoom into the image
          }}
        />
      </div>
      <div>{cell.row.original.champName}</div>
    </Box>
  );
}
