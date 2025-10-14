const  generateHints(excludeChar: string | null = null):any => {
    if (!currentRadical) return;
    const notFound = radicalMap[currentRadical].filter(
      (k) => !foundKanji.some((f) => f.char === k.char) && k.char !== excludeChar
    );
    const hints = notFound
      .sort((a, b) =>b.kanken -  a.kanken)
      .slice(0, 2)
      .map((k) => `${k.meaning}　（${k.kanken ? kankenToGakusei(k.kanken) : "不明"}）`);
    setHintList(hints);
  };
  