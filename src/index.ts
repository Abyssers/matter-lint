import { resolve } from "node:path";
import { writeFileSync } from "node:fs";
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
    (opt: MatterOption, path: string, data: MatterInfo, content: string) => {
        return [data, content];
    }
);

lint.add("force", false, false, (opt: MatterOption, path: string, data: MatterInfo, content: string) => {
    const commits = jit.repo(cwd).do("log", ["-n <number>", "--pretty=fuller", "--", "<path>"], "1", path)
        .formatted as any[];
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
            (data["contributors"] = [...new Set(commits.map(commit => commit["author"]["name"]))].join(",") as string);
    }
    return [data, content];
});

lint.add("write", false, false, (opt: MatterOption, path: string, data: MatterInfo, content: string) => {
    if (opt.value) {
        writeFileSync(path, stringify(content, data));
    } else {
        console.log(data);
    }
    return [data, content];
});

lint.run(cwd, args);
