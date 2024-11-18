// contentHandlers.js

// Firestore database instance is initialized globally in app.js

// Handler to create a new article
exports.createArticle = async (req, res) => {
  try {
    const { title, author, dateAdded, description, content } = req.body;
    const newArticle = {
      title,
      author,
      dateAdded,
      description,
      content,
    };

    const docRef = await db.collection("articles").add(newArticle);
    res
      .status(201)
      .send({ message: "Article created successfully", contentId: docRef.id });
  } catch (error) {
    console.error("Error creating article:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Handler to get an article by ID
exports.getArticleById = async (req, res) => {
  try {
    const { contentId } = req.params;
    const doc = await db.collection("articles").doc(contentId).get();

    if (!doc.exists) {
      return res.status(404).send({ message: "Article not found" });
    }

    res.status(200).send(doc.data());
  } catch (error) {
    console.error("Error fetching article:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Handler to update an existing article by ID
exports.updateArticleById = async (req, res) => {
  try {
    const { contentId } = req.params;
    const { title, author, dateAdded, description, content } = req.body;

    const updatedArticle = {
      title,
      author,
      dateAdded,
      description,
      content,
    };

    await db.collection("articles").doc(contentId).update(updatedArticle);
    res.status(200).send({ message: "Article updated successfully" });
  } catch (error) {
    console.error("Error updating article:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Handler to delete an article by ID
exports.deleteArticleById = async (req, res) => {
  try {
    const { contentId } = req.params;
    await db.collection("articles").doc(contentId).delete();
    res.status(200).send({ message: "Article deleted successfully" });
  } catch (error) {
    console.error("Error deleting article:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Handler to get all articles
exports.getAllArticles = async (req, res) => {
  try {
    const articlesSnapshot = await db.collection("articles").get();
    const articles = articlesSnapshot.docs.map((doc) => ({
      contentId: doc.id,
      ...doc.data(),
    }));

    if (articles.length === 0) {
      return res.status(404).send({ message: "No articles found" });
    }

    res.status(200).send(articles);
  } catch (error) {
    console.error("Error fetching articles:", error);
    res.status(500).send("Internal Server Error");
  }
};
