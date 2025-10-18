import { kankenToGakusei } from "@/assets/kankenToGrade";
import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { KanjiData, main_styles } from "./styles";


type GroupedKanji = Record<number, KanjiData[]>;

  const kunyomiStr =(kanji: KanjiData) => kanji.kunyomi?.[0] || "";
  const onyomiStr =(kanji: KanjiData) => kanji.onyomi?.[0] || "";



interface FoundKanjiListProps {
  foundKanji: KanjiData[];
  allKanji?: KanjiData[]; 
  isGamePlaying:boolean;
}

export const FoundKanjiList = React.memo(function FoundKanjiList({
  foundKanji,
  allKanji, 
  isGamePlaying
}: FoundKanjiListProps){

  const [selectedKanji, setSelectedKanji] = useState<KanjiData | null>(null);

  const foundKanjiSet = useMemo(
    ()=> new Set(foundKanji.map((k)=> k.char)),
    [foundKanji]
  );

  
  const groupedByKanken = useMemo(() => {
    // allKanjiが存在しない場合に空の配列で早期リターン
    if (!allKanji) return {};

    return allKanji.reduce((acc, kanji) => {
      const kanken = kanji.kanken; 
      if (!acc[kanken]) {
        acc[kanken] = [];
      }
      acc[kanken].push(kanji);
      return acc;
    }, {} as GroupedKanji);
  }, [allKanji]); 

  const sortedKankenLevels = useMemo(() => {
    return Object.keys(groupedByKanken)
      .map(Number)  
      .sort((a, b) => b - a); 
  }, [groupedByKanken]);

  const kankenLabel = (level:number)=>
    level % 1 === 0 ? `${level}級` : `準${Math.floor(level)}級`
  

  return (
    <View style={styles.listContainer}>

      {sortedKankenLevels.map((kankenLevel) => (
        <View key={kankenLevel} style={styles.gradeGroupContainer}>
          
          <Text style={styles.gradeTitle}>
            {kankenLabel(kankenLevel)}
            <Text style={styles.gradeSubTitle}>
              （{kankenToGakusei(Number(kankenLevel))}）
            </Text>
          </Text>

          {/** ---各級の漢字一覧--- */}
          <View style={styles.kanjiRowContainer}>

            {(groupedByKanken[Number(kankenLevel)] || []).map((kanji: KanjiData) => {
              const isFound = foundKanjiSet.has(kanji.char);
              return (
                <TouchableOpacity 
                  key={kanji.char} 
                  // ★ ゲームプレイ中はモーダルを開かないようにする
                  onPress={() => !isGamePlaying && setSelectedKanji(kanji)}
                  // ★ ゲームプレイ中は押せないことがわかるように、タップ時のフィードバックを無効化
                  activeOpacity={isGamePlaying ? 1.0 : 0.2}
                  style={[
                    main_styles.radicalContainer, 
                    styles.kanjiItem,
                    isFound ? styles.foundItem : styles.notFoundItem,
                  ]}
                >
                  {/* ★ isFoundか、!isGamePlayingの時だけ文字を表示 */}
                  <Text style={main_styles.radicalText}>
                    {isFound || !isGamePlaying ? kanji.char : '？'}
                  </Text>
                  <Text style={main_styles.countText}>
                    {isFound || !isGamePlaying ? kunyomiStr(kanji) : ' '}
                  </Text>
                  <Text style={main_styles.countText}>
                    {isFound || !isGamePlaying ? onyomiStr(kanji) : ' '}
                  </Text>

                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}

      {/* --- モーダル (変更なし) --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={!!selectedKanji} 
        onRequestClose={() => setSelectedKanji(null)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setSelectedKanji(null)}
        >
          <Pressable style={styles.modalContent}>
            {selectedKanji && ( 
              <>
                <Text style={styles.modalKanji}>{selectedKanji.char}</Text>
                <InfoRow label="訓読み" values={selectedKanji.kunyomi} />
                <InfoRow label="音読み" values={selectedKanji.onyomi} />
                <InfoRow label="意味" values={selectedKanji.meaning} multi={true} />

                <TouchableOpacity 
                  style={styles.modalCloseButton} 
                  onPress={() => setSelectedKanji(null)}
                >
                  <Text style={styles.modalCloseButtonText}>閉じる</Text>
                </TouchableOpacity>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
});

const InfoRow = ({
  label,
  values,
  multi = false,
}:{
  label:string;
  values?:string[];
  multi?:boolean;
})=>(
   <View style={styles.modalInfoRow}>
    <Text style={styles.modalInfoLabel}>{label}</Text>
    <View style={styles.modalInfoTextWrapper}>
      {values && values.length > 0 ? (
        multi ? (
          values.map((v, i) => (
            <Text key={i} style={styles.modalInfoTextMultiLine}>
              {v}
            </Text>
          ))
        ) : (
          <Text style={styles.modalInfoTextSingleLine}>{values.join("、")}</Text>
        )
      ) : (
        <Text style={multi ? styles.modalInfoTextMultiLine : styles.modalInfoTextSingleLine}>
          -
        </Text>
      )}
    </View>
  </View>
); 


// ----------------------------
// スタイル (変更なし)
// ----------------------------
const styles = StyleSheet.create({
  listContainer: { paddingHorizontal: 8, paddingBottom: 20 },
  gradeGroupContainer: { marginVertical: 12 },
  gradeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 8,
    paddingLeft: 4,
  },
  gradeSubTitle: {
    fontSize: 14,
    fontWeight: "normal",
    color: "#6B7280",
    marginLeft: 8,
  },
  kanjiRowContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
  },
  kanjiItem: { margin: 4 },
  foundItem: {
    backgroundColor: "#DCFCE7", // 正解→緑
    borderColor: "#86EFAC",
  },
  notFoundItem: {
    backgroundColor: "#FEE2E2", // 不正解→赤
    borderColor: "#FCA5A5",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxWidth: 400,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    elevation: 5,
  },
  modalKanji: {
    fontSize: 80,
    fontWeight: "bold",
    color: "#1E40AF",
    marginBottom: 16,
  },
  modalInfoRow: {
    width: "100%",
    flexDirection: "row",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 8,
  },
  modalInfoLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4B5563",
    width: 60,
  },
  modalInfoTextWrapper: { flex: 1 },
  modalInfoTextSingleLine: {
    fontSize: 16,
    color: "#1F2937",
    marginBottom: 4,
    flex: 1,
  },
  modalInfoTextMultiLine: {
    fontSize: 16,
    color: "#1F2937",
    marginBottom: 4,
  },
  modalCloseButton: {
    marginTop: 16,
    backgroundColor: "#6B7280",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  modalCloseButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
