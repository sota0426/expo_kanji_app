// ConfettiAnimation.tsx

import React, { useEffect } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
// Confettiの型を扱うための対処が必要です。手動で型定義ファイルを
// 作成している場合は、そのままインポートできます。
import Confetti from 'react-native-confetti';

interface ConfettiAnimationProps {
    currentAllKanjiLength:number;
    score: number;
    pointerEvents?: 'box-none' | 'box-only' | 'none' | 'auto';
}

export default function ConfettiAnimation({
    currentAllKanjiLength,
    score,
    pointerEvents 
}: ConfettiAnimationProps) {
    const { width, height } = useWindowDimensions();
    const confettiRef = React.useRef<Confetti>(null);


    // アニメーションの制御ロジック
    useEffect(() => {
        const confetti = confettiRef.current;

        if ((score >= 5 || score === currentAllKanjiLength) && confettiRef.current) {
            confettiRef.current.startConfetti();
        }

        // クリーンアップ関数
        return () => {
            if (confetti) {
                confetti.stopConfetti();
            }
        };
    }, [score,currentAllKanjiLength]);

    // アニメーションを画面全体に表示するためのWrapper
    return (
        <View 
            style={[styles.confettiWrapper, { width, height }]}
            pointerEvents={pointerEvents}    
        >
            <Confetti
                ref={confettiRef}
                timeout={5} 
            />
        </View>
    );
}

const styles = StyleSheet.create({
    confettiWrapper: {
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 10, // 他の要素より手前に表示
        // widthとheightはuseWindowDimensionsから受け取るため、ここでは設定不要
    },
});