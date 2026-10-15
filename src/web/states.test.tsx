import { describe, expect, it } from 'bun:test';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { setDsLocale } from '../i18n/store';
import { ConfirmDialog } from './confirm-dialog';
import { EmptyState, ErrorNote, LoadError, Spinner, formatDate } from './primitives';
import { Toast, currentToast, hideToast, showToast } from './toast';

const html = (el: ReactElement) => renderToStaticMarkup(el);

/**
 * États des écrans (audit web du 15/10/2026) : chaque état dit quoi faire
 * ensuite. Rendu serveur : on vérifie ce que la page AFFICHE.
 */
describe('EmptyState : une sortie', () => {
  it('sans action, le texte seul', () => {
    const out = html(<EmptyState>Aucun duel.</EmptyState>);
    expect(out).toContain('Aucun duel.');
    expect(out).not.toContain('<button');
  });

  it('action en bouton (onClick) ou en lien (href)', () => {
    expect(html(<EmptyState action={{ label: 'Effacer les filtres', onClick: () => {} }}>Rien.</EmptyState>)).toContain(
      'Effacer les filtres</button>',
    );
    const link = html(<EmptyState action={{ label: 'Trouver un adversaire', href: '/duels' }}>Rien.</EmptyState>);
    expect(link).toContain('href="/duels"');
    expect(link).toContain('Trouver un adversaire');
  });
});

describe('ErrorNote et LoadError : réessayer dans l’encart', () => {
  it('ErrorNote sans onRetry : pas de bouton', () => {
    const out = html(<ErrorNote message="Pas de connexion." />);
    expect(out).toContain('role="alert"');
    expect(out).not.toContain('<button');
  });

  it('ErrorNote avec onRetry : « Réessayer » ou le libellé donné', () => {
    setDsLocale('fr');
    expect(html(<ErrorNote message="x" onRetry={() => {}} />)).toContain('Réessayer</button>');
    expect(html(<ErrorNote message="x" onRetry={() => {}} retryLabel="Relancer" />)).toContain('Relancer</button>');
  });

  it('LoadError : message, titre, Réessayer et une autre sortie', () => {
    setDsLocale('fr');
    const out = html(
      <LoadError
        title="Impossible de charger la file"
        message="Pas de connexion."
        onRetry={() => {}}
        action={{ label: 'Retour au tableau de bord', href: '/admin' }}
      />,
    );
    expect(out).toContain('Impossible de charger la file');
    expect(out).toContain('Pas de connexion.');
    expect(out).toContain('Réessayer</button>');
    expect(out).toContain('href="/admin"');
  });
});

describe('Spinner : gris, jamais l’accent', () => {
  it('text-muted', () => {
    const out = html(<Spinner />);
    expect(out).toContain('text-muted');
    expect(out).not.toContain('text-accent');
  });
});

describe('formatDate : fuseau de Douala, jamais « — »', () => {
  it('une date absente rend une chaîne vide', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
  });

  it('fuseau du produit et langue de l’app', () => {
    setDsLocale('fr');
    expect(formatDate('2026-10-10T23:30:00.000Z')).toBe('11 oct., 00:30');
    expect(formatDate('2026-10-10T23:30:00.000Z', 'time')).toBe('00:30');
    setDsLocale('en');
    expect(formatDate('2026-10-10T23:30:00.000Z', 'date')).toBe('11 Oct 2026');
    setDsLocale('fr');
  });
});

describe('Toast', () => {
  it('annonce la région même vide (lecteur d’écran)', () => {
    expect(html(<Toast toast={null} />)).toContain('aria-live="polite"');
  });

  it('un échec s’annonce tout de suite, avec l’icône d’alerte', () => {
    const out = html(<Toast toast={{ id: 1, message: 'Pas enregistré.', failed: true }} />);
    expect(out).toContain('role="alert"');
    expect(out).toContain('e237-toast--failed');
  });

  it('showToast avec undo pose « Annuler », qui referme puis annule', () => {
    setDsLocale('fr');
    let undone = 0;
    showToast('Joueur vérifié.', { undo: () => (undone += 1) });
    const shown = currentToast();
    expect(html(<Toast toast={shown} />)).toContain('Annuler</button>');
    shown?.action?.onPress();
    expect(undone).toBe(1);
    expect(currentToast()).toBeNull();
  });

  it('hideToast retire le bandeau', () => {
    showToast('Publié.');
    expect(currentToast()?.message).toBe('Publié.');
    hideToast();
    expect(currentToast()).toBeNull();
  });
});
