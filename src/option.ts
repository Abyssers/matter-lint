import { MatterInfo } from "./info";
export class MatterOption {
    #name: string;
    #value: string | boolean;
    #param: boolean; // whether parameters are required
    #callback: (opt: MatterOption, data: MatterInfo) => MatterInfo;

    constructor(
        name: string,
        param: boolean,
        value: string | boolean,
        callback: (opt: MatterOption, data: MatterInfo) => MatterInfo
    ) {
        this.#name = name;
        this.#param = param;
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

    get param(): boolean {
        return this.#param;
    }

    get value(): string | boolean {
        return this.#value;
    }

    public set(value: string | boolean): void {
        this.#value = value;
        return;
    }

    public handle(data: MatterInfo): MatterInfo {
        return this.#callback(this, data);
    }
}
