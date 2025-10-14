import { busyuData } from "@/assets/busyuData";
import QuizScreen from "@/components/busyu/QuizScreen";
import RadicalList from "@/components/busyu/ex/RadicalList";
import { useEffect, useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";



// --- ヘルパー関数 (コンポーネント外に配置) ---

// カタカナをひらがなに変換
const kanaToHiragana = (str: string) =>
  str.replace(/[ァ-ヶ]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0x60));

// 全角数字を半角に変換
const toHalfWidth = (str: string) =>
  str.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));

// 学年文字列から数値を取得 (例:「小学３年生」-> 3)
const parseGrade = (gradeStr: string): number => {
  const raw = toHalfWidth(gradeStr || "");
  const match = raw.match(/\d+/);
  return match ? parseInt(match[0], 10) : 7; // 見つからない場合は7（中学生以上）
};

 export  interface processedDataProps{
    radical:string;
    reading:string;
    kanji:{
      char:string,
      readings:string[],
      meaning:string[],
      grade: number,
      kanken:number,
      kakusuu:number,
      busyu:string,
    }[];
  }

export default function QuizStarter(){
  const [processedData , setProcessedData] = useState<processedDataProps[]>([]);
  const [currentRadical , setCurrentRadical] = useState<string | null>(null);

  /**
   * 初期化処理:
   * busyuDataを一度だけ処理し、使いやすい形式に変換してstateに保存する
   */
  useEffect(() => {
    const data = busyuData.map(({ radical, reading, kanji }) => ({
      radical,
      reading,
      kanji: kanji.map((k) => ({
        char: k.char,
      readings: [...(k.onyomi || []), ...(k.kunyomi || [])]
          .map((r) => kanaToHiragana(r.replace(/（.*?）/g, ""))),
        meaning: [(k.meaning?.[0] || "").replace(/。$/, "")],        // 意味を最初の文だけに整形
        grade: parseGrade(k.grade || ""),        // 学年を数値に変換
        kanken: k.kanken || 99,        // 漢検級。未定義の場合は大きな値(99)を設定してソートで不利にする
        kakusuu:k.kakusuu,
        busyu:k.busyu,
      })),
    }));
    setProcessedData(data);
  }, []);

  // 同じ部首の漢字数ソート
  const radicalWithCount = useMemo(() =>
    processedData
      .map(({ radical, reading, kanji }) => ({
        radical,
        reading,
        count: kanji.length,
      }))
      .sort((a, b) => b.count - a.count),
    [processedData] // processedDataが変更された時だけ再計算
  );


  const currentRadicalData = useMemo(()=>
    processedData.find((entry)=> entry.radical === currentRadical),
  [processedData,currentRadical])

  
  const onSelect=(radical:string)=>{
    setCurrentRadical(radical);
  }


  return(
    <SafeAreaView style={{flex:1}}>
      {!currentRadicalData  ? (
        <RadicalList
          radicals={radicalWithCount}
          onSelect={onSelect}
        />
      ):(
        <QuizScreen
            currentRadicalKanji={currentRadicalData}
        />
      )}
    </SafeAreaView>
  )





}