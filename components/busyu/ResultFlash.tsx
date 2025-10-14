// src/components/ResultFlash.tsx

import { kankenToGrade } from '@/assets/kankenToGrade';
import { Star } from 'lucide-react-native';
import React, { memo, useEffect, useRef } from 'react';
import { Animated, Modal, StyleSheet, Text, View } from 'react-native';

// (Kanjiの型定義は変更なし)
export interface Kanji {
  char: string;
  readings: string[];
  kanken: number;
}

// ★ 定数を定義してマジックナンバーを減らす
const DEFAULT_DURATION = 1500; // 1.5秒

// --- ★ 1. コンポーネントを分割 ---

// ★ 不正解表示のための専用コンポーネント
const IncorrectContent = memo(({ pulseAnimation }: { pulseAnimation: Animated.Value }) => (
  <Animated.View style={[styles.boxBase, styles.incorrectBox, { opacity: pulseAnimation }]}>
    <Text style={styles.incorrectText}>不正解！</Text>
  </Animated.View>
));

// ★ 正解表示のための専用コンポーネント
const CorrectContent = memo(({ kanji }: { kanji: Kanji }) => (
  <View style={[styles.boxBase, styles.correctBox]}>
    <View style={styles.correctTitleContainer}>
      <Star color="#f59e0b" size={24} />
      <Text style={styles.correctTitleText}>正解！</Text>
      <Star color="#f59e0b" size={24} />
    </View>
    <Text style={styles.kanjiChar}>{kanji.char}</Text>
    <Text style={styles.kanjiReading}>読み: {kanji.readings.join("、")}</Text>
    <Text style={styles.kanjiGrade}>{kankenToGrade(kanji.kanken)}</Text>
  </View>
));


// --- メインコンポーネント ---

interface ResultFlashProps {
  isCorrect: boolean;
  visible: boolean;
  kanji: Kanji | null;
  onDismiss: () => void;
  duration?: number; // ★ durationをpropsで受け取れるようにする
}

export default function ResultFlash({
  visible,
  kanji,
  isCorrect,
  onDismiss,
  duration = DEFAULT_DURATION, // ★ propsにデフォルト値を設定
}: ResultFlashProps) {
  
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  // 自動で閉じるタイマー (ロジックはほぼ変更なし)
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onDismiss();
      }, duration); // ★ propsのdurationを使用
      return () => clearTimeout(timer);
    }
  }, [visible, onDismiss, duration]);

  useEffect(() => {
    // 不正解の時だけアニメーションを実行
    if (visible && !isCorrect) {
      // 0.6秒かけて透明度を0.5にし、0.6秒かけて1に戻すループアニメーション
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 0.6,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // 表示が消えるか、正解の時はアニメーションを停止して値をリセット
      pulseAnimation.stopAnimation();
      pulseAnimation.setValue(1);
    }

    // コンポーネントが非表示になるときにアニメーションをクリーンアップ
    return () => {
      pulseAnimation.stopAnimation();
    };
  }, [visible, isCorrect, pulseAnimation]);


  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.modalContainer}>
        {/* ★ 3. 条件に応じて分割したコンポーネントを呼び出す */}
        {isCorrect ? (
          <CorrectContent kanji={kanji} />
        ) : (
          <IncorrectContent pulseAnimation={pulseAnimation} />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // モーダル全体のコンテナ。画面全体を覆い、内容を中央に配置する
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // 半透明の黒い背景
  },
  // 正解/不正解ボックスの共通スタイル
  boxBase: {
    width: '80%',
    maxWidth: 320,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    // iOS用の影
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    // Android用の影
    elevation: 8,
  },
  // 不正解表示のスタイル
  incorrectBox: {
    backgroundColor: '#fee2e2', // red-100
    borderWidth: 2,
    borderColor: '#f87171', // red-400
  },
  incorrectText: {
    color: '#b91c1c', // red-700
    fontWeight: 'bold',
    fontSize: 24,
  },
  // 正解表示のスタイル
  correctBox: {
    backgroundColor: '#dcfce7', // green-100
    borderWidth: 2,
    borderColor: '#86efac', // green-300
  },
  correctTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  correctTitleText: {
    color: '#15803d', // green-700
    fontWeight: 'bold',
    fontSize: 24,
  },
  kanjiChar: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#14532d', // green-800
    marginVertical: 12,
  },
  kanjiReading: {
    color: '#15803d', // green-700
    fontWeight: '600',
    marginBottom: 4,
    fontSize: 18,
  },
  kanjiGrade: {
    color: '#16a34a', // green-600
    fontSize: 16,
  },
});