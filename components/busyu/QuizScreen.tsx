import React from 'react';
import { StyleSheet, Text, View } from "react-native";

// Propsの型をより具体的に定義します
type QuizScreenProps = {
    currentRadical: string;
    currentAllKanji: any[]; // 必要に応じて、より具体的な型に置き換えてください
};

export default function QuizScreen({
    currentRadical,
    currentAllKanji
}: QuizScreenProps) {
    return(

        <View style={styles.container}>

            {/* 部首を表示するコンテナ */}
            <View style={styles.radicalContainer}>
                <Text style={styles.radicalText}>
                    {currentRadical}
                </Text>
            </View>

            {/* 漢字の総数を表示するテキスト */}
            <Text style={styles.countText}>
                全 {currentAllKanji.length} 個の漢字があります
            </Text>
        </View>
    );
}

// StyleSheetを使ってスタイルを定義します
const styles = StyleSheet.create({
    container: {
        alignItems: 'center', // 子要素を中央揃えにする (text-centerの代替)
        justifyContent: 'center',
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