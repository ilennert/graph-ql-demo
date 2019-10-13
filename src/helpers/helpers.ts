import { DateTimeInput } from '../pets/graphql.schema';

export class Helpers {
    static testpattern(source: string, pattern: string): boolean {
        source = source.toLocaleLowerCase();
        pattern = pattern.toLocaleLowerCase();
        if (pattern.length > 1) {
            const swt = pattern[0];
            pattern = pattern.substring(1);
            switch (swt) {
                case '%':   // contains
                    return source.indexOf(pattern) > -1;
                case '>':   // begins with
                    return source.startsWith(pattern);
                case '<':   // ends with
                    return source.endsWith(pattern);
                default:
                    return source === (swt + pattern);
            }
        }
        return source === pattern;
    }

    static log(...arg: any[]): void {
        // tslint:disable-next-line: no-console
        console.log(arg);
    }

    static dateTimeInputToDate(dateTimeInput: DateTimeInput): Date {
        if (dateTimeInput.dateTime) {
            return new Date(dateTimeInput.dateTime);
        } else {
            dateTimeInput.hour =
            dateTimeInput.hour &&
            dateTimeInput.hour !== 0 &&
            dateTimeInput.hour <= 12 &&
            dateTimeInput.hour24 === false &&
            dateTimeInput.pm ? dateTimeInput.hour + 12 :
            dateTimeInput.hour;
            if (dateTimeInput.year && dateTimeInput.month && dateTimeInput.day) {
                if (dateTimeInput.hour && dateTimeInput.minute) {
                    if (dateTimeInput.second) {
                        return new Date(
                            dateTimeInput.year,
                            dateTimeInput.month - 1,
                            dateTimeInput.day,
                            dateTimeInput.hour,
                            dateTimeInput.minute,
                            dateTimeInput.second,
                            dateTimeInput.millisecond
                        );
                    }
                }
                return new Date(dateTimeInput.year, dateTimeInput.month - 1, dateTimeInput.day);
            }
        }
        return new Date();
    }
}
