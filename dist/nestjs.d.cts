import { r as PzAccountSdkClientOptions, t as PzAccountSdkClient } from "./PzAccountSdkClient-BTGGiVTp.cjs";
import { DynamicModule, InjectionToken, ModuleMetadata, OptionalFactoryDependency } from "@nestjs/common";
//#region src/NestJs/PzAccountSdkModule.d.ts
/** Token das opções resolvidas — para quem quiser injetá-las. */
export declare const PZ_ACCOUNT_SDK_OPTIONS: unique symbol;
interface PzAccountSdkModuleOptions extends PzAccountSdkClientOptions {
  /** Registra o client para a aplicação inteira, sem reimportar o módulo. */
  isGlobal?: boolean;
}
interface PzAccountSdkModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  /** Registra o client para a aplicação inteira, sem reimportar o módulo. */
  isGlobal?: boolean;
  inject?: Array<InjectionToken | OptionalFactoryDependency>;
  useFactory: (...args: any[]) => PzAccountSdkClientOptions | Promise<PzAccountSdkClientOptions>;
}
/**
 * Módulo NestJS do SDK: registra um `PzAccountSdkClient` único, injetável
 * pela própria classe.
 *
 * ```ts
 * @Module({ imports: [PzAccountSdkModule.forRoot({ isGlobal: true })] })
 * export class AppModule {}
 *
 * constructor(private readonly puzl: PzAccountSdkClient) {}
 * ```
 *
 * As opções vencem as variáveis `PUZL_ACCOUNT_*` de `process.env`; sem
 * opções, o client sai inteiro do ambiente.
 *
 * Montado sem decorators e sem import de runtime do `@nestjs/common`: o
 * mesmo arquivo serve ao Nest 9, 10, 11 e 12, em CommonJS ou ESM.
 */
export declare class PzAccountSdkModule {
  static forRoot(options?: PzAccountSdkModuleOptions): DynamicModule;
  static forRootAsync(options: PzAccountSdkModuleAsyncOptions): DynamicModule;
  private static module;
}
//#endregion
export { PzAccountSdkClient, type PzAccountSdkModuleAsyncOptions, type PzAccountSdkModuleOptions };