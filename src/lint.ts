import { resolve, extname } from "node:path";
import { existsSync } from "node:fs";
import { read } from "gray-matter";
import { MatterOption, MatterOptionHandler } from "./option";
import { MatterInfo } from "./info";

export interface MatterLintContext {
    path: string;
    data: MatterInfo;
    content: string;
    [key: string]: any;
}

class MatterLint {
    #queue: string[];
    #options: Map<string, MatterOption>;

    constructor() {
        this.#queue = [];
        this.#options = new Map();
    }

    private parse(
        cwd: string,
        args: string[]
    ): {
        opts: { key: string; value: string | boolean }[];
        paths: string[];
    } {
        const opts = [];
        const confs = [];
        const paths = [];
        const sepidx = args.indexOf("--");
        if (sepidx !== -1 && sepidx < args.length - 1) {
            confs.push(...args.slice(0, sepidx));
            paths.push(...args.slice(sepidx + 1).map(p => resolve(cwd, p)));
        } else {
            confs.push(...args);
        }
        while (confs.length > 0) {
            const cfg = confs.shift();
            if (cfg.includes("=")) {
                const eqidx = cfg.lastIndexOf("=");
                const key = cfg.slice(0, eqidx);
                if (this.#options.has(key)) {
                    const { param } = this.#options.get(key);
                    opts.push({
                        key,
                        value: param ? cfg.slice(eqidx + 1) : true,
                    });
                } else {
                    paths.push(cfg);
                }
            } else {
                if (this.#options.has(cfg)) {
                    const { param } = this.#options.get(cfg);
                    opts.push({
                        key: cfg,
                        value: param ? (confs.length > 0 ? confs.shift() : "") : true,
                    });
                } else {
                    paths.push(cfg);
                }
            }
        }
        return { opts, paths };
    }

    private legalize(value: any, depth = 1): string | boolean {
        if (depth < 0) return "";
        switch (typeof value) {
            case "number":
                value = Number.prototype.toString.call(value);
                break;
            case "bigint":
                // eslint-disable-next-line no-undef
                value = BigInt.prototype.toString.call(value);
                break;
            case "symbol":
            case "undefined":
            case "function":
                value = "";
                break;
            case "object":
                {
                    const { toString: typestr } = Object.prototype;
                    if (typestr.call(value) === "[object Object]") {
                        Object.keys(value).forEach(k => {
                            value[k] = this.legalize(value[k], depth - 1);
                        });
                        value = Object.entries(value)
                            .map(e => `${e[0]}:${e[1]}`)
                            .join(";");
                    } else if (typestr.call(value) === "[object Array]") {
                        value = (value as any[]).map(v => this.legalize(v, depth - 1)).join(",");
                    }
                }
                break;
            case "boolean":
            case "string":
            default:
                break;
        }
        return value;
    }

    public add(name: string, param: boolean, defaultValue: string | boolean, handler: MatterOptionHandler): MatterLint {
        const option = new MatterOption(name, param, defaultValue, handler);
        this.#queue.push(name);
        const { camelcase, dashed, abbrev } = option;
        this.#options.set(name, option);
        this.#options.set(camelcase, option);
        this.#options.set(dashed, option);
        this.#options.set(abbrev, option);
        return this;
    }

    public get(key: string): MatterOption | null {
        return this.#options.has(key) ? this.#options.get(key) : null;
    }

    public config(key: string, value: any): MatterLint {
        this.#options.has(key) && this.#options.get(key).set(this.legalize(value));
        return this;
    }

    public run(cwd: string, args: string[]): void {
        const { opts, paths } = this.parse(cwd, args);
        opts.forEach(opt => {
            this.config(opt.key, opt.value);
        });
        paths.forEach(path => {
            if ([".md", ".markdown"].includes(extname(path)) && existsSync(path)) {
                const { data, content } = read(path);
                const ctx: MatterLintContext = { path, data, content };
                this.#queue.forEach(name => {
                    this.#options.get(name).handle(ctx);
                });
            }
        });
    }
}

export const lint = new MatterLint();
