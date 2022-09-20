export interface MatterInfo {
    created?: Date;
    updated?: Date;
    author?: string;
    updatedby?: string;
    contributors?: { name: string; email: string }[];
    [key: string]: boolean | number | string | Date | { name: string; email: string }[];
}
