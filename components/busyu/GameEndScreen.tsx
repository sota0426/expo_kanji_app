import { ProcessedDataProps } from '@/app/busyu';
import React, { useMemo } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View
} from 'react-native';

import { router } from 'expo-router';
import { KanjiData } from './QuizScreen';


interface GameEndScreenProps {
  score: number;
  currentRadicalKanji: ProcessedDataProps;
  foundKanji: KanjiData[] | null;
  isGameClear: boolean;
  // onReplay: () => void; // (現在は未使用)
}

export default function GameEndScreen({
  score = 0,
  currentRadicalKanji,
  foundKanji,
  isGameClear,
}: GameEndScreenProps) {
  const { width, height } = useWindowDimensions();

  // 🚀 isAnimationのロジックを復元 (スコアが15点以上またはゲームクリア)
  const isAnimation = useMemo(() => isGameClear || score >= 15, [isGameClear, score]);
  // const isAnimation = true; // デバッグ用コードは削除またはコメントアウト推奨

  const onReturn=()=>{
     router.push("/busyu");
  }

  const foundKanjiCount = foundKanji ? foundKanji.length : 0;
  const allKanjiCount = currentRadicalKanji.kanji.length;

  const message = useMemo(() => {
    if(score === 0) return "次はがんばろう！";
    if (score >= 20) return "漢字マスター！";
    if (score >= 15) return "素晴らしい！";
    if (score >= 10) return "よくできました！";
    if (score >= 5) return "がんばりました！";
    return "また挑戦してね！";
  }, [score]);


  return (
    <View style={styles.container}>
      

      {/* メッセージ */}
      <Text style={styles.title}>答え合わせ</Text>
      <Text style={styles.scoreText}>{score}点</Text>
      {/* <Text style={styles.messageText}>{message(score)}</Text> */}
            
      <Text style={styles.summaryText}>
        部首「{currentRadicalKanji.radical}」で {foundKanjiCount} / {allKanjiCount} 個の漢字を発見しました！
      </Text>

      {/* <AllKanjiList /> はここに追加 */}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={onReturn}
          style={[styles.buttonBase, styles.secondaryButton]}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>部首選択へ戻る</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // text-center bg-white rounded-lg shadow-lg p-8
  container: {
    alignItems: 'center', // text-center
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 32, // p-8 (8 * 4 = 32)
    // 影のスタイル (shadow-lg)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8, // Android用
  }, 
  // text-3xl font-bold mb-4
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  
  // text-6xl font-bold text-blue-600 mb-4
  scoreText: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#2563EB', // blue-600
    marginBottom: 16,
  },
  
  // text-2xl text-gray-700 mb-2
  messageText: {
    fontSize: 24,
    color: '#374151', // gray-700
    marginBottom: 8,
  },
  
  // text-lg text-gray-600 mb-6
  summaryText: {
    fontSize: 18,
    color: '#4B5563', // gray-600
    marginBottom: 24, // mb-6
    textAlign: 'center',
  },

  listPlaceholder: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  
  // space-x-4 の代替
  buttonContainer: {
    flexDirection: 'row',
    // space-x-4 に相当するマージンをボタンに追加するため、ここでは gap のみ
    gap: 16, 
    justifyContent: 'center',
    flexWrap: 'wrap', // ボタンが多すぎるときに折り返す
    marginTop: 16,
  },

  // ボタンのベーススタイル
  buttonBase: {
    paddingVertical: 12, // py-3
    paddingHorizontal: 32, // px-8
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // bg-blue-500 hover:bg-blue-600
  primaryButton: {
    backgroundColor: '#3B82F6', // blue-500
  },
  
  // bg-gray-500 hover:bg-gray-600
  secondaryButton: {
    backgroundColor: '#6B7280', // gray-500
  },
  
  // text-white font-bold text-xl
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
});