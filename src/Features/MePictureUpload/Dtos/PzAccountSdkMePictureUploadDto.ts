import { existsSync, readFileSync, statSync } from 'node:fs';
import { basename } from 'node:path';
import { PzAccountSdkDto, mask, pullString, valuesOf, type PzAccountSdkValues } from '../../../Support/PzAccountSdkDto.js';

/** Bytes da imagem: Buffer, Uint8Array (ou outra view) ou ArrayBuffer. */
export type PzAccountSdkPictureContents = Buffer | ArrayBufferView | ArrayBuffer;

export interface PzAccountSdkMePictureUploadInput {
  access_token: string;
  contents: PzAccountSdkPictureContents;
  /** nome original — a extensão define o Content-Type da parte */
  filename?: string | undefined;
}

/**
 * Entrada de `mePictureUpload`.
 *
 * `contents` são os bytes da imagem (jpg, png ou webp, até 5 MB). A extensão
 * de `filename` define o Content-Type da parte — mande com a extensão certa.
 *
 * O nome é saneado aqui: ele costuma vir do navegador (`file.originalname`
 * no multer) e vai para o header da parte multipart. Fica só
 * `[A-Za-z0-9._-]`; vazio vira `picture` — sem nome, o servidor nem
 * reconheceria a parte como arquivo.
 */
export class PzAccountSdkMePictureUploadDto extends PzAccountSdkDto {
  private static readonly MIME_TYPES: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
  };

  readonly access_token: string;
  readonly contents: Buffer;
  readonly filename: string;

  constructor(props: PzAccountSdkMePictureUploadInput) {
    super();
    this.access_token = props.access_token;
    this.contents = PzAccountSdkMePictureUploadDto.toBuffer(props.contents);
    this.filename = PzAccountSdkMePictureUploadDto.sanitize(props.filename ?? '');
  }

  /**
   * Lê a imagem do disco. Sem `filename`, usa o nome do arquivo.
   *
   * @throws TypeError arquivo inexistente ou ilegível
   */
  static fromPath(accessToken: string, path: string, filename = ''): PzAccountSdkMePictureUploadDto {
    let contents: Buffer;

    try {
      if (!existsSync(path) || !statSync(path).isFile()) {
        throw new Error('not a file');
      }

      contents = readFileSync(path);
    } catch {
      throw new TypeError(`PzAccountSdk: não foi possível ler a imagem em "${path}".`);
    }

    return new PzAccountSdkMePictureUploadDto({
      access_token: accessToken,
      contents,
      filename: filename !== '' ? filename : basename(path),
    });
  }

  static from(values: unknown): PzAccountSdkMePictureUploadDto {
    const v = valuesOf(values);

    return new PzAccountSdkMePictureUploadDto({
      access_token: pullString(v, 'access_token'),
      contents: v['contents'] as PzAccountSdkPictureContents,
      filename: pullString(v, 'filename'),
    });
  }

  /** Content-Type da parte, pela extensão do nome. */
  mimeType(): string {
    const extension = this.filename.includes('.') ? (this.filename.split('.').pop() ?? '').toLowerCase() : '';

    return PzAccountSdkMePictureUploadDto.MIME_TYPES[extension] ?? '';
  }

  /** Os bytes da imagem ficam de fora (só o tamanho) e o token vai mascarado. */
  toArray(): PzAccountSdkValues {
    return { access_token: mask(this.access_token), filename: this.filename, size: this.contents.length };
  }

  /** Mesmo saneamento do SDK PHP: `basename`, só `[A-Za-z0-9._-]`, sem `.`/`_` nas pontas. */
  private static sanitize(filename: string): string {
    const path = filename.replaceAll('\\', '/').replace(/\/+$/, '');
    const name = path.slice(path.lastIndexOf('/') + 1);
    const safe = name.replace(/[^A-Za-z0-9._-]+/g, '_').replace(/^[._]+|[._]+$/g, '');

    return safe !== '' ? safe : 'picture';
  }

  /**
   * Bytes de qualquer formato binário. String só por compatibilidade com o
   * SDK PHP, como bytes crus (latin1) — texto UTF-8 se corromperia, por isso
   * ela fica fora do tipo. Qualquer outra coisa é erro de integração: mandar
   * 0 bytes em silêncio seria pior.
   *
   * @throws TypeError conteúdo em formato não suportado
   */
  private static toBuffer(contents: unknown): Buffer {
    if (Buffer.isBuffer(contents)) {
      return contents;
    }

    if (ArrayBuffer.isView(contents)) {
      return Buffer.from(contents.buffer, contents.byteOffset, contents.byteLength);
    }

    if (contents instanceof ArrayBuffer || Object.prototype.toString.call(contents) === '[object ArrayBuffer]') {
      return Buffer.from(contents as ArrayBuffer);
    }

    if (typeof contents === 'string') {
      return Buffer.from(contents, 'latin1');
    }

    throw new TypeError('PzAccountSdk: "contents" da foto precisa ser Buffer, Uint8Array ou ArrayBuffer.');
  }
}
