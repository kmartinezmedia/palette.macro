import { PaletteAlias, PaletteConfig, CssVariable } from '@kmart/types';
import { createMacro } from 'babel-plugin-macros';
export declare type MacroHandler = Parameters<typeof createMacro>[0];
declare const _default: (config: PaletteConfig) => Record<CssVariable<PaletteAlias>, string>;
export default _default;
