export interface MatterInfo {
    created?: Date;
    updated?: Date;
    author?: string;
    updatedby?: string;
    contributors?: { name: string; email: string; link?: string; contributions?: number; [key: string]: any }[];
    [key: string]: boolean | number | string | Date | any[];
}
