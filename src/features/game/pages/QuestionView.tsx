export default function QuestionView() {
  return <h1>Hola, mundo</h1>;
}

// import { useQuestions } from "@/hooks/useQuestions";
// import { useTabletGame } from "@/hooks/useGame";
// import { useAuth } from "@/hooks/useAuth";
// import { submitAnswer } from "@/services/answers.service";
// import questionIcon from "@/assets/images/tv/question-icon.png";
// import { useState, useEffect, useRef } from "react";
// import clsx from "clsx";
// import { useSession } from "@/hooks/useSession";
// import { useNavigate } from "react-router";

// export default function QuestionView() {
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const { currentRoom } = useTabletGame();
//   const { session } = useSession({
//     roomId: currentRoom?.id || null,
//     user,
//     autoJoin: false,
//   });
//   const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const questionStartTime = useRef<number | null>(null);
//   const [responseTimeMs, setResponseTimeMs] = useState<number | null>(null);

//   const {
//     currentQuestion,
//     currentQuestionIndex,
//     selectedQuestions,
//     isLoadingQuestions,
//     error,
//   } = useQuestions(currentRoom?.id || "");

//   // Iniciar el cronómetro cuando se carga una nueva pregunta
//   useEffect(() => {
//     if (currentQuestion && !selectedLetter) {
//       questionStartTime.current = Date.now();
//       setResponseTimeMs(null);
//     }
//   }, [currentQuestion, selectedLetter]);

//   // Redirect to feedback when session status is "feedback"
//   useEffect(() => {
//     if (session?.status === "feedback") {
//       navigate("/feedback");
//     }
//   }, [session?.status, navigate]);

//   if (isLoadingQuestions) {
//     return (
//       <div className="glass-card ">
//         <p className="text-2xl font-bold text-[var(--dark-blue)] ">
//           Cargando pregunta...
//         </p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="question-view">
//         <p>Error: {error}</p>
//       </div>
//     );
//   }

//   const handleAnswer = async (letter: string) => {
//     if (selectedLetter || isSubmitting) return;

//     // Calcular tiempo de respuesta en milisegundos
//     const timeMs = questionStartTime.current
//       ? Date.now() - questionStartTime.current
//       : 0;

//     setResponseTimeMs(timeMs);
//     setSelectedLetter(letter);
//     setIsSubmitting(true);

//     try {
//       if (
//         !currentRoom?.id ||
//         !session?.id ||
//         !user?.id ||
//         !currentQuestion?.id
//       ) {
//         console.error("Faltan datos para enviar la respuesta");
//         return;
//       }

//       const isCorrect = currentQuestion.answer === letter;

//       // Calcular puntuación (puedes ajustar esta lógica según tus necesidades)
//       // Fórmula simplificada: tiempo restante = puntaje
//       const timeLimit = 20000; // 20 segundos en milisegundos
//       const finalScore = isCorrect ? Math.max(0, timeLimit - timeMs) : 0;

//       // Enviar respuesta a Firestore
//       await submitAnswer(currentRoom.id, session.id, {
//         participantId: user.id,
//         questionId: currentQuestion.id,
//         selectedAnswer: letter,
//         isCorrect,
//         responseTimeMs: timeMs,
//         score: finalScore,
//       });

//       console.log("Answer submitted successfully:", {
//         time: timeMs,
//         answer: letter,
//         correct: isCorrect,
//         score: finalScore,
//       });
//     } catch (error) {
//       console.error("Error submitting answer:", error);
//       // Opcional: mostrar un mensaje de error al usuario
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="w-fit max-w-[80%]">
//       {currentQuestion ? (
//         <>
//           <div className="text-center text-2xl font-bold mb-3 text-gray-700">
//             ({currentQuestionIndex + 1}/{selectedQuestions.length})
//           </div>

//           <div className="bg-[var(--secondary)] py-6 px-10 rounded-[20px] border-3 relative mb-20">
//             <p className="bg-[var(--fuchsia)] text-white py-1 px-3 rounded-[10px] font-bold absolute top-[-20px] right-[10px] ">
//               {currentQuestion.topic}
//             </p>
//             <img
//               src={questionIcon}
//               alt="question icon"
//               width={150}
//               className="absolute top-[-60px] left-[-100px]"
//             />
//             <h2 className="text-xl font-bold text-center">
//               {currentQuestion.question}
//             </h2>
//           </div>

//           <section className="grid grid-cols-2 gap-10">
//             {Object.entries(currentQuestion.options).map(([key, value]) => {
//               return (
//                 <button
//                   key={key}
//                   type="button"
//                   className={clsx(
//                     "bg-white border-2 py-6 ps-10 pe-6 max-w-[400px] rounded-[40px] flex items-center justify-center font-bold relative cursor-pointer disabled:bg-gray-100 disabled:text-gray-700",
//                     selectedLetter &&
//                       (currentQuestion.answer === key
//                         ? "!bg-green-300"
//                         : selectedLetter === key && "!bg-red-300")
//                   )}
//                   onClick={() => handleAnswer(key)}
//                   disabled={!!selectedLetter || isSubmitting}
//                 >
//                   <p className="text-5xl lowercase bg-[var(--secondary)] w-16 h-16 rounded-full absolute top-[-10px] left-[-30px] flex items-center justify-center">
//                     {key}
//                   </p>
//                   <p>{value}</p>
//                 </button>
//               );
//             })}
//           </section>

//           {/* Mostrar el tiempo de respuesta y estado de envío */}
//           {responseTimeMs && (
//             <div className="text-center text-sm mt-5">
//               <p className="text-gray-600 font-bold">
//                 Tiempo de respuesta: {responseTimeMs}ms
//               </p>
//               {isSubmitting && (
//                 <p className="text-blue-600">Enviando respuesta...</p>
//               )}
//             </div>
//           )}
//         </>
//       ) : (
//         <p>Pregunta no disponible</p>
//       )}
//     </div>
//   );
// }
