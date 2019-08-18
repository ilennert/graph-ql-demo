
import { Address, PetSanctuary, CatOwnerRange } from '../graphql.schema';
import { initAddress } from './address.model';
import { initCat } from './cat.model';

export class SanctuaryModel {
    id: string;
    name: string;
    addressId: string;
}

export const initSanctuary: PetSanctuary = {
    id: '00000000-0000-0000-0000-000000000000',
    name: '',
    address: initAddress,
    catInventory: [ initCat ]
};
