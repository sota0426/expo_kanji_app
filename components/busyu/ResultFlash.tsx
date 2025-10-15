import { Kanji } from "@/assets/busyuData";
import { kankenToGrade } from "@/assets/kankenToGrade"; // このパスはご自身のプロジェクトに合わせてください
import { Star, XCircle } from "lucide-react-native";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";


interface ResultFlashProps {
  kanji: Kanji;
  visible: boolean;
  isCorrect: boolean;
}

export default function ResultFlash({
  kanji,
  visible,
  isCorrect,
}: ResultFlashProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const animation = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    // 不正解で表示された時のみ、アニメーションを開始
    if (visible && !isCorrect) {
      animation.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.95, // 少し控えめな動きに変更
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      animation.current.start();
    } else {
      // アニメーションを停止し、値をリセット
      animation.current?.stop();
      pulseAnim.setValue(1);
    }

    // クリーンアップ関数
    return () => {
      animation.current?.stop();
    };
  }, [visible, isCorrect, pulseAnim]);

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      <Animated.View
        style={[
          styles.container,
          isCorrect ? styles.correctContainer : styles.incorrectContainer,
          // 不正解の時だけアニメーションスタイルを適用
          !isCorrect && { transform: [{ scale: pulseAnim }] },
        ]}
        role="alert"
        aria-live="assertive"
      >
        {isCorrect ? (
          // 正解の場合の表示
          <>
            <View style={styles.header}>
              <Star color="#F59E0B" fill="#F59E0B" size={24} style={styles.starIcon} />
              <Text style={[styles.baseText, styles.correctHeaderText]}>
                正解！ +10秒
              </Text>
              <Star color="#F59E0B" fill="#F59E0B" size={24} style={styles.starIcon} />
            </View>
            <Text style={[styles.baseText, styles.kanjiChar, styles.correctText]}>
              {kanji.char}
            </Text>
            <Text style={[styles.baseText, styles.kanjiReading, styles.correctSubText]}>
              読み: {kanji.readings.join("、")}
            </Text>
            <Text style={[styles.baseText, styles.kanjiGrade, styles.correctSubText]}>
              {kankenToGrade(kanji.kanken)}
            </Text>
          </>
        ) : (
          // 不正解の場合の表示
          <>
            <View style={styles.header}>
              <XCircle color="#B91C1C" size={24} />
              <Text style={[styles.baseText, styles.incorrectHeaderText]}>
                不正解...
              </Text>
            </View>
            <Text style={[styles.baseText, styles.kanjiChar, styles.incorrectText]}>
              {kanji.char}
            </Text>
            <Text style={[styles.baseText, styles.kanjiReading, styles.incorrectSubText]}>
              正解は: {kanji.readings.join("、")}
            </Text>
            <Text style={[styles.baseText, styles.kanjiGrade, styles.incorrectSubText]}>
              {kankenToGrade(kanji.kanken)}
            </Text>
          </>
        )}
      </Animated.View>
    </View>
  );
}


// スタイル定義
const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)", // 背景を少し濃く
    zIndex: 50,
  },
  container: {
    borderRadius: 12, // 角を少し丸く
    padding: 24,
    maxWidth: 320,
    width: "90%",
    alignItems: "center",
    borderWidth: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  // --- 不正解スタイル ---
  incorrectContainer: {
    backgroundColor: "#FEF2F2", // red-50
    borderColor: "#FCA5A5", // red-300
  },
  incorrectHeaderText: {
    color: "#991B1B", // red-800
    fontWeight: "bold",
    fontSize: 20,
    marginLeft: 8,
  },
  incorrectText: {
    color: "#B91C1C", // red-700
  },
  incorrectSubText: {
    color: "#DC2626" // red-600
  },
  // --- 正解スタイル ---
  correctContainer: {
    backgroundColor: "#F0FDF4", // green-50
    borderColor: "#A7F3D0", // green-200
  },
  correctHeaderText: {
    color: "#14532D", // green-900
    fontWeight: "bold",
    fontSize: 20,
    marginHorizontal: 8,
  },
  correctText: {
    color: "#15803D", // green-700
  },
  correctSubText: {
    color: "#16A34A" // green-600
  },
  // --- 共通スタイル ---
  baseText: {
    // 共通フォント設定など
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  starIcon: {
    // 必要に応じて
  },
  kanjiChar: {
    fontSize: 64, // 大きくしてインパクトを出す
    fontWeight: "bold",
    marginBottom: 16,
  },
  kanjiReading: {
    fontWeight: "600",
    marginBottom: 8,
    fontSize: 18,
  },
  kanjiGrade: {
    fontSize: 16,
    color: "#6B7280" // gray-500
  },
});