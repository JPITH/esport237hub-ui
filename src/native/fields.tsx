/**
 * Champs de saisie React Native ESPORT 237 HUB (Expo) — famille complète.
 *
 * Mêmes tokens que le web (src/tokens) ; le mode light/dark suit
 * useColorScheme(). API volontairement parallèle à ../web/fields pour que les
 * écrans mobiles et web se ressemblent trait pour trait.
 *
 * Un champ `secureTextEntry` reçoit TOUJOURS le bouton œil afficher/masquer.
 * Icônes internes en react-native-svg (aucune dépendance d'icônes lourde).
 */
import { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { haptic } from './haptics';
import { useNeu } from './neu';
import Svg, { Circle, Path } from 'react-native-svg';

import { color, radius, spacing, type ColorScale } from '../tokens';
import { Txt } from './text';
import { fontFamily } from './typography';

/** Palette active selon le mode système (dark par défaut, ADN de la marque). */
function useColors(): ColorScale {
  const scheme = useColorScheme();
  return scheme === 'light' ? color.light : color.dark;
}

/** Champ = creux neu (`pressed-sm`) ; focus = liseré accent. */
/** Surface creusée d'un champ — compatible `View` comme `TextInput`. */
function fieldSurface(c: ColorScale, neu: ReturnType<typeof useNeu>, focused: boolean) {
  return {
    backgroundColor: c.surface,
    borderWidth: focused ? 1 : 0,
    borderColor: focused ? c.accent : 'transparent',
    ...neu.pressedSm,
  };
}

/**
 * Focus visible ARRONDI : le liseré du champ passe à l'accent. Sur le web
 * (react-native-web), l'outline navigateur par défaut est rectangulaire et
 * ignore le border-radius — on le neutralise ici, le liseré prend le relais.
 */
const NO_WEB_OUTLINE =
  Platform.OS === 'web'
    ? ({ outlineStyle: 'none' } as unknown as TextStyle)
    : null;

/* ------------------------------------------------------------------ */
/* Icônes internes (react-native-svg, style « trait »)                 */
/* ------------------------------------------------------------------ */

interface IconProps {
  color: string;
  size?: number;
}

function iconBase(size: number, c: string) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: c,
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
}

function IconEye({ color: c, size = 20 }: IconProps) {
  return (
    <Svg {...iconBase(size, c)}>
      <Path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <Circle cx="12" cy="12" r="3" />
    </Svg>
  );
}

function IconEyeOff({ color: c, size = 20 }: IconProps) {
  return (
    <Svg {...iconBase(size, c)}>
      <Path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <Path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <Path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <Path d="M2 2l20 20" />
    </Svg>
  );
}

function IconSearch({ color: c, size = 18 }: IconProps) {
  return (
    <Svg {...iconBase(size, c)}>
      <Circle cx="11" cy="11" r="8" />
      <Path d="m21 21-4.3-4.3" />
    </Svg>
  );
}

function IconX({ color: c, size = 16 }: IconProps) {
  return (
    <Svg {...iconBase(size, c)}>
      <Path d="M18 6 6 18" />
      <Path d="m6 6 12 12" />
    </Svg>
  );
}

function IconMinus({ color: c, size = 18 }: IconProps) {
  return (
    <Svg {...iconBase(size, c)}>
      <Path d="M5 12h14" />
    </Svg>
  );
}

function IconPlus({ color: c, size = 18 }: IconProps) {
  return (
    <Svg {...iconBase(size, c)}>
      <Path d="M5 12h14" />
      <Path d="M12 5v14" />
    </Svg>
  );
}

/** Drapeau du Cameroun minimal (trois barres — pas d'emoji, cf. DESIGN.md). */
function CameroonFlagMini() {
  return (
    <View style={{ flexDirection: 'row', borderRadius: 2, overflow: 'hidden' }}>
      <View style={{ width: 6, height: 12, backgroundColor: '#007a5e' }} />
      <View style={{ width: 6, height: 12, backgroundColor: '#ce1126' }} />
      <View style={{ width: 6, height: 12, backgroundColor: '#fcd116' }} />
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Field (+ œil automatique sur secureTextEntry)                       */
/* ------------------------------------------------------------------ */

export type FieldProps = TextInputProps & {
  label?: string;
  style?: StyleProp<ViewStyle>;
};

/** Champ de saisie. Jamais de TextInput natif brut dans les écrans. */
export function Field({ label, style, secureTextEntry, ...props }: FieldProps) {
  const c = useColors();
  const isPassword = !!secureTextEntry;
  // Le mot de passe démarre masqué ; l'œil bascule l'affichage.
  const neu = useNeu();
  const [hidden, setHidden] = useState(true);
  const [focused, setFocused] = useState(false);

  return (
    <View style={[{ gap: spacing['1'] }, style]}>
      {label ? (
        <Text style={[styles.fieldLabel, { color: c.textSecondary }]}>{label}</Text>
      ) : null}
      <View style={styles.fieldRow}>
        <TextInput
          placeholderTextColor={c.textMuted}
          {...props}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          secureTextEntry={isPassword ? hidden : secureTextEntry}
          style={[
            styles.field,
            NO_WEB_OUTLINE,
            fieldSurface(c, neu, focused),
            { color: c.textPrimary },
            isPassword && { paddingRight: 44 },
          ]}
        />
        {isPassword ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              hidden ? 'Afficher le mot de passe' : 'Masquer le mot de passe'
            }
            hitSlop={8}
            onPress={() => setHidden((v) => !v)}
            style={styles.eyeBtn}
          >
            {hidden ? (
              <IconEye color={c.textMuted} />
            ) : (
              <IconEyeOff color={c.textMuted} />
            )}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Textarea (Field multiligne)                                         */
/* ------------------------------------------------------------------ */

/** Zone de texte multiligne — même identité que Field. */
export function Textarea({ label, style, ...props }: FieldProps) {
  const c = useColors();
  const neu = useNeu();
  const [focused, setFocused] = useState(false);
  return (
    <View style={[{ gap: spacing['1'] }, style]}>
      {label ? (
        <Text style={[styles.fieldLabel, { color: c.textSecondary }]}>{label}</Text>
      ) : null}
      <TextInput
        placeholderTextColor={c.textMuted}
        multiline
        textAlignVertical="top"
        {...props}
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        style={[
          styles.field,
          styles.textarea,
          NO_WEB_OUTLINE,
          fieldSurface(c, neu, focused),
          { color: c.textPrimary },
        ]}
      />
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* Stepper (− / +)                                                     */
/* ------------------------------------------------------------------ */

/**
 * Saisie de nombre : boutons − / + autour d'un champ centré qui reste
 * éditable au clavier numérique. Zones tactiles 44 px.
 */
export function Stepper({
  label,
  value,
  onChange,
  min = 0,
  max = 99,
  step = 1,
  style,
}: {
  label?: string;
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  step?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const c = useColors();
  const neu = useNeu();
  const [focused, setFocused] = useState(false);

  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  const parse = (text: string) => {
    const n = Number.parseInt(text.replace(/[^0-9]/g, ''), 10);
    return Number.isNaN(n) ? min : clamp(n);
  };

  const side = (dir: 1 | -1) => {
    const disabled = dir === 1 ? value >= max : value <= min;
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={dir === 1 ? 'Augmenter' : 'Diminuer'}
        disabled={disabled}
        onPress={() => {
          haptic('selection');
          onChange(clamp(value + dir * step));
        }}
        style={({ pressed }) => [
          styles.stepperBtn,
          dir === 1
            ? { borderLeftWidth: 1, borderColor: c.border }
            : { borderRightWidth: 1, borderColor: c.border },
          pressed && { backgroundColor: `${c.accent}22` },
          disabled && { opacity: 0.35 },
        ]}
      >
        {dir === 1 ? (
          <IconPlus color={c.textSecondary} />
        ) : (
          <IconMinus color={c.textSecondary} />
        )}
      </Pressable>
    );
  };

  return (
    <View style={[{ gap: spacing['1'] }, style]}>
      {label ? (
        <Text style={[styles.fieldLabel, { color: c.textSecondary }]}>{label}</Text>
      ) : null}
      <View style={[styles.stepper, fieldSurface(c, neu, focused)]}>
        {side(-1)}
        <TextInput
          keyboardType="number-pad"
          value={String(value)}
          onChangeText={(t) => onChange(parse(t))}
          selectTextOnFocus
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[styles.stepperInput, NO_WEB_OUTLINE, { color: c.textPrimary }]}
        />
        {side(1)}
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* PhoneField                                                          */
/* ------------------------------------------------------------------ */

/** Groupes d'affichage d'un numéro camerounais : 6XX XX XX XX. */
function formatCmPhone(digits: string): string {
  const d = digits.slice(0, 9);
  return [d.slice(0, 3), d.slice(3, 5), d.slice(5, 7), d.slice(7, 9)]
    .filter(Boolean)
    .join(' ');
}

/**
 * Téléphone — préfixe VERROUILLÉ sur +237 (Cameroun) pour l'instant ;
 * l'indicatif deviendra sélectionnable à l'ouverture d'autres pays.
 */
export function PhoneField({
  label = 'Téléphone',
  value,
  onChange,
  placeholder = '6XX XX XX XX',
  style,
}: {
  label?: string;
  /** Chiffres du numéro national (9 max), sans le préfixe. */
  value: string;
  onChange: (digits: string) => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const c = useColors();
  const neu = useNeu();
  const [focused, setFocused] = useState(false);
  return (
    <View style={[{ gap: spacing['1'] }, style]}>
      {label ? (
        <Text style={[styles.fieldLabel, { color: c.textSecondary }]}>{label}</Text>
      ) : null}
      <View style={[styles.phoneWrap, fieldSurface(c, neu, focused)]}>
        <View
          style={[
            styles.phonePrefix,
            { borderRightColor: c.border, backgroundColor: c.surfaceRaised },
          ]}
        >
          <CameroonFlagMini />
          <Txt variant="label" tone="secondary">
            +237
          </Txt>
        </View>
        <TextInput
          keyboardType="phone-pad"
          autoComplete="tel-national"
          placeholderTextColor={c.textMuted}
          value={formatCmPhone(value)}
          placeholder={placeholder}
          onChangeText={(t) => onChange(t.replace(/\D/g, '').slice(0, 9))}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[styles.phoneInput, NO_WEB_OUTLINE, { color: c.textPrimary }]}
        />
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/* SearchField                                                         */
/* ------------------------------------------------------------------ */

/** Barre de recherche : icône, spinner pendant la requête, effacement. */
export function SearchField({
  value,
  onChange,
  onSubmit,
  placeholder = 'Rechercher…',
  loading = false,
  style,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const c = useColors();
  const neu = useNeu();
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.searchWrap, fieldSurface(c, neu, focused), style]}>
      <View style={styles.searchIcon}>
        {loading ? (
          <ActivityIndicator size="small" color={c.accent} />
        ) : (
          <IconSearch color={c.textMuted} />
        )}
      </View>
      <TextInput
        value={value}
        onChangeText={onChange}
        onSubmitEditing={onSubmit}
        placeholder={placeholder}
        placeholderTextColor={c.textMuted}
        returnKeyType="search"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[styles.searchInput, NO_WEB_OUTLINE, { color: c.textPrimary }]}
      />
      {value ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Effacer"
          hitSlop={8}
          onPress={() => onChange('')}
          style={styles.searchClear}
        >
          <IconX color={c.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fieldLabel: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 12,
  },
  fieldRow: { position: 'relative', justifyContent: 'center' },
  field: {
    minHeight: 48,
    borderRadius: radius.full,
    borderCurve: 'continuous',
    paddingHorizontal: spacing['4'],
    // Android ajoute un padding vertical par défaut qui décentre le
    // placeholder ; on le neutralise et on centre nous-mêmes.
    paddingVertical: 0,
    textAlignVertical: 'center',
    fontSize: 15,
  },
  textarea: {
    minHeight: 88,
    borderRadius: radius.xl,
    paddingVertical: spacing['3'],
    textAlignVertical: 'top',
  },
  eyeBtn: {
    position: 'absolute',
    right: 4,
    top: 0,
    bottom: 0,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'stretch',
    minHeight: 44,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderCurve: 'continuous',
  },
  stepperBtn: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperInput: {
    flex: 1,
    minWidth: 44,
    textAlign: 'center',
    textAlignVertical: 'center',
    paddingVertical: 0,
    fontFamily: fontFamily.bodyBold,
    fontSize: 16,
  },
  phoneWrap: {
    flexDirection: 'row',
    alignItems: 'stretch',
    minHeight: 44,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderCurve: 'continuous',
  },
  phonePrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['1'],
    paddingHorizontal: spacing['3'],
    borderRightWidth: 1,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: spacing['3'],
    paddingVertical: 0,
    textAlignVertical: 'center',
    fontSize: 15,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    borderRadius: radius.md,
    paddingHorizontal: spacing['2'],
    gap: spacing['1'],
    borderCurve: 'continuous',
  },
  searchIcon: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 0,
    textAlignVertical: 'center',
    fontSize: 15,
  },
  searchClear: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
