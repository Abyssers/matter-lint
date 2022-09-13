import { resolve } from "node:path";
import { readFileSync } from "node:fs";
import { jit } from "@abysser/jit";

const cwd: string = process.cwd();
const args: string[] = process.argv.slice(2);
