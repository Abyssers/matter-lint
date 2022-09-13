export class Option {
    #name: string;
    #value: any;

    constructor(name: string, value: any) {
        this.#name = name;
        this.#value = value;
    }

    get name(): string {
        return this.#name;
    }

    get camelcase(): string {
        return this.#name
            .toLowerCase()
            .split(/( |-)/)
            .filter(w => w !== "")
            .map(w => w.at(0).toUpperCase() + w.slice(1))
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

    public use(): void {
        return;
    }
}
