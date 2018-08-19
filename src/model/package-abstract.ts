import { IPackageJSON } from '@/model/package-json';

export interface PackageAbstract extends IPackageJSON {

  readonly distTags: IDistTags;
  readonly time: ITimes;
  readonly users: {};
  readonly _id: string;
  readonly _rev: string;
}

export interface ITimes {
  [key: number]: Date;
  created: string;
  modified: string;
}

export interface IDistTags {
  [key: string]: number;
}
