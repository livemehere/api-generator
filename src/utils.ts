import fs from "fs";
import ts from "typescript";

export function createDir(path: string, clear = false) {
  const alreadyExist = fs.existsSync(path);
  if (clear && alreadyExist) {
    fs.rmSync(path, { recursive: true });
  }

  if (alreadyExist) return;

  fs.mkdirSync(path, { recursive: true });
}

export function writeFile(path: string, text: string) {
  fs.writeFileSync(path, text, { encoding: "utf-8" });
}

export function loadTsFile(path: string) {
  const source = fs.readFileSync(path, "utf-8");
  const res = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
    },
  });
  return eval(res.outputText);
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

/* Resolve custom string syntax {key} */
export function parseBlocks(str: string) {
  let blocks = [];
  try {
    const regExp = /{([^}]+)}/g;
    let match;
    while ((match = regExp.exec(str))) {
      const key = match[1];
      blocks.push({ key, matchStr: match[0] });
    }
  } catch (e) {
    /* empty */
  }
  return blocks;
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

export function joinValidString(
  values: (string | undefined | null)[],
  delimiter = ",",
) {
  return values.filter(Boolean).join(delimiter);
}

export function isIgnoreFile(list: string[], path: string) {
  return list.some((ignorePath) => path.includes(ignorePath));
}

export function getFileStringOrNull(path: string) {
  const exist = fs.existsSync(path);
  if (!exist) return null;
  return fs.readFileSync(path, "utf-8");
}

export function isDiff(str1?: string | null, str2?: string | null) {
  return str1 !== str2;
}

export function getLogTitle(prevCodeExist: boolean, isDiff: boolean) {
  return prevCodeExist ? (isDiff ? "Updated" : "Already exists") : "Created";
}
