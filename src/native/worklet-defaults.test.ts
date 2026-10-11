/**
 * Garde-fou des worklets (11/10/2026).
 *
 * Une fonction `'worklet'` tourne sur le fil UI de Reanimated : le plugin
 * Babel des worklets y emporte les variables du module que le CORPS de la
 * fonction utilise — pas celles d'une valeur PAR DÉFAUT de paramètre. Sur le
 * téléphone, `minSize = THUMB_MIN` dans `scrollThumb` levait
 * « ReferenceError: Property 'THUMB_MIN' doesn't exist » à l'ouverture de
 * chaque écran défilant : l'erreur démontait TOUTE l'app, écran vide
 * (APK preview du 11/10/2026, reproduit sur émulateur). Le web ne le voyait
 * pas : ses worklets tournent sur le fil JS, sans transfert.
 *
 * Règle : dans une fonction `'worklet'`, une valeur par défaut est un
 * LITTÉRAL (nombre, texte, booléen, null, undefined). Une constante du module
 * se lit dans le corps (`const min = minSize ?? THUMB_MIN`).
 */
import { describe, expect, it } from 'bun:test';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import ts from 'typescript';

const ROOT = join(import.meta.dir, '..');

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === 'node_modules' ? [] : sourceFiles(path);
    return /\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : [];
  });
}

function isWorklet(fn: ts.FunctionLikeDeclaration): boolean {
  const body = fn.body;
  if (!body || !ts.isBlock(body)) return false;
  const first = body.statements[0];
  return (
    !!first &&
    ts.isExpressionStatement(first) &&
    ts.isStringLiteral(first.expression) &&
    first.expression.text === 'worklet'
  );
}

function isLiteral(node: ts.Expression): boolean {
  if (ts.isPrefixUnaryExpression(node)) return isLiteral(node.operand);
  if (ts.isParenthesizedExpression(node)) return isLiteral(node.expression);
  return (
    ts.isNumericLiteral(node) ||
    ts.isStringLiteral(node) ||
    ts.isNoSubstitutionTemplateLiteral(node) ||
    node.kind === ts.SyntaxKind.TrueKeyword ||
    node.kind === ts.SyntaxKind.FalseKeyword ||
    node.kind === ts.SyntaxKind.NullKeyword ||
    (ts.isIdentifier(node) && node.text === 'undefined')
  );
}

/** Les valeurs par défaut non littérales d'un paramètre, déstructuration comprise. */
function nonLiteralDefaults(name: ts.BindingName, init: ts.Expression | undefined): string[] {
  const found: string[] = [];
  if (init && !isLiteral(init)) found.push(init.getText());
  if (ts.isObjectBindingPattern(name) || ts.isArrayBindingPattern(name)) {
    for (const element of name.elements) {
      if (ts.isBindingElement(element)) found.push(...nonLiteralDefaults(element.name, element.initializer));
    }
  }
  return found;
}

function offenders(): string[] {
  const out: string[] = [];
  for (const file of sourceFiles(ROOT)) {
    const text = readFileSync(file, 'utf8');
    if (!text.includes("'worklet'") && !text.includes('"worklet"')) continue;
    const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
    const visit = (node: ts.Node) => {
      if (ts.isFunctionLike(node) && 'body' in node && isWorklet(node as ts.FunctionLikeDeclaration)) {
        for (const param of (node as ts.FunctionLikeDeclaration).parameters) {
          for (const bad of nonLiteralDefaults(param.name, param.initializer)) {
            const line = source.getLineAndCharacterOfPosition(param.getStart()).line + 1;
            out.push(`${relative(ROOT, file)}:${line} — valeur par défaut « ${bad} »`);
          }
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
  }
  return out;
}

describe('worklets — valeurs par défaut des paramètres', () => {
  it('aucune fonction worklet ne lit une variable du module dans une valeur par défaut', () => {
    expect(offenders()).toEqual([]);
  });
});
