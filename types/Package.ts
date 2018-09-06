import {
  IAuthor,
  IBinMap,
  IBugs,
  IConfig,
  IDependencyMap,
  IDirectories,
  IEngines,
  IPublishConfig,
  IRepository,
  IScriptsMap,
} from './package-json';
import { IDistTags, ITimes, IVersions } from './package-meta-data';
import { PackageMetaDataDTO } from './package-meta-data';
import Crafter from './Crafter';
import Searchable from './Searchable';
import { Tag } from './Tag';

export default class Package extends Searchable implements PackageMetaDataDTO  {
  public readonly distTags!: IDistTags;
  public readonly time!: ITimes;
  public readonly users!: {};
  public readonly versions!: IVersions;
  // tslint:disable-next-line:variable-name
  public readonly _id!: string;
  // tslint:disable-next-line:variable-name
  public readonly _rev!: string;
  public readonly name!: string;
  public readonly version?: string | undefined;
  public readonly description?: string | undefined;
  public readonly keywords?: string[] | undefined;
  public readonly homepage?: string | undefined;
  public readonly bugs?: string | IBugs;
  public readonly license?: string | undefined;
  public readonly author?: IAuthor | string;
  public readonly contributors?: string[] | IAuthor[];
  public readonly files?: string[] | undefined;
  public readonly main?: string | undefined;
  public readonly bin?: string | IBinMap;
  public readonly man?: string | string[] | undefined;
  public readonly directories?: IDirectories;
  public readonly repository?: string | IRepository;
  public readonly scripts?: IScriptsMap;
  public readonly config?: IConfig;
  public readonly dependencies?: IDependencyMap;
  public readonly devDependencies?: IDependencyMap;
  public readonly peerDependencies?: IDependencyMap;
  public readonly optionalDependencies?: IDependencyMap;
  public readonly bundledDependencies?: string[] | undefined;
  public readonly engines?: IEngines;
  public readonly os?: string[] | undefined;
  public readonly cpu?: string[] | undefined;
  public readonly preferGlobal?: boolean | undefined;
  public readonly private?: boolean | undefined;
  public readonly publishConfig?: IPublishConfig;
  public readonly readme?: string | null;
  public readonly repositoryUrl?: string;
  public readonly bugTrackerUrl?: string;
  public readonly dependenciesCount: number;
  public readonly scope: string | undefined;
  public readonly mainCode: string | undefined;
  private craftersList: Crafter[];

  constructor(packageMetaData: PackageMetaDataDTO) {
    super();
    Object.assign(this, packageMetaData);

    if (!this.distTags) {
      this.distTags = packageMetaData['dist-tags'];
    }

    // set repositoryUrl:
    if (packageMetaData.repository) {
      if (typeof packageMetaData.repository === 'string') {
        this.repositoryUrl = packageMetaData.repository;
      } else {
        this.repositoryUrl = packageMetaData.repository.url;
      }
    }

    // set bugsUrl:
    if (packageMetaData.bugs) {
      if (typeof packageMetaData.bugs === 'string') {
        this.bugTrackerUrl = packageMetaData.bugs;
      } else {
        this.bugTrackerUrl = packageMetaData.bugs.url;
      }
    }

    // Count depenedencies:
    const dependencies = packageMetaData.dependencies;
    const devDependencies = packageMetaData.devDependencies;
    const dependenciesCount = dependencies ? Object.keys(dependencies).length : 0;
    const devDependenciesCount = devDependencies ? Object.keys(devDependencies).length : 0;
    this.dependenciesCount = dependenciesCount + devDependenciesCount;

    // set scope:
    const packageNameParts = packageMetaData.name.split('/');
    if (packageNameParts.length > 1) {
      this.scope = packageNameParts[0];
    }

    this.craftersList = [];
  }

  public matches(other: Searchable): boolean {
    if (other instanceof Tag) {
      return this.keywords !== undefined && this.keywords.indexOf(other.value) > -1;
    }
    if (other instanceof Crafter) {
      return this.crafters.some((crafter) => crafter.equals(other));
    }
    if (other instanceof Package) {
      return other.name === this.name && other.version === this.version;
    }
    return false;
  }

  public getSearchItemText(): string[] {
    return [
        this.name || '',
        this.description || '',
        this.author ? this.author.toString() : '',
      ]
      .concat(this.keywords || []) // TODO: use Tag object instead.
      .concat(...this.crafters.map((crafter) => crafter.getSearchItemText()));
  }

  public get crafters(): Crafter[] {
    if (this.craftersList.length) {
      return this.craftersList;
    }
    if (this.author) {
      this.craftersList.push(new Crafter(this.author));
    }
    if (this.contributors) {
      for (const contributor of this.contributors) {
        this.craftersList.push(new Crafter(contributor));
      }
    }
    return this.craftersList;
  }

  public get repositoryName(): string | undefined {
    if (this.repositoryUrl) {
      return this.url2Name(this.repositoryUrl);
    }
  }

  public get bugTrackerName(): string | undefined {
    if (this.bugTrackerUrl) {
      return this.url2Name(this.bugTrackerUrl);
    }
  }

  private url2Name(url: string): string {
    if (url.includes('github')) {
      return 'github';
    }
    if (url.includes('gitlab')) {
      return 'gitlab';
    }
    return url.split('/')[2];
  }

}
