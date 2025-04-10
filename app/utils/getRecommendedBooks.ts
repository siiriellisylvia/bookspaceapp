import Book, { type BookType } from "~/models/Book";

export async function getRecommendedBooks(
  currentBook: BookType,
  limit: number = 3,
) {
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

  return recommendedBooks[0]?.finalBooks || [];
}
