import React from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View,InteractionManager } from "react-native";

interface QuizInputSectionProps {
  inputRef: React.RefObject<TextInput | null>;
  inputText: string;
  setInputText: (text: string) => void;
  checkAnswer: () => void;
  toggleHint: () => void;
  toggleCard:()=>void;
  isHintVisible: boolean;
  isShowCard:boolean;
  hintList: string[];
}

export const QuizInputSection = React.memo(function QuizInputSection({
  inputRef,
  inputText,
  setInputText,
  checkAnswer,
  toggleHint,
  toggleCard,
  isHintVisible,
  isShowCard,
  hintList,
}:QuizInputSectionProps) {
  return (
    <View style={kanjiInput_styles.container}>
      <TextInput
        ref={inputRef}
        style={kanjiInput_styles.input}
        value={inputText}
        onChangeText={setInputText}
        onSubmitEditing={checkAnswer}
        placeholder="読み方をひらがなで入力"
        placeholderTextColor="#9ca3af"
        autoCapitalize="none"
      />
      <View style={kanjiInput_styles.buttonContainer}>
        <TouchableOpacity
          onPress={checkAnswer}
          disabled={!inputText.trim()}
          style={[
            kanjiInput_styles.buttonBase,
            kanjiInput_styles.submitButton,
            !inputText.trim() && kanjiInput_styles.disabledButton,
          ]}
        >
          <Text style={kanjiInput_styles.buttonText}>答える</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={toggleHint}
          style={[kanjiInput_styles.buttonBase, kanjiInput_styles.hintButton]}
        >
          <Text style={kanjiInput_styles.buttonText}>
            {isHintVisible ? "ヒントを隠す" : "ヒントを見る"}
          </Text>

        </TouchableOpacity>
        <TouchableOpacity
          onPress={toggleCard}
          style={[kanjiInput_styles.buttonBase, kanjiInput_styles.cardButton]}
        >
          <Text style={kanjiInput_styles.buttonText}>
            {isShowCard ? "カードを隠す" : "カードを見る"}
          </Text>

        </TouchableOpacity>
      </View>

      {/* ヒント表示エリア */}
      {isHintVisible && hintList.length > 0 && (
        <View style={kanjiInput_styles.hintBox}>
          <Text style={kanjiInput_styles.hintTitle}>ヒント（意味のみ）</Text>
          {hintList.map((hint, idx) => (
            <Text key={idx} style={kanjiInput_styles.hintItem}>
              • {hint}
            </Text>
          ))}
        </View>
      )}
      
    </View>
  );
});



const kanjiInput_styles = StyleSheet.create({
  container: {
    alignItems: "center",
    width: "100%",
    padding:16,
  },
  input: {
    fontSize: 16,
    padding: 12,
    borderWidth: 2,
    borderColor: "#d1d5db",
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
    flexWrap: "wrap",
  },
  buttonBase: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 140,
  },
  submitButton: {
    backgroundColor: "#22c55e",
  },
  hintButton: {
    backgroundColor: "#f97316",
  },
  cardButton: {
    backgroundColor: "#1671f9ff",
  },

  disabledButton: {
    backgroundColor: "#d1d5db",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  hintBox: {
    marginTop: 16,
    backgroundColor: "#fef3c7",
    borderColor: "#fde047",
    borderWidth: 1,
    padding: 16,
    borderRadius: 8,
    width: "100%",
  },
  hintTitle: {
    fontWeight: "600",
    marginBottom: 8,
    fontSize: 16,
    color: "#374151",
  },
  hintItem: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 4,
  },
});