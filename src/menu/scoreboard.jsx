import React, { useEffect, useState } from "react";
import {
  Box,
  Collapse,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CloseSharpIcon from "@mui/icons-material/CloseSharp";
import SmartDisplayIcon from '@mui/icons-material/SmartDisplay';
import "./scoreboard.css";

import { db } from "../firebase.js";
import { getDocs, collection  } from 'firebase/firestore';

// const exampleExerciseData = {
//     title: "주제3",
//     by: "IOT101",
//     detail: "내용2",
//     supply: ["LED소자"],
//     date: "2024-06-13 02:01:40",
//     code: "void setup() {     pinMode(13, OUTPUT); } void loop() {     digitalWrite(13, HIGH);     delay(1000);     digitalWrite(13, LOW);     delay(1000); }"
//   };

//   const exampleUserData = {
//     name: "IOT101",
//     date: "2024-06-13 02:01:40",
//     score: 123123,
//     time: "0.01"
//   };

//   const dataRef = doc(db, 'Exercise', exampleExerciseData.title)
//   await setDoc(dataRef, {
//       title: "주제3",
//       by: "IOT102",
//       detail: "내용2",
//       supply: ["LED소자"],
//       date: "2024-06-13 02:01:40",
//       code: "void setup() {     pinMode(13, OUTPUT); } void loop() {     digitalWrite(13, HIGH);     delay(1000);     digitalWrite(13, LOW);     delay(1000); }"
//     })

// const dataRef2 = doc(db, 'Exercise', exampleExerciseData.title, 'users', exampleUserData.name)
// await setDoc(dataRef2, exampleUserData);
// console.log(exampleExerciseData.title, exampleUserData.name)
// console.log(exampleUserData)

    
async function fetchData() {
  const exerciseCollection = collection(db, "Exercise");
  const exerciseSnapshot = await getDocs(exerciseCollection);
  const exerciseList = await Promise.all(
    exerciseSnapshot.docs.map(async doc => {
      const exerciseData = doc.data();
      const usersCollection = collection(db, "Exercise", doc.id, "users");
      const usersSnapshot = await getDocs(usersCollection);
      const usersData = usersSnapshot.docs.map(userDoc => userDoc.data());
      return {
        id: doc.id,
        title: exerciseData.title,
        by: exerciseData.by,
        detail: exerciseData.detail,
        code: exerciseData.code,
        supply: exerciseData.supply,
        date: exerciseData.date,
        users: usersData,
      };
    })
  );
  return exerciseList;
}

function Row({ row, isConnected, setMode, setChallenge }) {
  const [open, setOpen] = React.useState(false);

  return (
    <React.Fragment>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell component="th" scope="row">
          {row.title}
        </TableCell>
        <TableCell align="left">{row.by}</TableCell>
        <TableCell align="left">{row.supply.join(", ")}</TableCell>
        <TableCell align="left">
            <IconButton
                color={"info"}
                aria-label="Run row"
                size="small"
                disabled={!isConnected}
                onClick={() => {
                    setMode("upload");
                    setChallenge({"title":row.title, "code":row.code})
                    }}>
                    <SmartDisplayIcon/>
            </IconButton>
        </TableCell>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography style={{fontSize: "18px", margin: 0, marginTop: "12px"}} gutterBottom component="div">
                History
              </Typography>
              <Table size="small" aria-label="users data">
                <TableHead>
                  <TableRow>
                    <TableCell>Detail</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow key={row.date}>
                      <TableCell>{row.detail}</TableCell>
                      <TableCell>{row.date}</TableCell>
                    </TableRow>
                </TableBody>
              </Table>
              <Typography style={{fontSize: "18px", margin: 0, marginTop: "12px"}} gutterBottom component="div">
                Users' Data
              </Typography>
              <Table size="small" aria-label="users data">
                <TableHead>
                  <TableRow>
                    <TableCell>Users</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.users.map(data => (
                    <TableRow key={data.date}>
                      <TableCell>{data.name}</TableCell>
                      <TableCell>{data.time}</TableCell>
                      <TableCell>{data.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

export default function CollapsibleTable({ isConnected, setMode, setChallenge }) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const getData = async () => {
      const data = await fetchData();
      setRows(data);
    };
    getData();
  }, []);

  return (
    <div className="scoremain">
      <div className="close">
        <IconButton onClick={() => setMode("")} size="small">
          <CloseSharpIcon />
        </IconButton>
      </div>
      <TableContainer component={Paper} sx={{ maxHeight: "calc(100% - 35px)" }}>
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell style={{ fontSize: "18px" }} align="left">Title</TableCell>
              <TableCell style={{ fontSize: "18px" }} align="left">By</TableCell>
              <TableCell style={{ fontSize: "18px" }} align="left">Detail</TableCell>
              <TableCell style={{ fontSize: "18px" }} align="left">Run</TableCell>
              <TableCell style={{ fontSize: "18px" }} align="left" />
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(row => (
              <Row key={row.id} row={row} 
                isConnected={isConnected} 
                setMode={setMode}
                setChallenge={setChallenge}/>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
