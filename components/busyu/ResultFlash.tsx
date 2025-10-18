import { kankenToGakusei } from "@/assets/kankenToGrade";
import { Animated, StyleSheet, Text, View } from "react-native";
import { KanjiData } from "./QuizScreen";

// 
// --- readingKanji 関数 (変更なし) ---
// 
export const readingKanji = (kanji: KanjiData) => {
  const kunyomiStr = (kanji.kunyomi && kanji.kunyomi.length > 0)
    ? kanji.kunyomi.join("、") // 区切り文字を "、" に変更
    : ""; 

  const onyomiStr = (kanji.onyomi && kanji.onyomi.length > 0)
    ? kanji.onyomi.join("、") // 区切り文字を "、" に変更
    : ""; 

  return {
    kunyomiStr,
    onyomiStr,
  };
}

interface ResultFlashProps {
  collectKanji:KanjiData;
}

export default function ResultFlash({
  collectKanji
}: ResultFlashProps) {
  const { kunyomiStr, onyomiStr } = readingKanji(collectKanji);

  return (
    <View style={styles.overlay}>
      <Animated.View
        style={[
          styles.container,
          styles.correctContainer,
        ]}
        role="alert"
        aria-live="assertive"
      >
          <>
            <Text style={[ styles.kanjiChar, styles.correctText]}>
              {collectKanji.char}
            </Text>

            {/* ▼▼▼ 修正箇所 ▼▼▼ */}
            
            {/* 訓読みが存在する場合のみ、専用の行で表示 */}
            {kunyomiStr && (
              // 1. ラッパーViewを追加
              <View style={styles.readingWrapper}> 
                {/* 2. ラベルを分離 */}
                <Text style={[styles.readingLabel, styles.correctSubText]}>訓:</Text> 
                {/* 3. 読みテキストに flex: 1 を適用 */}
                <Text style={[ styles.kanjiReading, styles.correctSubText]}>
                  {kunyomiStr}
                </Text>
              </View>
            )}
            
            {/* 音読みが存在する場合のみ、専用の行で表示 */}
            {onyomiStr && (
              <View style={styles.readingWrapper}>
                <Text style={[styles.readingLabel, styles.correctSubText]}>音:</Text>
                <Text style={[ styles.kanjiReading, styles.correctSubText]}>
                  {onyomiStr}
                </Text>
              </View>
            )}
            {/* ▲▲▲ 修正完了 ▲▲▲ */}

            <Text style={[ styles.kanjiGrade, styles.correctSubText]}>
              {kankenToGakusei(collectKanji.kanken)}
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
    justifyContent: "flex-start", 
    alignItems: "center",
    paddingTop: "25%", 
    zIndex: 50,
  },
  container: {
    borderRadius: 12, 
    padding: 24,
    maxWidth: 320,
    width: "90%",
    alignItems: "center", // kanjiChar と kanjiGrade は中央揃え
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
    fontSize: 64, 
    fontWeight: "bold",
    marginBottom: 16,
  },
  
  // ▼▼▼ スタイル修正 ▼▼▼
  // 読み（訓・音）を表示するためのラッパー
  readingWrapper: {
    flexDirection: 'row', // ラベルと読みを横並び
    width: '100%',        // コンテナの幅いっぱいに
    marginBottom: 8,      // 読み同士の余白
    paddingHorizontal: 4, // 左右のパディング
  },
  
  // 「訓:」「音:」のラベル
  readingLabel: {
    fontWeight: '600',
    fontSize: 18,
    marginRight: 8,    // ラベルと読みの間の余白
  },

  // 読みテキスト本体
  kanjiReading: {
    fontWeight: '600',
    fontSize: 18,
    flex: 1, // 残りのスペースをすべて使い、テキストを折り返す
  },
  // ▲▲▲ 修正完了 ▲▲▲

  kanjiGrade: {
    fontSize: 16,
    color: "#6B7280", // gray-500
    marginTop: 8, // 読み方リストとの間に少し余白を追加
  },
});