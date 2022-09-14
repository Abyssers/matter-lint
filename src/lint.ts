import { resolve, extname } from "node:path";
import { existsSync } from "node:fs";
import { read } from "gray-matter";
import { MatterOption } from "./option";
import { MatterHandler } from "./handler";

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
                }
            } else {
                if (this.#options.has(cfg)) {
                    const { param } = this.#options.get(cfg);
                    opts.push({
                        key: cfg,
                        value: param ? (confs.length > 0 ? confs.shift() : "") : true,
                    });
                }
            }
        }
        return { opts, paths };
    }

    public add(name: string, param: boolean, defaultValue: string | boolean, handler: MatterHandler): MatterLint {
        const option = new MatterOption(name, param, defaultValue, handler);
        this.#queue.push(name);
        const { camelcase, dashed, abbrev } = option;
        this.#options.set(name, option);
        this.#options.set(camelcase, option);
        this.#options.set(dashed, option);
        this.#options.set(abbrev, option);
        return this;
    }

    public config(key: string, value: string | boolean): MatterLint {
        this.#options.has(key) && this.#options.get(key).set(value);
        return this;
    }

    public run(cwd: string, args: string[]): void {
        const { opts, paths } = this.parse(cwd, args);
        opts.forEach(opt => {
            this.config(opt.key, opt.value);
        });
        paths.forEach(path => {
            if ([".md", ".markdown"].includes(extname(path)) && existsSync(path)) {
                let { data, content } = read(path);
                this.#queue.forEach(name => {
                    [data, content] = this.#options.get(name).handle(path, data, content);
                });
            }
        });
    }
}

export const lint = new MatterLint();
