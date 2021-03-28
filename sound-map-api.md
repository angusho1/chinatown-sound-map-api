---
title: sound-map-api
tags: []
---

# API

## Users

### Login

```POST``` ```/user/login```

Logs the user in

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
