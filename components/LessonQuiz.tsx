"use client";
import { useState } from "react";
import type { QuizQuestion } from "@/lib/learning-model";

export function LessonQuiz({questions}:{questions:QuizQuestion[]}) {
  const [answers,setAnswers]=useState<Record<number,number>>({});
  const [graded,setGraded]=useState(false);
  const correct=questions.filter((q,i)=>answers[i]===q.answer).length;
  return <section className="lesson-quiz"><h3>Tự kiểm tra</h3>
    {questions.map((q,i)=><fieldset key={i} disabled={graded}><legend>{i+1}. {q.question}</legend>
      {q.options.map((option,j)=><label key={j}><input type="radio" name={`question-${i}`} checked={answers[i]===j} onChange={()=>setAnswers({...answers,[i]:j})}/> {option}</label>)}
      {graded&&<p>{answers[i]===q.answer?"Đúng.":"Đáp án đúng: "+q.options[q.answer]} {q.explanation}</p>}
    </fieldset>)}
    {graded?<><p role="status">Đúng {correct}/{questions.length} câu.</p><button className="btn" onClick={()=>{setGraded(false);setAnswers({});}}>Làm lại</button></>:
      <button className="btn" disabled={Object.keys(answers).length!==questions.length} onClick={()=>setGraded(true)}>Kiểm tra đáp án</button>}
  </section>;
}
