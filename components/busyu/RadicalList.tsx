// -----------------------
// components\busyu\RadicalList.tsx
// -----------------------
import { Shuffle } from "lucide-react-native";
import React, { useEffect } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, } from "react-native";

interface RadicalListProps {
  radicals: {
    radical: string;
    count: number;
    reading: string;
  }[],
  onSelect: (radical: string) => void;
}

export default function RadicalList({
  radicals,
  onSelect    
}: RadicalListProps) {

    useEffect(() => {
        // デバッグ用のログはそのまま使用できます
        console.log(JSON.stringify(radicals, null, 2));
    }, [radicals]);

    const onRandomSelect = () => {
        const randomIndex = Math.floor(Math.random() * radicals.length);
        const randomRadical = radicals[randomIndex].radical;
        onSelect(randomRadical);
    }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity
        onPress={onRandomSelect}
        style={[styles.card, { backgroundColor: "gray" }]} // 青みがかった背景色
        activeOpacity={0.7} // タップ時の透明度
      >
      <View style={{flexDirection: "row", alignItems: "center", gap: 8}}>
        <Shuffle color="white" size={20}/>
         <Text style ={{ fontSize:18, color: "white", fontWeight: "bold" }}>
          ランダムに選択
        </Text>
      </View>
      </TouchableOpacity>
      {radicals
        .filter(({ count }) => count > 10)
        .map(({ radical, count, reading }) => (
          <TouchableOpacity
            key={radical}
            onPress={() => onSelect(radical)}
            style={styles.card}
            activeOpacity={0.7} // タップ時の透明度
          >
            <View style={styles.cardContent}>
              <View style={styles.header}>
                <Text style={styles.radicalText}>{radical}</Text>
                <Text style={styles.countText}>（漢字数：{count}）</Text>
              </View>
              <View style={styles.body}>
                <Text style={styles.readingText}>部首名: {reading}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    // 2カラムレイアウトのためのFlexbox設定
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 8, // 全体の余白
  },
  card: {
    // 各カードのスタイル
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16, // カード間の垂直方向の余白
    width: "80%",

    // iOS用の影
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Android用の影
    elevation: 3,
  },
  cardContent: {
    // カード内のコンテンツの配置
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline', // テキストのベースラインを揃える
    marginBottom: 8,
  },
  radicalText: {
    fontSize: 36,
    fontWeight: "bold",
    marginRight: 8,
  },
  countText: {
    fontSize: 14,
    color: "#4B5563", // gray-600
  },
  body: {
    // marginTop: 8, // 元のコードのmt-2に相当
  },
  readingText: {
    fontSize: 16,
    color: "#374151", // gray-700
  },
});