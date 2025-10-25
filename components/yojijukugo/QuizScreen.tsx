import { yojiData } from "@/assets/yojiData";
import { LinearGradient } from "expo-linear-gradient"; // グラデーションに必要
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

// --- モックデータ (インポートが正しく動作するまで) ---
// 実際のyojiData.tsファイルからインポートしてください
// import { yojiData, yojiDataProps } from "./yojiData";
export interface yojiDataProps {
  radical: string;
  reading: string;
  meaning: string;
  synonym: string;
  antonym?: string;
  note: string;
  kanken: number;
}

interface YojiProps {
  level: number;
  onFinish: (score: number) => void;
  onQuit: () => void;
}

const getRandomQuizSet = (level: number): yojiDataProps[] => {
  const filtered = yojiData.filter((item) => item.kanken === level);
  const shuffled = [...filtered].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 10); // 10問 (データが少ない場合は全問)
};

const getRandomChoices = (correct: yojiDataProps, allData: yojiDataProps[]) => {
  const shuffled = allData
    .filter((item) => item.radical !== correct.radical)
    .sort(() => 0.5 - Math.random())
    .slice(0, 5);
  return [...shuffled, correct].sort(() => 0.5 - Math.random());
};

export const YojiQuiz = ({
  level,
  onFinish,
  onQuit
}: YojiProps) => {
  const [quizSet, setQuizSet] = useState<yojiDataProps[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [choices, setChoices] = useState<yojiDataProps[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [history, setHistory] = useState<
    {
      question: yojiDataProps;
      selected: string | null;
      correct: boolean;
    }[]
  >([]);

  // 初回レンダリング時にquizSetを作成
  useEffect(() => {
    const newQuizSet = getRandomQuizSet(level);
    setQuizSet(newQuizSet);
    setCurrentIndex(0);
    setScore(0);
    setHistory([]); // クイズ開始時に履歴をリセット
  }, [level]);

  const current = quizSet[currentIndex];
  const progress = quizSet.length > 0 ? ((currentIndex + 1) / quizSet.length) * 100 : 0;

  useEffect(() => {
    if (!current) return;
    setChoices(getRandomChoices(current, yojiData));
    setSelected(null);
    setShowAnswer(false);
    setShowCelebration(false);
  }, [current]);

  const handleChoice = (radical: string) => {
    if (selected) return;
    setSelected(radical);
    setShowAnswer(true);

    if (radical === current.radical) {
      setScore((prev) => prev + 1);
      setShowCelebration(true);
      // 正解時の効果音やアニメーション用のタイマー
      setTimeout(() => setShowCelebration(false), 1500);
    }
  };

  const handleNextQuiz = () => {
    setHistory((prev) => [
      ...prev,
      {
        question: current,
        selected,
        correct: selected === current.radical,
      },
    ]);

    if (currentIndex + 1 === quizSet.length) {
      onFinish(score);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  // --- ローディング表示 ---
  if (!current) {
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
  }

  // --- メインのクイズ表示 ---
  return (
    <LinearGradient
      colors={["#EFF6FF", "#E0E7FF", "#F3E8FF"]}
      style={styles.container}
    >
      {/* --- 正解時のお祝いモーダル --- */}
      <Modal
        transparent={true}
        visible={showCelebration}
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <View style={styles.celebrationBox}>
            <Text style={styles.celebrationEmoji}>🎉</Text>
            <Text style={styles.celebrationText}>正解！</Text>
            <Text style={styles.celebrationEmoji}>🎉</Text>
          </View>
        </View>
      </Modal>

      {/* --- メインコンテンツ --- */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* ヘッダー */}
        <View style={styles.headerContainer}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>四字熟語クイズ</Text>
            <View style={styles.headerControls}>
              <View style={styles.scoreBadge}>
                <Text style={styles.scoreText}>{score} / {quizSet.length}</Text>
              </View>
              <Pressable
                onPress={onQuit}
                style={({ pressed }) => [
                  styles.quitButton,
                  pressed && styles.quitButtonPressed,
                ]}
              >
                <Text style={styles.quitButtonText}>終了</Text>
              </Pressable>
            </View>
          </View>

          {/* プログレスバー */}
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>{currentIndex + 1}/{quizSet.length}</Text>
            <View style={styles.progressBarBg}>
              <LinearGradient
                colors={["#4F46E5", "#7C3AED"]}
                style={[styles.progressBarFg, { width: `${progress}%` }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
          </View>
        </View>

        {/* メインカード */}
        <View style={styles.mainCard}>
          {!showAnswer ? (
            // --- 問題表示モード ---
            <>
              <View style={styles.questionSection}>
                <Text style={styles.questionTitle}>この意味の四字熟語は？</Text>
                <View style={styles.meaningBox}>
                  <Text style={styles.meaningText}>{current.meaning}</Text>
                </View>
              </View>

              {/* 選択肢 */}
              <View style={styles.choicesContainer}>
                {choices.map((item, index) => (
                  <Pressable
                    key={item.radical}
                    onPress={() => handleChoice(item.radical)}
                    disabled={selected !== null}
                    style={({ pressed }) => [
                      styles.choiceButton,
                      pressed && styles.choiceButtonPressed,
                    ]}
                  >
                    <View style={styles.choiceContent}>
                      <View style={styles.choiceLetterCircle}>
                        <Text style={styles.choiceLetterText}>
                          {String.fromCharCode(65 + index)}
                        </Text>
                      </View>
                      <View style={styles.choiceTextContainer}>
                        <Text style={styles.choiceRadical}>{item.radical}</Text>
                        <Text style={styles.choiceReading}>({item.reading})</Text>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            </>
          ) : (
            // --- 解答表示モード ---
            <View style={styles.answerSection}>
              {/* 結果表示 */}
              <View style={styles.resultContainer}>
                <Text style={styles.resultEmoji}>
                  {selected === current.radical ? "🎉" : "❌"}
                </Text>
                <Text style={[
                  styles.resultText,
                  selected === current.radical ? styles.resultTextCorrect : styles.resultTextIncorrect
                ]}>
                  {selected === current.radical
                    ? "正解！素晴らしいです！"
                    : `不正解 - 正解は「${current.radical}」`
                  }
                </Text>
              </View>

              {/* 選択肢の結果 */}
              <View style={styles.choicesContainer}>
                {choices.map((item, index) => {
                  const isCorrect = item.radical === current.radical;
                  const isSelected = item.radical === selected;
                  let styleKey = styles.choiceDisabled; // デフォルト
                  if (isCorrect) styleKey = styles.choiceCorrect;
                  if (isSelected && !isCorrect) styleKey = styles.choiceIncorrect;

                  return (
                    <View key={item.radical} style={[styles.choiceResultBase, styleKey]}>
                      <View style={styles.choiceContent}>
                        <View style={[
                            styles.choiceLetterCircle,
                            isCorrect ? styles.choiceLetterCorrect : (isSelected ? styles.choiceLetterIncorrect : styles.choiceLetterDisabled)
                          ]}>
                          <Text style={[
                              styles.choiceLetterText,
                              isCorrect ? styles.choiceLetterTextCorrect : (isSelected ? styles.choiceLetterTextIncorrect : styles.choiceLetterTextDisabled)
                            ]}>
                            {String.fromCharCode(65 + index)}
                          </Text>
                        </View>
                        <View style={styles.choiceTextContainer}>
                          <Text style={[styles.choiceRadical, isCorrect || isSelected ? styles.choiceTextWhite : styles.choiceTextDisabled]}>{item.radical}</Text>
                          <Text style={[styles.choiceReading, isCorrect || isSelected ? styles.choiceTextWhite : styles.choiceTextDisabled]}>({item.reading})</Text>
                        </View>
                      </View>
                      <Text style={styles.choiceCheck}>
                        {isCorrect ? "✓" : isSelected ? "✗" : ""}
                      </Text>
                    </View>
                  );
                })}
              </View>

              {/* 補足情報 */}
              <View style={styles.explanationBox}>
                <Text style={styles.explanationTitle}>意味</Text>
                <Text style={styles.explanationContent}>{current.meaning}</Text>
                <Text style={styles.explanationTitle}>補足</Text>
                <Text style={styles.explanationContent}>{current.note || "なし"}</Text>
                <Text style={styles.explanationTitle}>類義語</Text>
                <Text style={styles.explanationContent}>{current.synonym || "なし"}</Text>
              </View>

              {/* 次へボタン */}
              <View style={styles.nextButtonContainer}>
                <Pressable
                  onPress={handleNextQuiz}
                  style={({ pressed }) => [styles.nextButton, pressed && styles.nextButtonPressed]}
                >
                  <LinearGradient
                    colors={["#4F46E5", "#7C3AED"]}
                    style={styles.nextButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.nextButtonText}>
                      {currentIndex + 1 === quizSet.length ? "結果を見る" : "次の問題へ"}
                    </Text>
                    <Text style={styles.nextButtonArrow}>→</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        {/* --- 回答履歴 --- */}
        {history.length > 0 && (
          <View style={styles.historyContainer}>
            <Text style={styles.historyTitle}>回答履歴</Text>
            {history.map((entry, idx) => (
              <View
                key={`${entry.question.radical}-${idx}`}
                style={[
                  styles.historyItem,
                  entry.correct ? styles.historyItemCorrect : styles.historyItemIncorrect
                ]}
              >
                <View style={styles.historyItemText}>
                  <Text style={styles.historyItemQuestion} numberOfLines={1}>
                    Q{idx + 1}. {entry.question.meaning}
                  </Text>
                  <Text style={styles.historyItemDetails}>
                    選択: {entry.selected ?? "未選択"} ／ 正解: {entry.question.radical}
                  </Text>
                </View>
                <Text style={styles.historyItemEmoji}>
                  {entry.correct ? "✔️" : "❌"}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

// --- StyleSheet ---
const styles = StyleSheet.create({
  // ローディング
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingBox: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#4B5563",
  },
  // メインコンテナ
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16, // 全体にパディング
    paddingTop: 50, // ステータスバーを考慮
  },
  // お祝いモーダル
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  celebrationBox: {
    backgroundColor: "#10B981", // Tailwind green-500
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  celebrationEmoji: {
    fontSize: 20,
    marginHorizontal: 8,
  },
  celebrationText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  // ヘッダー
  headerContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.8)", // bg-white/80
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  headerControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  scoreBadge: {
    backgroundColor: "#E0E7FF", // indigo-100
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 16,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#3730A3", // indigo-800
  },
  quitButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#D1D5DB", // gray-300
    backgroundColor: "white",
  },
  quitButtonPressed: {
    backgroundColor: "#FEE2E2", // red-50
    borderColor: "#FCA5A5", // red-300
  },
  quitButtonText: {
    fontSize: 14,
    color: "#374151", // gray-700
  },
  // プログレスバー
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressText: {
    fontSize: 14,
    color: "#4B5563",
    marginRight: 12,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: "#E5E7EB", // gray-200
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFg: {
    height: 8,
    borderRadius: 4,
  },
  // メインカード
  mainCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)", // bg-white/90
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    flex: 1, // 画面いっぱいに広がる
  },
  // 問題セクション
  questionSection: {
    marginBottom: 24,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
    textAlign: "center",
  },
  meaningBox: {
    backgroundColor: "linear-gradient(to right, #EEF2FF, #F5E8FF)", // from-indigo-50 to-purple-50
    borderRadius: 8,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#6366F1", // indigo-500
  },
  meaningText: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "500",
  },
  // 選択肢
  choicesContainer: {
    flexDirection: "column",
    gap: 12, // React Native 0.71+
  },
  choiceButton: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    backgroundColor: "white",
    borderColor: "#C7D2FE", // indigo-200
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  choiceButtonPressed: {
    backgroundColor: "#EEF2FF", // indigo-50
    borderColor: "#A5B4FC", // indigo-400
    transform: [{ scale: 1.02 }],
  },
  choiceContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  choiceLetterCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E0E7FF", // indigo-100
    marginRight: 12,
  },
  choiceLetterText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4338CA", // indigo-600
  },
  choiceTextContainer: {
    flex: 1,
  },
  choiceRadical: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  choiceReading: {
    fontSize: 14,
    color: "#4B5563",
  },
  // 回答セクション
  answerSection: {
    flex: 1,
    flexDirection: "column",
  },
  resultContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  resultEmoji: {
    fontSize: 30,
    marginBottom: 8,
  },
  resultText: {
    fontSize: 18,
    fontWeight: "600",
  },
  resultTextCorrect: {
    color: "#059669", // green-600
  },
  resultTextIncorrect: {
    color: "#DC2626", // red-600
  },
  // 回答後の選択肢
  choiceResultBase: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  choiceCorrect: {
    backgroundColor: "#34D399", // green-400
    borderColor: "#10B981", // green-500
  },
  choiceIncorrect: {
    backgroundColor: "#F87171", // red-400
    borderColor: "#EF4444", // red-500
  },
  choiceDisabled: {
    backgroundColor: "#F3F4F6", // gray-100
    borderColor: "#E5E7EB", // gray-200
  },
  choiceLetterCorrect: {
    backgroundColor: "white",
  },
  choiceLetterTextCorrect: {
    color: "#059669", // green-600
  },
  choiceLetterIncorrect: {
    backgroundColor: "white",
  },
  choiceLetterTextIncorrect: {
    color: "#DC2626", // red-600
  },
  choiceLetterDisabled: {
    backgroundColor: "#D1D5DB", // gray-300
  },
  choiceLetterTextDisabled: {
    color: "#4B5563", // gray-600
  },
  choiceTextWhite: {
    color: "white",
  },
  choiceTextDisabled: {
    color: "#6B7280", // gray-500
  },
  choiceCheck: {
    fontSize: 20,
    color: "white",
    fontWeight: "bold",
  },
  // 補足
  explanationBox: {
    backgroundColor: "#F9FAFB", // gray-50
    borderRadius: 8,
    padding: 16,
    marginVertical: 24,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4F46E5", // indigo-600
    marginBottom: 4,
    marginTop: 8,
  },
  explanationContent: {
    fontSize: 14,
    color: "#374151",
  },
  // 次へボタン
  nextButtonContainer: {
    alignItems: "center",
    paddingBottom:15,
  },
  nextButton: {
    borderRadius: 12,
    overflow: "hidden", // for gradient
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  nextButtonPressed: {
    transform: [{ scale: 1.05 }],
  },
  nextButtonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  nextButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  nextButtonArrow: {
    color: "white",
    fontSize: 16,
    marginLeft: 8,
  },
  // 履歴
  historyContainer: {
    marginTop: 24,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    padding: 16,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  historyItemCorrect: {
    backgroundColor: "#F0FDF4", // green-50
    borderColor: "#A7F3D0", // green-200
  },
  historyItemIncorrect: {
    backgroundColor: "#FEF2F2", // red-50
    borderColor: "#FECACA", // red-200
  },
  historyItemText: {
    flex: 1, // テキストがはみ出ないように
  },
  historyItemQuestion: {
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 4,
  },
  historyItemDetails: {
    fontSize: 12,
    color: "#6B7280",
  },
  historyItemEmoji: {
    fontSize: 18,
    marginLeft: 12,
  },
});

// デフォルトエクスポート
export default YojiQuiz;
