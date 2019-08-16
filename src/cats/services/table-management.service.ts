import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

import { Helpers } from '../../helpers/helpers';

@Injectable()
export class TableManagementService {
    private channel: string[] = [];

    public tableChannel(tableName: string): number {
        const index = this.channel.findIndex(e => e === tableName);
        if (index > -1) {
            return index;
        }
        return this.channel.push(tableName) - 1;
    }

    public readData(tableChan: number): any {
        let fileContents;
        try {
            fileContents = fs.readFileSync(this.channel[tableChan], 'utf-8');
        } catch (err) {
            if (err.code === 'ENOENT') {
                Helpers.log(`File not found! ${this.channel[tableChan]}`);
                return [];
            } else {
                throw err;
            }
        }
        return JSON.parse(fileContents);
    }

    public writeData(tableChan: number, obj: any): void {
        const stringify = JSON.stringify(obj);
        fs.writeFileSync(this.channel[tableChan], stringify, 'utf-8');
    }
}
