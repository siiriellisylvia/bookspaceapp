import Book, { type BookType } from "~/models/Book";

// Cache to store recommended books by book ID
const recommendationsCache = new Map<
  string,
  { books: BookType[]; timestamp: number }
>();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour cache duration

export async function getRecommendedBooks(
  currentBook: BookType,
  limit: number = 3,
) {
  const bookId = currentBook._id.toString();
  const now = Date.now();

  // Check if we have a valid cache entry
  const cachedResult = recommendationsCache.get(bookId);
  if (cachedResult && now - cachedResult.timestamp < CACHE_DURATION) {
    return cachedResult.books;
  }
  const recommendedBooks = await Book.aggregate([
    {
      $match: {
        _id: { $ne: currentBook._id }, // Exclude the current book
        genres: { $in: currentBook.genres }, // Must share at least one genre
      },
    },
    {
      $addFields: {
        genreMatchCount: {
          $size: { $setIntersection: ["$genres", currentBook.genres] }, // Count shared genres
        },
      },
    },
    {
      $facet: {
        // Try to get books with 5 or more matching genres first
        highMatch: [
          { $match: { genreMatchCount: { $gte: 5 } } },
          { $sample: { size: limit } },
        ],
        // Fallback: get books with 3-4 matching genres
        mediumMatch: [
          { $match: { genreMatchCount: { $gte: 3, $lt: 5 } } },
          { $sample: { size: limit } },
        ],
        // Last resort: get books with 1-2 matching genres
        lowMatch: [
          { $match: { genreMatchCount: { $gte: 1, $lt: 3 } } },
          { $sample: { size: limit } },
        ],
      },
    },
    {
      // Combine all books from the different match categories
      $project: {
        allBooks: {
          $concatArrays: ["$highMatch", "$mediumMatch", "$lowMatch"],
        },
      },
    },
    {
      // Take the first 3 books from the combined array (limit)
      $project: {
        finalBooks: { $slice: ["$allBooks", limit] },
      },
    },
  ]);

  const result = recommendedBooks[0]?.finalBooks || [];

  // Cache the result
  recommendationsCache.set(bookId, {
    books: result,
    timestamp: now,
  });

  return result;
}

/**
 * Fetches a list of random books from the database
 * @param limit Number of books to fetch
 * @returns Array of books
 */
export async function getRandomBooks(limit: number = 6): Promise<BookType[]> {
  // Get random books from the database
  const randomBooks = await Book.aggregate([
    { $sample: { size: limit } } // Get random books
  ]);

  return randomBooks;
}

/**
 * Fetches a list of popular books from the database (books with highest ratings)
 * @param limit Number of books to fetch
 * @returns Array of books
 */
export async function getPopularBooks(limit: number = 6): Promise<BookType[]> {
  // Get books with the highest ratings
  const popularBooks = await Book.aggregate([
    { $match: { rating: { $gt: 0 } } },  // Only books with ratings
    { $sort: { rating: -1, ratingsCount: -1 } }, // Sort by rating and then by number of ratings
    { $limit: limit * 2 }, // Get more than we need to select randomly from
    { $sample: { size: limit } } // Randomly select from top rated books
  ]);

  return popularBooks;
}

/**
 * Fetches a list of books matching specific moods
 * @param moods Array of moods to match against
 * @param limit Number of books to fetch
 * @returns Array of books matching at least one of the specified moods
 */
export async function getBooksByMoods(
  moods: string[] = ["lighthearted", "inspiring", "funny", "hopeful"],
  limit: number = 6
): Promise<BookType[]> {
  // Get books that match any of the specified moods
  const moodBooks = await Book.aggregate([
    { $match: { moods: { $in: moods } } }, // Match books that have at least one of the specified moods
    { $addFields: { 
      moodMatchCount: { $size: { $setIntersection: ["$moods", moods] } } // Count matching moods
    }},
    { $sort: { moodMatchCount: -1, rating: -1 } }, // Sort by number of matching moods, then by rating
    { $limit: limit * 2 }, // Get more than we need to select randomly from
    { $sample: { size: limit } } // Randomly select from the filtered books
  ]);

  return moodBooks;
}
