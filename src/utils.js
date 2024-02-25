// Границы поля
const borders = {x_min: -54, x_max: 54, y_min: -32, y_max: 32}

// Функция по рассчету расстояния между двумя точками
const distance = (p1, p2) => Math.sqrt((p1.x - p2.x)**2 + (p1.y-p2.y)**2)

// Интерпретация инфы
const interpret = observable_data => {
    // Собираем информацию о видимости объектов
    // Для расшифровки, страница 8-9 методических указаний
    const label               = observable_data[0]
    const distance            = observable_data.length > 1 + 1  ? observable_data[1] : undefined;
    const direction           = observable_data.length > 1 + 1  ? observable_data[2] : observable_data[1];
    const distanceChange      = observable_data.length > 2 + 1  ? observable_data[3] : undefined;
    const directionChange     = observable_data.length > 2 + 1  ? observable_data[4] : undefined;
    const bodyFacingDirection = observable_data.length > 4 + 1  ? observable_data[5] : undefined;
    const headFacingDirection = observable_data.length > 4 + 1  ? observable_data[6] : undefined;

    return { 
        label, 
        distance, 
        direction, 
        distanceChange, 
        directionChange, 
        bodyFacingDirection,
        headFacingDirection 
    }
}

// Поиск координат текущей позиции по трем флагам
const getPosition3Flags = (flag_1, flag_2, flag_3) => {
    // Эпсилон чтобы избежать деления на ноль
    const eps = 1e-3;

    if (!(flag_1.distance && flag_2.distance && flag_3.distance)) 
        throw Error(`Not enough distance info: ${flag_1}, ${flag_2}, ${flag_3}.`)
    
    const x1 = flag_1.coords.x, y1 = flag_1.coords.y, d1 = flag_1.distance;
    const x2 = flag_2.coords.x, y2 = flag_2.coords.y, d2 = flag_2.distance;
    const x3 = flag_3.coords.x, y3 = flag_3.coords.y, d3 = flag_3.distance;

    // Алгоритм рассчета см. на стр.25 методических указаний
    const alpha_1 = (y1 - y2) / (x2 - x1 + eps);
    const beta_1  = (y2**2 - y1**2 + x2**2 - x1**2 + d1**2 - d2**2 ) / (2 * (x2 - x1) + eps);

    const alpha_2 = (y1 - y3) / (x3 - x1 + eps);
    const beta_2  = (y3**2 - y1**2 + x3**2 - x1**2 + d1**2 - d3**2 ) / (2 * (x3 - x1) + eps);

    const y = (beta_1 - beta_2) / (alpha_2 - alpha_1 + eps);
    const x = alpha_1 * y + beta_1;

    // Нулевые коориданаты иногда говорят о проблеме в программе, на всякий сделаю лог
    if (!x || !y) console.log(`beta_1=${beta_1}, beta_2=${beta_2}, alpha_1=${alpha_1}, alpha_2=${alpha_2}, flags = ${[flag_1.coords.x, flag_1.coords.y, flag_2.coords.x, flag_2.coords.y, flag_3.coords.x, flag_3.coords.y,]}`)

    return {x, y}
}

// Проверка координат
const validateCoords = coords => {
    return (coords.x >= borders.x_min - Math.abs(coords.x) / 4) &&
    (coords.x <= borders.x_max + Math.abs(coords.x) / 4) &&
    (coords.y >= borders.y_min - Math.abs(coords.x) / 4) &&
    (coords.y <= borders.y_min - Math.abs(coords.x) / 4)
}

module.exports = {
    distance,
    interpret,
    validateCoords,
    getPosition3Flags
}