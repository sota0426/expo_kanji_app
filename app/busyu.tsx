// app/busyu.js (or your preferred file name)
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    Dimensions,
    FlatList,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { Kanji } from "./types/kanji";
import { busyuData } from "@/assets/busyuData";
import { kankenToGakusei } from "@/kanji-app/src/components/kankenToGrade";


const RadicalSelector = ({ radicals, onSelect }) => (
  <FlatList
    data={radicals}
    keyExtractor={(item) => item.radical}
    numColumns={3}
    contentContainerStyle={styles.radicalListContainer}
    renderItem={({ item }) => (
      <TouchableOpacity style={styles.radicalButton} onPress={() => onSelect(item.radical)}>
        <Text style={styles.radicalButtonText}>{item.radical}</Text>
        <Text style={styles.radicalInfoText}>{item.reading}</Text>
        <Text style={styles.radicalInfoText}>({item.count}字)</Text>
      </TouchableOpacity>
    )}
  />
);

const GameExplanation = ({ onStart }) => (
  <View style={styles.explanationContainer}>
    <Text style={styles.explanationTitle}>遊び方</Text>
    <Text style={styles.explanationText}>
      部首から連想される漢字の「よみ」をひらがなで入力してください。正解すると残り時間が増えます。
    </Text>
    <TouchableOpacity style={styles.startButton} onPress={onStart}>
      <Text style={styles.startButtonText}>ゲーム開始</Text>
    </TouchableOpacity>
  </View>
);

const InfoBar = ({ timeLeft, isTimeUnlimited, onToggleTimeMode, score, onReset }) => (
    <View style={styles.infoBarContainer}>
        <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>SCORE</Text>
            <Text style={styles.infoValue}>{score}</Text>
        </View>
        <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>TIME</Text>
            <Text style={[styles.infoValue, isTimeUnlimited && {fontSize: 24}]}>{isTimeUnlimited ? "∞" : timeLeft}</Text>
        </View>
        <View style={styles.infoBarButtons}>
            <TouchableOpacity onPress={onToggleTimeMode} style={styles.smallButton}>
                <Text style={styles.smallButtonText}>{isTimeUnlimited ? "時間制限" : "無制限"}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onReset} style={styles.smallButton}>
                <Text style={styles.smallButtonText}>終了</Text>
            </TouchableOpacity>
        </View>
    </View>
);

const FoundKanjiList = ({ foundKanji, total }) => (
  <View>
    <Text style={styles.foundKanjiHeader}>見つけた漢字 ({foundKanji.length} / {total})</Text>
    <View style={styles.foundKanjiGrid}>
      {foundKanji.map((k, index) => (
        <View key={index} style={styles.foundKanjiItem}>
          <Text style={styles.foundKanjiChar}>{k.char}</Text>
        </View>
      ))}
    </View>
  </View>
);

const GameEndScreen = ({ score, currentRadical, foundKanji, allKanji, isGameClear, onReplay, onReturn }) => (
    <View style={styles.endScreenContainer}>
        <Text style={styles.endScreenTitle}>{isGameClear ? "🎉 全問正解！ 🎉" : "ゲーム終了"}</Text>
        <Text style={styles.endScreenScore}>スコア: {score}</Text>
        <Text style={styles.endScreenDetail}>
            「{currentRadical}」の漢字: {foundKanji.length} / {allKanji.length} 個 見つけました
        </Text>
        <View style={styles.endScreenButtons}>
            <TouchableOpacity style={[styles.endButton, styles.replayButton]} onPress={onReplay}>
                <Text style={styles.endButtonText}>もう一度プレイ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.endButton, styles.returnButton]} onPress={onReturn}>
                <Text style={styles.endButtonText}>部首選択に戻る</Text>
            </TouchableOpacity>
        </View>
    </View>
);

const KanjiInputWithHint = ({ value, onChange, onSubmit, isHintVisible, hints, onToggleHint }) => (
    <View style={styles.inputContainer}>
        <TextInput
            style={styles.textInput}
            placeholder="よみがなを入力"
            value={value}
            onChangeText={onChange}
            onSubmitEditing={onSubmit}
            autoCapitalize="none"
            autoCorrect={false}
        />
        <TouchableOpacity style={styles.submitButton} onPress={onSubmit}>
            <Text style={styles.submitButtonText}>答える</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.hintButton} onPress={onToggleHint}>
            <Text style={styles.hintButtonText}>{isHintVisible ? "ヒントを隠す" : "ヒントを見る"}</Text>
        </TouchableOpacity>
        {isHintVisible && (
            <View style={styles.hintBox}>
                {hints.length > 0 ? hints.map((h, i) => <Text key={i} style={styles.hintText}>{h}</Text>) : <Text style={styles.hintText}>ヒントはありません</Text>}
            </View>
        )}
    </View>
);

const ResultFlash = ({ visible, kanji, isCorrect }) => (
    <Modal visible={visible} transparent={true} animationType="fade">
        <View style={styles.flashContainer}>
            <View style={[styles.flashBox, isCorrect ? styles.flashCorrect : styles.flashIncorrect]}>
                {isCorrect ? (
                    <>
                        <Text style={styles.flashText}>正解！</Text>
                        <Text style={styles.flashKanji}>{kanji?.char}</Text>
                        <Text style={styles.flashText}>+{calcPoint(kanji?.kanken || 0)} pt</Text>
                    </>
                ) : (
                    <Text style={styles.flashText}>不正解</Text>
                )}
            </View>
        </View>
    </Modal>
);

/** ユーティリティ関数 */
const calcPoint = (kanken: number): number => {
    if (kanken >= 5 && kanken <= 10) return 1;
    if (kanken >= 3 && kanken <= 4) return 2;
    if (kanken >= 2 && kanken <= 2.5) return 3;
    if (kanken === 1.5) return 5;
    if (kanken === 1) return 8;
    return 1;
};

const kanaToHiragana = (str: string) => str.replace(/[ァ-ヶ]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0x60));
const toHalfWidth = (str: string) => str.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
const parseGrade = (gradeStr: string): number => {
    const raw = toHalfWidth(gradeStr || "");
    const match = raw.match(/\d+/);
    return match ? parseInt(match[0], 10) : 7;
};

// --- Main Game Component ---

export default function KanjiBushuGame() {
  const router = useRouter();

  const [radicalMap, setRadicalMap] = useState<Record<string, Kanji[]>>({});
  const [radicalReadings, setRadicalReadings] = useState<Record<string, string>>({});

  const [currentRadical, setCurrentRadical] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);

  const [input, setInput] = useState("");
  const [foundKanji, setFoundKanji] = useState<Kanji[]>([]);
  const [currentKanji, setCurrentKanji] = useState<Kanji | null>(null);
  const [showResult, setShowResult] = useState(false);

  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);

  const [hintList, setHintList] = useState<string[]>([]);
  const [isHintVisible, setIsHintVisible] = useState(false);
  const [isGameClear, setIsGameClear] = useState(false);
  const [isTimeUnlimited, setIsTimeUnlimited] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean>(false);

  useEffect(() => {
    const map: Record<string, Kanji[]> = {};
    const readingMap: Record<string, string> = {};
    busyuData.forEach(({ radical, reading, kanji }) => {
      readingMap[radical] = reading;
      map[radical] = kanji.map((k) => ({
        char: k.char,
        readings: [...(k.onyomi || []), ...(k.kunyomi || [])]
          .map((r) => kanaToHiragana(r.replace(/（.*?）/g, "")).toLowerCase()),
        meaning: (k.meaning?.[0] || "").replace(/。$/, ""),
        grade: parseGrade(k.grade || ""),
        kanken: k.kanken
      }));
    });
    setRadicalMap(map);
    setRadicalReadings(readingMap);
  }, []);

  const endGame = useCallback(() => {
    setGameStarted(false);
    setGameEnded(true);
  }, []);

  useEffect(() => {
    if (gameStarted && !gameEnded && !isTimeUnlimited && timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearTimeout(timerId);
    }
    if (gameStarted && !gameEnded && !isTimeUnlimited && timeLeft === 0) {
      endGame();
    }
  }, [gameStarted, gameEnded, timeLeft, isTimeUnlimited, endGame]);

  useEffect(() => {
    if (!currentRadical || gameEnded) return;
    const total = radicalMap[currentRadical]?.length || 0;
    if (foundKanji.length === total && total > 0) {
      setIsGameClear(true);
      endGame();
    }
  }, [foundKanji, currentRadical, radicalMap, gameEnded, endGame]);

  const startGame = (radical: string) => {
    setCurrentRadical(radical);
    setGameStarted(false); // Start with explanation screen
    setGameEnded(false);
    setInput("");
    setFoundKanji([]);
    setCurrentKanji(null);
    setShowResult(false);
    setScore(0);
    setTimeLeft(60);
    setIsHintVisible(false);
    setHintList([]);
    setIsGameClear(false);
  };

  const resetAll = () => {
    setCurrentRadical(null);
    setGameStarted(false);
    setGameEnded(false);
    setInput("");
    setFoundKanji([]);
    setCurrentKanji(null);
    setShowResult(false);
    setScore(0);
    setIsTimeUnlimited(false);
    setTimeLeft(60);
    setIsHintVisible(false);
    setHintList([]);
    setIsGameClear(false);
  };

  const generateHints = (excludeChar: string | null = null) => {
    if (!currentRadical) return;
    const notFound = radicalMap[currentRadical].filter(
      (k) => !foundKanji.some((f) => f.char === k.char) && k.char !== excludeChar
    );
    const hints = notFound
      .sort((a, b) => b.kanken - a.kanken)
      .slice(0, 2)
      .map((k) => `${k.meaning}　（${k.kanken ? kankenToGakusei(k.kanken) : "不明"}）`);
    setHintList(hints);
  };

  const checkAnswer = () => {
    if (!currentRadical || !input.trim()) return;
    const ans = input.trim().toLowerCase();
    const allKanji = radicalMap[currentRadical] || [];

    const matched = allKanji.find(
      (k) => !foundKanji.some((f) => f.char === k.char) && k.readings.includes(ans)
    );

    if (matched) {
      const pts = calcPoint(matched.kanken);
      if (!isTimeUnlimited) setTimeLeft((s) => s + 15);
      setScore((s) => s + pts);
      setFoundKanji((prev) => [...prev, matched]);
      setCurrentKanji(matched);
      setIsAnswerCorrect(true);
      setShowResult(true);
      if (isHintVisible) generateHints(matched.char);
      setTimeout(() => {
        setShowResult(false);
        setCurrentKanji(null);
      }, 2000);
    } else {
      setIsAnswerCorrect(false);
      setShowResult(true);
      setTimeout(() => setShowResult(false), 700);
    }
    setInput("");
  };

  const toggleHint = () => {
    if (!isHintVisible) generateHints();
    setIsHintVisible((v) => !v);
  };

  const radicalsWithCount = Object.entries(radicalMap)
    .map(([radical, kanjiList]) => ({
      radical,
      count: kanjiList.length,
      reading: radicalReadings[radical] || "？",
    }))
    .sort((a, b) => b.count - a.count);

  const currentAllKanji = currentRadical ? radicalMap[currentRadical] : [];

  return (
    <LinearGradient colors={['#eff6ff', '#faf5ff']} style={styles.flexContainer}>
      <SafeAreaView style={styles.flexContainer}>
        <ScrollView contentContainerStyle={styles.container}>
          {!currentRadical ? (
            <>
              <TouchableOpacity onPress={() => router.push("/")} style={styles.backButton}>
                <Text>← タイトルに戻る</Text>
              </TouchableOpacity>
              <Text style={styles.mainTitle}>部首を選択</Text>
              <RadicalSelector radicals={radicalsWithCount} onSelect={startGame} />
            </>
          ) : (
            <>
              <View style={styles.gameHeader}>
                <Text style={styles.radicalTitle}>
                  「{currentRadical}」（{radicalReadings[currentRadical] || "?"}）の漢字
                </Text>
              </View>

              {!gameStarted && !gameEnded && <GameExplanation onStart={() => setGameStarted(true)} />}
              
              {gameStarted && (
                <View style={styles.gameContainer}>
                  <View style={styles.card}>
                    <InfoBar
                      timeLeft={timeLeft}
                      isTimeUnlimited={isTimeUnlimited}
                      onToggleTimeMode={() => setIsTimeUnlimited((v) => !v)}
                      score={score}
                      onReset={endGame}
                    />
                    <View style={styles.radicalDisplayContainer}>
                        <View style={styles.radicalDisplay}>
                            <Text style={styles.radicalDisplayText}>{currentRadical}</Text>
                        </View>
                         <Text style={styles.kanjiCountText}>
                            全 {currentAllKanji.length} 個の漢字があります
                        </Text>
                    </View>
                    <KanjiInputWithHint
                      value={input}
                      onChange={setInput}
                      onSubmit={checkAnswer}
                      isHintVisible={isHintVisible}
                      hints={hintList}
                      onToggleHint={toggleHint}
                    />
                    <FoundKanjiList foundKanji={foundKanji} total={currentAllKanji.length} />
                  </View>
                </View>
              )}
              
              <ResultFlash visible={showResult} kanji={currentKanji} isCorrect={isAnswerCorrect} />

              {gameEnded && (
                <GameEndScreen
                  score={score}
                  currentRadical={currentRadical}
                  foundKanji={foundKanji}
                  allKanji={currentAllKanji}
                  isGameClear={isGameClear}
                  onReplay={() => startGame(currentRadical!)}
                  onReturn={resetAll}
                />
              )}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// --- StyleSheet ---
const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  flexContainer: { flex: 1 },
  container: {
    padding: 16,
    paddingBottom: 50,
  },
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  gameHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  radicalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
  },
  gameContainer: {
    gap: 24,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    gap: 20
  },
  // RadicalSelector styles
  radicalListContainer: {
    justifyContent: 'center',
  },
  radicalButton: {
    flex: 1,
    margin: 8,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    minHeight: 100
  },
  radicalButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  radicalInfoText: {
    fontSize: 12,
    color: '#6b7280',
  },
  // GameExplanation styles
  explanationContainer: {
    backgroundColor: '#f9fafb',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 20,
  },
  explanationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  explanationText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
    color: '#4b5563',
  },
  startButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 999,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // InfoBar styles
  infoBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  infoBox: {
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    color: '#6b7280',
    fontSize: 12,
  },
  infoValue: {
    color: '#1f2937',
    fontSize: 28,
    fontWeight: 'bold',
  },
  infoBarButtons: {
    gap: 8,
  },
  smallButton: {
    backgroundColor: 'white',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  smallButtonText: {
    color: '#374151'
  },
  // Radical Display
  radicalDisplayContainer: {
    alignItems: 'center',
  },
  radicalDisplay: {
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    padding: 24,
    marginBottom: 8,
  },
  radicalDisplayText: {
    fontSize: 80,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  kanjiCountText: {
    color: '#4b5563',
    fontSize: 16,
  },
  // Input styles
  inputContainer: {
    alignItems: 'center',
    gap: 12,
  },
  textInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    textAlign: 'center',
  },
  submitButton: {
    width: '100%',
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  hintButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  hintButtonText: {
    color: '#374151'
  },
  hintBox: {
    width: '100%',
    backgroundColor: '#fefce8',
    borderColor: '#facc15',
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
  },
  hintText: {
    color: '#713f12',
    textAlign: 'center',
  },
  // FoundKanjiList styles
  foundKanjiHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  foundKanjiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  foundKanjiItem: {
    backgroundColor: '#f3f4f6',
    width: 44,
    height: 44,
    borderRadius: 8,
    margin: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  foundKanjiChar: {
    fontSize: 24,
  },
  // ResultFlash styles
  flashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  flashBox: {
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    minWidth: 200,
  },
  flashCorrect: { backgroundColor: 'rgba(29, 78, 216, 0.9)' },
  flashIncorrect: { backgroundColor: 'rgba(220, 38, 38, 0.9)' },
  flashText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  flashKanji: {
    fontSize: 60,
    color: 'white',
    fontWeight: 'bold',
    marginVertical: 8,
  },
  // GameEndScreen styles
  endScreenContainer: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginVertical: 20,
    elevation: 5,
  },
  endScreenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  endScreenScore: {
    fontSize: 22,
    marginBottom: 8,
  },
  endScreenDetail: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 24,
    textAlign: 'center',
  },
  endScreenButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  endButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  replayButton: { backgroundColor: '#3b82f6' },
  returnButton: { backgroundColor: '#6b7280' },
  endButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});