"use client";

import { useState } from "react";

import { Avatar } from "./primitives";

export interface ProfileAvatarProps {
  /** URL résolue par l'API (`profile.avatar_url`) ou aperçu local. */
  src?: string | null;
  /** Nom affiché — initiale de repli et description accessible. */
  name: string | null | undefined;
  size?: number;
  className?: string;
}

/**
 * Photo de profil d'un joueur, avec repli sur l'initiale du design system.
 *
 * Le repli n'est PAS l'icône « image cassée » de `MediaImage` : sur un profil,
 * l'absence de photo est la normale (une photo reste privée tant qu'un
 * administrateur ne l'a pas approuvée), pas un incident. Une URL qui casse
 * (média retiré, réseau) retombe donc elle aussi sur la pastille à initiale.
 *
 * Jumeau natif : `ProfileAvatar` de `@esport237hub/ui/native`, mêmes props.
 */
export function ProfileAvatar({
  src,
  name,
  size = 40,
  className = "",
}: ProfileAvatarProps) {
  // On mémorise l'URL qui a échoué, pas un simple booléen : changer de photo
  // doit retenter le chargement sans effet de synchronisation.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!src || failedSrc === src) {
    return <Avatar name={name} size={size} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`Photo de profil de ${name ?? "joueur"}`}
      width={size}
      height={size}
      decoding="async"
      onError={() => setFailedSrc(src)}
      className={`shrink-0 rounded-full border border-edge bg-raised object-cover ${className}`.trim()}
      style={{ width: size, height: size }}
    />
  );
}
