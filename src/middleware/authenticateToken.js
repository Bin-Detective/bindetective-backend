const { getAuth } = require("firebase-admin/auth");

async function authenticateToken(req, res, next) {
  const idToken = req.headers.authorization?.split("Bearer ")[1]; // Retrieve token from header

  if (!idToken) {
    return res.status(401).json({ message: "Authorization token missing" });
  }

  try {
    const decodedToken = await getAuth().verifyIdToken(idToken); // Verify the token
    req.uid = decodedToken.uid; // Add the UID to the request object
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(403).json({ message: "Unauthorized" });
  }
}

module.exports = { authenticateToken };
