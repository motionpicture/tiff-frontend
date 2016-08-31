"use strict";
class TicketTypeGroupUtil {
    /**
     * 内部関係者用券種グループを取得する
     */
    static getOne4staff() {
        return [
            {
                code: TicketTypeGroupUtil.TICKET_TYPE_CODE_FREE,
                name: {
                    ja: '無料',
                    en: 'Free'
                },
                charge: 0 // 料金
            },
            {
                code: TicketTypeGroupUtil.TICKET_TYPE_CODE_NOT_FOR_SALE,
                name: {
                    ja: 'Not for sale',
                    en: 'Not for Sale'
                },
                charge: 0 // 料金
            },
        ];
    }
    /**
     * 外部関係者用券種グループを取得する
     */
    static getOne4sponsor() {
        return [
            {
                code: TicketTypeGroupUtil.TICKET_TYPE_CODE_NOT_FOR_SALE,
                name: {
                    ja: 'Not for sale',
                    en: 'Not for Sale'
                },
                charge: 0 // 料金
            }
        ];
    }
}
TicketTypeGroupUtil.TICKET_TYPE_CODE_ADULTS = '01';
TicketTypeGroupUtil.TICKET_TYPE_CODE_STUDENTS = '02';
TicketTypeGroupUtil.TICKET_TYPE_CODE_STUDENTS_ON_THE_DAY = '03';
TicketTypeGroupUtil.TICKET_TYPE_CODE_FREE = '00';
TicketTypeGroupUtil.TICKET_TYPE_CODE_NOT_FOR_SALE = '99';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TicketTypeGroupUtil;
