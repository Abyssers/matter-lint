export interface MatterInfo {
    created?: Date;
    updated?: Date;
    author?: string;
    committer?: string;
    contributors?: string;
    [key: string]: boolean | number | string | Date;
}
