
import { Address, PetSanctuary } from '../graphql.schema';
import { initAddress } from './address.model';
import { initCat } from './cat.model';

export class SanctuaryModel {
    id: string;
    name: string;
    addressRef: string;
    catInventoryRef: string[];
}

export const initSanctuary: PetSanctuary = {
    id: '00000000-0000-0000-0000-000000000000',
    name: '',
    address: initAddress,
    catInventory: [ initCat ]
};
