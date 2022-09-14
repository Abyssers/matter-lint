export class Option {
    #name: string;
    #value: any;
    #callback: () => void;

    constructor(name: string, value: any, callback: () => void) {
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

    public call(): void {
        return this.#callback();
    }
}
