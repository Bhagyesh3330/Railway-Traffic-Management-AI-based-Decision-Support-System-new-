# --- Step 1: Clean old dependencies ---
Write-Host "Cleaning old node_modules and package-lock.json..."

# Frontend
Remove-Item -Recurse -Force .\frontend\node_modules -ErrorAction SilentlyContinue
Remove-Item -Force .\frontend\package-lock.json -ErrorAction SilentlyContinue

# Backend
Remove-Item -Recurse -Force .\backend\node_modules -ErrorAction SilentlyContinue
Remove-Item -Force .\backend\package-lock.json -ErrorAction SilentlyContinue

Write-Host "Clean complete.`n"

# --- Step 2: Install dependencies ---
Write-Host "Installing frontend dependencies..."
Set-Location .\frontend
npm install
Set-Location ..

Write-Host "Installing backend dependencies..."
Set-Location .\backend
npm install
Set-Location ..

Write-Host "Dependencies installed.`n"

# --- Step 3: Start backend ---
Write-Host "Starting backend server on port 5000..."
Start-Process powershell -ArgumentList "-NoExit","-Command cd `"$PWD\backend`"; npm run dev"

# --- Step 4: Start frontend ---
Write-Host "Starting frontend server on port 3000..."
Start-Process powershell -ArgumentList "-NoExit","-Command cd `"$PWD\frontend`"; npm run dev"

Write-Host "`nBoth servers started. Frontend: http://localhost:3000 | Backend: http://localhost:5000"
