/**
 * Formulaire multi-étapes — barre de progression + contenu de l'étape courante.
 */
import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { font, fontFamily, radius, spacing, useE237Colors } from './core';
import { haptic } from './haptics';

export interface StepperFormProps {
  /** Index 1-based de l'étape courante. */
  step: number;
  totalSteps: number;
  title?: string;
  subtitle?: string;
  children: ReactNode;
}

export function StepperForm({
  step,
  totalSteps,
  title,
  subtitle,
  children,
}: StepperFormProps) {
  const c = useE237Colors();
  const prevStep = useRef(step);

  useEffect(() => {
    if (prevStep.current !== step) {
      haptic('selection');
      prevStep.current = step;
    }
  }, [step]);

  return (
    <View style={styles.root}>
      <View style={styles.progressRow}>
        {Array.from({ length: totalSteps }, (_, i) => {
          const done = i + 1 <= step;
          return (
            <View
              key={i}
              style={[
                styles.progressSegment,
                {
                  backgroundColor: done ? c.accent : c.border,
                  opacity: done ? 1 : 0.55,
                },
              ]}
            />
          );
        })}
      </View>

      <Text style={[styles.stepHint, { color: c.textMuted }]}>
        Étape {step} sur {totalSteps}
      </Text>

      {title ? (
        <Text style={[styles.title, { color: c.textPrimary }]}>{title}</Text>
      ) : null}
      {subtitle ? (
        <Text style={[styles.subtitle, { color: c.textSecondary }]}>
          {subtitle}
        </Text>
      ) : null}

      <Animated.View
        key={step}
        entering={FadeIn.duration(220)}
        exiting={FadeOut.duration(120)}
        style={styles.body}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing['3'],
  },
  progressRow: {
    flexDirection: 'row',
    gap: spacing['1'],
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: radius.full,
  },
  stepHint: {
    fontFamily: fontFamily.displaySemi,
    fontSize: font.size.xs,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: fontFamily.display,
    fontSize: font.size.xl,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: fontFamily.body,
    fontSize: font.size.sm,
    lineHeight: 20,
  },
  body: {
    gap: spacing['3'],
  },
});
