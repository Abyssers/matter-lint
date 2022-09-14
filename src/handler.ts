import { MatterOption } from "./option";
import { MatterInfo } from "./info";

export interface MatterHandler {
    (opt: MatterOption, path: string, data: MatterInfo, content: string): [MatterInfo, string];
}
