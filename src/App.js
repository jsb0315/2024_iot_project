import './App.css';

import React, { useState, useEffect, useRef } from 'react';
import CreateCode from './menu/CreateCode.jsx';
import CollapsibleTable from './menu/scoreboard.jsx';
import ConnectComponent from './components/connected.jsx';
import './wall.jpg';

function App() {
  const [messages, setMessages] = useState(["Wating..."]);
  console.log(messages);
  const [room, setRoom] = useState("IOT101");
  const [mode, setMode] = useState("");
  const user = "WEB";
  const [isConnected, setIsConnected] = useState(false);  //접속됨
  const [tryConnecting, setConnecting] = useState(false); // 접속 시도중
  const [isCompile, setisCompile] = useState(null);  //컴파일 유무 반환
  const [isVerified, setisVerified] = useState(null);  //검증 성공유무 반환

  const [challenge, setChallenge] = useState(null);
  const ws = useRef(null);
  useEffect(() => {
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  function sendMessage(content, message) {
    if (ws.current) {
      ws.current.send(JSON.stringify({ type: 'message', room, content: content, user, value: message }));
    }
  };

  const joinRoom = () => {
    ws.current = new WebSocket('ws://203.234.62.169:8080');

    ws.current.onopen = () => {
      setConnecting(true);
      ws.current.send(JSON.stringify({ type: 'join', room, content: "connection", user, value: "connected" }));
    };

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'message' || message.type === 'join') {
        setIsConnected(true);
        if (message.content === 'connection') {
          ws.current.send(JSON.stringify({ type: 'message', room, content: "connection", user, value: "connected" }));
        }
        else if (message.content === 'compile') {
          setisCompile(message.value==='True'?true:false)
          setisVerified(null)
        }
        else if (message.content === 'verify') {
          setisVerified(message.value==='True'?true:false)
        }
        setMessages((prevMessages) => [...prevMessages, `${message.user}: ${message.value}`]);
      }
      else if (message.type === 'leave') {
        setIsConnected(false);
        setMessages((prevMessages) => [...prevMessages, `${message.user}: Disconnected`]);
      }
      else if (message.type === 'err') {
        setConnecting(false);
        setIsConnected(false);
        // setMessages(["다시 입력해주세요"]);
        alert(message.value)
      }
    };

    ws.current.onclose = () => {
      setConnecting(false);
      setIsConnected(false);
      console.log('서버 연결이 종료되었습니다.');
    };
  };

  const leaveRoom = () => {
    setConnecting(false);
    setIsConnected(false);
    setMessages(["Wating..."]);
    if (ws.current) {
      ws.current.send(JSON.stringify({ type: 'leave', room, content: "", user, value: "" }));
    }
    ws.current.close();
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="top">
          <h3>Good Arduino</h3>
          <div className='connectinput'>
            <input
              type="text"
              value={room}
              onChange={(e) => tryConnecting ? {} : setRoom(e.target.value)}
              placeholder="Room name"
              />
            <ConnectComponent
              tryConnecting={tryConnecting}
              clickevent={!tryConnecting ? joinRoom : leaveRoom}
              stat={isConnected} />
          </div>
        </div>
        <div className="menu">
          <button className='menuBtn upload' onClick={() => {
            setChallenge(null);
            setisCompile(null);
            setisVerified(null);
            setMode("upload")}}>
              START
          </button>
          <button className='menuBtn scoreboard' onClick={() => {
            setChallenge(null);
            setisCompile(null);
            setisVerified(null);
            setMode("score")}}>
              ScoreBoard
          </button>
          <button className='menuBtn test'>
              MyPage
          </button>
        </div>
          {mode === "upload" &&
            <CreateCode
              room={room}
              isConnected={isConnected}
              isCompile={isCompile}
              isVerified={isVerified}
              setisCompile={setisCompile}
              setisVerified={setisVerified}
              sendMessage={sendMessage}
              setMode={setMode}
              challenge={challenge}
              setChallenge={setChallenge} />}
          {mode === "score" && 
            <CollapsibleTable
              isConnected={isConnected}
              setMode={setMode}
              setChallenge={setChallenge}/>}
      </header>
    </div>
  );
}

export default App;