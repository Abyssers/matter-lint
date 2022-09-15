import { isAbsolute, extname, resolve } from "node:path";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { stringify } from "gray-matter";
import { jit } from "@abysser/jit";
import { MatterOption } from "./option";
import { MatterLintContext, lint } from "./lint";

const cwd: string = process.cwd();
const args: string[] = process.argv.slice(2);

/* default configurations */
lint.add("config", true, resolve(cwd, ".matterlint.json"), (opt: MatterOption) => {
    if (
        typeof opt.value === "string" &&
        isAbsolute(opt.value) &&
        extname(opt.value) === ".json" &&
        existsSync(opt.value)
    ) {
        const opts = JSON.parse(readFileSync(opt.value, { encoding: "utf8" }));

        Object.keys(opts).forEach(key => {
            const option = lint.get(key);
            if (option && option.name !== "config") {
                lint.config(option.name, opts[key]);
            }
        });
    }
});

lint.add("force", false, false, (opt: MatterOption, ctx: MatterLintContext) => {
    if (typeof opt.value === "boolean") {
        const { path } = ctx;
        const commits = jit.repo(cwd).do("log", ["--pretty=fuller", "--", "<path>"], path).formatted as any[];
        if (opt.value) {
            ctx.data["author"] = commits[commits.length - 1]["author"]["name"] as string;
            ctx.data["committer"] = commits[0]["author"]["name"] as string;
            ctx.data["contributors"] = [...new Set(commits.map(commit => commit["author"]["name"]))].join(
                ","
            ) as string;
            ctx.data["created"] = commits[commits.length - 1]["authorDate"] as Date;
            ctx.data["updated"] = commits[0]["authorDate"] as Date;
        } else {
            const { hasOwnProperty: has } = Object.prototype;
            !has.call(ctx.data, "author") &&
                (ctx.data["author"] = commits[commits.length - 1]["author"]["name"] as string);
            !has.call(ctx.data, "committer") && (ctx.data["committer"] = commits[0]["author"]["name"] as string);
            !has.call(ctx.data, "contributors") &&
                (ctx.data["contributors"] = [...new Set(commits.map(commit => commit["author"]["name"]))].join(
                    ","
                ) as string);
            !has.call(ctx.data, "created") && (ctx.data["created"] = commits[commits.length - 1]["authorDate"] as Date);
            !has.call(ctx.data, "updated") && (ctx.data["updated"] = commits[0]["authorDate"] as Date);
        }
        ctx.commits = commits;
        ctx.force = opt.value;
    }
});

lint.add("now", false, false, (opt: MatterOption, ctx: MatterLintContext) => {
    if (typeof opt.value === "boolean") {
        if (opt.value) {
            const { force } = ctx;
            const now: Date = new Date();
            if (force) {
                now > ctx.data["updated"] && (ctx.data["updated"] = now);
            } else {
                const { hasOwnProperty: has } = Object.prototype;
                !has.call(ctx.data, "updated") && now > ctx.data["updated"] && (ctx.data["updated"] = now);
            }
        }
    }
});

lint.add("map", true, "", (opt: MatterOption, ctx: MatterLintContext) => {
    if (typeof opt.value === "string") {
        opt.value
            .split(";")
            .map(p => p.split(":"))
            .forEach(map => {
                const [originField, mappedField] = map;
                if (Object.keys(ctx.data).includes(originField)) {
                    ctx.data[mappedField] = ctx.data[originField];
                    delete ctx.data[originField];
                }
            });
    }
});

lint.add("blank-lines", true, "1", (opt: MatterOption, ctx: MatterLintContext) => {
    if (typeof opt.value === "string" && !Number.isNaN(Number(opt.value))) {
        let rn = false;
        while (ctx.content.startsWith("\r\n") || ctx.content.startsWith("\n")) {
            if (ctx.content.startsWith("\r\n")) (ctx.content = ctx.content.slice(2)) && (rn = true);
            if (ctx.content.startsWith("\n")) ctx.content = ctx.content.slice(1);
        }
        ctx.content = new Array(Math.ceil(Number(opt.value))).fill(rn ? "\r\n" : "\n").join("") + ctx.content;
    }
});

lint.add("write", false, false, (opt: MatterOption, ctx: MatterLintContext) => {
    if (typeof opt.value === "boolean") {
        if (opt.value) {
            writeFileSync(ctx.path, stringify(ctx.content, ctx.data));
        } else {
            console.log(ctx.data);
        }
    }
});

lint.run(cwd, args);
