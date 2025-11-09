# Fix Port 5000 Conflict

## Problem
The server can't start because port 5000 is already in use.

## Solution

### Option 1: Kill the process using port 5000

```bash
# Find the process using port 5000
lsof -ti:5000

# Kill the process
kill -9 $(lsof -ti:5000)

# Or on some systems:
fuser -k 5000/tcp
```

### Option 2: Change the port in .env

Update `backend/.env`:
```env
PORT=5001
```

Then update `frontend/.env`:
```env
VITE_API_URL=http://localhost:5001/api
VITE_SOCKET_URL=http://localhost:5001
```

### Option 3: Use a different port temporarily

```bash
cd backend
PORT=5001 npm run dev
```

## After fixing, restart the server:

```bash
cd backend
npm run dev
```

The server should now start successfully and the forgot-password route will be available.


