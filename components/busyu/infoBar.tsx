// -----------------------
// src/components/InfoBar.tsx
// -----------------------
import { RefreshCw, Trophy } from "lucide-react-native"; // lucide-react-native をインポート
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Propsの型定義は変更なし
interface InfoBarProps {
  onToggleTimeMode: () => void;
  score: number;
  onReset: () => void;
}

export default function InfoBar({
  score,
  onReset,
  onToggleTimeMode,
}: InfoBarProps) {
  return (
    <View style={styles.container}>
      {/* 中央：スコア */}
      <View style={styles.centerSection}>
        <Trophy color="#eab308" size={24} />
        <Text style={styles.scoreText}>{score}点</Text>
      </View>

      {/* 右側：リセットボタン */}
      <TouchableOpacity onPress={onReset} style={styles.resetButton}>
        <RefreshCw color="white" size={16} />
        <Text style={styles.resetButtonText}>答え</Text>
      </TouchableOpacity>
    </View>
  );
}

// StyleSheetを使ってスタイリングを定義
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap", // 画面幅が狭い場合に折り返す
    gap: 16, // 各セクション間の余白
    paddingHorizontal: 8, // 水平方向のパディング
    paddingVertical: 12,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8, // 要素間の余白
    minWidth: 140,
  },
  timerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ef4444", // red-500
  },
  toggleButton: {
    backgroundColor: "#f59e0b", // yellow-500
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  toggleButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  centerSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minWidth: 60,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ca8a04", // yellow-600
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#6b7280", // gray-500
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  resetButtonText: {
    color: "white",
    fontSize: 14,
  },
});