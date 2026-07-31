/**
 * Catalogue de skins partagé — UN SEUL contexte React pour le web ET le natif.
 *
 * L'application charge les skins de la boutique une fois (API), les pose ici,
 * et n'importe quelle carte résout sa clé sans prop drilling :
 *
 *   <SkinCatalogProvider catalog={skinsDeLApi}>…</SkinCatalogProvider>
 *   const skin = useSkin(profil.skinKey)   // → SkinSpec, jamais undefined
 *
 * Ce fichier n'importe que `react` : il est donc valide côté DOM comme côté
 * React Native. Il n'est PAS ré-exporté par `./skins` (point d'entrée sans
 * React, importable depuis Node) mais par les barrels `./web` et `./native`.
 */
import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { parseSkinSpec, resolveSkin, type BuiltinSkinKey, type SkinSpec } from './spec';

/** Catalogue indexé par `skin_key`. */
export type SkinCatalog = Readonly<Record<string, SkinSpec>>;

const EMPTY: SkinCatalog = Object.freeze({});

const SkinCatalogContext = createContext<SkinCatalog>(EMPTY);

export interface SkinCatalogProviderProps {
  /**
   * Skins venus de la base. Accepte des specs déjà normalisés ou des `design`
   * bruts (y compris l'ancien format `--pc-*`) : tout est passé au parseur
   * tolérant, donc une entrée corrompue n'empêche pas les autres de s'afficher.
   */
  catalog?: Readonly<Record<string, unknown>> | null;
  children: ReactNode;
}

export function SkinCatalogProvider({ catalog, children }: SkinCatalogProviderProps) {
  const value = useMemo<SkinCatalog>(() => {
    if (!catalog) return EMPTY;
    const out: Record<string, SkinSpec> = {};
    for (const [key, design] of Object.entries(catalog)) {
      out[key] = parseSkinSpec(design, { key });
    }
    return out;
  }, [catalog]);

  return <SkinCatalogContext.Provider value={value}>{children}</SkinCatalogContext.Provider>;
}

/** Catalogue courant (vide hors provider — les skins intégrés suffisent). */
export function useSkinCatalog(): SkinCatalog {
  return useContext(SkinCatalogContext);
}

/**
 * Résout ce qu'on a sous la main en `SkinSpec` complet : une clé (`'champion'`,
 * ou une clé boutique), un spec déjà construit, ou rien. Ne rend jamais
 * `undefined` — c'est cette garantie qui a supprimé le crash mobile sur un
 * `skin_key` inconnu.
 */
export function useSkin(
  skin?: string | SkinSpec | null,
  fallbackKey?: BuiltinSkinKey,
): SkinSpec {
  const catalog = useSkinCatalog();
  return useMemo(() => {
    if (skin && typeof skin === 'object') return skin;
    return resolveSkin(skin ?? null, catalog, fallbackKey);
  }, [skin, catalog, fallbackKey]);
}

/**
 * Résout une liste de clés en specs, sans doublon et sans trou : une clé
 * inconnue est ignorée plutôt que remplacée par le skin par défaut (sinon le
 * rail d'essayage afficherait N fois « Signature »).
 */
export function useSkins(keys: readonly string[]): SkinSpec[] {
  const catalog = useSkinCatalog();
  return useMemo(() => {
    const seen = new Set<string>();
    const out: SkinSpec[] = [];
    for (const key of keys) {
      const spec = resolveSkin(key, catalog);
      if (spec.key !== key || seen.has(spec.key)) continue;
      seen.add(spec.key);
      out.push(spec);
    }
    return out;
  }, [keys, catalog]);
}
