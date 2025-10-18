import { ProcessedDataProps } from "@/app/busyu"; // ProcessedDataProps をインポート
import { kankenToGakusei } from "@/assets/kankenToGrade";
import { RefreshCw, Trophy } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import ConfettiAnimation from "./ConfettiAnimation";
import { FoundKanjiList } from "./FoundKanjiList";
import GameEndScreen from "./GameEndScreen";
import { QuizInputSection } from "./QuizInputSection";
import ResultFlash from "./ResultFlash";
import { KanjiData, main_styles } from "./styles";

// ------------------------------------
// ヘルパーコンポーネント: ScrollableContainer
// ------------------------------------
const ScrollableContainer = ({children}: {children: React.ReactNode}) => {
  // WebではKeyboardAvoidingViewは不要なため、シンプルなViewでラップ
  if(Platform.OS === 'web'){
    return <View style={fullScreenStyles.flexContainer}><ScrollView contentContainerStyle={fullScreenStyles.scrollContent}>{children}</ScrollView></View>
  }
  // iOS or Android では KeyboardAvoidingView と ScrollView を組み合わせる
  return (
    <KeyboardAvoidingView
      style={fullScreenStyles.flexContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
    >
      <ScrollView contentContainerStyle={fullScreenStyles.scrollContent}>{children}</ScrollView>
    </KeyboardAvoidingView>
  )
}

// ------------------------------------
// 型定義
// ------------------------------------

// export interface ProcessedDataProps {
//   radical: string;
//   reading: string;
//   kanji: {
//     char: string;
//     kunyomi?: string[];
//     onyomi?: string[];
//     readings: string[];
//     meaning: string[];
//     grade: number;
//     kanken: number;
//     kakusuu: number;
//     busyu: string;
//   }[];
// }

// (alias) type KanjiData = {
//     char: string;
//     kunyomi?: string[] | undefined;
//     onyomi?: string[] | undefined;
//     readings: string[];
//     meaning: string[];
//     grade: number;
//     kanken: number;
//     kakusuu: number;
//     busyu: string;
// }

interface QuizScreenProps{
  currentRadicalKanji:ProcessedDataProps
}


// ------------------------------------
// メインコンポーネント
// ------------------------------------
export default function QuizScreen({
  currentRadicalKanji
}:QuizScreenProps){
  const [score , setScore] = useState<number>(0)
  const [isHintVisible,setIsHintVisible] = useState<boolean>(false);
  const [inputText , setInputText] = useState<string>("");
  const [foundKanji , setFoundKanji] = useState<KanjiData[]>([]); 
  const inputRef = useRef<TextInput>(null);
  const [collectedKanji , setCollectedKanji] = useState<KanjiData | null>();
  const [showResultFlash,setShowResultFlash] = useState<boolean>(false);
  const [isGamePlaying ,setIsPlaying] = useState<boolean>(true); // ゲームプレイ中/結果表示切り替え

  const currentAllKanji:KanjiData[] = currentRadicalKanji.kanji;

  // --- 計算済み値 (useMemo) ---
  const unfoundKanji = useMemo(()=>
    currentRadicalKanji.kanji.filter(
      k => !foundKanji.some(f => f.char === k.char)
    ),[currentRadicalKanji.kanji,foundKanji]
  );
  
  const hintList = useMemo(()=>
    unfoundKanji
      .sort((a, b) =>b.kanken -  a.kanken)
      .slice(0,10)
      .map((k) => `${k.meaning[0]} （${kankenToGakusei(k.kanken)} ）`)
  ,[unfoundKanji]);

  // --- イベントハンドラ (useCallback) ---
  const findMatchedKAnji = useCallback(
    (reading:string) => unfoundKanji.find( k => k.readings.includes(reading)),
    [unfoundKanji]
  );
  
  const checkAnswer= useCallback(() => {
    if(!inputText.trim()) return;
    
    const answer = inputText.trim().toLocaleLowerCase();
    const matchedKanji = findMatchedKAnji(answer); // matchedKanji は KanjiData | undefined 型

    let wasCorrect = false;
    
    if(matchedKanji){
      setScore(current => current + 1);
      setFoundKanji(prev => [...prev , matchedKanji]);
      setCollectedKanji(matchedKanji);
      wasCorrect = true;
    }
    setInputText("");

    if(!wasCorrect && isGamePlaying){
      requestAnimationFrame(()=>{
        inputRef.current?.focus();
      });
    }
  }, [inputText, findMatchedKAnji, isGamePlaying, inputRef]); // ▼ 依存配列を修正

  const onPlayingChange = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []); // 依存配列を空に

  const toggleHint = useCallback(() => {
    setIsHintVisible(prev => !prev);
  }, []); // 依存配列を空に

  // --- 副作用 (useEffect) ---
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (collectedKanji) {
      setShowResultFlash(true);
      timer = setTimeout(() => {
        setShowResultFlash(false);
        setCollectedKanji(null);
      }, 2000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [collectedKanji]);

  useEffect(() => {
    // ResultFlashが非表示になった後、かつゲームプレイ中にフォーカスを戻す
    if (!showResultFlash && isGamePlaying) { 
      requestAnimationFrame(()=>{
        inputRef.current?.focus();
      })
    }
  }, [showResultFlash, isGamePlaying]); // isGamePlayingも依存配列に追加

  // ------------------------------------
  // メインレンダリング
  // ------------------------------------
  return(
    
    <ScrollableContainer>
      {/* 1.クイズ終了後のアニメーション */}
      {!isGamePlaying &&  (
        <ConfettiAnimation  
          score={score}
          pointerEvents="none"
        />
      )}

      {/* 1. 正解フラッシュ (最前面) */}
      { showResultFlash && collectedKanji && (
        <ResultFlash 
          collectKanji={collectedKanji} 
        />
      )}



      {/* 2. インフォバー */}
      <View style={bar_styles.barContainer}>
        <View style={bar_styles.leftSection}>
          <Trophy color="#eab308" size={24} />
          <Text style={bar_styles.scoreText}>{foundKanji.length} 個（残り：{currentRadicalKanji.kanji.length - foundKanji.length}個）</Text>

        </View>
        <TouchableOpacity onPress={onPlayingChange} style={bar_styles.resetButton}>
          <RefreshCw color="white" size={16} />
          <Text style={bar_styles.resetButtonText}>
            {isGamePlaying ? "答えを見る":"クイズを再開する"}
          </Text>
        </TouchableOpacity>
      </View>


      {/* 3. 部首情報 */}
      <View style={main_styles.container}>
          <Text style={main_styles.countText}>{currentRadicalKanji.reading}</Text>
          <View style={main_styles.radicalContainer}>
              <Text style={main_styles.radicalText}>
                  {currentRadicalKanji.radical}
              </Text>
          </View>
      </View>
      
      {/* 4. メインコンテンツの切り替え */}
      { isGamePlaying ? (
        <View style={{marginTop:20}}>
          <QuizInputSection
            inputRef={inputRef}
            inputText={inputText}
            setInputText={setInputText}
            checkAnswer={checkAnswer}
            toggleHint={toggleHint}
            isHintVisible={isHintVisible}
            hintList={hintList}
          />
        </View>
      ) : (
        /* 結果表示UI */
          <GameEndScreen 
            score={score}
            currentRadicalKanji={currentRadicalKanji}
            foundKanji={foundKanji}
            isGameClear={foundKanji.length === currentRadicalKanji.kanji.length}
          />
      )}

        <FoundKanjiList
          foundKanji={foundKanji} 
          allKanji={currentAllKanji}
          isGamePlaying={isGamePlaying}
        />
        
      {/* 最下部のスペーサー */}
      <View style={{ height: 100 }} /> 
    </ScrollableContainer>
  )
}

// ------------------------------------
// スタイルシート
// ------------------------------------
const fullScreenStyles = StyleSheet.create({
  flexContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1, // コンテンツが短い場合でもScrollView全体を占有
  }
});

const bar_styles = StyleSheet.create({
  barContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 16,
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minWidth: 140,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ca8a04",
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6b7280",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  resetButtonText: {
    color: "white",
    fontSize: 14,
    padding: 2,
  },
});
