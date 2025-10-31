import { yojiData } from "@/assets/yojiData";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";

export interface yojiDataProps {
  radical: string;
  reading: string;
  meaning: string;
  synonym: string;
  antonym?: string;
  note: string;
  kanken: number;
}

interface YojiMissingCharQuizProps {
  level: number;
  onFinish: (score: number) => void;
  onQuit: () => void;
}

const getRandomQuizSet = (level: number): yojiDataProps[] => {
  const filtered = yojiData.filter((item) => item.kanken === level);
  const shuffled = [...filtered].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 10);
};

const getRandomCharChoices = (correctChar: string, allChars: string[]) => {
  const unique = Array.from(new Set(allChars));
  const filtered = unique.filter((c) => c !== correctChar);
  const shuffled = filtered.sort(() => 0.5 - Math.random()).slice(0, 3);
  return [...shuffled, correctChar].sort(() => 0.5 - Math.random());
};

export const YojiMissingCharQuiz = ({
  level,
  onFinish,
  onQuit,
}: YojiMissingCharQuizProps) => {
  const [quizSet, setQuizSet] = useState<yojiDataProps[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [missingIndex, setMissingIndex] = useState(0);
  const [choices, setChoices] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [history, setHistory] = useState<
    { question: yojiDataProps; selected: string | null; correct: boolean }[]
  >([]);

  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const newSet = getRandomQuizSet(level);
    setQuizSet(newSet);
    setCurrentIndex(0);
    setScore(0);
    setHistory([]);
  }, [level]);

  const current = quizSet[currentIndex];
  const progress =
    quizSet.length > 0 ? ((currentIndex + 1) / quizSet.length) * 100 : 0;

  useEffect(() => {
    if (!current) return;

    // 四字熟語の中からランダムに一文字を隠す
    const randIdx = Math.floor(Math.random() * current.radical.length);
    setMissingIndex(randIdx);
    const missingChar = current.radical[randIdx];

    // 全データから漢字一覧を抽出して選択肢を作る
    const allChars = yojiData.flatMap((item) => item.radical.split(""));
    setChoices(getRandomCharChoices(missingChar, allChars));

    setSelected(null);
    setShowAnswer(false);
  }, [current]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [currentIndex]);

  const handleChoice = (char: string) => {
    if (selected) return;
    setSelected(char);
    setShowAnswer(true);

    const correctChar = current.radical[missingIndex];
    if (char === correctChar) {
      setScore((prev) => prev + 1);
    }

  };

  const handleNext = () => {

    setHistory((prev) => [
      ...prev,
      {
        question: current,
        selected,
        correct: selected === current.radical[missingIndex],
      },
    ]);    
    if (currentIndex + 1 === quizSet.length) {
      onFinish(score);
    } else {
      setCurrentIndex((p) => p + 1);
    }
  };

  if (!current)
    return (
      <LinearGradient
        colors={["#EFF6FF", "#E0E7FF"]}
        style={styles.loadingContainer}
      >
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>問題を読み込み中...</Text>
        </View>
      </LinearGradient>
    );

  const displayWord = current.radical
    .split("")
    .map((c, i) => (i === missingIndex ? "[？]" : c))
    .join("");

  const correctChar = current.radical[missingIndex];

  return (
    <LinearGradient
      colors={["#EEF2FF", "#EDE9FE"]}
      style={styles.container}
    >

      <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <Text style={styles.title}>四字熟語 一文字あてクイズ</Text>
          <View style={styles.headerRow}>
            <Text style={styles.scoreText}>
              {score} / {quizSet.length}
            </Text>
            <Pressable
              onPress={onQuit}
              style={({ pressed }) => [
                styles.quitButton,
                pressed && styles.quitButtonPressed,
              ]}
            >
              <Text style={styles.quitText}>終了</Text>
            </Pressable>
          </View>
          <View style={styles.progressBarBg}>
            <LinearGradient
              colors={["#6366F1", "#8B5CF6"]}
              style={[styles.progressBarFg, { width: `${progress}%` }]}
            />
          </View>
        </View>

        {/* メイン */}
        <View style={styles.mainCard}>
          {!showAnswer ? (
            <>
              <Text style={styles.meaningText}>【意味】{current.meaning}</Text>
              <Text style={styles.quizWord}>{displayWord}</Text>

              <View style={styles.choices}>
                {choices.map((c, idx) => (
                  <Pressable
                    key={idx}
                    onPress={() => handleChoice(c)}
                    disabled={!!selected}
                    style={({ pressed }) => [
                      styles.choice,
                      pressed && styles.choicePressed,
                    ]}
                  >
                    <Text style={styles.choiceText}>{c}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          ) : (
            <>
              <Text style={styles.resultEmoji}>
                {selected === correctChar ? "🎉" : "❌"}
              </Text>
              <Text
                style={[
                  styles.resultText,
                  selected === correctChar
                    ? styles.correct
                    : styles.incorrect,
                ]}
              >
                {selected === correctChar
                  ? "正解です！"
                  : `残念！正解は「${correctChar}」`}
              </Text>

              <Text style={styles.explanationTitle}>読み</Text>
              <Text style={styles.explanationKanji}>{current.radical}（{current.reading}）</Text>
              <Text style={styles.explanationTitle}>意味</Text>
              <Text style={styles.explanation}>{current.meaning}</Text>

              <Pressable
                onPress={handleNext}
                style={({ pressed }) => [
                  styles.nextButton,
                  pressed && styles.nextPressed,
                ]}
              >
                <LinearGradient
                  colors={["#4F46E5", "#7C3AED"]}
                  style={styles.nextGradient}
                >
                  <Text style={styles.nextText}>
                    {currentIndex + 1 === quizSet.length
                      ? "結果を見る"
                      : "次の問題へ"}
                  </Text>
                </LinearGradient>
              </Pressable>
            </>
          )}
        </View>

        {/* 履歴 */}
        {history.length > 0 && (
          <View style={styles.historyBox}>
            <Text style={styles.historyTitle}>回答履歴</Text>
            {history.map((h, i) => (
              <View
                key={i}
                style={[
                  styles.historyItem,
                  h.correct ? styles.historyCorrect : styles.historyIncorrect,
                ]}
              >
                <Text numberOfLines={1}>
                  Q{i + 1}. {h.question.radical}（{h.question.reading}）
                </Text>
                <Text numberOfLines={1}>
                  意味：{h.question.meaning}
                </Text>

              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingBox: { backgroundColor: "white", padding: 32, borderRadius: 16 },
  loadingText: { marginTop: 12, color: "#4B5563" },
  scroll: { padding: 16, paddingTop: 50 },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  celebrationBox: {
    backgroundColor: "#10B981",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    flexDirection: "row",
  },
  celebrationEmoji: { fontSize: 20, marginHorizontal: 8 },
  celebrationText: { color: "white", fontSize: 24, fontWeight: "bold" },
  header: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 8 },
  scoreText: { color: "#4F46E5", fontWeight: "bold" },
  quitButton: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  quitButtonPressed: { backgroundColor: "#FEE2E2" },
  quitText: { color: "#374151" },
  progressBarBg: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    marginTop: 8,
    overflow: "hidden",
  },
  progressBarFg: { height: 8, borderRadius: 4 },
  mainCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  meaningText: { fontSize: 16, color: "#1F2937", marginBottom: 16 },
  quizWord: {
    fontSize: 28,
    textAlign: "center",
    fontWeight: "bold",
    color: "#4F46E5",
    marginBottom: 24,
  },
  choices: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center" },
  choice: {
    backgroundColor: "#EEF2FF",
    padding: 12,
    borderRadius: 8,
    minWidth: 60,
    alignItems: "center",
  },
  choicePressed: { backgroundColor: "#C7D2FE" },
  choiceText: { fontSize: 18, color: "#312E81" },
  resultEmoji: { fontSize: 48, textAlign: "center", marginBottom: 8 },
  resultText: { fontSize: 18, textAlign: "center", marginBottom: 16 },
  correct: { color: "#059669" },
  incorrect: { color: "#DC2626" },
  explanationKanji:{
      fontSize: 20,
      color: "#374151",
      paddingBottom:3
  },
  explanationTitle: {
    fontWeight: "bold",
    color: "#4F46E5",
    marginBottom: 4,
  },
  explanation: {fontSize: 20, color: "#374151", marginBottom: 24 },
  nextButton: { borderRadius: 12, overflow: "hidden", alignSelf: "center" },
  nextGradient: { paddingHorizontal: 24, paddingVertical: 12 },
  nextPressed: { transform: [{ scale: 1.05 }] },
  nextText: { color: "white", fontWeight: "bold", fontSize: 16 },
  historyBox: { backgroundColor: "white", borderRadius: 12, padding: 16, marginTop: 16 },
  historyTitle: { fontWeight: "bold", marginBottom: 8 },
  historyItem: { padding: 8, borderRadius: 8, marginBottom: 4 },
   historyCorrect: { backgroundColor: "#D1FAE5" },
  historyIncorrect: { backgroundColor: "#FEE2E2" },
});

export default YojiMissingCharQuiz;
