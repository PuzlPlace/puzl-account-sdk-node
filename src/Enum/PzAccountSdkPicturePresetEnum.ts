import { PzAccountSdkEnum, enumLookup } from './PzAccountSdkEnum.js';

export type PzAccountSdkPicturePresetValue =
  | 'puzzle'
  | 'rocket'
  | 'star'
  | 'leaf'
  | 'sun'
  | 'moon'
  | 'mountain'
  | 'wave'
  | 'cat'
  | 'fox'
  | 'owl'
  | 'robot'
  | 'mixer_truck'
  | 'hard_hat'
  | 'crane'
  | 'bricks'
  | 'laser_sword'
  | 'droid'
  | 'space_helmet'
  | 'ring_world'
  | 'electric_guitar'
  | 'rock_hand';

/**
 * Ilustrações prontas que o usuário pode escolher como foto da conta.
 *
 * Espelha `UserPicturePresetEnum` do Puzl Account. Um preset novo no provedor
 * exige nova versão do SDK.
 */
export class PzAccountSdkPicturePresetEnum extends PzAccountSdkEnum<PzAccountSdkPicturePresetValue> {
  static readonly PUZZLE = new PzAccountSdkPicturePresetEnum('PUZZLE', 'puzzle');
  static readonly ROCKET = new PzAccountSdkPicturePresetEnum('ROCKET', 'rocket');
  static readonly STAR = new PzAccountSdkPicturePresetEnum('STAR', 'star');
  static readonly LEAF = new PzAccountSdkPicturePresetEnum('LEAF', 'leaf');
  static readonly SUN = new PzAccountSdkPicturePresetEnum('SUN', 'sun');
  static readonly MOON = new PzAccountSdkPicturePresetEnum('MOON', 'moon');
  static readonly MOUNTAIN = new PzAccountSdkPicturePresetEnum('MOUNTAIN', 'mountain');
  static readonly WAVE = new PzAccountSdkPicturePresetEnum('WAVE', 'wave');
  static readonly CAT = new PzAccountSdkPicturePresetEnum('CAT', 'cat');
  static readonly FOX = new PzAccountSdkPicturePresetEnum('FOX', 'fox');
  static readonly OWL = new PzAccountSdkPicturePresetEnum('OWL', 'owl');
  static readonly ROBOT = new PzAccountSdkPicturePresetEnum('ROBOT', 'robot');
  static readonly MIXER_TRUCK = new PzAccountSdkPicturePresetEnum('MIXER_TRUCK', 'mixer_truck');
  static readonly HARD_HAT = new PzAccountSdkPicturePresetEnum('HARD_HAT', 'hard_hat');
  static readonly CRANE = new PzAccountSdkPicturePresetEnum('CRANE', 'crane');
  static readonly BRICKS = new PzAccountSdkPicturePresetEnum('BRICKS', 'bricks');
  static readonly LASER_SWORD = new PzAccountSdkPicturePresetEnum('LASER_SWORD', 'laser_sword');
  static readonly DROID = new PzAccountSdkPicturePresetEnum('DROID', 'droid');
  static readonly SPACE_HELMET = new PzAccountSdkPicturePresetEnum('SPACE_HELMET', 'space_helmet');
  static readonly RING_WORLD = new PzAccountSdkPicturePresetEnum('RING_WORLD', 'ring_world');
  static readonly ELECTRIC_GUITAR = new PzAccountSdkPicturePresetEnum('ELECTRIC_GUITAR', 'electric_guitar');
  static readonly ROCK_HAND = new PzAccountSdkPicturePresetEnum('ROCK_HAND', 'rock_hand');

  private static readonly lookup = enumLookup('PzAccountSdkPicturePresetEnum', [
    PzAccountSdkPicturePresetEnum.PUZZLE,
    PzAccountSdkPicturePresetEnum.ROCKET,
    PzAccountSdkPicturePresetEnum.STAR,
    PzAccountSdkPicturePresetEnum.LEAF,
    PzAccountSdkPicturePresetEnum.SUN,
    PzAccountSdkPicturePresetEnum.MOON,
    PzAccountSdkPicturePresetEnum.MOUNTAIN,
    PzAccountSdkPicturePresetEnum.WAVE,
    PzAccountSdkPicturePresetEnum.CAT,
    PzAccountSdkPicturePresetEnum.FOX,
    PzAccountSdkPicturePresetEnum.OWL,
    PzAccountSdkPicturePresetEnum.ROBOT,
    PzAccountSdkPicturePresetEnum.MIXER_TRUCK,
    PzAccountSdkPicturePresetEnum.HARD_HAT,
    PzAccountSdkPicturePresetEnum.CRANE,
    PzAccountSdkPicturePresetEnum.BRICKS,
    PzAccountSdkPicturePresetEnum.LASER_SWORD,
    PzAccountSdkPicturePresetEnum.DROID,
    PzAccountSdkPicturePresetEnum.SPACE_HELMET,
    PzAccountSdkPicturePresetEnum.RING_WORLD,
    PzAccountSdkPicturePresetEnum.ELECTRIC_GUITAR,
    PzAccountSdkPicturePresetEnum.ROCK_HAND,
  ]);

  static cases(): readonly PzAccountSdkPicturePresetEnum[] {
    return PzAccountSdkPicturePresetEnum.lookup.cases();
  }

  static from(value: PzAccountSdkPicturePresetEnum | PzAccountSdkPicturePresetValue | string): PzAccountSdkPicturePresetEnum {
    return PzAccountSdkPicturePresetEnum.lookup.from(value);
  }

  static tryFrom(value: unknown): PzAccountSdkPicturePresetEnum | null {
    return PzAccountSdkPicturePresetEnum.lookup.tryFrom(value);
  }
}
