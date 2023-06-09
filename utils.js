export function formatSeconds(seconds) {
    const date = new Date(null);
    date.setSeconds(seconds);
    return date.toISOString().slice(11, 19);
}