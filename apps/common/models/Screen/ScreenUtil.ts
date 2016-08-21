export default class ScreenUtil {
    public static getSeatGrades() {
        return [
            {
                name: {
                    ja: 'ノーマルシート',
                    en: 'Normal Seat',
                },
                additional_charge: 0
            },
            {
                name: {
                    ja: 'プレミアボックスシート',
                    en: 'Premiere Box Seat',
                },
                additional_charge: 1000
            },
            {
                name: {
                    ja: 'プレミアラグジュアリーシート',
                    en: 'Premiere Luxury Seat',
                },
                additional_charge: 3000
            }
        ];
    }

    public static sortBySeatCode(a: string, b:string): number {
        let rowA = a.substr(0, 1); // 行
        let rowB = b.substr(0, 1); // 行
        let columnA = a.substr(2); // 列
        let columnB = b.substr(2); // 列

        if (rowA < rowB) {
            return -1;
        } else if (rowA > rowB) {
            return 1;
        } else {
            if (parseInt(columnA) < parseInt(columnB)) {
                return -1;
            } else {
                return 1;
            }
        }
    }
}
