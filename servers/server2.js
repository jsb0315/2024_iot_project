const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const rooms = new Map();

let today = new Date();

let year = today.getFullYear();
let month = ('0' + (today.getMonth() + 1)).slice(-2);
let day = ('0' + today.getDate()).slice(-2);
let hours = ('0' + today.getHours()).slice(-2); 
let minutes = ('0' + today.getMinutes()).slice(-2);
let seconds = ('0' + today.getSeconds()).slice(-2); 
let formattedTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

wss.on('connection', (ws, req) => {
    ws.on('message', (message) => {

        const parsedMessage = JSON.parse(message);
        let exist;
        let { type, room, content, user, value } = parsedMessage;
        console.log(`[${formattedTime}] (${room}) ${user}[${type}] ${content} | ${value}`)

        if (type === 'join') {
            if (!rooms.has(room)) {
                rooms.set(room, new Set());
            }
            const clients = rooms.get(room);
            clients.forEach(client => exist = client.user);
            if (clients.size > 1 || clients.size === 1 && exist === user) { // 방 입장시 이미 있을떄
                content = "Err"
                value = "이미 존재하는 이름입니다."
                console.log(`[${formattedTime}] (${room}) ${user}[Err]: ${clients.size > 1 ? "Already exists" : "Role duplication"}`)
                ws.send(JSON.stringify({ type: 'err', room, content, user, value }));
            } else {
                rooms.get(room).add(ws);
                ws.room = room;
                ws.user = user;
                console.log(`[${formattedTime}] (${room}) ${user} joined: ${req.socket.remoteAddress}`);
                if (clients) {
                    clients.forEach(client => {
                        if (client !== ws) {
                            ws.send(JSON.stringify({ type: 'join', room, content, user, value }));
                        }
                    });
                }
            }
        } else if (type === 'message') {
            const clients = rooms.get(room);
            if (clients) {
                clients.forEach(client => {
                    if (client !== ws) {
                        client.send(JSON.stringify({ type: 'message', room, content, user, value }));
                    }
                });
            }
        }
    });

    ws.on('close', () => {
        const { room, user } = ws;
        if (room) {
            const clients = rooms.get(room);
            if (clients) {
                clients.forEach(client => {
                    if (client !== ws) {
                        client.send(JSON.stringify({ type: 'leave', room, content: "", user, value: "" }));
                    }
                });
            }
            rooms.get(room).delete(ws);
            console.log(`[${formattedTime}] (${room}) ${user} leaved`);
        }
    });
});

server.listen(8080, () => {
    console.log('WebSocket 서버가 ws://---:8080 에서 실행 중입니다.');
});
