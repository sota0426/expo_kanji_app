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
import { KanjiData, main_styles } from "./QuizScreen";

interface FoundKanjiListProps {
  foundKanji: KanjiData[];
  allKanji?: KanjiData[]; 
}

type GroupedKanji = Record<number, KanjiData[]>;

const simpleReadingKanji = (kanji: KanjiData) => {
  const kunyomiStr = (kanji.kunyomi && kanji.kunyomi.length > 0)
    ? kanji.kunyomi[0]
    : ""; 

  const onyomiStr = (kanji.onyomi && kanji.onyomi.length > 0)
    ? kanji.onyomi[0]
    : ""; 

  if(onyomiStr && kunyomiStr){
    return `${kunyomiStr} , ${onyomiStr}`;
  }
  if(onyomiStr){
    return onyomiStr;
  }
  if(kunyomiStr){
    return kunyomiStr;
  }
  return "";
}

export const FoundKanjiList = React.memo(({
  foundKanji,
  allKanji, 
}: FoundKanjiListProps) => {

  const [selectedKanji, setSelectedKanji] = useState<KanjiData | null>(null);
  const isResultMode = !!allKanji; 
  const listToDisplay = allKanji || foundKanji;

  const foundKanjiSet = useMemo(() => {
    return new Set(foundKanji.map(k => k.char));
  }, [foundKanji]);

  
  const groupedByKanken = useMemo(() => {
    return listToDisplay.reduce((acc, kanji) => {
      const kanken = kanji.kanken; 
      if (!acc[kanken]) {
        acc[kanken] = [];
      }
      acc[kanken].push(kanji);
      return acc;
    }, {} as GroupedKanji);
  }, [listToDisplay]); 

  const sortedKankenLevels = useMemo(() => {
    return Object.keys(groupedByKanken).sort((a, b) => Number(b) - Number(a)); 
  }, [groupedByKanken]);

  const kankenn =(kankenLevel:number)=>{
    if( kankenLevel % 1 ===0){
      return `${kankenLevel}級`;
    }else{
      const integerPart = Math.floor(kankenLevel);
      return `準${integerPart}級`;
    }
  }

  return (
    <View style={styles.listContainer}>
      {sortedKankenLevels.map((kankenLevel) => (
        <View key={kankenLevel} style={styles.gradeGroupContainer}>
          
          <Text style={styles.gradeTitle}>
            {kankenn(Number(kankenLevel))}
            <Text style={styles.gradeSubTitle}>
              （{kankenToGakusei(Number(kankenLevel))}）
            </Text>
          </Text>

          <View style={styles.kanjiRowContainer}>
            {groupedByKanken[Number(kankenLevel)].map((k) => {
              
              const isFound = foundKanjiSet.has(k.char);
              
              return (
                <TouchableOpacity 
                  key={k.char} 
                  onPress={() => setSelectedKanji(k)} 
                  style={[
                    main_styles.radicalContainer, 
                    styles.kanjiItem,
                    isResultMode && (isFound ? styles.foundItem : styles.notFoundItem)
                  ]}
                >
                  <Text style={main_styles.radicalText}>
                    {k.char}
                  </Text>
                  <Text style={main_styles.countText}>
                    {simpleReadingKanji(k)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}

      {/* --- ▼▼▼ モーダル修正箇所 ▼▼▼ --- */}
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
                
                {/* --- 訓読み (SingleLine スタイルを使用) --- */}
                <View style={styles.modalInfoRow}>
                  <Text style={styles.modalInfoLabel}>訓読み</Text>
                  <Text style={styles.modalInfoTextSingleLine}> {/* ★ 変更 */}
                    {selectedKanji.kunyomi && selectedKanji.kunyomi.length > 0
                      ? selectedKanji.kunyomi.join('、')
                      : "N/A"}
                  </Text>
                </View>

                {/* --- 音読み (SingleLine スタイルを使用) --- */}
                <View style={styles.modalInfoRow}>
                  <Text style={styles.modalInfoLabel}>音読み</Text>
                  <Text style={styles.modalInfoTextSingleLine}> {/* ★ 変更 */}
                    {selectedKanji.onyomi && selectedKanji.onyomi.length > 0
                      ? selectedKanji.onyomi.join('、')
                      : "N/A"}
                  </Text>
                </View>

                {/* --- 意味 (MultiLine スタイルを使用) --- */}
                <View style={styles.modalInfoRow}>
                  <Text style={styles.modalInfoLabel}>意味</Text>
                  <View style={styles.modalInfoTextWrapper}>
                    {selectedKanji.meaning && selectedKanji.meaning.length > 0 ? (
                      selectedKanji.meaning.map((meaning, index) => (
                        <Text key={index} style={styles.modalInfoTextMultiLine}> 
                          {meaning}
                        </Text>
                      ))
                    ) : (
                      <Text style={styles.modalInfoTextMultiLine}>N/A</Text> 
                    )}
                  </View>
                </View>
                {/* --- 修正完了 --- */}

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
      {/* --- ▲▲▲ モーダル修正完了 ▲▲▲ --- */}
    </View>
  );
});

// --- ▼▼▼ スタイル修正箇所 ▼▼▼ ---
const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 8, 
  },
  gradeGroupContainer: {
    marginVertical: 12, 
  },
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
  kanjiItem: {
    margin: 4, 
  },
  foundItem: {
    backgroundColor: "#DCFCE7", // green-100
    borderColor: "#86EFAC", // green-300
  },
  notFoundItem: {
    backgroundColor: "#FEE2E2", // red-100
    borderColor: "#FDA4AF", // red-300
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
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
    borderBottomColor: "#E5E7EB", // gray-200
    paddingBottom: 8,
  },
  modalInfoLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4B5563", // gray-600
    width: 60, 
  },
  modalInfoTextWrapper: {
    flex: 1, 
  },
  // ★ スタイルを2つに分割
  modalInfoTextSingleLine: { // 訓読み・音読み用 (折り返しのため flex: 1 が必要)
    fontSize: 16,
    color: "#1F2937", // gray-800
    marginBottom: 4, 
    flex: 1, 
  },
  modalInfoTextMultiLine: { // 意味用 (flex: 1 は不要)
    fontSize: 16,
    color: "#1F2937", // gray-800
    marginBottom: 4, 
  },
  // ---
  modalCloseButton: {
    marginTop: 16,
    backgroundColor: "#6B7280", // gray-500
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
// --- ▲▲▲ スタイル修正完了 ▲▲▲ ---