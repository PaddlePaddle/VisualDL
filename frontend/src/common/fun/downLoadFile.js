import XLSX from 'xlsx';
import FileSaver from 'file-saver';
const aoaToSheet = XLSX.utils.aoa_to_sheet;
const saveAs = FileSaver.saveAs;
function s2ab(s) {
    if (typeof ArrayBuffer !== 'undefined') {
        let buf = new ArrayBuffer(s.length);
        let view = new Uint8Array(buf);
        for (let i = 0; i !== s.length; ++i) {
            view[i] = s.charCodeAt(i) & 0xFF;
        }
        return buf;
    }
    let buf = new Array(s.length);
    for (let i = 0; i !== s.length; ++i) {
        buf[i] = s.charCodeAt(i) & 0xFF;
    }
    return buf;
}

/**
 * download Excel
 *
 * @desc transform data like [['A', 'B', 'C'], ['1', '2', '3'],[['1-1', '2-1', '3-1']]] to xlsx and download
 * @param {Array} data the data for the xlsx
 * @param {string} name filename
 */
export const generateXLSXandAutoDownload = function (data, name) {
    let wopts = {
        bookType: 'xlsx',
        bookSST: false,
        type: 'binary'
    };
    let ws = aoaToSheet(data);
    let wb = {
        SheetNames: ['Export'],
        Sheets: {},
        Props: {}
    };
    wb.Sheets.Export = ws;
    let wbout = XLSX.write(wb, wopts);
    saveAs(
        new Blob(
            [s2ab(wbout)],
            {
                type: 'application/octet-stream'
            }
        ),
        name + '.xlsx' || 'sheetjs.xlsx'
    );
};

/**
 * download json
 *
 * @desc download json
 * @param {Array} data the data for the xlsx
 * @param {string} name filename
 */
export const generateJsonAndDownload = function (data, name) {
    saveAs(
        new Blob(
            [s2ab(JSON.stringify(data, null, '    '))],
            {
                type: 'application/octet-stream'
            }
        ),
        name + '.json' || 'json.json'
    );
};
