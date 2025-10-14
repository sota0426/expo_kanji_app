import { processedDataProps } from "@/app/busyu";
import { kankenToGakusei } from "@/assets/kankenToGrade";
import { RefreshCw, Trophy } from "lucide-react-native";
import { useMemo, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

// interface processedDataProps {
//     radical: string;
//     reading: string;
//     kanji: {
//         char: string;
//         readings: string[];
//         meaning: string[];
//         grade: number;
//         kanken: number;
//         kakusuu: number;
//         busyu: string;
//     }[];
// }
interface  prpcessedKanji {
        char: string;
        readings: string[];
        meaning: string[];
        grade: number;
        kanken: number;
        kakusuu: number;
        busyu: string;
  }
  

interface QuizScreenProps{
  currentRadicalKanji:processedDataProps
}

export default function QuizScreen({
  currentRadicalKanji
}:QuizScreenProps){
  const [score , setScore] = useState<number>(0)
  const [isHintVisible,setIsHintVisible] = useState<boolean>(false);
  const [inputText , setInputText] = useState<string>("");
  const [foundKanji , setFoundKanji] = useState<prpcessedKanji[]>([]);


  const unfoundKanji = useMemo(()=>
      currentRadicalKanji.kanji.filter(k => !foundKanji.some(f => f.char === k.char))
    ,[currentRadicalKanji.kanji,foundKanji])
  
    // ヒントリストの生成
  const hintList = useMemo(()=>
    unfoundKanji
      .sort((a, b) =>b.kanken -  a.kanken)
      .slice(0,5)
      .map((k) => `${k.meaning}（${k.kanken ? kankenToGakusei(k.kanken) + "-------------答え：" + k.char : "不明"}）`)
  ,[unfoundKanji])

  
    //イベントハンドラー
  const checkAnswer=()=>{
    if(!inputText.trim()) return;
    
    const answer = inputText.trim().toLocaleLowerCase();
    
    // まだ見つけていない漢字の中から、読みが一致するものを探す
    const matchedKanji = currentRadicalKanji.kanji.find(k => 
      !foundKanji.some(found => found.char === k.char) && // まだ見つかっていない
      k.readings.includes(answer) // 読みが一致する
    );

    if(matchedKanji){
      setScore(current => current + 10);
      setFoundKanji(prev => [...prev , matchedKanji]);
    }

    setInputText("")
  }


  const onEnd =()=>{
    return
  }

  const toggleHint =()=>{
    setIsHintVisible(!isHintVisible);
  }

  return(
    <SafeAreaView style={{ flex: 1 }}>
      {/* インフォバー */}
        <View style={bar_styles.barContainer}>
          {/* 左側：得点 */}
          <View style={bar_styles.leftSection}>
            <Trophy color="#eab308" size={24} />
            <Text style={bar_styles.scoreText}>{score}点</Text>
          </View>
          {/* 右側：リセットボタン */}
          <TouchableOpacity onPress={onEnd} style={bar_styles.resetButton}>
            <RefreshCw color="white" size={16} />
            <Text style={bar_styles.resetButtonText}>答えを見る</Text>
          </TouchableOpacity>
        </View>

        {/* 部首と漢字数 */}
        <View style={main_styles.container}>
            <View style={main_styles.radicalContainer}>
                <Text style={main_styles.radicalText}>
                    {currentRadicalKanji.radical}
                </Text>
            </View>
            <Text style={main_styles.countText}>{currentRadicalKanji.reading}</Text>
            <Text style={main_styles.countText}>（ 全 {currentRadicalKanji.kanji.length} 個 ）</Text>
        </View>

        <View style={kanjiInput_styles.container}>
          <TextInput
            style={kanjiInput_styles.input}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={checkAnswer} // Enterキー押下時のイベント
            placeholder="読み方をひらがなで入力"
            placeholderTextColor="#9ca3af" // gray-400
            autoCapitalize="none"
            autoCorrect={false}
          />
          <View style={kanjiInput_styles.buttonContainer}>
            <TouchableOpacity
              onPress={checkAnswer}
              disabled={!inputText.trim()}
              // disabled状態に応じてスタイルを動的に変更
              style={[
                kanjiInput_styles.buttonBase,
                kanjiInput_styles.submitButton,
                !inputText.trim() && kanjiInput_styles.disabledButton,
              ]}
            >
              <Text style={kanjiInput_styles.buttonText}>答える</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={toggleHint}
              style={[kanjiInput_styles.buttonBase, kanjiInput_styles.hintButton]}
            >
              <Text style={kanjiInput_styles.buttonText}>
                {isHintVisible ? "ヒントを隠す" : "ヒントを見る"}
              </Text>
            </TouchableOpacity>
          </View>
    
          {/* ヒント表示エリア */}
          {isHintVisible && hintList.length > 0 && (
            <View style={kanjiInput_styles.hintBox}>
              <Text style={kanjiInput_styles.hintTitle}>ヒント（意味のみ）</Text>
              {/* propsで受け取った hintList を直接使用 */}
              {hintList.map((hint, idx) => (
                <Text key={idx} style={kanjiInput_styles.hintItem}>
                  • {hint}
                </Text>
              ))}
            </View>
          )}
        </View>


{/* テスト*/}
        {foundKanji.map((k,idx)=>(
          <View key={idx}>
            <Text>{k.char}</Text>
          </View>
        ))}
    


    </SafeAreaView>
  )
}


// StyleSheetを使ってスタイリングを定義
const bar_styles = StyleSheet.create({
  barContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap", // 画面幅が狭い場合に折り返す
    gap: 16, // 各セクション間の余白
    paddingHorizontal: 8, // 水平方向のパディング
    paddingVertical: 12,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8, // 要素間の余白
    minWidth: 140,
  },
  timerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ef4444", // red-500
  },
  toggleButton: {
    backgroundColor: "#f59e0b", // yellow-500
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  toggleButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  centerSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minWidth: 60,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ca8a04", // yellow-600
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#6b7280", // gray-500
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  resetButtonText: {
    color: "white",
    fontSize: 14,
  },
  radicalContainer: {
      backgroundColor: '#DBEAFE', // Tailwindのbg-blue-100に近い色
      borderRadius: 8,           // rounded-lg
      padding: 12,               // p-8        // mb-4 (元のmb-2より少し大きめに調整)
      alignItems: 'center',
      justifyContent: 'center',
  },
  radicalText: {
      fontSize: 80,              // text-8xlに近いサイズ
      fontWeight: 'bold',        // font-bold
      color: '#1E40AF',          // text-blue-800に近い色
  },
  countText: {
      color: '#374151',          // text-gray-700に近い色
      fontSize: 16,              // text-base
  },
});

const main_styles = StyleSheet.create({
    container: {
        alignItems: 'center', // 子要素を中央揃えにする (text-centerの代替)
        justifyContent: 'center',
    },
    radicalContainer: {
        backgroundColor: '#DBEAFE', // Tailwindのbg-blue-100に近い色
        borderRadius: 8,           // rounded-lg
        padding: 6,               // p-8        // mb-4 (元のmb-2より少し大きめに調整)
        alignItems: 'center',
        justifyContent: 'center',
    },
    radicalText: {
        fontSize: 70,              // text-8xlに近いサイズ
        fontWeight: 'bold',        // font-bold
        color: '#1E40AF',          // text-blue-800に近い色
    },
    countText: {
        color: '#374151',          // text-gray-700に近い色
        fontSize: 16,              // text-base
    },
});


// スタイル定義 (変更なし)
const kanjiInput_styles = StyleSheet.create({
  container: {
    alignItems: "center",
    width: "100%",
    padding: 16,
  },
  input: {
    fontSize: 16,
    padding: 12,
    borderWidth: 2,
    borderColor: "#d1d5db", // gray-300
    borderRadius: 8,
    width: "80%",
    textAlign: "center",
    backgroundColor: "white",
  },
  buttonContainer: {
    marginTop: 16,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    flexWrap: "wrap", // 小さい画面でもボタンが収まるように
  },
  buttonBase: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 140, // ボタンの最小幅を確保
  },
  submitButton: {
    backgroundColor: "#22c55e", // green-500
  },
  hintButton: {
    backgroundColor: "#f97316", // orange-500
  },
  disabledButton: {
    backgroundColor: "#d1d5db", // gray-300
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  hintBox: {
    marginTop: 16,
    backgroundColor: "#fef3c7", // yellow-100
    borderColor: "#fde047", // yellow-300
    borderWidth: 1,
    padding: 16,
    borderRadius: 8,
    width: "100%",
  },
  hintTitle: {
    fontWeight: "600",
    marginBottom: 8,
    fontSize: 16,
    color: "#374151", // gray-800
  },
  hintItem: {
    fontSize: 14,
    color: "#4b5563", // gray-700
    marginBottom: 4,
  },
});
