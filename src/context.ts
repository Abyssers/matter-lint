import { Option } from "./option";

export class Context {
    #options: Map<string, Option>;

    constructor() {
        this.#options = new Map();
    }

    public add(option: Option): void {
        const { camelcase, dashed, abbrev } = option;
        this.#options.set(camelcase, option);
        this.#options.set(dashed, option);
        this.#options.set(abbrev, option);
    }

    public config(key: string, value: any): boolean {
        if (this.#options.has(key)) {
            this.#options.get(key).set(value);
            return true;
        }
        return false;
    }
}
