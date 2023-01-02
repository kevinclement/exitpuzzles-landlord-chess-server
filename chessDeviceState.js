module.exports = class ChessDeviceState {
    constructor() {
        this.version = "unknown"
        this.gitDate = "unknown"
        this.buildDate = "unknown"

        this.bust = false;
        this.bust_solved = false;
        this.piece_1 = false;
        this.piece_2 = false;
        this.rfid_solved = false;
        this.lights = true;
        this.piecesDisabled = false;
        this.solved = false;
    }
}
