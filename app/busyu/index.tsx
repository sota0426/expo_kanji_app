import { busyuData } from "@/assets/busyuData";
import QuizScreen from "@/components/busyu/QuizScreen";
import RadicalList from "@/components/busyu/RadicalList";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Button, SafeAreaView, StyleSheet } from "react-native";

// --- ヘルパー関数 (変更なし) ---
const kanaToHiragana = (str: string) =>
  str.replace(/[ァ-ヶ]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0x60));

const toHalfWidth = (str: string) =>
  str.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0));

const parseGrade = (gradeStr: string): number => {
  const raw = toHalfWidth(gradeStr || "");
  const match = raw.match(/\d+/);
  return match ? parseInt(match[0], 10) : 7;
};

// --- 型定義 (変更なし) ---
export interface ProcessedDataProps {
  radical: string;
  reading: string;
  kanji: {
    char: string;
    kunyomi?: string[];
    onyomi?: string[];
    readings: string[];
    meaning: string[];
    grade: number;
    kanken: number;
    kakusuu: number;
    busyu: string;
  }[];
}

export default function QuizStarter() {
  const [processedData, setProcessedData] = useState<ProcessedDataProps[]>([]);
  const [currentRadical, setCurrentRadical] = useState<string | null>(null);

  // 初期化処理 (変更なし)
  useEffect(() => {
    const data = busyuData.map(({ radical, reading, kanji }) => ({
      radical,
      reading,
      kanji: kanji.map((k) => ({
        char: k.char,
        readings: [...(k.onyomi || []), ...(k.kunyomi || [])].map((r) =>
          kanaToHiragana(r.replace(/（.*?）/g, ""))
        ),
        kunyomi: k.kunyomi || [],
        onyomi: k.onyomi || [],
        meaning: [(k.meaning?.[0] || "").replace(/。$/, "")],
        grade: parseGrade(k.grade || ""),
        kanken: k.kanken || 99,
        kakusuu: k.kakusuu,
        busyu: k.busyu,
      })),
    }));
    setProcessedData(data);
  }, []);

  // 部首リストを漢字数でソート (変更なし)
  const radicalWithCount = useMemo(
    () =>
      processedData
        .map(({ radical, reading, kanji }) => ({
          radical,
          reading,
          count: kanji.length,
        }))
        .sort((a, b) => b.count - a.count),
    [processedData]
  );

  // 選択された部首の全データを取得 (変更なし)
  const currentRadicalData = useMemo(
    () => processedData.find((entry) => entry.radical === currentRadical),
    [processedData, currentRadical]
  );

  // 部首が選択されたときの処理
  const onSelect = (radical: string) => {
    setCurrentRadical(radical);
  };

  // ★★ 追加: クイズ画面からリストに戻る処理 ★★1
  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
             
      {!currentRadicalData ? (
        <>
        <Button
          color="gray"
          title="ホームに戻る"
          onPress={handleBack}
        />
        
          <RadicalList 
            radicals={radicalWithCount} 
            onSelect={onSelect} 
          />
        </>
      ) : (
        <QuizScreen
          currentRadicalKanji={currentRadicalData}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  goHome:{

  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7', // 全体の背景色を少しグレーに
  },
});