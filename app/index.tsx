import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Home() {
  const quizzes = [
    {
      title: "部首漢字ゲーム",
      description: "部首から漢字を連想して答えるクイズ",
      path: "/busyu",
      disabled: false,
      genre: "漢字",
      difficulty: "初級",
      icon: "📝"
    },
    {
      title: "四字熟語当てクイズ",
      description: "意味から四字熟語を答える４択クイズ",
      path: "/yojijukugo", 
      disabled: false,
      genre: "漢字",
      difficulty: "上級",
      icon: "📚"
    },      
  ];

  const groupedQuizzes = quizzes.reduce<Record<string, typeof quizzes>>((acc, quiz) => {
    if (!acc[quiz.genre]) acc[quiz.genre] = [];
    acc[quiz.genre].push(quiz);
    return acc;
  }, {});

  const getGenreColors = (genre:string): [string, string]  => {
    switch (genre) {
      case "漢字": return ["#c084fc", "#f472b6"];
      case "算数": return ["#60a5fa", "#22d3ee"];
      case "英語": return ["#4ade80", "#34d399"];
      default: return ["#9ca3af", "#6b7280"];
    }
  };

  // 📱 動的に画面サイズを取得してカード幅を更新
  const [numColumns, setNumColumns] = useState(2);
  const [cardWidth, setCardWidth] = useState(160);

  useEffect(() => {
    const gutter = 10;
    const horizontalPadding = 24;
    const updateLayout =()=>{
      const {width} = Dimensions.get("window");
      let colums =2;
      if(width >=1000) colums = 4;
      else if(width >= 600) colums=3;
      else if(width <= 400) colums=1;
      setNumColumns(colums);
      const totalGutter = gutter * (colums -1);
      setCardWidth((width - horizontalPadding - totalGutter) / colums);
    }

    updateLayout();
    const subscription: any = Dimensions.addEventListener('change', updateLayout);
    return () => {
      // Handle different RN versions: some return a subscription with .remove(), others return an unsubscribe function.
      if (subscription && typeof subscription.remove === 'function') {
        subscription.remove();
      } else if (typeof subscription === 'function') {
        subscription();
      }
    };
  }, []);

  return (
    <LinearGradient colors={['#f0f4ff', '#ffffff', '#faf5ff']} style={styles.flexContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.mainTitle}>学習クイズメニュー</Text>
          <Text style={styles.subtitle}>ジャンル別に選んで楽しく学習しよう！</Text>
        </View>
        
        {Object.entries(groupedQuizzes).map(([genre, genreQuizzes]) => (
          <View key={genre} style={styles.genreSection}>
            <View style={styles.genreHeader}>
              <LinearGradient colors={getGenreColors(genre)} style={styles.genreTitleBadge}>
                <Text style={styles.genreTitleText}>{genre}クイズ</Text>
              </LinearGradient>
              <View style={styles.divider} />
            </View>
            
            <View style={[styles.quizGrid, { justifyContent: numColumns === 1 ? 'center' : 'flex-start' }]}>
              {genreQuizzes.map((quiz, index) => (
                <View key={index} 
                      style={[
                        styles.cardContainer,
                        quiz.disabled && styles.disabledCard,
                        { width: cardWidth, marginRight: 20, marginBottom: 20 }
                      ]}
                >
                  <LinearGradient colors={getGenreColors(quiz.genre)} style={styles.cardTopBorder} />
                  <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardIcon}>{quiz.icon}</Text>
                    </View>
                    
                    <Text style={styles.cardTitle}>{quiz.title}</Text>
                    <Text style={styles.cardDescription}>{quiz.description}</Text>
                    
                    <View style={styles.buttonContainer}>
                      {!quiz.disabled ? (
                        <Link href={quiz.path as any} asChild>
                          <TouchableOpacity activeOpacity={0.7}>
                            <LinearGradient colors={getGenreColors(quiz.genre)} style={styles.playButton}>
                              <Text style={styles.buttonText}>プレイする</Text>
                            </LinearGradient>
                          </TouchableOpacity>
                        </Link>
                      ) : (
                        <View style={[styles.playButton, styles.disabledButton]}>
                          <Text style={styles.disabledButtonText}>近日公開予定</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>新しいクイズを続々追加予定です！お楽しみに 🎉</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flexContainer: { flex: 1 },
  container: { padding: 24, paddingTop: 60 },
  header: { alignItems: 'center', marginBottom: 48 },
  mainTitle: { fontSize: 36, fontWeight: 'bold', color: '#4c2882', marginBottom: 12 },
  subtitle: { fontSize: 18, color: '#6b7280' },
  genreSection: { marginBottom: 48 },
  genreHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  genreTitleBadge: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 999 },
  genreTitleText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  divider: { flex: 1, height: 1, backgroundColor: '#d1d5db', marginLeft: 16 },
  quizGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  cardContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  disabledCard: { backgroundColor: '#f3f4f6', opacity: 0.7 },
  cardTopBorder: { height: 6, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  cardContent: { padding: 20 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  cardIcon: { fontSize: 36 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#1f2937', marginBottom: 8 },
  cardDescription: { fontSize: 14, color: '#4b5563', marginBottom: 24, lineHeight: 20, minHeight: 60 },
  buttonContainer: { alignItems: 'center' },
  playButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  disabledButton: { backgroundColor: '#e5e7eb' },
  disabledButtonText: { color: '#6b7280', fontWeight: 'bold', fontSize: 16 },
  footer: { alignItems: 'center', marginTop: 20 },
  footerText: { fontSize: 14, color: '#6b7280' },
});
