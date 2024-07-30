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
  git commit -m "%COMMIT_MESSAGE%"
  if %errorlevel% neq 0 (
    echo No changes to commit in main branch.
  ) else (
    echo Pushing to origin main
    git push origin main
  )

  echo Removing existing gh-pages worktree if it exists
  git worktree remove frontend\gh-pages --force || echo No existing worktree to remove.

  echo Adding new gh-pages worktree
  git worktree add -B gh-pages frontend\gh-pages origin/gh-pages

  echo Copying build output to gh-pages directory
  xcopy frontend\dist frontend\gh-pages /E /H /C /I /Y

  echo Committing and pushing changes to gh-pages branch
  cd frontend\gh-pages
  git add .
  git commit -m "%COMMIT_MESSAGE%"
  git push origin gh-pages
) > %LOG_FILE% 2>&1

endlocal
