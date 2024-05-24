import React from "react";
import "../main.css";
import Button from "@mui/material/Button";

function testFunc() {
  console.log("Hello world!");
}

export default function Home() {
  return (
    <>
      <Button variant="contained">Hello world</Button>
    </>
  );
}
