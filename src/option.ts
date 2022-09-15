import { MatterLintContext } from "./lint";

export interface MatterOptionHandler {
    (opt: MatterOption, ctx: MatterLintContext): void;
}

export class MatterOption {
    #name: string;
    #value: string | boolean;
    #param: boolean; // whether parameters are required
    #handler: MatterOptionHandler;

    constructor(name: string, param: boolean, value: string | boolean, handler: MatterOptionHandler) {
        this.#name = name;
        this.#param = param;
        this.#value = value;
        this.#handler = handler;
    }

    get name(): string {
        return this.#name;
    }

    get camelcase(): string {
        return this.#name
            .toLowerCase()
            .split(/( |-)/)
            .filter(w => w !== "" && w !== "-")
            .map((w, i) => (i === 0 ? w : w.at(0).toUpperCase() + w.slice(1)))
            .join("");
    }

    get dashed(): string {
        return `--${this.#name
            .toLowerCase()
            .split(/( |-)/)
            .filter(w => w !== "" && w !== "-")
            .join("-")}`;
    }

    get abbrev(): string {
        return `-${this.#name
            .toLowerCase()
            .split(/( |-)/)
            .filter(w => w !== "" && w !== "-")
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

    public handle(ctx: MatterLintContext): ReturnType<MatterOptionHandler> {
        return this.#handler(this, ctx);
    }
}
