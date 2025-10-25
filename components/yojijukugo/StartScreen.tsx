import { yojiData } from "@/assets/yojiData";
import { router } from "expo-router";
import React, { CSSProperties, useEffect, useState } from "react";
import { ScrollView } from "react-native";


const kankenToGrade = (level: number) => {
  const gradeMap: Record<number, string> = {
    5: "小学6年生",
    4: "中学生レベル",
    3: "中学生レベル",
    2.5: "高校生レベル",
    2: "高校生レベル",
    1.5: "大学・社会人",
    1: "大学・社会人",
  };
  return gradeMap[level] ?? "不明";
};

// DimensionsのWeb版
const useWindowDimensions = () => {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return { width };
};

const levels = [5, 4, 3, 2.5, 2, 1.5, 1];

const getLevelCounts = () => {
  const counts: Record<number, number> = {} as Record<number, number>;
  levels.forEach((level) => {
    counts[level] = yojiData.filter((item) => item.kanken === level).length;
  });
  return counts;
};

const levelCounts = getLevelCounts();

const getKankenLabel = (level: number) => {
  switch (level) {
    case 1.5:
      return "準1級";
    case 2.5:
      return "準2級";
    default:
      return `${level}級`;
  }
};

interface StartScreenProps {
  onStart: (level: number) => void;
}

const YojiStartScreen = ({
  onStart
}: StartScreenProps) => {
  const { width } = useWindowDimensions();

  // ホバー状態を管理
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  // レスポンシブなカラム数を決定
  const getNumColumns = () => {
    if (width > 1024) return 4; // PC
    if (width > 768) return 3;  // Tablet
    if (width > 640) return 2;  // Small Tablet
    return 2; // Mobile
  };
  const numColumns = getNumColumns();
  const cardMargin = 8;
  // ウィンドウ幅からパディング(24*2)とマージンを引いてカード幅を計算
  const cardWidth = (width - 48 - (numColumns * cardMargin * 2)) / numColumns;

  // 各レベルカードをレンダリングする関数
  const renderLevelCard = (level: number) => {
    const theme = getLevelTheme(level);
    const isHovered = hoveredCard === level;

    // スタイルを動的に結合
    const cardStyle: CSSProperties = {
      ...styles.card,
      ...styles.shadow,
      backgroundColor: theme.bg,
      borderColor: isHovered ? theme.hoverBorder : theme.border,
      width: cardWidth,
      margin: cardMargin,
      transform: isHovered ? 'scale(1.05)' : 'scale(1)',
      // shadowOpacity, shadowRadius はReact Nativeのプロパティなので、boxShadowで代用
      boxShadow: isHovered 
        ? '0 10px 20px rgba(0, 0, 0, 0.2)' 
        : '0 4px 10px rgba(0, 0, 0, 0.1)',
    };

    const gradientStyle: CSSProperties = {
      ...styles.cardGradient,
      background: `linear-gradient(to bottom right, ${theme.gradient[0]}, ${theme.gradient[1]})`,
      opacity: isHovered ? 0.1 : 0,
    };

    return (
    <ScrollView>
      <button
        key={level}
        onClick={() => onStart(level)}
        style={cardStyle}
        onMouseEnter={() => setHoveredCard(level)}
        onMouseLeave={() => setHoveredCard(null)}
      >
        <div style={gradientStyle} />

        <span style={styles.cardIcon}>{theme.icon}</span>

        <div style={styles.cardLevelContainer}>
          <span style={{ ...styles.cardLevelKanken, color: theme.text }}>
            漢検{getKankenLabel(level)}
          </span>
          <span style={{ ...styles.cardLevelGrade, color: theme.text }}>
            {kankenToGrade(level)}
          </span>
        </div>

        <div style={{ ...styles.badge, backgroundColor: theme.badgeBg }}>
          <span style={{ ...styles.badgeText, color: theme.badgeText }}>
            {levelCounts[level]}問
          </span>
        </div>

        <div style={styles.difficultyContainer}>
          {Array.from({ length: 5 }, (_, i) => (
            <div
              key={i}
              style={{
                ...styles.difficultyDot,
                backgroundColor:
                  i < 6 - level
                    ? theme.difficultyColor
                    : "#E5E7EB",
              }}
            />
          ))}
        </div>

        <span style={{ ...styles.cardStartText, color: theme.text, opacity: isHovered ? 1 : 0 }}>
          クイズを開始 →
        </span>
      </button>
      </ScrollView>

    );
  };

  const [isBackButtonHovered, setIsBackButtonHovered] = useState(false);

  const backButtonStyle: CSSProperties = {
    ...styles.backButton,
    backgroundColor: isBackButtonHovered ? "#D1D5DB" : "#E5E7EB",
  };

  const headerIconStyle: CSSProperties = {
    ...styles.headerIconContainer,
    ...styles.shadow,
    background: 'linear-gradient(to right, #4F46E5, #7C3AED)',
  };

  const containerStyle: CSSProperties = {
    ...styles.container,
    background: 'linear-gradient(to bottom right, #F3E8FF, #EFF6FF, #E0F2FE)',
  };

  return (
    <ScrollView>
    <div style={containerStyle}>
      <div style={styles.scrollContainer}>

        <button
          onClick={() => router.push("/")} 
          style={backButtonStyle}
          onMouseEnter={() => setIsBackButtonHovered(true)}
          onMouseLeave={() => setIsBackButtonHovered(false)}
        >
          <span style={styles.backButtonText}>← タイトルに戻る</span>
        </button>

        <div style={styles.header}>
          <h1 style={styles.title}>四字熟語クイズ</h1>
          <p style={styles.subtitle}>
            漢字検定のレベルを選んでクイズを始めましょう。
          </p>
        </div>

        {/* FlatListの代わりにdivとmapを使用 */}
        <div style={{ ...styles.cardList, gridTemplateColumns: `repeat(${numColumns}, 1fr)` }}>
          {levels.map(renderLevelCard)}
        </div>

      </div>
    </div>
    </ScrollView>
  );
};


// レベル別の色テーマ（StyleSheet用のカラーコードを返す）
const getLevelTheme = (level: number) => {
  const themes: Record<number, any> = {
    5: {
      gradient: ["#34D399", "#10B981"],
      bg: "#F0FDF4",
      border: "#A7F3D0",
      hoverBorder: "#34D399",
      text: "#065F46",
      badgeBg: "#D1FAE5",
      badgeText: "#065F46",
      icon: "🌱",
      difficultyColor: "#10B981",
    },
    4: {
      gradient: ["#60A5FA", "#3B82F6"],
      bg: "#EFF6FF",
      border: "#BFDBFE",
      hoverBorder: "#60A5FA",
      text: "#1E40AF",
      badgeBg: "#DBEAFE",
      badgeText: "#1E40AF",
      icon: "🌊",
      difficultyColor: "#3B82F6",
    },
    3: {
      gradient: ["#A78BFA", "#8B5CF6"],
      bg: "#F5F3FF",
      border: "#DDD6FE",
      hoverBorder: "#A78BFA",
      text: "#5B21B6",
      badgeBg: "#EDE9FE",
      badgeText: "#5B21B6",
      icon: "🌸",
      difficultyColor: "#8B5CF6",
    },
    2.5: {
      gradient: ["#F472B6", "#E11D48"],
      bg: "#FFF1F2",
      border: "#FECDD3",
      hoverBorder: "#F472B6",
      text: "#BE123C",
      badgeBg: "#FFE4E6",
      badgeText: "#BE123C",
      icon: "🌺",
      difficultyColor: "#E11D48",
    },
    2: {
      gradient: ["#FBBF24", "#F97316"],
      bg: "#FFF7ED",
      border: "#FED7AA",
      hoverBorder: "#FBBF24",
      text: "#C2410C",
      badgeBg: "#FFEDD5",
      badgeText: "#C2410C",
      icon: "🔥",
      difficultyColor: "#F97316",
    },
    1.5: {
      gradient: ["#F87171", "#EF4444"],
      bg: "#FEF2F2",
      border: "#FECACA",
      hoverBorder: "#F87171",
      text: "#B91C1C",
      badgeBg: "#FEE2E2",
      badgeText: "#B91C1C",
      icon: "⚡",
      difficultyColor: "#EF4444",
    },
    1: {
      gradient: ["#4B5563", "#111827"],
      bg: "#F9FAFB",
      border: "#D1D5DB",
      hoverBorder: "#6B7280",
      text: "#1F2937",
      badgeBg: "#F3F4F6",
      badgeText: "#1F2937",
      icon: "👑",
      difficultyColor: "#4B5563",
    },
  };
  return themes[level] || themes[1];
};



const styles: { [key: string]: CSSProperties } = {
  container: {
    minHeight: '100vh',
    fontFamily: 'sans-serif',
    paddingBottom:40,
  },
  scrollContainer: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    boxSizing: 'border-box', // 型エラーの原因
    width: '100%',
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 8,
    borderRadius: 6,
    padding: '8px 16px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  backButtonText: {
    fontSize: 14,
    color: "#374151",
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: "center",
    marginBottom: 5,
    textAlign: 'center',
  },
  headerIconContainer: {
    width: 80,
    height: 80,
    display: 'flex',
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    marginBottom: 24,
  },
  headerIconText: {
    fontSize: 30,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 16,
    margin: 0,
  },
  subtitle: {
    fontSize: 18,
    color: "#4B5563",
    maxWidth: 672,
    lineHeight: 1.5,
    margin: 0,
  },
  cardList: {
    width: "100%",
    display: 'grid',
    justifyContent: 'center',
  },
  card: {
    border: '2px solid',
    borderRadius: 16,
    padding: 24,
    display: 'flex',
    flexDirection: 'column',
    alignItems: "center",
    overflow: "hidden",
    position: 'relative',
    transition: 'transform 0.3s, box-shadow 0.3s, border-color 0.3s',
    cursor: 'pointer',
    boxSizing: 'border-box', // 型エラーの原因
  },
  shadow: {
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
  },
  cardGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    transition: 'opacity 0.3s',
  },
  cardIcon: {
    fontSize: 36,
    marginBottom: 12,
  },
  cardLevelContainer: {
    marginBottom: 8,
    alignItems: "center",
    display: 'flex',
    flexDirection: 'column',
  },
  cardLevelKanken: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  cardLevelGrade: {
    fontSize: 14,
    opacity: 0.8,
  },
  badge: {
    padding: '4px 12px',
    borderRadius: 9999,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  difficultyContainer: {
    display: 'flex',
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 12,
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    margin: '0 2px',
    opacity: 0.6,
  },
  cardStartText: {
    fontSize: 14,
    fontWeight: "500",
    transition: "opacity 0.3s",
  },
  footer: {
    display: 'flex',
    flexDirection: "row",
    alignItems: "center",
    marginTop: 48,
  },
  footerText: {
    fontSize: 14,
    color: "#4B5563",
    marginLeft: 8,
  },
};

export default YojiStartScreen;