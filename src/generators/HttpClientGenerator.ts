import { ServiceOption } from "../type";
import { parseBracket } from "../utils";

export class HttpClientGenerator {
  options: ServiceOption;
  constructor(options: ServiceOption) {
    this.options = options;
  }

  getCode() {
    return `
             private httpClient: HttpClient = new HttpClient({
                baseURL: "${this.options.baseURL}",
                requestHook: (config) => {
                    ${this.getHeaderCode()};
                    return config;
                },
            });
        `;
  }

  private getHeaderCode() {
    return (
      Object.entries(this.options.headers)
        .map(([key, value]) => this.generateHeader(key, value))
        .join(";") + ";"
    );
  }

  private generateHeader(key: string, value: string) {
    const parseValue = parseBracket(value);
    if (!parseValue.isBracket) {
      return `config.headers['${key}'] = "${value}"`;
    }

    switch (parseValue.key) {
      case "cookie":
        return `config.headers['${key}'] = \`${value.replace(parseValue.matchStr, `$\{HttpClient.getFromCookie("${parseValue.value}")}`)}\``;
      default:
        throw new Error(`unsupported custom tag <${parseValue.key}>`);
    }
  }
}
