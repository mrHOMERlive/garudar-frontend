/**
 * Поиск страны по справочнику — терпимый к формулировке и опечаткам.
 *
 * Раньше фильтр сравнивал запрос только с началом строки, из-за чего
 * многословные названия не находились по значимому слову: «korea» не давал
 * ничего (в справочнике NORTH KOREA / SOUTH KOREA), «congo» не показывал ДРК,
 * «virgin» — ни одни Виргинские острова.
 *
 * Модуль намеренно без React и без JSX: его можно прогнать под node на реальном
 * списке стран (юнит-раннера для фронтенда в проекте нет).
 */

// Уровни качества совпадения: чем меньше, тем выше в выдаче. Ранжирование
// обязательно — при поиске по подстроке иначе «in» покажет SAINT VINCENT
// раньше, чем INDIA.
const RANK = {
  CODE_EXACT: 0,
  NAME_PREFIX: 1,
  WORD_PREFIX: 2,
  SUBSTRING: 3,
  ALL_TOKENS: 4,
  FUZZY: 5,
};

/** Верхний регистр, без диакритики, пунктуация → пробелы. */
export function normalize(value) {
  if (!value) return '';
  const decomposed = String(value).normalize('NFKD');
  // U+0300–U+036F — комбинируемые диакритические знаки (COTE D'IVOIRE и т.п.).
  const withoutMarks = decomposed.replace(/[\u0300-\u036f]/g, '');
  return withoutMarks
    .toUpperCase()
    .replace(/[^0-9A-Z]+/g, ' ')
    .trim();
}

/**
 * Сколько опечаток прощаем. Короткий запрос при большом допуске вытянул бы
 * половину справочника, поэтому до 3 символов фаззи не применяем вовсе.
 */
export function fuzzyThreshold(length) {
  if (length <= 3) return 0;
  if (length <= 6) return 1;
  return 2;
}

/**
 * Слова названия для сопоставления по токенам.
 *
 * Подряд идущие односимвольные слова дополнительно склеиваются: после
 * нормализации «U.S. VIRGIN ISLANDS» превращается в «U S VIRGIN ISLANDS», и без
 * склейки запрос «us virgin» не находил бы ничего. Так же чинятся U.K., U.A.E.
 */
export function wordsOf(normalizedName) {
  const words = normalizedName.split(' ').filter(Boolean);
  const merged = [];
  let run = '';
  for (const word of words) {
    if (word.length === 1) {
      run += word;
    } else {
      if (run.length > 1) merged.push(run);
      run = '';
    }
  }
  if (run.length > 1) merged.push(run);
  return merged.length ? [...words, ...merged] : words;
}

/**
 * Расстояние Дамерау — Левенштейна с ранним выходом.
 *
 * Именно Дамерау, а не обычный Левенштейн: перестановка соседних букв — самая
 * частая опечатка, и у обычного алгоритма она стоит 2, из-за чего «korae» не
 * находил бы «KOREA» при допуске в одну ошибку.
 */
export function editDistanceWithin(a, b, limit) {
  if (limit <= 0) return a === b;
  if (Math.abs(a.length - b.length) > limit) return false;
  if (a === b) return true;

  let prevPrev = null;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    const curr = [i];
    let rowBest = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let best = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
      // Транспозиция соседних символов стоит одну правку.
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        best = Math.min(best, prevPrev[j - 2] + 1);
      }
      curr[j] = best;
      if (best < rowBest) rowBest = best;
    }
    if (rowBest > limit) return false;
    prevPrev = prev;
    prev = curr;
  }
  return prev[b.length] <= limit;
}

/**
 * Уровень совпадения страны с запросом или null, если не совпало.
 * `country` — { code, name } из справочника.
 */
export function matchRank(country, rawQuery) {
  const query = normalize(rawQuery);
  if (!query) return RANK.NAME_PREFIX;

  const name = normalize(country.name);
  const code = normalize(country.code);
  const words = wordsOf(name);
  const queryTokens = wordsOf(query);

  if (code === query) return RANK.CODE_EXACT;
  // Код двухбуквенный — подстрока по нему дала бы сплошной шум, только префикс.
  if (query.length < code.length && code.startsWith(query)) return RANK.CODE_EXACT;

  if (name.startsWith(query)) return RANK.NAME_PREFIX;
  if (words.some((w) => w.startsWith(query))) return RANK.WORD_PREFIX;
  if (name.includes(query)) return RANK.SUBSTRING;

  // Слова запроса в любом порядке: «us virgin», «korea south».
  if (queryTokens.length > 1 && queryTokens.every((tok) => words.some((w) => w.startsWith(tok)))) {
    return RANK.ALL_TOKENS;
  }

  const limit = fuzzyThreshold(query.length);
  if (limit > 0) {
    if (editDistanceWithin(query, name, limit)) return RANK.FUZZY;
    if (words.some((w) => editDistanceWithin(query, w, limit))) return RANK.FUZZY;
  }

  return null;
}

/**
 * Отфильтровать и отсортировать справочник под запрос.
 * Пустой запрос возвращает исходный список в исходном порядке.
 */
export function searchCountries(countries, rawQuery) {
  const list = Array.isArray(countries) ? countries : [];
  if (!normalize(rawQuery)) return list;

  return list
    .map((country) => ({ country, rank: matchRank(country, rawQuery) }))
    .filter((entry) => entry.rank !== null)
    .sort((a, b) => a.rank - b.rank || String(a.country.name).localeCompare(String(b.country.name)))
    .map((entry) => entry.country);
}

export { RANK };
