const express = require('express');
const os = require('os');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const CoupGame = require('./game/coup');
const utilities = require('./utilities/utilities');

// ---------------------------------------------------------------------------
// App / server setup
// ---------------------------------------------------------------------------
const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

const PORT = process.env.PORT || 8000;
const MIN_PLAYERS = 2;
const MAX_PLAYERS = 6;

let namespaces = {}; // roomCode -> CoupGame instance (or null while in lobby)

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getLocalIPs() {
    const interfaces = os.networkInterfaces();
    const ips = [];
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                ips.push(iface.address);
            }
        }
    }
    return ips;
}

// ---------------------------------------------------------------------------
// HTTP routes
// ---------------------------------------------------------------------------
app.get('/health', (req, res) => {
    res.json({ status: 'ok', rooms: Object.keys(namespaces).length });
});

app.get('/createNamespace', (req, res) => {
    let newNamespace = '';
    while (newNamespace === '' || newNamespace in namespaces) {
        newNamespace = utilities.generateNamespace(); // default length 6
    }
    const newSocket = io.of(`/${newNamespace}`);
    openSocket(newSocket, `/${newNamespace}`);
    namespaces[newNamespace] = null;
    console.log(`[room] ${newNamespace} created`);
    res.json({ namespace: newNamespace });
});

app.get('/exists/:namespace', (req, res) => {
    const namespace = req.params.namespace.toUpperCase();
    res.json({ exists: namespace in namespaces });
});

// ---------------------------------------------------------------------------
// Lobby / namespace logic
// ---------------------------------------------------------------------------
function openSocket(gameSocket, namespace) {
    let players = []; // includes vacated slots, kept for index stability
    let partyLeaderName = '';
    let started = false;
    let game = null; // CoupGame instance once started
    const tokenToName = {}; // playerToken -> name, persists for the life of the room

    const updatePartyList = () => {
        const partyMembers = players
            .filter((x) => x.player !== '')
            .map((x) => ({ name: x.player, socketID: x.socket_id, isReady: x.isReady }));
        gameSocket.emit('partyUpdate', partyMembers);
    };

    gameSocket.on('connection', (socket) => {
        players.push({ player: '', socket_id: socket.id, isReady: false });
        const index = players.length - 1;
        console.log(`[room ${namespace}] socket connected (${socket.id}), slot ${index}`);

        socket.on('setName', (rawName, rawToken) => {
            const name = String(rawName || '').trim().slice(0, 12);
            const token = String(rawToken || '').trim().slice(0, 100);

            // Reconnect path: game already started and this token belongs to
            // a player who is already seated at the table.
            if (started && game) {
                const knownName = token && tokenToName[token];
                if (knownName) {
                    players[index].player = knownName;
                    players[index].socket_id = socket.id;
                    const ok = game.reattachPlayer(knownName, socket);
                    if (ok) {
                        socket.emit('joinSuccess', socket.id);
                        socket.emit('rejoinedGame');
                        return;
                    }
                }
                socket.emit('joinFailed', 'game_already_started');
                return;
            }

            if (name === '') {
                socket.emit('joinFailed', 'invalid_name');
                return;
            }

            const existingSlotIndex = players.findIndex((x) => x.player === name);
            let isReclaim = false;
            if (existingSlotIndex !== -1) {
                // If the same token is reclaiming their own name (e.g. a fast
                // page reload where the old socket hasn't been cleaned up
                // yet by the server), let them take over that seat instead
                // of bouncing them with "name taken".
                const existingToken = players[existingSlotIndex].token;
                if (existingToken && existingToken === token) {
                    players[existingSlotIndex].player = '';
                    players[existingSlotIndex].socket_id = '';
                    isReclaim = true;
                } else {
                    socket.emit('joinFailed', 'name_taken');
                    return;
                }
            }

            const activeCount = players.filter((x) => x.player !== '').length;
            if (!isReclaim && activeCount >= MAX_PLAYERS) {
                socket.emit('joinFailed', 'party_full');
                return;
            }

            const isLeader = isReclaim ? name === partyLeaderName : activeCount === 0;
            if (isLeader) {
                partyLeaderName = name;
                players[index].isReady = true;
                socket.emit('leader');
                console.log(`[room ${namespace}] leader is ${name}`);
            }

            players[index].player = name;
            players[index].token = token;
            if (token) {
                tokenToName[token] = name;
            }
            updatePartyList();
            socket.emit('joinSuccess', socket.id);
        });

        socket.on('setReady', (isReady) => {
            if (!players[index]) return;
            players[index].isReady = Boolean(isReady);
            updatePartyList();
            socket.emit('readyConfirm');
        });

        socket.on('startGameSignal', (playersForGame) => {
            const readyPlayers = playersForGame.filter((p) => p.name !== '');
            const allReady = readyPlayers.every((p) => p.isReady);
            if (readyPlayers.length < MIN_PLAYERS || !allReady) {
                socket.emit('startGameFailed', 'not_enough_ready_players');
                return;
            }
            started = true;
            gameSocket.emit('startGame');
            game = startGame(readyPlayers, gameSocket, namespace);
        });

        socket.on('disconnect', () => {
            console.log(`[room ${namespace}] socket disconnected (${socket.id})`);

            if (started && game) {
                const slot = players.find((x) => x.socket_id === socket.id);
                if (slot && slot.player !== '') {
                    game.markDisconnected(slot.player);
                }
                return;
            }

            players.forEach((x, i) => {
                if (x.socket_id === socket.id) {
                    if (x.player !== '') {
                        gameSocket.emit('g-addLog', `${x.player} disconnected`);
                    }
                    const wasLeader = x.player === partyLeaderName;
                    const leaderNameAtDisconnect = x.player;
                    players[i].player = '';

                    if (wasLeader && !started) {
                        // Grace period: the leader might just be reloading the
                        // page, in which case a new socket claiming the same
                        // name (with the same token) will arrive within a
                        // second or two. Only close the room if nobody has
                        // reclaimed that seat by the time the grace period
                        // elapses.
                        setTimeout(() => {
                            const reclaimed = players.some((p) => p.player === leaderNameAtDisconnect);
                            if (reclaimed || started) return;
                            console.log(`[room ${namespace}] leader left before game start, closing room`);
                            gameSocket.emit('leaderDisconnect', 'leader_disconnected');
                            const roomCode = namespace.substring(1);
                            delete io._nsps.get(namespace);
                            delete namespaces[roomCode];
                            players = [];
                        }, 3000);
                    }
                }
            });
            updatePartyList();
        });
    });

    // Garbage collect empty rooms periodically.
    const checkEmptyInterval = setInterval(() => {
        const ns = io._nsps.get(namespace);
        const socketCount = ns ? ns.sockets.size : 0;
        if (socketCount === 0) {
            const roomCode = namespace.substring(1);
            if (io._nsps.has(namespace)) {
                io._nsps.delete(namespace);
            }
            if (roomCode in namespaces) {
                delete namespaces[roomCode];
            }
            clearInterval(checkEmptyInterval);
            console.log(`[room] ${namespace} garbage collected`);
        }
    }, 15000);
}

function startGame(players, gameSocket, namespace) {
    const roomCode = namespace.substring(1);
    const game = new CoupGame(players, gameSocket);
    namespaces[roomCode] = game;
    game.start();
    return game;
}

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------
server.listen(PORT, '0.0.0.0', () => {
    const ips = getLocalIPs();
    console.log('');
    console.log('========================================');
    console.log('  Coup Online server is running');
    console.log('========================================');
    console.log(`  Local:    http://localhost:${PORT}`);
    ips.forEach((ip) => console.log(`  Network:  http://${ip}:${PORT}`));
    console.log('========================================');
    console.log('  Share a "Network" address with players');
    console.log('  on the same Wi-Fi/LAN to play locally.');
    console.log('========================================');
    console.log('');
});
