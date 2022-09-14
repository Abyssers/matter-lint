import { Option } from "./option";

class Context {
    #options: Map<string, Option>;

    constructor() {
        this.#options = new Map();
    }

    public add(
        name: string,
        value: any,
        callback: () => void = () => {
            return;
        }
    ): void {
        const option = new Option(name, value, callback);
        const { camelcase, dashed, abbrev } = option;
        this.#options.set(camelcase, option);
        this.#options.set(dashed, option);
        this.#options.set(abbrev, option);
    }

    public config(key: string, value: any): boolean {
        if (this.#options.has(key)) {
            this.#options.get(key).set(value);
            this.#options.get(key).call();
            return true;
        }
        return false;
    }
}

export const ctx = new Context();
