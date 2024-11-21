# API Documentation

- [User Management](#user-management)
- [Article Management](#article-management)

## User Management

This API allows for CRUD operations on the users collection. Each user document contains the following fields:

- `userId` (string): Unique identifier for each user.
- `userName` (string): Name of the user.
- `dateOfBirth` (string): Date of birth of the user (format: YYYY-MM-DD).

### Base URL : `/users`

### Authentication

All endpoints require an authorization token in the request header.

- Header : `Authorization: Bearer <idToken>`

### Endpoints

- [Create User](#1-create-user)
- [Get User By ID](#2-get-user-by-id)
- [Update User By ID](#3-update-user-by-id)
- [Delete User By ID](#4-delete-user-by-id)
- [Get All Users](#5-get-all-users)

### 1. Create User

- URL : `/users`
- Method : `POST`
- Description : Creates a new user document in the `users` collection.
- Request Header : `Authorization: Bearer <idToken>`, `Content-type: application/json`
- Request Body :

```json
{
  "userName": "string", // required, name of the user
  "dateOfBirth": "string" // optional, date of birth in the format YYYY-MM-DD
}
```

- Response :

  - **201 Created**: User created successfully.

  ```json
  {
    "message": "User created successfully"
  }
  ```

  - **400 Bad Request**: Missing required fields (userId or userName).

  ```json
  {
    "error": "userId and userName are required"
  }
  ```

  - **401 Unauthorized**: Authorization token missing or invalid.

  ```json
  {
    "error": "Authorization token missing" // or "Unauthorized"
  }
  ```

  - **500 Internal Server Error**: An error occurred while creating the user.

### 2. Get User by ID

- URL : `/users/:userId`
- Method : `GET`
- Description : Retrieves a user document by its userId.
- Request Header : `Authorization: Bearer <idToken>`
- Parameters : `userId` (string): Unique identifier of the user to retrieve.
- Response :

  - **200 OK**: Returns the user data.

  ```json
  {
    "userName": "string",
    "dateOfBirth": "string"
  }
  ```

  - **404 Not Found**: User not found.

  ```json
  {
    "error": "User not found"
  }
  ```

  - **401 Unauthorized**: Authorization token missing or invalid.

  ```json
  {
    "error": "Authorization token missing" // or "Unauthorized"
  }
  ```

  - **500 Internal Server Error**: An error occurred while retrieving the user.

### 3. Update User by ID

- URL : `/users/:userId`
- Method : `PUT`
- Description : Updates an existing user document in the `users` collection by `userId`. Fields in the request body are optional; only fields provided will be updated.
- Request Header : `Authorization: Bearer <idToken>`
- Parameters : `userId` (string): Unique identifier of the user to update.
- Request Body :

```json
{
  "userName": "string", // optional, name of the user
  "dateOfBirth": "string" // optional, date of birth in the format YYYY-MM-DD
}
```

- Response :

  - **200 OK**: User updated successfully.

  ```json
  {
    "message": "User updated successfully"
  }
  ```

  - **404 Not Found**: User not found.

  ```json
  {
    "error": "User not found"
  }
  ```

  - **401 Unauthorized**: Authorization token missing or invalid.

  ```json
  {
    "error": "Authorization token missing" // or "Unauthorized"
  }
  ```

  - **500 Internal Server Error**: An error occurred while updating the user.

### 4. Delete User by ID

- URL : `/users/:userId`
- Method : `DELETE`
- Description : Deletes a user document from the `users` collection by `userId`.
- Request Header : `Authorization: Bearer <idToken>`
- Parameters : `userId` (string): Unique identifier of the user to delete.
- Response :

  - **200 OK**: User updated successfully.

  ```json
  {
    "message": "User deleted successfully"
  }
  ```

  - **404 Not Found**: User not found.

  ```json
  {
    "error": "User not found"
  }
  ```

  - **401 Unauthorized**: Authorization token missing or invalid.

  ```json
  {
    "error": "Authorization token missing" // or "Unauthorized"
  }
  ```

  - **500 Internal Server Error**: An error occurred while deleting the user.

### 5. Get All Users

- URL : `/users`
- Method : `GET`
- Description : Retrieves all user documents from the `users` collection.
- Request Header : `Authorization: Bearer <idToken>`
- Response :

  - **200 OK**: Returns an array of user objects.

  ```json
  [
    {
      "id": "string",          // userId from Firestore document ID
      "userName": "string",
      "dateOfBirth": "string"
    },
    {
      "id": "string",
      "userName": "string",
      "dateOfBirth": "string"
    },
    ...
  ]
  ```

  - **401 Unauthorized**: Authorization token missing or invalid.

  ```json
  {
    "error": "Authorization token missing" // or "Unauthorized"
  }
  ```

  - **500 Internal Server Error**: An error occurred while fetching the users.

## Article Management

This API enables CRUD operations on the `articles` collection. Each article document consists of the following fields:

- `contentId` (string): Unique identifier for each article (generated by Firestore).
- `title` (string): Title of the article.
- `author` (string): Name of the article author.
- `dateAdded` (string): Date when the article was added (format: YYYY-MM-DD).
- `description` (string): Brief description of the article.
- `content` (string): Full content of the article.

### Base URL: `/articles`

### Authentication

some endpoints require an authorization token in the request header.

- Header: `Content-type: application/json`

### Endpoints

- [Create Article](#1-create-article)
- [Get Article By ID](#2-get-article-by-id)
- [Update Article By ID](#3-update-article-by-id)
- [Delete Article By ID](#4-delete-article-by-id)
- [Get All Articles](#5-get-all-articles)

### 1. Create Article

- **URL**: `/articles`
- **Method**: `POST`
- **Description**: Creates a new article in the `articles` collection.
- **Request Header**: `Content-type: application/json`
- **Request Body**:

```json
{
  "title": "string", // required, title of the article
  "author": "string", // required, name of the author
  "dateAdded": "string", // required, date added in the format YYYY-MM-DD
  "description": "string", // required, brief description
  "content": "string" // required, full content of the article
}
```

- **Response**:

  - **201 Created**: Article created successfully.

  ```json
  {
    "message": "Article created successfully",
    "contentId": "string" // Firestore document ID
  }
  ```

  - **500 Internal Server Error**: An error occurred while creating the article.

### 2. Get Article By ID

- **URL**: `/articles/:contentId`
- **Method**: `GET`
- **Description**: Retrieves an article by its `contentId`.
- **Parameters**: `contentId` (string): Unique identifier of the article.
- **Response**:

  - **200 OK**: Returns the article data.

  ```json
  {
    "title": "string",
    "author": "string",
    "dateAdded": "string",
    "description": "string",
    "content": "string"
  }
  ```

  - **500 Internal Server Error**: An error occurred while fetching the article.

### 3. Update Article By ID

- **URL**: `/articles/:contentId`
- **Method**: `PUT`
- **Description**: Updates an existing article by `contentId`. Fields in the request body are optional; only provided fields will be updated.
- **Request Header**: `Content-type: application/json`
- **Parameters**: `contentId` (string): Unique identifier of the article to update.
- **Request Body**:

```json
{
  "title": "string", // optional
  "author": "string", // optional
  "dateAdded": "string", // optional, format YYYY-MM-DD
  "description": "string", // optional
  "content": "string" // optional
}
```

- **Response**:

  - **200 OK**: Article updated successfully.

  ```json
  {
    "message": "Article updated successfully"
  }
  ```

  - **500 Internal Server Error**: An error occurred while updating the article.

### 4. Delete Article By ID

- **URL**: `/articles/:contentId`
- **Method**: `DELETE`
- **Description**: Deletes an article by `contentId`.
- **Parameters**: `contentId` (string): Unique identifier of the article to delete.
- **Response**:

  - **200 OK**: Article deleted successfully.

  ```json
  {
    "message": "Article deleted successfully"
  }
  ```

  - **500 Internal Server Error**: An error occurred while deleting the article.

### 5. Get All Articles

- **URL**: `/articles`
- **Method**: `GET`
- **Description**: Retrieves all articles from the `articles` collection.
- **Response**:

  - **200 OK**: Returns an array of article objects.

  ```json
  [
    {
      "contentId": "string",
      "title": "string",
      "author": "string",
      "dateAdded": "string",
      "description": "string",
      "content": "string"
    },
    {
      "contentId": "string",
      "title": "string",
      "author": "string",
      "dateAdded": "string",
      "description": "string",
      "content": "string"
    },
    ...
  ]
  ```

  - **404 Not Found**: No articles found.

  ```json
  {
    "error": "No articles found"
  }
  ```

  - **500 Internal Server Error**: An error occurred while fetching the articles.
