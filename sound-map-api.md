---
title: sound-map-api
tags: []
---

# API

## Auth

### Signup

```POST``` ```/signup```

Signs the user up using an email and password, and sends back a JWT cookie to log the user in

### Login

```POST``` ```/login```

Logs the user in and sends back a JWT in a cookie

### Google Login (OAuth)

```GET``` ```/login/google```

Prompt a user to sign in through their Google account

### Facebook Login (OAuth)

```GET``` ```/login/facebook```

Prompt a user to sign in through their Google account

### Get user by id
```GET```  ```/user/{user_id}```

Gets the user by id - should require authorization

## Sound Clips

### Get all sound clips
```GET```  ```/sound-clips```  

### Post a sound clip

```POST```  ```/sound-clips```

Adds a sound clip to the database - restricted to admin only

### Get sound clip by id
```GET```  ```/sound-clip/{clip_id}```  

Get a sound clip by the clip id

### Post submission
```POST``` ```/sound-clip/submissions```

Submits a sound clip for review by an admin
