const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const rooms = new Map();

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const parsedMessage = JSON.parse(message);
        let exist;
        let { type, room, content, user } = parsedMessage;
        console.log(`(${room}) ${user}[${type}]: ${content}`)

        if (type === 'join') {
            if (!rooms.has(room)) {
                rooms.set(room, new Set());
            }
            const clients = rooms.get(room);
            clients.forEach(client => exist = client.user);
            if (clients.size > 1 || clients.size === 1 && exist === user) { // 방 입장시 이미 있을떄
                content = "이미 존재하는 이름입니다."
                console.log(`(${room}) ${user}[Err]: ${clients.size > 1 ? "Already exists" : "Role duplication"}`)
                ws.send(JSON.stringify({ type: 'err', room, content, user }));
            } else {
                rooms.get(room).add(ws);
                ws.room = room;
                ws.user = user;
                console.log(`(${room}) ${user} joined`);
                if (clients) {
                    clients.forEach(client => {
                        if (client !== ws) {
                            ws.send(JSON.stringify({ type: 'message', room, content, user }));
                        }
                    });
                }
            }
        } else if (type === 'message') {
            const clients = rooms.get(room);
            if (clients) {
                clients.forEach(client => {
                    if (client !== ws) {
                        client.send(JSON.stringify({ type: 'message', room, content, user }));
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
                        client.send(JSON.stringify({ type: 'leave', room, user }));
                    }
                });
            }
            rooms.get(room).delete(ws);
            console.log(`(${room}) ${user} leaved`);
        }
    });
});

server.listen(8080, () => {
    console.log('WebSocket 서버가 ws://203.234.62.169:8080 에서 실행 중입니다.');
});
