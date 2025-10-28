@echo off
echo Setting up new project from template...

REM Запрос названия проекта
set /p PROJECT_NAME="Enter project name: "

REM Переименование в package.json
powershell -Command "(Get-Content package.json) -replace '\"name\": \"{{PROJECT_NAME}}\"', '\"name\": \"%PROJECT_NAME%\"' | Set-Content package.json"

echo Project setup complete!
echo Run 'pnpm install' to install dependencies
echo Run 'pnpm dev' to start development server