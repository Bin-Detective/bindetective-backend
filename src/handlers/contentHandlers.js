// contentHandlers.js

// Import uuidv4 for generating unique filenames for thumbnails
const { v4: uuidv4 } = require("uuid");

// Handler to create a new article with thumbnail
exports.createArticle = async (req, res) => {
  try {
    // Extract article details and thumbnail from the request body
    const { title, author, dateAdded, description, content, thumbnail } =
      req.body;

    // Create a new article object with the extracted details
    const newArticle = {
      title,
      author,
      dateAdded,
      description,
      content,
    };

    // If a thumbnail is provided, process and upload it to Firebase Storage
    if (thumbnail) {
      // Convert the base64-encoded thumbnail to a buffer
      const thumbnailBuffer = Buffer.from(thumbnail, "base64");
      // Generate a unique filename for the thumbnail
      const thumbnailName = `${uuidv4()}.jpg`;
      // Create a reference to the file in Firebase Storage
      const file = bucket.file(thumbnailName);

      // Upload the thumbnail buffer to Firebase Storage with appropriate metadata
      await file.save(thumbnailBuffer, {
        metadata: { contentType: "image/jpeg" },
        public: true, // Make the file publicly accessible
      });

      // Add the URL of the uploaded thumbnail to the article object
      newArticle.thumbnailUrl = `https://storage.googleapis.com/${bucket.name}/articleThumbs/${thumbnailName}`;
    }

    // Add the new article to the Firestore 'articles' collection
    const docRef = await db.collection("articles").add(newArticle);
    // Send a success response with the ID of the newly created article
    res
      .status(201)
      .send({ message: "Article created successfully", contentId: docRef.id });
  } catch (error) {
    // Log any errors that occur and send an internal server error response
    console.error("Error creating article:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Handler to get an article by ID
exports.getArticleById = async (req, res) => {
  try {
    // Extract the article ID from the request parameters
    const { contentId } = req.params;
    // Retrieve the article document from Firestore using the article ID
    const doc = await db.collection("articles").doc(contentId).get();

    // If the article does not exist, send a 404 not found response
    if (!doc.exists) {
      return res.status(404).send({ message: "Article not found" });
    }

    // Send the article data as the response
    res.status(200).send(doc.data());
  } catch (error) {
    // Log any errors that occur and send an internal server error response
    console.error("Error fetching article:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Handler to update an existing article by ID
exports.updateArticleById = async (req, res) => {
  try {
    // Extract the article ID from the request parameters
    const { contentId } = req.params;
    // Extract the updated article details and thumbnail from the request body
    const { title, author, dateAdded, description, content, thumbnail } =
      req.body;

    // Create an updated article object with the extracted details
    const updatedArticle = {
      title,
      author,
      dateAdded,
      description,
      content,
    };

    // If a new thumbnail is provided, process and upload it to Firebase Storage
    if (thumbnail) {
      // Convert the base64-encoded thumbnail to a buffer
      const thumbnailBuffer = Buffer.from(thumbnail, "base64");
      // Generate a unique filename for the thumbnail
      const thumbnailName = `${uuidv4()}.jpg`;
      // Create a reference to the file in Firebase Storage
      const file = bucket.file(thumbnailName);

      // Upload the thumbnail buffer to Firebase Storage with appropriate metadata
      await file.save(thumbnailBuffer, {
        metadata: { contentType: "image/jpeg" },
        public: true, // Make the file publicly accessible
      });

      // Add the URL of the uploaded thumbnail to the updated article object
      updatedArticle.thumbnailUrl = `https://storage.googleapis.com/${bucket.name}/${thumbnailName}`;
    }

    // Update the article document in Firestore with the updated details
    await db.collection("articles").doc(contentId).update(updatedArticle);
    // Send a success response indicating the article was updated
    res.status(200).send({ message: "Article updated successfully" });
  } catch (error) {
    // Log any errors that occur and send an internal server error response
    console.error("Error updating article:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Handler to delete an article by ID
exports.deleteArticleById = async (req, res) => {
  try {
    // Extract the article ID from the request parameters
    const { contentId } = req.params;
    // Delete the article document from Firestore using the article ID
    await db.collection("articles").doc(contentId).delete();
    // Send a success response indicating the article was deleted
    res.status(200).send({ message: "Article deleted successfully" });
  } catch (error) {
    // Log any errors that occur and send an internal server error response
    console.error("Error deleting article:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Handler to get all articles
exports.getAllArticles = async (req, res) => {
  try {
    // Retrieve all article documents from the Firestore 'articles' collection
    const articlesSnapshot = await db.collection("articles").get();
    // Map the documents to an array of article objects, including the document ID
    const articles = articlesSnapshot.docs.map((doc) => ({
      contentId: doc.id,
      ...doc.data(),
    }));

    // If no articles are found, send a 404 not found response
    if (articles.length === 0) {
      return res.status(404).send({ message: "No articles found" });
    }

    // Send the array of articles as the response
    res.status(200).send(articles);
  } catch (error) {
    // Log any errors that occur and send an internal server error response
    console.error("Error fetching articles:", error);
    res.status(500).send("Internal Server Error");
  }
};
