import { enCatalog } from './en.catalog';
import { enForms } from './en.forms';
import { enMoney } from './en.money';
import { enRanking } from './en.ranking';
import { enStatus } from './en.status';
import { enUi } from './en.ui';

import type { fr } from './fr';

export const en: Record<keyof typeof fr, string> = {
  ...enStatus,
  ...enCatalog,
  ...enMoney,
  ...enRanking,
  ...enForms,
  ...enUi,
};
