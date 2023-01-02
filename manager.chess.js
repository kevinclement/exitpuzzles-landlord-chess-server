const ChessDeviceState = require('./chessDeviceState');
let Manager = require('./manager')

module.exports = class ChessManager extends Manager {
    constructor(opts) {
        let incoming = [];
        let handlers = {};

        let ref = opts.fb.db.ref('landlord/devices/chess')

        super({ 
            ...opts,
            ref: ref,
            dev:'/dev/ttyChess',
            baudRate: 115200,
            handlers: handlers,
            incoming:incoming,
        })

        // ask for status once we connect
        this.on('connected', () => {
            this.write('status')
        });

        handlers['chess.reset']      = (s,cb) => { this.write('reboot',    err => { if (err) { s.ref.update({ 'error': err }); } cb() }); }
        handlers['chess.solveHead']  = (s,cb) => { this.write('solve1',    err => { if (err) { s.ref.update({ 'error': err }); } cb() }); }
        handlers['chess.solveBoard'] = (s,cb) => { this.write('solve2',    err => { if (err) { s.ref.update({ 'error': err }); } cb() }); }

        // setup supported device output parsing
        incoming.push(
        {
            pattern:/.*status=(.*)/,
            match: (m) => {
                // Use a parsed object so I can look at the parsing as a whole and not rely on ordering
                let newState = new ChessDeviceState();

                m[1].split(',').forEach((s)=> {
                    let p = s.split(/:(.+)/);
                    switch(p[0]) {
                        case "bust":
                            newState.bust = (p[1] === 'on')
                            break
                        case "bust_solved":
                            newState.bust_solved = (p[1] === 'true')
                            break
                        case "piece_1":
                            newState.piece_1 = (p[1] === 'on')
                            break
                        case "piece_2":
                            newState.piece_2 = (p[1] === 'on')
                            break
                        case "rfid_solved":
                            newState.rfid_solved = (p[1] === 'true')
                            break
                        case "solved":
                            newState.solved = (p[1] === 'true')
                            break
                    }
                })

                // check if any interesting state toggled from last time
                if (newState.solved != this.state.solved) {
                    this.logger.log(this.logPrefix + 'all solved, playing sound...')
                    this.play("door-open.wav", () => {
                        this.logger.log(this.logPrefix + 'audio finished.  opening door...')
                        this.write('finish', err => { });
                    })
                }

                // copy to our state now
                this.state = newState;

                ref.child('info/build').update({
                    version: newState.version,
                    date: newState.buildDate,
                    gitDate: newState.gitDate
                })

                ref.update({
                    bust: newState.bust,
                    bust_solved: newState.bust_solved,
                    piece_1: newState.piece_1,
                    piece_2: newState.piece_2,
                    rfid_solved: newState.rfid_solved,
                    solved: newState.solved,
                })    
            }
        });

        this.audio = opts.audio
        
        // start with unknown tnt state
        this.state = new ChessDeviceState();

        // now connect to serial
        this.connect()
    }

    play(fName, cb) {
        this.audio.play(fName, (err) => {
            if (cb) {
                cb()
            }
        })
    }
}
