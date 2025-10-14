import { Kanji } from "@/assets/busyuData";
import { kankenToGrade } from "@/assets/kankenToGrade";
import { Star } from "lucide-react-native";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

interface ResultFlashProps{
  visible:boolean;
  kanji:Kanji;
  isCorrect:boolean;
}

export default function ResultFlash({
  visible,
  kanji,
  isCorrect
}:ResultFlashProps){
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(()=>{
    if(visible && !isCorrect){
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim,{
            toValue:0.5,
            duration:500,
            useNativeDriver:true
          }),
          Animated.timing(pulseAnim,{
            toValue:1,
            duration:500,
            useNativeDriver:true
          }),
        ])
      ).start();
    }else{
      pulseAnim.setValue(1);
    }
  },[visible,isCorrect,pulseAnim])

  if(!visible){
    return null;
  }

  return (
    <View style={styles.overlay}>
      <View
        style={[styles.container, styles.correctContainer]}
        role="alert"
        aria-live="assertive"
      >
        <View style={styles.header}>
          <Star color="#F59E0B" size={24} style={styles.starIcon} />
          <Text style={[styles.baseText, styles.correctHeaderText]}>正解！ +10秒</Text>
          <Star color="#F59E0B" size={24} style={styles.starIcon} />
        </View>
        <Text style={[styles.baseText, styles.kanjiChar]}>{kanji.char}</Text>
        <Text style={[styles.baseText, styles.kanjiReading]}>
          読み: {kanji.readings.join("、")}
        </Text>
        <Text style={[styles.baseText, styles.kanjiGrade]}>
          {kankenToGrade(kanji.kanken)}
        </Text>
      </View>
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
    backgroundColor: "rgba(0, 0, 0, 0.2)", // 背景を少し暗くする場合
    zIndex: 50,
  },
  container: {
    borderRadius: 8,
    padding: 24,
    maxWidth: 320,
    width: "90%",
    alignItems: "center",
    borderWidth: 2,
    // iOS用の影
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    // Android用の影
    elevation: 5,
  },
  incorrectContainer: {
    backgroundColor: "#FEE2E2", // red-100
    borderColor: "#F87171", // red-400
  },
  correctContainer: {
    backgroundColor: "#D1FAE5", // green-100
    borderColor: "#6EE7B7", // green-300
  },
  baseText: {
    // アプリ全体で共通のフォント設定があればここに
  },
  incorrectText: {
    color: "#B91C1C", // red-700
    fontWeight: "bold",
    fontSize: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  correctHeaderText: {
    color: "#065F46", // green-800
    fontWeight: "bold",
    fontSize: 20,
    marginHorizontal: 8,
  },
  starIcon: {
    // 必要に応じてスタイル追加
  },
  kanjiChar: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#065F46", // green-800
    marginBottom: 16,
  },
  kanjiReading: {
    color: "#047857", // green-700
    fontWeight: "600", // semibold
    marginBottom: 4,
    fontSize: 16,
  },
  kanjiGrade: {
    color: "#059669", // green-600
    fontSize: 18,
  },
});