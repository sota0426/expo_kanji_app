import { busyuData, RadicalEntry } from "@/assets/busyuData";
import { kankenToGakusei } from "@/assets/kankenToGrade";
import KanjiInput from "@/components/busyu/KanjiInput";
import QuizScreen from "@/components/busyu/QuizScreen";
import RadicalList from "@/components/busyu/RadicalSelector";
import InfoBar from "@/components/busyu/infoBar";
import { useEffect, useState } from "react";
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
        console.log(`Selected radical: ${radical}`);
        console.log(`Associated kanji: ${JSON.stringify(radicalMap[radical], null, 2)}`);
    }


    useEffect(() => {
        if (!currentRadical) return;
        const hints = radicalMap[currentRadical]
          .sort((a, b) =>b.kanken -  a.kanken)
          .slice(0, 4)
          .map((k) => `${k.meaning}　（${k.kanken ? kankenToGakusei(k.kanken) : "不明"}）`);

        setHintList(hints);
    }, [currentRadical]);


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
            onSubmit={() => {}}
            hintList={hintList}
          />
        </>         
      )}
    </SafeAreaView>
  );
};
