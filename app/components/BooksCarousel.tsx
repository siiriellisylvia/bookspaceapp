import BookCard from "./BookCard";
import { type BookType } from "~/models/Book";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import { useEffect, useState } from "react";

interface BooksCarouselProps {
  books: BookType[];
  progress?: number[];
}

export default function BooksCarousel({ books, progress }: BooksCarouselProps) {
  const [api, setApi] = useState<any>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };

    api.on("select", onSelect);
    api.on("reInit", onSelect);
    onSelect();

    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  return (
    <Carousel
      className="w-full"
      setApi={setApi}
      opts={{
        align: "start",
        containScroll: "trimSnaps",
      }}
    >
      <CarouselContent>
        {books.length ? (
          books.map((book, index) => (
            <CarouselItem
              key={book._id.toString()}
              className="md:basis-1/2 lg:basis-1/4"
            >
              <BookCard book={book} progress={progress?.[index]} />
            </CarouselItem>
          ))
        ) : (
          <CarouselItem className="col-span-full text-center">
            <p>No books found.</p>
          </CarouselItem>
        )}
      </CarouselContent>
      {canScrollPrev && <CarouselPrevious className="hidden md:flex" />}
      {canScrollNext && <CarouselNext className="hidden md:flex" />}
    </Carousel>
  );
}
