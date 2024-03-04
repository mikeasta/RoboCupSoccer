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

// Поиск координат текущей позиции по двум флагам (см. мет. ук стр. 24)
const getPosition2Flags = (flag_1, flag_2) => {
    // Эпсилон чтобы избежать деления на ноль в случае, если не удалось избежать
    // флагов с одинаковой координатой на предыдущем этапе
    const eps = 1e-5;
    
    // Достаем параметры из флагов
    const x1 = flag_1.coords.x, y1 = flag_1.coords.y, d1 = flag_1.distance;
    const x2 = flag_2.coords.x, y2 = flag_2.coords.y, d2 = flag_2.distance;

    // Алгоритм рассчета см. на стр.24 методических указаний
    const alpha =  (y1 - y2 + eps) / (x2 - x1 + eps)
    const beta  =  (y2**2 - y1**2 + x2**2 - x1**2 + d1**2 - d2**2 + eps) / (2 * (x2 - x1) + eps)

    const a = alpha**2 + 1
    const b = -2 * (alpha * (x1 - beta) + y1)
    const c = (x1 - beta)**2 + y1**2 - d1**2

    const underroot_y_value = Math.max(b**2 - 4 * a * c > 0, 0) // Выбираем ноль, если подкорневое значение меньше нуля 
    const positive_y = (-b + Math.sqrt(underroot_y_value) + eps) / (2 * a + eps)
    const negative_y = (-b - Math.sqrt(underroot_y_value) + eps) / (2 * a + eps) 

    const error_ratio = 1.1 // Введем погрешность на размеры поля - координаты могут быть +- верными, но выходить за пределы поля

    const y = positive_y < (-32 * error_ratio) || positive_y > (32 * error_ratio) ? negative_y: positive_y; 

    const underroot_x_value = Math.max(d1**2 - (y-y1)**2, 0) // Выбираем ноль, если подкорневое значение меньше нуля 
    const positive_x = x1 + Math.sqrt(underroot_x_value)
    const negative_x = x1 - Math.sqrt(underroot_x_value)

    const x = positive_x < (-54 * error_ratio) || positive_x > (54 * error_ratio) ? negative_x: positive_x;
    return {x, y}
}

module.exports = {
    interpret,
    getPosition3Flags,
    getPosition2Flags
}