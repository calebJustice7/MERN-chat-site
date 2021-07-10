function checkTime(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}

export default function startTime(date) {
    var today = new Date(date);
    var h = today.getHours();
    var m = today.getMinutes();

    if(h < 10 && h !== 0) {
        h = '0' + h;
    } else if(h > 12) {
        h = h - 12;
    } else if(h === 0) {
        h = 12;
    }

    m = checkTime(m);
    return h + ':' + m
}