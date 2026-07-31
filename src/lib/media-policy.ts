/**
 * Politique médias côté client — miroir de `apps/api/.../media-policy.ts`.
 *
 * Ces constantes étaient recopiées caractère pour caractère dans
 * `apps/web/src/components/media/media-upload.ts` et son jumeau natif
 * `apps/mobile/src/components/media/media-upload.ts`. Elles vivent désormais
 * ici : le PARCOURS réseau (URL signée, dépôt, `complete`) reste par
 * plateforme, seule la règle partagée monte dans le design system.
 *
 * Ces contrôles ne sont qu'un confort : le serveur revérifie TOUT au
 * `complete`. On les double côté client pour ne pas envoyer 8 Mo avant
 * d'apprendre que le format est refusé.
 */
import type { MediaKind } from '@esport237hub/types';

const MB = 1024 * 1024;

/** Types MIME acceptés à l'envoi (miroir de `isAllowedMimeType`). */
export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

/** Valeur de l'attribut `accept` d'un `<input type="file">`. */
export const IMAGE_ACCEPT_ATTRIBUTE = ALLOWED_IMAGE_MIME_TYPES.join(',');

/** Miroir de `maxBytesForKind` (API). */
export const MAX_BYTES_BY_KIND: Record<MediaKind, number> = {
  player_avatar: 8 * MB,
  game_artwork: 12 * MB,
  venue_photo: 8 * MB,
  duel_proof: 8 * MB,
  post_cover: 8 * MB,
  social_post_image: 8 * MB,
};

export function maxBytesForKind(kind: MediaKind): number {
  return MAX_BYTES_BY_KIND[kind];
}

/** « 8 Mo » — pour un message d'aide lisible. */
export function maxSizeLabel(kind: MediaKind): string {
  return `${Math.round(maxBytesForKind(kind) / MB)} Mo`;
}

/** Étapes visibles par l'utilisateur, dans l'ordre. */
export type UploadStep =
  | 'idle'
  | 'preparing'
  | 'uploading'
  | 'finalizing'
  | 'processing'
  | 'done';

export const UPLOAD_STEP_LABEL: Record<UploadStep, string> = {
  idle: '',
  preparing: 'Préparation de l’envoi…',
  uploading: 'Envoi de la photo…',
  finalizing: 'Vérification du fichier…',
  processing: 'Traitement de l’image…',
  done: 'Terminé',
};

/**
 * Fichier candidat, réduit à ce dont la règle a besoin.
 * Le `File` du navigateur y répond ; côté natif on passe
 * `{ type: asset.mimeType, size: asset.fileSize }`.
 */
export interface ImageFileLike {
  type: string;
  size: number;
}

/**
 * Refuse tout de suite un fichier que le serveur refuserait de toute façon.
 * Rend le message d'erreur en français, ou `null` si le fichier convient.
 */
export function validateImageFile(
  file: ImageFileLike,
  kind: MediaKind,
): string | null {
  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type as AllowedImageMimeType)) {
    return 'Format non accepté : choisis une image JPEG, PNG ou WebP.';
  }
  if (file.size <= 0) {
    return 'Ce fichier est vide.';
  }
  if (file.size > maxBytesForKind(kind)) {
    return `Fichier trop volumineux : ${maxSizeLabel(kind)} maximum.`;
  }
  return null;
}
