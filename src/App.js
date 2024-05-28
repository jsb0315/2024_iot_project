import logo from './logo.svg';
import './App.css';

import React, { useState, useEffect, useRef } from 'react';
import CreateCode from './CreateCode.js';
import ConnectComponent from './components/connected.jsx';


function App() {
  const [messages, setMessages] = useState(["Wating..."]);
  const [room, setRoom] = useState("IOT101");
  const user = "WEB";
  const [isConnected, setIsConnected] = useState(false);  //접속됨
  const [tryConnecting, setConnecting] = useState(false); // 접속 시도중
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
        <div>
          <h1>WebSocket Chat Client</h1>

          <div>
            <div className='connectinput'>
              <input
                type="text"
                value={room}
                onChange={(e) => tryConnecting ? {} : setRoom(e.target.value)}
                placeholder="Room name"
              />
              <ConnectComponent
                clickevent={!tryConnecting ? joinRoom : leaveRoom}
                stat={isConnected} />
            </div>
            {(tryConnecting) ? (<div>
              {messages.map((msg, index) => (
                <p key={index}>{msg}</p>))}
            </div>
            ) : (<div/>)}
          </div>
        </div>
        <img src={logo} className="App-logo" alt="logo" />

        <CreateCode
          isConnected={isConnected}
          CheckCompile={sendMessage} />

      </header>
    </div>
  );
}

export default App;