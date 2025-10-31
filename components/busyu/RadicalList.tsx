import { router } from "expo-router";
import { Shuffle } from "lucide-react-native";
import React, { CSSProperties, useEffect, useState } from "react";
import { ScrollView, Text, TextStyle, View, ViewStyle } from "react-native";

interface RadicalListProps {
  radicals: {
    radical: string;
    count: number;
    reading: string;
  }[];
  onSelect: (radical: string) => void;
}

export default function RadicalList({ radicals, onSelect }: RadicalListProps) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [isRandomHovered, setIsRandomHovered] = useState(false);
  const [isBackButtonHovered, setIsBackButtonHovered] = useState(false);

  const onRandomSelect = () => {
    const randomIndex = Math.floor(Math.random() * radicals.length);
    const randomRadical = radicals[randomIndex].radical;
    onSelect(randomRadical);
  };

  useEffect(() => {
    console.log(JSON.stringify(radicals, null, 2));
  }, [radicals]);

  const backButtonStyle: CSSProperties = {
    ...styles.backButton,
    backgroundColor: isBackButtonHovered ? "#D1D5DB" : "#E5E7EB",
  };

  const randomButtonStyle: CSSProperties = {
    ...styles.randomButton,
    transform: isRandomHovered ? "scale(1.05)" : "scale(1)",
    boxShadow: isRandomHovered
      ? "0 10px 20px rgba(139,92,246,0.3)"
      : "0 6px 12px rgba(139,92,246,0.25)",
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 戻るボタン */}
      <button
        onClick={() => router.push("/")}
        style={backButtonStyle}
        onMouseEnter={() => setIsBackButtonHovered(true)}
        onMouseLeave={() => setIsBackButtonHovered(false)}
      >
        <span style={styles.backButtonText}>← タイトルに戻る</span>
      </button>

      {/* タイトル */}
      <View style={styles.header}>
        <Text style={styles.title}>部首クイズ</Text>
        <Text style={styles.subtitle}>
          興味のある部首を選んでクイズを始めましょう。
        </Text>
      </View>

      {/* ランダム選択ボタン */}
      <button
        onClick={onRandomSelect}
        onMouseEnter={() => setIsRandomHovered(true)}
        onMouseLeave={() => setIsRandomHovered(false)}
        style={randomButtonStyle}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Shuffle color="white" size={20} />
          <span style={{ fontSize: 18, color: "white", fontWeight: "bold" }}>
            ランダムに選択
          </span>
        </div>
      </button>

      {/* 部首カード一覧 */}
      <div style={styles.cardList}>
        {radicals
          .filter(({ count }) => count > 10)
          .map(({ radical, count, reading }) => {
            const isHovered = hoveredCard === radical;

            const cardStyle: CSSProperties = {
              ...styles.card,
              transform: isHovered ? "scale(1.05)" : "scale(1)",
              boxShadow: isHovered
                ? "0 10px 20px rgba(0, 0, 0, 0.2)"
                : "0 4px 10px rgba(0, 0, 0, 0.1)",
              borderColor: isHovered ? "#A78BFA" : "#DDD6FE",
            };

            return (
              <button
                key={radical}
                onClick={() => onSelect(radical)}
                onMouseEnter={() => setHoveredCard(radical)}
                onMouseLeave={() => setHoveredCard(null)}
                style={cardStyle}
              >
                <div style={styles.cardGradient} />
                <span style={styles.radicalText}>{radical}</span>
                <span style={styles.readingText}>部首名：{reading}</span>
                <span style={styles.countText}>漢字数：{count}字</span>
              </button>
            );
          })}
      </div>
    </ScrollView>
  );
}

const styles: Record<string, ViewStyle | TextStyle | any> = {
  container: {
    minHeight: "100vh",
    fontFamily: "sans-serif",
    background: "linear-gradient(to bottom right, #F3E8FF, #EFF6FF, #E0F2FE)",
    padding: 24,
    alignItems: "center",
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 8,
    borderRadius: 6,
    padding: "8px 16px",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  backButtonText: {
    fontSize: 14,
    color: "#374151",
  },
  header: {
    alignItems: "center",
    textAlign: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#4B5563",
  },
  randomButton: {
    backgroundColor: "#8B5CF6",
    padding: "16px 32px",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    border: "none",
    cursor: "pointer",
    transition: "transform 0.3s, box-shadow 0.3s",
  },
  cardList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16,
    width: "100%",
  },
  card: {
    position: "relative",
    backgroundColor: "#F5F3FF",
    border: "2px solid #DDD6FE",
    borderRadius: 16,
    padding: 24,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    transition: "transform 0.3s, box-shadow 0.3s, border-color 0.3s",
    cursor: "pointer",
  },
  cardGradient: {
    position: "absolute",
    inset: 0,
    borderRadius: 16,
    background: "linear-gradient(to bottom right, #A78BFA, #8B5CF6)",
    opacity: 0.08,
  },
  radicalText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#5B21B6",
    marginBottom: 8,
    zIndex: 1,
  },
  readingText: {
    fontSize: 16,
    color: "#4B5563",
    zIndex: 1,
  },
  countText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
    zIndex: 1,
  },
};
