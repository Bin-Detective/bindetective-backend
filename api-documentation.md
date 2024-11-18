# API Documentation

- [User Management](#user-management)

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
