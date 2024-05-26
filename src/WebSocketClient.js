import React, { useState, useEffect, useRef } from 'react';

function WebSocketClient({Message}) {
    const [messages, setMessages] = useState(["Wating..."]);
    const [input, setInput] = useState('connected');
    const [room, setRoom] = useState("IOT101");
    const user = "WEB";
    const [isConnected, setIsConnected] = useState(false);
    const ws = useRef(null);
    useEffect(() => {
        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, []);

    const sendMessage = () => {
        if (ws.current) {
            ws.current.send(JSON.stringify({ type: 'message', room, content: input ? input : Message, user }));
            setInput('');
        }
    };

    const joinRoom = () => {
        ws.current = new WebSocket('ws://203.234.62.169:8080');

        ws.current.onopen = () => {
            setIsConnected(true);
            ws.current.send(JSON.stringify({ type: 'join', room, content: "connected", user }));
        };

        ws.current.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'message' || message.type === 'join') {
                if (message.content === 'connected'){
                    ws.current.send(JSON.stringify({ type: 'message', room, content: "connected", user }));
                }
                setMessages((prevMessages) => [...prevMessages, `${message.user}: ${message.content}`]);
            }
            else if (message.type === 'leave') {
                setMessages((prevMessages) => [...prevMessages, `${message.user}: Disconnected`]);
            }
            else if (message.type === 'err'){
                setIsConnected(false);
                // setMessages(["다시 입력해주세요"]);
                alert(message.content)
            }
        };

        ws.current.onclose = () => {
            setIsConnected(false);
            console.log('서버 연결이 종료되었습니다.');
        };
    };

    return (
        <div>
            <h1>WebSocket Chat Client</h1>
            {!isConnected ? (
                <div>
                    <input
                        type="text"
                        value={room}
                        onChange={(e) => setRoom(e.target.value)}
                        placeholder="Room name"
                    />
                    <button onClick={joinRoom}>Join Room</button>
                </div>
            ) : (
                <div>
                    <div>
                        {messages.map((msg, index) => (
                            <p key={index}>{msg}</p>
                        ))}
                    </div>
                    <input
                        type="text"
                        value={Message}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Message"
                    />
                    <button onClick={sendMessage}>Send</button>
                </div>
            )}
        </div>
    );
};

export default WebSocketClient;
