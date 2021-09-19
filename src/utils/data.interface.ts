import { DataTypeEnum } from './data.type.enum';

export interface IData {
  type: DataTypeEnum;
  data: any;
  name?: string;
  part?: number;
}
