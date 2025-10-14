import React, { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Propsの型定義に `onChange` を追加
interface KanjiInputAndCheckProps {
  value: string;
  onChange: (text: string) => void; // 親から受け取るonChange関数
  onSubmit: () => void;
  hintList: string[];
}

export default function KanjiInputAndCheck({
  value,
  onChange, // propsからonChangeを受け取る
  onSubmit,
  hintList,
}: KanjiInputAndCheckProps) {
  const [isHintVisible, setIsHintVisible] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // ヒントの表示/非表示を切り替えるシンプルな関数
  const toggleHint = () => {
    setIsHintVisible((currentValue) => !currentValue);
  };

  // コンポーネント表示時にキーボードを自動で開く
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // 送信処理（キーボードを閉じる処理も追加）
  const handleSubmit = () => {
    if (!value.trim()) return; // 空の場合は送信しない
    onSubmit();
    Keyboard.dismiss(); // 送信時にキーボードを閉じる
  };

  return (
    <View style={styles.container}>
      <TextInput
        ref={inputRef}
        style={styles.input}
        value={value}
        // ここを修正：onChangeText を使い、受け取ったテキストを直接 onChange 関数に渡す
        onChangeText={onChange}
        onSubmitEditing={handleSubmit} // Enterキー押下時のイベント
        placeholder="読み方をひらがなで入力"
        placeholderTextColor="#9ca3af" // gray-400
        autoCapitalize="none"
        autoCorrect={false}
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!value.trim()}
          // disabled状態に応じてスタイルを動的に変更
          style={[
            styles.buttonBase,
            styles.submitButton,
            !value.trim() && styles.disabledButton,
          ]}
        >
          <Text style={styles.buttonText}>答える</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={toggleHint}
          style={[styles.buttonBase, styles.hintButton]}
        >
          <Text style={styles.buttonText}>
            {isHintVisible ? "ヒントを隠す" : "ヒントを見る"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ヒント表示エリア */}
      {isHintVisible && hintList.length > 0 && (
        <View style={styles.hintBox}>
          <Text style={styles.hintTitle}>ヒント（意味のみ）:</Text>
          {/* propsで受け取った hintList を直接使用 */}
          {hintList.map((hint, idx) => (
            <Text key={idx} style={styles.hintItem}>
              • {hint}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

// スタイル定義 (変更なし)
const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    width: "100%",
    padding: 16,
  },
  input: {
    fontSize: 16,
    padding: 12,
    borderWidth: 2,
    borderColor: "#d1d5db", // gray-300
    borderRadius: 8,
    width: "80%",
    textAlign: "center",
    backgroundColor: "white",
  },
  buttonContainer: {
    marginTop: 16,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap", // 小さい画面でもボタンが収まるように
  },
  buttonBase: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 140, // ボタンの最小幅を確保
  },
  submitButton: {
    backgroundColor: "#22c55e", // green-500
  },
  hintButton: {
    backgroundColor: "#f97316", // orange-500
  },
  disabledButton: {
    backgroundColor: "#d1d5db", // gray-300
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  hintBox: {
    marginTop: 16,
    backgroundColor: "#fef3c7", // yellow-100
    borderColor: "#fde047", // yellow-300
    borderWidth: 1,
    padding: 16,
    borderRadius: 8,
    width: "100%",
  },
  hintTitle: {
    fontWeight: "600",
    marginBottom: 8,
    fontSize: 16,
    color: "#374151", // gray-800
  },
  hintItem: {
    fontSize: 14,
    color: "#4b5563", // gray-700
    marginBottom: 4,
  },
});