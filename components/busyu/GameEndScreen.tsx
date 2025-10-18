import { ProcessedDataProps } from '@/app/busyu';
import React, { useMemo } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { router } from 'expo-router';
import { KanjiData } from './styles';


interface GameEndScreenProps {
  currentRadicalKanji: ProcessedDataProps;
  foundKanji: KanjiData[] | null;
}

export default function GameEndScreen({
  currentRadicalKanji,
  foundKanji,
}: GameEndScreenProps) {
  
  const onReturn=()=>{
     router.push("/busyu");
  }

  const foundKanjiCount = foundKanji ? foundKanji.length : 0;
  const allKanjiCount = currentRadicalKanji.kanji.length;
  const collectPercentage = foundKanjiCount / allKanjiCount  * 100

  const message = useMemo(() => {
    if (collectPercentage >= 80) return "漢字マスター！";
    if (collectPercentage >= 60) return "素晴らしい！";
    if (collectPercentage >= 40) return "よくできました！";
    if (collectPercentage >= 20) return "がんばりました！";
    return "次は頑張ろう！";
  }, [collectPercentage]);


  return (
    <View style={styles.container}>
      {/* メッセージ */}
      <Text style={[styles.messageText]}>（全{allKanjiCount} 個）</Text>
      <Text style={styles.scoreText}>正解 {foundKanjiCount} 個</Text>
      <Text style={styles.messageText}>{message}</Text>
            
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
    marginTop:20,
    padding: 32, // p-8 (8 * 4 = 32)
    // 影のスタイル (shadow-lg)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8, // Android用
  }, 

  // text-6xl font-bold text-blue-600 mb-4
  scoreText: {
    fontSize: 60,
    fontWeight: 'bold',
    color: 'red', // blue-600
    marginBottom: 16,
  },
  
  // text-2xl text-gray-700 mb-2
  messageText: {
    fontSize: 24,
    color: '#455d83ff', // gray-700
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
    backgroundColor: '#51c58fff', // gray-500
  },
  
  // text-white font-bold text-xl
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
});