class MatterLintOptions {
    #options: Map<string, string>;

    constructor() {
        this.#options = new Map([
            ["-c", "config"],
            ["--config", "config"],
            ["-w", "write"],
            ["--write", "write"],
            ["-f", "forcedUpdateTime"],
            ["--forced-update-time", "forcedUpdateTime"],
        ]);
    }
}
