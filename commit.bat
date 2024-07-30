@echo off
setlocal enabledelayedexpansion

set LOG_FILE=commit_log.txt

set /p COMMIT_MESSAGE=Enter your commit message: 

(
  echo Running build command
  npm run build

  echo Adding files to git
  git add .

  echo Committing changes to main branch
  git diff-index --quiet HEAD --
  if %errorlevel% neq 0 (
    git commit -m "%COMMIT_MESSAGE%"
    echo Pushing to origin main
    git push origin main
  ) else (
    echo No changes to commit.
  )

  echo Checking if gh-pages worktree exists
  if not exist frontend\gh-pages (
    echo gh-pages worktree does not exist, creating it
    git worktree add -B gh-pages frontend\gh-pages origin/gh-pages
  ) else (
    echo gh-pages worktree already exists
  )

  echo Copying build output to gh-pages directory
  xcopy frontend\dist frontend\gh-pages /E /H /C /I /Y

  echo Committing and pushing changes to gh-pages branch
  cd frontend\gh-pages
  git add .
  git commit -m "%COMMIT_MESSAGE%"
  git push origin gh-pages
) > %LOG_FILE% 2>&1

endlocal
