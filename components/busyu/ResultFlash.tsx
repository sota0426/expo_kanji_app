import { kankenToGrade } from "@/assets/kankenToGrade"; // このパスはご自身のプロジェクトに合わせてください
import { Star } from "lucide-react-native";
import { Animated, StyleSheet, Text, View } from "react-native";
import { prpcessedKanji } from "./QuizScreen";


interface ResultFlashProps {
  kanji: prpcessedKanji;
}

export default function ResultFlash({
  kanji,
}: ResultFlashProps) {
 
  return (
    <View style={styles.overlay}>
      <Animated.View
        style={[
          styles.container,
        ]}
        role="alert"
        aria-live="assertive"
      >
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
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