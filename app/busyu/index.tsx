import { busyuData, RadicalEntry } from "@/assets/busyuData";
import { kankenToGakusei } from "@/assets/kankenToGrade";
import KanjiInput from "@/components/busyu/KanjiInput";
import QuizScreen from "@/components/busyu/QuizScreen";
import RadicalList from "@/components/busyu/RadicalSelector";
import ResultFlash from "@/components/busyu/ResultFlash";
import InfoBar from "@/components/busyu/infoBar";
import { useCallback, useEffect, useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Kanji } from "../types/kanji";

export interface MapProps {
    [key: string]: Kanji[];
}

export default function QuizStarter() {
  //部首データのインポート
  const kanjiData:RadicalEntry[] = busyuData;

  //状態管理のためのフック
  const [radicalMap, setRadicalMap] = useState<MapProps>({});
  const [radicalReadings, setRadicalReadings] = useState<Record<string, string>>({});
  const [currentRadical, setCurrentRadical] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [hintList, setHintList] = useState<string[]>([]);
  const [inputVlue, setInputValue] = useState<string>("");
  const [foundKanji, setFoundKanji] = useState<Kanji[]>([]);  
  const [currentKanji, setCurrentKanji] = useState<Kanji | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean>(false);
  const [isFlashVisible, setFlashVisible] = useState(false);
  
  /** 初期化 */
  useEffect(() => {
      const map: MapProps = {};
      const readingMap: Record<string, string> = {};

      busyuData.forEach(({ radical, reading, kanji }) => {
          readingMap[radical] = reading;
          map[radical] = kanji.map((k) => ({
          char: k.char,
          readings: [...(k.onyomi || []), ...(k.kunyomi || [])]
              .map((r) => kanaToHiragana(r.replace(/（.*?）/g, "")).toLowerCase()),
          meaning: (k.meaning?.[0] || "").replace(/。$/, ""),
          grade: parseGrade(k.grade || ""),
          kanken:k.kanken
          }));
      });

      setRadicalMap(map);
      setRadicalReadings(readingMap);

  }, []);

  useEffect(() => {
    if (!currentRadical) return;
    const hints = radicalMap[currentRadical]
      .sort((a, b) =>b.kanken -  a.kanken)
      .slice(0, 4)
      .map((k) => `${k.meaning}　（${k.kanken ? kankenToGakusei(k.kanken) : "不明"}）`);

    setHintList(hints);
  }, [currentRadical]);   


  //文字列の中に含まれるカタカナを、すべてひらがなに変換します。
  const kanaToHiragana = (str: string) =>str.replace(/[ァ-ヶ]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0x60));

  //文字列の中に含まれる全角数字（０, １, ２...）を、すべて半角数字（0, 1, 2...）に変換します。
  const toHalfWidth = (str: string) =>str.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));

  //学年を表す文字列（例：「小学３年生」）から数字の部分だけを取り出して、数値として返します。もし数字が見つからなかった場合は、デフォルトで 7 を返します。
  const parseGrade = (gradeStr: string): number => {
      const raw = toHalfWidth(gradeStr || "");
      const match = raw.match(/\d+/);
      return match ? parseInt(match[0], 10) : 7;
  };

  //部首とその関連漢字のリストを作成し、漢字の数で降順にソートします。
  const radicalsWithCount = Object.entries(radicalMap).map(([radical, kanjiList]) => ({
    radical,
    count: kanjiList.length,
    reading: radicalReadings[radical] || "？",
  })).sort((a, b) => b.count - a.count);


  const currentAllKanji = currentRadical ? radicalMap[currentRadical] : [];

  const onSelect = (radical: string) => {
      setCurrentRadical(radical);
  }


  const checkAnswer = () => {
    if (!currentRadical || !inputVlue.trim()) return;
    const ans = inputVlue.trim().toLowerCase();

    const matched = currentAllKanji.find(
      (k) => !foundKanji.some((f) => f.char === k.char) && k.readings.includes(ans)
    );

    if (matched) {
      setScore((s) => s + 10);
      setFoundKanji((prev) => [...prev, matched]);
      setShowResult(true);
    }
    setInputValue("");
  };

  const handleDismiss = useCallback(() => {
    setShowResult(false);
  }, [setShowResult]); 



return (
  <SafeAreaView style={{ flex: 1 }}>
    {!currentRadical ? (
    <RadicalList
      radicals={radicalsWithCount}
      onSelect={onSelect}
    />
    ):(
      <>
        <InfoBar 
          score={score}
          onReset={() => {}}
          onToggleTimeMode={() => {}}
        />
        <QuizScreen
          currentRadical={currentRadical}
          currentAllKanji={currentAllKanji}
        />

        <KanjiInput 
          value={inputVlue}
          onChange={(e) => setInputValue(e)}
          onSubmit={checkAnswer}
          hintList={hintList}
        />

        <ResultFlash
          onDismiss={handleDismiss}
          visible={showResult} 
          kanji={currentKanji} 
          isCorrect={true || isAnswerCorrect} 
        />  
        
        <View>
          {currentAllKanji.map((k)=><Text key={k.char}> {k.readings.join(", ")}</Text>)}
        </View>

      </>         
    )}
  </SafeAreaView>
  );
};
