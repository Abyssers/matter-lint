import { isAbsolute, extname, resolve } from "node:path";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { stringify } from "gray-matter";
import { jit } from "@abysser/jit";
import { MatterInfo } from "./info";
import { MatterOption } from "./option";
import { lint } from "./lint";

const cwd: string = process.cwd();
const args: string[] = process.argv.slice(2);

/* default configurations */
lint.add(
    "config",
    true,
    resolve(cwd, ".matterlint.json"),
    (opt: MatterOption, _path: string, data: MatterInfo, content: string) => {
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
                    if (typeof opts[key] === "undefined") return;
                    if (typeof opts[key] === "function") return;
                    if (typeof opts[key] === "symbol") return;
                    if (Object.prototype.toString.call(opts[key]) === "[object Object]") return;
                    if (typeof opts[key] === "number") opts[key] = (opts[key] as number).toString();
                    if (Array.isArray(opts[key])) {
                        opts[key] = (opts[key] as any[])
                            .flat(Infinity)
                            .map(v => {
                                if (typeof v === "undefined") return "";
                                if (typeof v === "function") return "";
                                if (typeof v === "symbol") return "";
                                if (Object.prototype.toString.call(v) === "[object Object]") return "";
                                if (typeof v === "number") return v.toString();
                                return (v as string).trim();
                            })
                            .join(",");
                    }
                    if (typeof opts[key] === "string") {
                        lint.config(key, (opts[key] as string).trim());
                    } else if (typeof opts[key] === "boolean") {
                        lint.config(key, opts[key]);
                    }
                }
            });
        }
        return [data, content];
    }
);

lint.add("force", false, false, (opt: MatterOption, path: string, data: MatterInfo, content: string) => {
    if (typeof opt.value === "boolean") {
        const commits = jit.repo(cwd).do("log", ["--pretty=fuller", "--", "<path>"], path).formatted as any[];
        if (opt.value) {
            data["created"] = commits[commits.length - 1]["authorDate"] as Date;
            data["updated"] = commits[0]["authorDate"] as Date;
            data["author"] = commits[commits.length - 1]["author"]["name"] as string;
            data["committer"] = commits[0]["author"]["name"] as string;
            data["contributors"] = [...new Set(commits.map(commit => commit["author"]["name"]))].join("") as string;
        } else {
            const { hasOwnProperty: has } = Object.prototype;
            !has.call(data, "created") && (data["created"] = commits[commits.length - 1]["authorDate"] as Date);
            !has.call(data, "updated") && (data["updated"] = commits[0]["authorDate"] as Date);
            !has.call(data, "author") && (data["author"] = commits[commits.length - 1]["author"]["name"] as string);
            !has.call(data, "committer") && (data["committer"] = commits[0]["author"]["name"] as string);
            !has.call(data, "contributors") &&
                (data["contributors"] = [...new Set(commits.map(commit => commit["author"]["name"]))].join(
                    ","
                ) as string);
        }
    }
    return [data, content];
});

lint.add("blank-lines", true, "1", (opt: MatterOption, _path: string, data: MatterInfo, content: string) => {
    if (typeof opt.value === "string" && !Number.isNaN(Number(opt.value))) {
        let rn = false;
        while (content.startsWith("\r\n") || content.startsWith("\n")) {
            if (content.startsWith("\r\n")) (content = content.slice(2)) && (rn = true);
            if (content.startsWith("\n")) content = content.slice(1);
        }
        content = new Array(Math.ceil(Number(opt.value))).fill(rn ? "\r\n" : "\n").join("") + content;
    }
    return [data, content];
});

lint.add("write", false, false, (opt: MatterOption, path: string, data: MatterInfo, content: string) => {
    if (typeof opt.value === "boolean") {
        if (opt.value) {
            writeFileSync(path, stringify(content, data));
        } else {
            console.log(data);
        }
    }
    return [data, content];
});

lint.run(cwd, args);
