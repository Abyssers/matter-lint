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
                    lint.config(option.name, opts[key]);
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
            data["author"] = commits[commits.length - 1]["author"]["name"] as string;
            data["committer"] = commits[0]["author"]["name"] as string;
            data["contributors"] = [...new Set(commits.map(commit => commit["author"]["name"]))].join("") as string;
            data["created"] = commits[commits.length - 1]["authorDate"] as Date;
            data["updated"] = new Date();
        } else {
            const { hasOwnProperty: has } = Object.prototype;
            !has.call(data, "author") && (data["author"] = commits[commits.length - 1]["author"]["name"] as string);
            !has.call(data, "committer") && (data["committer"] = commits[0]["author"]["name"] as string);
            !has.call(data, "contributors") &&
                (data["contributors"] = [...new Set(commits.map(commit => commit["author"]["name"]))].join(
                    ","
                ) as string);
            !has.call(data, "created") && (data["created"] = commits[commits.length - 1]["authorDate"] as Date);
            !has.call(data, "updated") && (data["updated"] = new Date());
        }
    }
    return [data, content];
});

lint.add("map", true, "", (opt: MatterOption, _path: string, data: MatterInfo, content: string) => {
    if (typeof opt.value === "string") {
        opt.value
            .split(";")
            .map(p => p.split(":"))
            .forEach(map => {
                const [originField, mappedField] = map;
                if (Object.keys(data).includes(originField)) {
                    data[mappedField] = data[originField];
                    delete data[originField];
                }
            });
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
