import React, { useState, useRef, useEffect } from "react";
import CheckboxItems from "../components/CheckboxItems.jsx";
import RadioItems from "../components/RadioItem.jsx";
import "./CreateCode.css";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import Button from '@mui/material/Button';
import SendIcon from '@mui/icons-material/Send';
import Tooltip from '@mui/material/Tooltip';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import WestIcon from '@mui/icons-material/West';
import IconButton from '@mui/material/IconButton';
import CodeEditor from '../components/codeEditor.jsx';
import CheckSharpIcon from '@mui/icons-material/CheckSharp';
import LoadingButton from '@mui/lab/LoadingButton';
import CloseSharpIcon from '@mui/icons-material/CloseSharp';
import VerifiedSharpIcon from '@mui/icons-material/VerifiedSharp';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { db } from "../firebase.js";
import { doc, setDoc } from 'firebase/firestore';

const items = [
  "LED 소자",
  "PIR 모션센서",
  "기울기 센서",
  "온도 센서",
  "PIR 모션인식센서",
  "CDS 조도 센서",
  "불꽃 센서",
  "초음파 센서",
  "온습도 센서",
  "5V 능동부저",
  "5V 수동부저",
  "10K 포텐쇼미터",
  "적외선 수신기",
  "조이스틱 모듈",
  "사운드 센서",
  "푸시버튼",
];

async function GPT_API(text, type) {
  const response = await fetch("http://203.234.62.169:3001/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      text: text,
      type: type,
    }),
  });
  return await response.json();
}

function CreateCode({ room, isConnected, isCompile, isVerified, setisCompile, setisVerified, sendMessage, setMode, challenge, setChallenge }) {
  const [getList, setList] = useState([]);
  const [pixItems, setItems] = useState([]);
  const [getTopic, setTopic] = useState(null);
  const [getCode, setCode] = useState(null);
  const [getReady, setReady] = useState(false);
  
  const [checkedItems, setCheckedItems] = useState([]);
  
  const [open, setOpen] = React.useState(false);

  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [currenTime, setcurrenTime] = useState("0:00");
  
    
  if (isVerified===true){
    var today = new Date();

    var year = today.getFullYear();
    var month = ('0' + (today.getMonth() + 1)).slice(-2);
    var day = ('0' + today.getDate()).slice(-2);
    var hours = ('0' + today.getHours()).slice(-2); 
    var minutes = ('0' + today.getMinutes()).slice(-2);
    var seconds = ('0' + today.getSeconds()).slice(-2); 
    const formattedTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    const elapsedTime = Date.now() - startTime - 7000;

    if (getList.length){
      let dataRef1 = doc(db, 'Exercise', getTopic.topic);
      setDoc(dataRef1, {
        title: getTopic.topic,
        by: room,
        detail: getTopic.detail,
        supply: pixItems,
        date: formattedTime,
        code: getCode
      })
    }
    console.log(getTopic.topic, room)
    console.log({
      name: room,
      date: formattedTime,
      score: elapsedTime,
      time: currenTime
    })
    let dataRef2 = doc(db, 'Exercise', getTopic.topic, 'users', room)
    setDoc(dataRef2, {
      name: room,
      date: formattedTime,
      score: elapsedTime,
      time: currenTime
    });
  }

  useEffect(() => {
    if (challenge&&!isCompile){
      sendMessage("registration", challenge.code);
      setTopic({topic:challenge.title})
      setCode(challenge.code);
      setChallenge(null);
    }
    if (isRunning){
      const intervalId = setInterval(() => {
        const endTime = Date.now();
        const elapsedTime = endTime - startTime;
        const minutes = Math.floor(elapsedTime / (1000 * 60));
        const seconds = Math.floor((elapsedTime % (1000 * 60)) / 1000);
        setcurrenTime(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }, 1000); // 1초마다 실행
      
      return () => clearInterval(intervalId); // 컴포넌트가 언마운트될 때 clearInterval을 호출하여 타이머 정리
    }
  }, [isRunning, startTime, currenTime, challenge, getCode, isCompile, sendMessage, setChallenge, getTopic]); // startTime이 변경될 때마다 useEffect가 실행되도록 설정

  const handleRadioChange = event => {
    setTopic(JSON.parse(event.target.value));
  };

  const getListBtn = async () => {
    if (!checkedItems.length || !isConnected){
      setOpen(true)
      return
    }
    swiperRef.current.slideNext()
    setList([]);
    setItems(checkedItems);
    GPT_API(`- [준비물]: ${checkedItems.join(" 1개, ") + " 1개"}`, true).then(
      res => {
        console.log(res["ans"]);
        setList(JSON.parse(res["ans"]));
      }
    );
  };
  const getCodeBtn = async () => {
    swiperRef.current.slideNext()
    setisVerified(null)
    setReady(false)
    setCode(null);
    setisCompile(null)
    GPT_API(
      `- [준비물]: ${pixItems.join(" 1개, ") + " 1개"}
- [주제]: ${getTopic.topic}
- [내용]: ${getTopic.detail}`,
      false
    ).then(res => {
      console.log(res);
      setCode(res["ans"]);
      sendMessage("registration", res["ans"])
    });
  };

  const handleChip = (item) => {
    if (checkedItems.includes(item)) {
      setCheckedItems(checkedItems.filter((i) => i !== item));
    } else {
      setCheckedItems([...checkedItems, item]);
    }
  };

  const swiperRef = useRef();

  const handleStartTimer = () => {
    setIsRunning(true);
    setStartTime(Date.now());
  };

  const handleStopTimer = () => {
    setisVerified("wait")
    setIsRunning(false);
    sendMessage("verify", "");
  };

  return (
    <div className="codecreate">
      <div className="close">
        <IconButton onClick={() => setMode("")} size="small">
          <CloseSharpIcon />
        </IconButton>
      </div>
      <Swiper
        onSwiper={swiper => {
          swiperRef.current = swiper;
          if (challenge){
            swiperRef.current.slideNext();
            swiperRef.current.slideNext();
          }
        }}
        className="mySwiper"
        touchRatio={0}
      >
        <SwiperSlide>
          <div className="page">
            준비물 고르기
            <CheckboxItems
              items={items}
              checkedItems={checkedItems}
              handleChip={handleChip}
            />
            <div className="nextbtn1">
              <ClickAwayListener onClickAway={() => setOpen(false)}>
                <Tooltip
                  title={
                    !isConnected
                      ? "아두이노에 연결해주세요!"
                      : "센서를 선택해주세요!"
                  }
                  onClose={() => setOpen(false)}
                  open={open}
                >
                  <span onClick={getListBtn}>
                    <Button
                      variant={!isConnected ? "outlined" : "contained"}
                      endIcon={<SendIcon />}
                      disabled={!checkedItems.length || !isConnected}
                      size="small"
                    >
                      Get List
                    </Button>
                  </span>
                </Tooltip>
              </ClickAwayListener>
            </div>
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div className="page">
            주제 확인
            <RadioItems
              items={items}
              getList={getList}
              getTopic={getTopic}
              handleRadioChange={handleRadioChange}
            />
            <div className="nextbtn2">
              <IconButton
                color="delete"
                variant="contained"
                onClick={() => swiperRef.current.slidePrev()}
              >
                <WestIcon />
              </IconButton>
              <Button
                size="small"
                variant={!isConnected ? "outlined" : "contained"}
                endIcon={<SendIcon />}
                disabled={!getTopic}
                onClick={getCodeBtn}
              >
                START!
              </Button>
            </div>
          </div>
        </SwiperSlide>

        <SwiperSlide>
          <div className="codeCont">
            <div className={`codeblur ${!getReady && "blur"}`}>
              <CodeEditor code={getCode} />
            </div>
            {!getReady ? (
              <div className="loadingbtn">
                <LoadingButton
                  size="large"
                  variant="contained"
                  endIcon={<CheckSharpIcon />}
                  loading={isCompile===null}
                  disabled={!isConnected}
                  loadingPosition="end"
                  onClick={() => {
                    if (isCompile===false){
                      swiperRef.current.slidePrev();
                    }
                    else{
                    handleStartTimer();
                    setReady(true);
                    }
                  }}>
                  <span>
                    {!getCode
                      ? "Generating Code.."
                      : isCompile === null
                      ? "Compiling code..."
                      : isCompile ? "Ready?" : "Failed to Compile"}
                  </span>
                </LoadingButton>
              </div>
            ) : (
              <div className="verifybtn">
                <LoadingButton
                  variant="contained"
                  endIcon={<VerifiedSharpIcon />}
                  loading={isVerified==="wait"}
                  disabled={!isConnected}
                  loadingPosition="end"
                  onClick={(typeof isVerified === 'boolean') ? ()=>{} : handleStopTimer}>
                  <span>
                    {isVerified===null
                      ? "VERIFY"
                      : isVerified==="wait"
                      ? "VERIFING..."
                      : isVerified ? "COMPLETE!" : "FAIL..."}
                  </span>
                </LoadingButton>
              </div>
            )}
            {isVerified===true&&(<Alert severity="success">
              <AlertTitle>COMPLETE!</AlertTitle>
               축하합니다! {currenTime} 만에 성공했네요!
            </Alert>)}
            {isVerified===false&&(<Alert severity="error">
              <AlertTitle>FAIL</AlertTitle>
              아쉽게도 실패했습니다.. 분발하도록
            </Alert>)}
          </div>
        </SwiperSlide>
      </Swiper>
      {/* <p>{currenTime}</p>
      <button onClick={handleStartTimer} disabled={isRunning}>
        Start Timer
      </button>
      <button onClick={handleStopTimer} disabled={!isRunning}>
        Stop Timer
      </button>
      <button onClick={() => swiperRef.current.slidePrev()}>
        Go to Prev Slide
      </button>
      <button onClick={() => swiperRef.current.slideNext()}>
        Go to Next Slide
      </button> */}
    </div>
  );
}

export default CreateCode;
