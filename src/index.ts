import { parse } from '@babel/parser';
import { ObjectProperty, SpreadElement, ObjectMethod } from '@babel/types';
import { PaletteAlias, PaletteConfig, CssVariable, AnyObject } from '@kmart/types';
import { toCssVar, toCssVarFn } from '@kmart/utils';
import { createMacro } from 'babel-plugin-macros';

export type MacroHandler = Parameters<typeof createMacro>[0];

const convertPalette = (nodes: ObjectProperty[]) => {
  return nodes.reduce((prev, { key, value }) => {
    const name = key.type === 'Identifier' ? toCssVar(key.name as PaletteAlias) : '';
    let result;
    if (value.type === 'ArrayExpression') {
      const elements = (value.elements as unknown) as [{ value: PaletteAlias }, { value: string }];
      const [alias, opacity] = elements.map(item => item.value);
      result = `rgba(var(--${alias}), ${opacity})`;
    } else if (value.type === 'StringLiteral') {
      const alias = (value.value as unknown) as PaletteAlias;
      result = `rgb(var(--${alias})`;
    }

    if (!!name && !!result) {
      return {
        ...prev,
        [name]: result,
      };
    } else {
      return prev;
    }
  }, {} as Record<CssVariable<PaletteAlias>, string>);
};

const filterProperties = <T extends (ObjectMethod | ObjectProperty | SpreadElement)[]>(
  props: T
) => {
  return props.filter(item => item.type === 'ObjectProperty') as ObjectProperty[];
};

const objectToAst = <T extends AnyObject>(obj: T) => {
  const result = parse(`const temp = ${JSON.stringify(obj)}`);
  if (result) {
    const body = result.program.body[0];
    if (body.type === 'VariableDeclaration') {
      return body.declarations[0].init;
    }
  }
};

const createPalette: MacroHandler = ({ references }) => {
  references.default.forEach(referencePath => {
    const args = referencePath.parentPath.get('arguments');
    if (Array.isArray(args)) {
      const [firstArgumentPath] = args;
      if (firstArgumentPath.node.type === 'ObjectExpression') {
        const properties = filterProperties(firstArgumentPath.node.properties);
        const palette = convertPalette(properties);
        const paletteInAst = objectToAst(palette);
        if (paletteInAst) {
          firstArgumentPath.parentPath.replaceWith(paletteInAst);
        }
      }
    }
  });
};

export default createMacro(createPalette) as (
  config: PaletteConfig
) => Record<CssVariable<PaletteAlias>, string>;
