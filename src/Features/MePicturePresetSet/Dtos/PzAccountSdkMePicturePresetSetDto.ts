import { PzAccountSdkPicturePresetEnum, type PzAccountSdkPicturePresetValue } from '../../../Enum/PzAccountSdkPicturePresetEnum.js';
import { PzAccountSdkDto, mask, pullString, valuesOf, type PzAccountSdkValues } from '../../../Support/PzAccountSdkDto.js';

export interface PzAccountSdkMePicturePresetSetInput {
  access_token: string;
  preset: PzAccountSdkPicturePresetEnum | PzAccountSdkPicturePresetValue;
}

/**
 * Entrada de `mePicturePresetSet` — troca a foto por uma ilustração pronta.
 *
 * Preset desconhecido lança `TypeError` já aqui: é erro de integração, e
 * mandá-lo ao provedor só trocaria a exceção por um 422.
 */
export class PzAccountSdkMePicturePresetSetDto extends PzAccountSdkDto {
  readonly access_token: string;
  readonly preset: PzAccountSdkPicturePresetEnum;

  constructor(props: PzAccountSdkMePicturePresetSetInput) {
    super();
    this.access_token = props.access_token;
    this.preset = PzAccountSdkPicturePresetEnum.from(props.preset);
  }

  static from(values: unknown): PzAccountSdkMePicturePresetSetDto {
    const v = valuesOf(values);

    return new PzAccountSdkMePicturePresetSetDto({
      access_token: pullString(v, 'access_token'),
      preset: PzAccountSdkPicturePresetEnum.tryFrom(v['preset']) ?? (pullString(v, 'preset') as PzAccountSdkPicturePresetValue),
    });
  }

  toArray(): PzAccountSdkValues {
    return { access_token: mask(this.access_token), preset: this.preset.value };
  }
}
