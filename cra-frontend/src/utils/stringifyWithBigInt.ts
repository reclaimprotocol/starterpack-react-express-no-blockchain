export default function stringifyWithBitInt(value:any) {
    if (value !== undefined) {
        return JSON.stringify(value, (_, v) => typeof v === 'bigint' ? `${v}n` : v);
    }
    return ''
}