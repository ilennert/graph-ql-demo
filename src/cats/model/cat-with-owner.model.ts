
import { Cat } from './cat.model';

export class CatWithOwner extends Cat {
    ownerRanges: string[];          // string array of id to OwnerRanges which is a one to one with owner
}
