// const fs = require('fs');

// // Первый набор вариантов
// const set1 = [
//   'AhA',
//   '@hA',
//   'phA',
//   'Ah@',
//   '@h@',
//   'ph@',
//   'Ahp',
//   '@hp',
//   'php',
//   'AnA',
//   '@nA',
//   'pnA',
//   'bnA',
//   'An@',
//   '@n@',
//   'pn@',
//   'bn@',
//   'Anp',
//   '@np',
//   'pnp',
//   'bnp',
//   'Anb',
//   '@nb',
//   'pnb',
// ];

// // Второй набор вариантов
// const set2 = [
//   'AhA',
//   '@hA',
//   'phA',
//   'Ah@',
//   '@h@',
//   'ph@',
//   'Ahp',
//   '@hp',
//   'php',
//   'AnA',
//   '@nA',
//   'pnA',
//   'bnA',
//   'An@',
//   '@n@',
//   'pn@',
//   'bn@',
//   'Anp',
//   '@np',
//   'pnp',
//   'bnp',
//   'Anb',
//   '@nb',
//   'pnb',
//   'An_',
//   '@n_',
//   'pn_',
//   'bn_',
//   '_nA',
//   '_n@',
//   '_np',
//   '_nb',
// ];

// // Третий набор вариантов
// const set3 = [
//   'AhA',
//   '@hA',
//   'phA',
//   'Ah@',
//   '@h@',
//   'ph@',
//   'Ahp',
//   '@hp',
//   'php',
//   'AnA',
//   '@nA',
//   'pnA',
//   'bnA',
//   'An@',
//   '@n@',
//   'pn@',
//   'bn@',
//   'Anp',
//   '@np',
//   'pnp',
//   'bnp',
//   'Anb',
//   '@nb',
//   'pnb',
// ];

// // Функция для проверки первого и последнего символа компонента (для подсчёта X и Y)
// function countSymbols(component) {
//   const validChars = ['A', '@', 'p'];
//   const firstIsValid = validChars.includes(component[0]);
//   const lastIsValid = validChars.includes(component[component.length - 1]);
//   return { firstIsValid, lastIsValid };
// }

// // Функция для трансформации компонента: заменяет все 'h' на '---' и удаляет все 'n'
// function transform(component) {
//   return component.replace(/h/g, '---').replace(/n/g, '');
// }

// // Новая функция для получения веса символа с учётом номера компонента
// // Если символ 'A':
// //   для 1-го и 2-го компонента – вес 3,
// //   для 3-го компонента – вес 2.
// // Символы 'b' и '_' имеют вес 0, все остальные – вес 1.
// function getWeightForComponent(componentIndex, symbol) {
//   if (symbol === 'A') {
//     return (componentIndex === 3) ? 2 : 3;
//   }
//   if (symbol === 'b' || symbol === '_') return 0;
//   return 1;
// }

// let output = '';

// for (const item1 of set1) {
//   for (const item2 of set2) {
//     for (const item3 of set3) {
//       const components = [item1, item2, item3];

//       // Подсчёт X и Y:
//       // X — количество компонентов, у которых первый символ равен 'A', '@' или 'p'
//       // Y — количество компонентов, у которых последний символ равен 'A', '@' или 'p'
//       let x = 0, y = 0;
//       for (const comp of components) {
//         const { firstIsValid, lastIsValid } = countSymbols(comp);
//         if (firstIsValid) x++;
//         if (lastIsValid) y++;
//       }
//       if (x < y) continue;

//       // Правило 1: Если все компоненты начинаются с 'b' или '_'
//       if (components.every(comp => comp[0] === 'b' || comp[0] === '_')) continue;

//       // Правило 2: Если все компоненты заканчиваются на 'b' или '_'
//       if (components.every(comp => comp[comp.length - 1] === 'b' || comp[comp.length - 1] === '_')) continue;

//       // Извлекаем первый и последний символы каждого компонента
//       const firstChar1 = item1[0], lastChar1 = item1[item1.length - 1];
//       const firstChar2 = item2[0], lastChar2 = item2[item2.length - 1];
//       const firstChar3 = item3[0], lastChar3 = item3[item3.length - 1];

//       // Правило 3: Если у второго компонента заканчивается на 'b' или '_' и у третьего компонента начинается на 'b'
//       if ((lastChar2 === 'b' || lastChar2 === '_') && firstChar3 === 'b') continue;

//       // Правило 4: Если у второго компонента начинается на 'b' или '_' и у третьего компонента заканчивается на 'b'
//       if ((firstChar2 === 'b' || firstChar2 === '_') && lastChar3 === 'b') continue;

//       // Правило 5: Если у второго компонента заканчивается на 'b' или '_' и у первого компонента начинается на 'b'
//       if ((lastChar2 === 'b' || lastChar2 === '_') && firstChar1 === 'b') continue;

//       // Правило 6: Если у второго компонента начинается на 'b' или '_' и у первого компонента заканчивается на 'b'
//       if ((firstChar2 === 'b' || firstChar2 === '_') && lastChar1 === 'b') continue;

//       // Правило 7: Если первый и второй компоненты начинаются с 'p' или '@'
//       if ((firstChar1 === 'p' || firstChar1 === '@') && (firstChar2 === 'p' || firstChar2 === '@')) continue;

//       // Правило 8: Если второй и третий компоненты начинаются с 'p' или '@'
//       if ((firstChar2 === 'p' || firstChar2 === '@') && (firstChar3 === 'p' || firstChar3 === '@')) continue;

//       // Правило 9: Если все три компоненты начинаются с 'p' или '@'
//       if ((firstChar1 === 'p' || firstChar1 === '@') &&
//           (firstChar2 === 'p' || firstChar2 === '@') &&
//           (firstChar3 === 'p' || firstChar3 === '@')) continue;

//       // Правило 10: Если первый и второй компоненты заканчиваются на 'p' или '@'
//       if ((lastChar1 === 'p' || lastChar1 === '@') && (lastChar2 === 'p' || lastChar2 === '@')) continue;

//       // Правило 11: Если второй и третий компоненты заканчиваются на 'p' или '@'
//       if ((lastChar2 === 'p' || lastChar2 === '@') && (lastChar3 === 'p' || lastChar3 === '@')) continue;

//       // Правило 12: Если все три компоненты заканчиваются на 'p' или '@'
//       if ((lastChar1 === 'p' || lastChar1 === '@') &&
//           (lastChar2 === 'p' || lastChar2 === '@') &&
//           (lastChar3 === 'p' || lastChar3 === '@')) continue;

//       // Правило 13: Если второй компонент равен 'b' или '_' и второй символ третьего компонента равен 'n'
//       if ((item2 === 'b' || item2 === '_') && item3.length > 1 && item3[1] === 'n') continue;

//       // Правило 14: Если второй компонент равен 'b' или '_' и второй символ первого компонента равен 'n'
//       if ((item2 === 'b' || item2 === '_') && item1.length > 1 && item1[1] === 'n') continue;

//       // Правило 15: Если у всех компонентов второй символ равен 'n'
//       if (components.every(comp => comp.length > 1 && comp[1] === 'n')) continue;

//       // Правило 16:
//       // Если количество символов '@', 'p' или 'b' на первых позициях компонентов
//       // больше, чем количество символов '@' или 'p' на последних позициях компонентов, пропускаем комбинацию.
//       let countFirst = 0, countLast = 0;
//       for (const comp of components) {
//         if (comp[0] === '@' || comp[0] === 'p' || comp[0] === 'b') countFirst++;
//         if (comp[comp.length - 1] === '@' || comp[comp.length - 1] === 'p') countLast++;
//       }
//       if (countFirst > countLast) continue;

//       // Правило 17: Если первый символ второго компонента равен 'A' и первый символ третьего компонента равен 'p'
//       if (firstChar2 === 'A' && firstChar3 === 'p') continue;

//       // Правило 18: Если последний символ второго компонента равен 'A' и последний символ третьего компонента равен 'p'
//       if (lastChar2 === 'A' && lastChar3 === 'p') continue;

//       // Правило 19: Если второй компонент начинается на 'p' или заканчивается на 'p'
//       if (item2[0] === 'p' || item2[item2.length - 1] === 'p') continue;

//       // Правило 20: Если второй компонент заканчивается на 'b', а третий компонент начинается на '@' и заканчивается на 'p'
//       if (lastChar2 === 'b' && firstChar3 === '@' && lastChar3 === 'p') continue;

//       // Правило 21: Если второй компонент заканчивается на 'b', а первый компонент начинается на '@' и заканчивается на 'p'
//       if (lastChar2 === 'b' && firstChar1 === '@' && lastChar1 === 'p') continue;

//       // Правило 22: Если второй компонент заканчивается на 'b', а третий компонент начинается и заканчивается на '@'
//       if (lastChar2 === 'b' && firstChar3 === '@' && lastChar3 === '@') continue;

//       // Правило 23: (аналогично правилу 22)
//       if (lastChar2 === 'b' && firstChar3 === '@' && lastChar3 === '@') continue;

//       // Правило 24: Если второй компонент заканчивается на 'b', а третий компонент содержит 'n'
//       if (lastChar2 === 'b' && item3.includes('n')) continue;

//       // Правило 25: Если второй компонент заканчивается на 'b', а первый компонент содержит 'n'
//       if (lastChar2 === 'b' && item1.includes('n')) continue;

//       // Правило 26: Если второй компонент заканчивается на '_', а третий компонент содержит 'n'
//       if (lastChar2 === '_' && item3.includes('n')) continue;

//       // Правило 27: Если второй компонент заканчивается на '_', а первый компонент содержит 'n'
//       if (lastChar2 === '_' && item1.includes('n')) continue;

//       // Новое правило 28:
//       // Если третий компонент равен '@hp' или 'ph@', а второй компонент равен '_nb'
//       if ((item3 === '@hp' || item3 === 'ph@') && item2 === '_nb') continue;

//       // Новое правило 29:
//       // Если первый компонент равен '@hp' или 'ph@', а второй компонент равен '_nb'
//       if ((item1 === '@hp' || item1 === 'ph@') && item2 === '_nb') continue;

//       // Новое правило 31:
//       // Если третий компонент равен 'php', а второй компонент заканчивается на 'b'
//       if (item3 === 'php' && item2[item2.length - 1] === 'b') continue;

//       // Новое правило 32:
//       // Если первый компонент равен 'php', а второй компонент заканчивается на 'b'
//       if (item1 === 'php' && item2[item2.length - 1] === 'b') continue;

//       // Новое правило 30 (обновлённое):
//       // Вычисляем веса для первых и последних символов компонентов с учётом положения:
//       // - Если символ 'A' в 1-ом или 2-ом компоненте → вес 3, если в 3-ем → вес 2.
//       // - Символы 'b' и '_' имеют вес 0.
//       // - Все остальные символы имеют вес 1.
//       const sumFirst = getWeightForComponent(1, item1[0]) +
//                        getWeightForComponent(2, item2[0]) +
//                        getWeightForComponent(3, item3[0]);
//       const sumLast = getWeightForComponent(1, item1[item1.length - 1]) +
//                       getWeightForComponent(2, item2[item2.length - 1]) +
//                       getWeightForComponent(3, item3[item3.length - 1]);
//       // Если сумма весов первых символов меньше суммы весов последних, комбинация не выводится.
//       if (sumFirst < sumLast) continue;

//       // Применяем трансформацию: заменяем все 'h' на '---' и удаляем 'n'
//       const transformed1 = transform(item1);
//       const transformed2 = transform(item2);
//       const transformed3 = transform(item3);

//       // Формируем строку с комбинацией, разделённую табуляцией
//       output += `${transformed1}\t${transformed2}\t${transformed3}\n`;
//     }
//   }
// }

// // Записываем результат в файл output.txt
// fs.writeFileSync('output.txt', output, { encoding: 'utf8' });
// console.log('Файл успешно записан.');
