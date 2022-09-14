import { resolve } from "node:path";
import { MatterInfo } from "./info";
import { MatterOption } from "./option";
import { lint } from "./lint";

const cwd: string = process.cwd();
const args: string[] = process.argv.slice(2);

/* default configurations */
lint.add("config", true, resolve(cwd, ".matterlint.json"), (opt: MatterOption, data: MatterInfo) => {
    return data;
});

lint.add("write", false, true, (opt: MatterOption, data: MatterInfo) => {
    if (!opt.value) {
        /* log something */
    } else {
        /* write back */
    }
    return data;
});

lint.run(cwd, args);
