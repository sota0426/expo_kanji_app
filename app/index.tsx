// app/index.js (or your desired screen file)
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import React from 'react';
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
      title: "部首当てクイズ",
      description: "漢字の部首を答える４択クイズ",
      path: "/busyuate", 
      disabled: false,
      genre: "漢字",
      difficulty: "中級",
      icon: "🔍"
    },
    {
      title: "四字熟語当てクイズ",
      description: "意味から四字熟語を答える４択クイズ",
      path: "/yojiimi", 
      disabled: false,
      genre: "漢字",
      difficulty: "上級",
      icon: "📚"
    },      
    // {
    //   title: "２×２の掛け算クイズ",
    //   description: "２×２の掛け算をひたすら行う",
    //   path: "/kakezan", 
    //   disabled: false,
    //   genre: "算数",
    //   difficulty: "初級",
    //   icon: "✖️"
    // },
    // {
    //     title: "近日公開",
    //     description: "新しいクイズを準備中です。",
    //     path: "/", 
    //     disabled: true,
    //     genre: "算数",
    //     difficulty: "",
    //     icon: "✨"
    // },
  ];

  const groupedQuizzes = quizzes.reduce<Record<string, typeof quizzes>>((
    acc,
    quiz
  ) => {
    if (!acc[quiz.genre]) {
      acc[quiz.genre] = [];
    }
    acc[quiz.genre].push(quiz);
    return acc;
  }, {});
  
    // 戻り値の型を string[] から [string, string] に変更
  const getGenreColors = (genre:string): [string, string]  => {
    switch (genre) {
      case "漢字": return ["#c084fc", "#f472b6"];
      case "算数": return ["#60a5fa", "#22d3ee"];
      case "英語": return ["#4ade80", "#34d399"];
      // defaultケースも要素数を2つに揃える
      default: return ["#9ca3af", "#6b7280"];
    }
  };

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
            
            <View style={styles.quizGrid}>
              {genreQuizzes.map((quiz, index) => (
                <View key={index} style={[styles.cardContainer, quiz.disabled && styles.disabledCard]}>
                  <LinearGradient colors={getGenreColors(quiz.genre)} style={styles.cardTopBorder} />
                  <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardIcon}>{quiz.icon}</Text>
                    </View>
                    
                    <Text style={styles.cardTitle}>{quiz.title}</Text>
                    <Text style={styles.cardDescription}>{quiz.description}</Text>
                    
                    <View style={styles.buttonContainer}>
                      {!quiz.disabled ? (
                        <Link href={quiz.path} asChild>
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

// Calculate item width for a 2-column grid with spacing
const { width } = Dimensions.get('window');
const cardMargin = 5;
const cardWidth = (width /2) - (cardMargin * 2);

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
  },
  container: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  mainTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4c2882',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
  },
  genreSection: {
    marginBottom: 48,
  },
  genreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  genreTitleBadge: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
  },
  genreTitleText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#d1d5db',
    marginLeft: 16,
  },
  quizGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -cardMargin,
  },
  cardContainer: {
    width: cardWidth,
    margin: cardMargin,
    backgroundColor: 'white',
    borderRadius: 16,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    // Shadow for Android
    elevation: 6,
  },
  disabledCard: {
    backgroundColor: '#f3f4f6',
    opacity: 0.7,
  },
  cardTopBorder: {
    height: 6,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardIcon: {
    fontSize: 36,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 24,
    lineHeight: 20,
    minHeight: 60,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#e5e7eb',
  },
  disabledButtonText: {
    color: '#6b7280',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
  },
});