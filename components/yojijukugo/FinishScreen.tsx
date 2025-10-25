import React from "react";
import {
 View,
 Text,
 StyleSheet,
 TouchableOpacity,
 SafeAreaView,
 StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient"; // Expoでグラデーションを使用するために必要です

interface FinishScreenProps {
 score: number;
 total: number;
 onRetry: () => void;
 onReturnTop: () => void;
}

export const FinishScreen: React.FC<FinishScreenProps> = ({
 score,
 total,
 onRetry,
 onReturnTop,
}) => {
 const percentage = Math.round((score / total) * 100);

 const getMessage = () => {
  if (percentage === 100) return "完璧です！素晴らしい！🎉";
  if (percentage >= 80) return "とてもよくできました！👏";
  if (percentage >= 50) return "あと少し！頑張りました👍";
  return "また挑戦してみましょう！💪";
 };

 return (
  <SafeAreaView style={styles.safeArea}>
   <StatusBar barStyle="dark-content" />
   <LinearGradient
    // 元のTailwind CSS (from-blue-100 via-purple-100 to-indigo-100) に近い色
    colors={["#DBEAFE", "#E9D5FF", "#E0E7FF"]}
    style={styles.gradient}
   />
   <View style={styles.container}>
    <View style={styles.card}>
     <Text style={styles.title}>クイズ終了！</Text>
     <Text style={styles.scoreText}>
      あなたのスコア：
      <Text style={styles.scoreHighlight}>
       {score} / {total}
      </Text>
      {"\n"}
      正答率：
      <Text style={styles.scoreHighlight}>{percentage}%</Text>
     </Text>

     {/* メッセージ */}
     <View style={styles.messageContainer}>
      <Text style={styles.messageText}>{getMessage()}</Text>
     </View>

     {/* アクションボタン */}
     <View style={styles.buttonContainer}>
      <TouchableOpacity
       style={[styles.button, styles.buttonRetry]}
       onPress={onRetry}
       activeOpacity={0.7}
      >
       <Text style={styles.buttonText}>もう一度挑戦する</Text>
      </TouchableOpacity>
      <TouchableOpacity
       style={[styles.button, styles.buttonReturn]}
       onPress={onReturnTop}
       activeOpacity={0.7}
      >
       <Text style={styles.buttonReturnText}>トップに戻る</Text>
      </TouchableOpacity>
     </View>
    </View>
   </View>
  </SafeAreaView>
 );
};

// スタイリング (Tailwind CSSクラスを変換)
const styles = StyleSheet.create({
 safeArea: {
  flex: 1,
 },
 gradient: {
  ...StyleSheet.absoluteFillObject, // 画面全体に広げる
 },
 container: {
  flex: 1,
  justifyContent: "center", // 垂直方向中央
  alignItems: "center", // 水平方向中央
  padding: 24, // p-6
 },
 card: {
  backgroundColor: "#ffffff", // bg-white
  padding: 32, // p-8
  borderRadius: 16, // rounded-2xl
  width: "100%", // w-full
  maxWidth: 448, // max-w-md
  alignItems: "center", // text-center
  // shadow-2xl
  shadowColor: "#000",
  shadowOffset: {
   width: 0,
   height: 25,
  },
  shadowOpacity: 0.1,
  shadowRadius: 20,
  elevation: 24, // Android用
 },
 title: {
  fontSize: 24, // text-2xl
  fontWeight: "bold", // font-bold
  color: "#4338ca", // text-indigo-700
  marginBottom: 16, // mb-4
 },
 scoreText: {
  fontSize: 20, // text-xl
  fontWeight: "600", // font-semibold
  color: "#1f2937", // text-gray-800
  marginBottom: 24, // mb-6
  textAlign: "center", // text-center
 },
 scoreHighlight: {
  color: "#4f46e5", // text-indigo-600
  fontWeight: "bold",
 },
 messageContainer: {
  marginBottom: 24, // mb-6
 },
 messageText: {
  fontSize: 14, // text-sm
  color: "#4b5563", // text-gray-600
  textAlign: "center",
 },
 buttonContainer: {
  width: "100%", // space-y-3 はボタンのマージンで対応
 },
 button: {
  borderRadius: 8, // rounded-lg
  paddingVertical: 12, // py-2 (py-3相当)
  paddingHorizontal: 24, // px-6
  alignItems: "center",
  width: "100%",
 },
 buttonRetry: {
  backgroundColor: "#6366f1", // bg-indigo-500
  marginBottom: 12, // space-y-3
 },
 buttonText: {
  color: "#ffffff", // text-white
  fontSize: 16,
  fontWeight: "600",
 },
 buttonReturn: {
  backgroundColor: "transparent",
  borderWidth: 1,
  borderColor: "#a5b4fc", // border-indigo-300 (hoverの代わりに)
 },
 buttonReturnText: {
  color: "#4f46e5", // text-indigo-600 (hoverの代わりに)
  fontSize: 16,
  fontWeight: "600",
 },
});

