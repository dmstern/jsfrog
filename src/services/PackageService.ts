import BackendApi from '@/services/BackendApi';
import { PackagesResponse } from '@/model/PackageResponse';
import Package from '@/model/Package';
import { SearchItem, SearchKey } from '@/model/SearchItem';

export default class PackagesService {
  public static get Instance(): PackagesService {
    return this.instance || (this.instance = new this());
  }

  public get packageNames(): string[] {
    return this.packageNamesList;
  }

  public get searchItems(): Array<SearchItem|Package> {
    return this.searchItemList;
  }

  private static instance: PackagesService;

  private request!: Promise<Package[]>;
  private packages!: Package[];
  private packageNamesList!: string[];
  private searchItemList!: SearchItem[];

  private constructor() {
    this.packages = [];
    this.packageNamesList = [];
    this.searchItemList = [];
  }

  public async getPackages(): Promise<Package[]> {
    if (this.packages.length) {
      return new Promise<Package[]>((fulfill, reject) => {
        fulfill(this.packages);
      });
    }

    if (this.request) {
      return this.request;
    }
    return (this.request = new Promise<Package[]>((fulfill, reject) => {
      BackendApi.Instance.getPackages().then((response) => {
        const packagesResponse: PackagesResponse = response.data;
        this.packageNamesList = Object.keys(packagesResponse).filter(
          (key) => !key.startsWith('_'),
        );

        for (const packageName of this.packageNamesList) {
          const modifiedPackage: Package = new Package(
            packagesResponse[packageName],
          );
          this.packages.push(modifiedPackage);

          if (modifiedPackage.keywords) {
            for (const keyword of modifiedPackage.keywords!) {
              this.addSearchItem(new SearchItem(SearchKey.KEYWORD, keyword));
            }
          }
          if (modifiedPackage.displayName) {
            this.addSearchItem(new SearchItem(SearchKey.AUTHOR, modifiedPackage.displayName));
          }
        }
        fulfill(this.packages);
      });
    }));
  }

  private addSearchItem(searchItem: SearchItem) {
    for (const currentSearchItem of this.searchItemList) {
      if (currentSearchItem.key === searchItem.key
        && currentSearchItem.value === searchItem.value) {
        return;
      }
    }
    this.searchItemList.push(searchItem);
  }
}
