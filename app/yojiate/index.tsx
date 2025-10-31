import { FinishScreen } from "@/components/yojiate/FinishScreen";
import YojiQuiz from "@/components/yojiate/QuizScreen";
import YojiStartScreen from "@/components/yojiate/YojiStartScreen";
import { useState } from "react";

export default function Yojijukugo(){
  const [level , setLevel]=useState<number | null>(null);
  const [finished,setFinished] =useState<boolean>(false);
  const [score , setScore] = useState<number>(0);

  const handleFinish =(finalScore:number)=>{
    setScore(finalScore);
    setFinished(true);
  };

  const handleRetry=()=>{
    setFinished(false);
  }

  const handleReturnTop=()=>{
    setLevel(null);
    setFinished(false);
    setScore(0);
  }

  if(finished){
    return(
      <FinishScreen
        score={score}
        total={10}
        onRetry={handleRetry}
        onReturnTop={handleReturnTop}
      />
    );
  }

  if(level === null){
    return (
      <YojiStartScreen 
        onStart={(lvl)=>setLevel(lvl)}
      />
    )}

    return(
      <YojiQuiz
        level={level}
        onFinish={(finalScore)=>handleFinish(finalScore)}
        onQuit={handleReturnTop}
      />
    )
}