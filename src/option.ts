import { MatterInfo } from "./info";
export class Option {
    #name: string;
    #value: any;
    #callback: (opt: Option, data: MatterInfo) => void;

    constructor(name: string, value: any, callback: (opt: Option, data: MatterInfo) => void) {
        this.#name = name;
        this.#value = value;
        this.#callback = callback;
    }

    get name(): string {
        return this.#name;
    }

    get camelcase(): string {
        return this.#name
            .toLowerCase()
            .split(/( |-)/)
            .filter(w => w !== "")
            .map((w, i) => (i === 0 ? w : w.at(0).toUpperCase() + w.slice(1)))
            .join("");
    }

    get dashed(): string {
        return `--${this.#name
            .toLowerCase()
            .split(/( |-)/)
            .filter(w => w !== "")
            .join("-")}`;
    }

    get abbrev(): string {
        return `-${this.#name
            .toLowerCase()
            .split(/( |-)/)
            .filter(w => w !== "")
            .map(w => w.at(0))
            .join("")}`;
    }

    get value(): any {
        return this.#value;
    }

    public set(value: any): void {
        this.#value = value;
        return;
    }

    public handle(data: MatterInfo): void {
        return this.#callback(this, data);
    }
}
