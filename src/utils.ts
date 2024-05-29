import fs from "fs";

export function createDir(path: string, clear = false) {
  if (fs.existsSync(path) && clear) {
    fs.rmSync(path, { recursive: true });
  }
  fs.mkdirSync(path, { recursive: true });
}

export function writeFile(path: string, text: string) {
  fs.writeFileSync(path, text, { encoding: "utf-8" });
}

/* Resolve custom string syntax (<customTag>value</customTag>) */
export function parseBracket(str: string) {
  try {
    const regExp = /<(.+)>(.+)<\/\1>/g;
    const match = regExp.exec(str)!;
    const matchStr = match[0];
    const key = match[1];
    const value = match[2];
    return { matchStr, key, value, isBracket: true };
  } catch (e) {
    return { matchStr: null, key: null, value: null, isBracket: false };
  }
}

export function toCamelCase(str: string) {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, "");
}

export function toPascalCase(str: string) {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word) {
      return word.toUpperCase();
    })
    .replace(/\s+/g, "");
}

export function removeApostrophe(str: string) {
  return str.replace(/('|")(.+)\1/g, (word, g1) => {
    return word.replaceAll(g1, "");
  });
}
