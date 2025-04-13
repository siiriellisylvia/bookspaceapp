import { redirect } from "react-router";
import CountdownTimer, { type CountdownTimerHandle } from "~/components/CountdownTimer";
import { Button } from "~/components/ui/button";
import { authenticateUser } from "~/services/auth.server";
import type { Route } from "../+types/root";
import Book, { type BookType } from "~/models/Book";
import { X } from "lucide-react";
import { useNavigate } from "react-router";
import { useState, useRef } from "react";

export async function loader({ request, params }: Route.LoaderArgs) {
  const currentUser = await authenticateUser(request);
  if (!currentUser) {
    throw redirect("/signin");
  }

  const book = await Book.findById(params.id);
  if (!book) {
    throw new Response("Book Not Found", { status: 404 });
  }

  return Response.json({
    currentUser,
    book,
  });
}

export default function ReadMode({
  loaderData,
}: {
  loaderData: {
    book: BookType;
  };
}) {
  const { book } = loaderData;
  const navigate = useNavigate();
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const [timerCompleted, setTimerCompleted] = useState(false);
  const timerRef = useRef<CountdownTimerHandle>(null);

  const handleTimerComplete = (minutes: number) => {
    setElapsedMinutes(minutes);
    setTimerCompleted(true);
  };

  const handleTimerStop = (minutes: number) => {
    setElapsedMinutes(minutes);
  };
  
  const handleTimerUpdate = (minutes: number) => {
    setElapsedMinutes(minutes);
  };

  const handleFinishReading = () => {
    // Get the current elapsed minutes directly from the timer component
    let timeToPass = elapsedMinutes;
    
    // If the timer component is available, get the current time from it
    if (timerRef.current) {
      timeToPass = timerRef.current.getCurrentElapsedMinutes();
    }
    
    // Ensure we have at least 1 minute
    timeToPass = Math.max(1, timeToPass);
    
    // Store in sessionStorage as a fallback
    try {
      sessionStorage.setItem('minutesRead', String(timeToPass));
    } catch (e) {
      console.error("Failed to store in sessionStorage:", e);
    }
    
    // Navigate to finish reading session with the time parameter
    navigate(`/books/${book._id}/finish-reading-session?minutesRead=${timeToPass}`);
  };

  return (
    <div className="flex flex-col gap-2 px-2 py-20 md:py-5 items-center h-screen">
      <div className="flex flex-row gap-2 items-center justify-between w-full">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="rounded-full md:hidden"
        >
          <X />
        </Button>
        {!timerCompleted && (
          <Button
            onClick={handleFinishReading}
            variant="outline"
            className="md:ml-auto"
          >
            Finish reading session
          </Button>
        )}
      </div>
      <div className="flex flex-col gap-2 items-center justify-center w-full">
        <p className="font-semibold font-sans mx-auto">Now reading</p>
        <h1>
          {book.title}
        </h1>
        <img
          src={book.coverImage?.url}
          alt={book.title}
          className="w-1/3 rounded-lg md:w-1/5"
        />
      </div>
      <CountdownTimer 
        ref={timerRef}
        onTimerComplete={handleTimerComplete} 
        onTimerStop={handleTimerStop}
        onTimerUpdate={handleTimerUpdate}
        onFinishReading={handleFinishReading}
      />
    </div>
  );
}
