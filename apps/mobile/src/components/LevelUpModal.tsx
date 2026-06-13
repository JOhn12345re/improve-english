import { useEffect } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import type { LevelInfo } from '@/data/xp-levels';

interface LevelUpModalProps {
  visible: boolean;
  levelInfo: LevelInfo | null;
  onDismiss: () => void;
}

const PARTICLE_COUNT = 12;
const PARTICLE_EMOJIS = ['\u2728', '\uD83C\uDF1F', '\u26A1', '\uD83C\uDF89', '\uD83D\uDCAB', '\uD83D\uDD25'];

function Particle({ index, delay }: { index: number; delay: number }) {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);

  const angle = (index / PARTICLE_COUNT) * Math.PI * 2;
  const distance = 100 + Math.random() * 60;

  useEffect(() => {
    opacity.value = withDelay(delay, withSequence(
      withTiming(1, { duration: 200 }),
      withDelay(600, withTiming(0, { duration: 400 })),
    ));
    translateX.value = withDelay(delay, withTiming(Math.cos(angle) * distance, { duration: 800, easing: Easing.out(Easing.cubic) }));
    translateY.value = withDelay(delay, withTiming(Math.sin(angle) * distance - 40, { duration: 800, easing: Easing.out(Easing.cubic) }));
    scale.value = withDelay(delay, withSequence(
      withSpring(1.2, { damping: 4 }),
      withTiming(0.3, { duration: 400 }),
    ));
  }, [delay, angle, distance, opacity, translateX, translateY, scale]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.Text style={[styles.particle, style]}>
      {PARTICLE_EMOJIS[index % PARTICLE_EMOJIS.length]}
    </Animated.Text>
  );
}

export default function LevelUpModal({ visible, levelInfo, onDismiss }: LevelUpModalProps) {
  const badgeScale = useSharedValue(0);
  const badgeRotate = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const btnOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      badgeScale.value = withSequence(
        withTiming(0, { duration: 0 }),
        withDelay(200, withSpring(1.2, { damping: 4, stiffness: 150 })),
        withSpring(1, { damping: 8 }),
      );
      badgeRotate.value = withSequence(
        withTiming(0, { duration: 0 }),
        withDelay(200, withSequence(
          withTiming(-10, { duration: 100 }),
          withTiming(10, { duration: 100 }),
          withTiming(-5, { duration: 100 }),
          withTiming(0, { duration: 100 }),
        )),
      );
      textOpacity.value = withDelay(600, withTiming(1, { duration: 400 }));
      btnOpacity.value = withDelay(1000, withTiming(1, { duration: 300 }));
    } else {
      badgeScale.value = 0;
      textOpacity.value = 0;
      btnOpacity.value = 0;
    }
  }, [visible, badgeScale, badgeRotate, textOpacity, btnOpacity]);

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: badgeScale.value },
      { rotate: `${badgeRotate.value}deg` },
    ],
  }));

  const textStyle = useAnimatedStyle(() => ({ opacity: textOpacity.value }));
  const btnStyle = useAnimatedStyle(() => ({ opacity: btnOpacity.value }));

  if (!levelInfo) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.content}>
          {/* Particles */}
          <View style={styles.particleContainer}>
            {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
              <Particle key={i} index={i} delay={300 + i * 50} />
            ))}
          </View>

          {/* Badge */}
          <Animated.View style={[styles.badge, badgeStyle]}>
            <Text style={styles.badgeIcon}>{levelInfo.icon}</Text>
            <Text style={styles.badgeLevel}>{levelInfo.level}</Text>
          </Animated.View>

          {/* Text */}
          <Animated.View style={[styles.textBlock, textStyle]}>
            <Text style={styles.title}>LEVEL UP !</Text>
            <Text style={styles.subtitle}>Tu es maintenant</Text>
            <Text style={styles.levelName}>{levelInfo.title}</Text>
            <Text style={styles.levelSub}>Niveau {levelInfo.level}</Text>
          </Animated.View>

          {/* Dismiss */}
          <Animated.View style={btnStyle}>
            <TouchableOpacity style={styles.btn} onPress={onDismiss} activeOpacity={0.85}>
              <Text style={styles.btnText}>Continue !</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  particleContainer: {
    position: 'absolute',
    width: 0,
    height: 0,
    alignItems: 'center',
    justifyContent: 'center',
    top: '40%',
  },
  particle: {
    position: 'absolute',
    fontSize: 24,
  },
  badge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1E1B4B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#F59E0B',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 30,
  },
  badgeIcon: {
    fontSize: 40,
  },
  badgeLevel: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    marginTop: -4,
  },
  textBlock: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#F59E0B',
    letterSpacing: 3,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#D1D5DB',
    fontWeight: '500',
  },
  levelName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginTop: 4,
  },
  levelSub: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
    fontWeight: '500',
  },
  btn: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  btnText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E1B4B',
  },
});
