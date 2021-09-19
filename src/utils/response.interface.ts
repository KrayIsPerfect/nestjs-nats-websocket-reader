import {DataTypeEnum} from "./data.type.enum";

export interface IResponse {
    type: DataTypeEnum;
    success: boolean;
    err?: Error;
    name?: string;
    part?: number;
}