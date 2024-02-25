// Интерпретация информации о наблюдаемом объекте
const interpret = observable_data => {
    // Для расшифровки, страницы 8-9 методических указаний
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

// Поиск координат текущей позиции по трем флагам (см. мет. ук стр. 25)
const getPosition3Flags = (flag_1, flag_2, flag_3) => {
    // Эпсилон чтобы избежать деления на ноль в случае, если не удалось избежать
    // флагов с одинаковой координатой на предыдущем этапе
    const eps = 1e-5;
    
    // Достаем параметры из флагов
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

    return {x, y}
}

module.exports = {
    interpret,
    getPosition3Flags
}