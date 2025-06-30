# Prompt • Project Initialization (Optimized)

## 🎯 Role
Tech Lead или AI Agent, выполняющий полную инициализацию и аудит проекта.

## Inputs
- Репозиторий проекта (URL или локальный путь)
- Доступ к коду и конфигурации
- (Опционально) существующие файлы документации

## Expected Outputs
1. **docs/project-navigation.md** — структурированный гид по проекту
2. **AGENTS.md** — инструкция для AI-агентов в корне проекта
3. **Таблица технологий** и их версий
4. **Анализ легаси-кода** с уточняющими вопросами
5. **Полный каталог** текущей документации (с ссылкой на prompt-playbook.md)

## ⚙️ Workflow

### 1️⃣ Codebase Discovery
- Просканировать весь проект (игнорировать .git, node_modules, __pycache__)
- Определить точки входа (main.py, index.js, package.json, requirements.txt и др.)
- Зафиксировать менеджеры зависимостей и ключевые конфиги
- Распознать фреймворки и архитектурные паттерны (Django, FastAPI, React, Express и др.)
- Собрать ссылки на документацию (README.md, docs/, Wiki)

### 2️⃣ Tech Stack Map
Оформить таблицу:

| Component | Technology | Version | Notes |
|-----------|------------|---------|-------|
| Backend   | [detected] | [ver]   | [patterns/notes] |
| Frontend  | [detected] | [ver]   | [patterns/notes] |
| Database  | [detected] | [ver]   | [connection info] |
| Runtime   | [detected] | [ver]   | [requirements] |

### 3️⃣ Architecture Review
- Выделить ключевые модули и связи между ними
- Очертить границы API и потоки данных
- Определить архитектурный стиль (монолит, MVC, микросервисы и др.)
- Отметить всё нестандартное или сложное
- Пометить потенциальные зоны легаси для ревью

### 4️⃣ Legacy Check
**Если легаси обнаружено — задать уточняющие вопросы:**
- Как долго будет поддержка этих компонентов?
- Есть ли планы миграции или ограничения?
- Какие части кода нельзя изменять агентам?
- Каких стандартов нужно придерживаться?
- Есть ли устаревшие зависимости?

### 5️⃣ Создать PROJECT-NAVIGATION.md

```markdown
# 🗂️ Project Navigation Guide

## 📌 Overview
[Краткое описание системы]

## 📁 Structure
```
[Дерево каталогов с пояснениями]
```

## 🚀 How to Run
- **Development**: [шаги]
- **Production**: [деплой]
- **Testing**: [запуск тестов]

## ⚙️ Key Components
| Component | Path | Purpose | Dependencies |
|-----------|------|---------|---------------|
| [name]    | [path] | [purpose] | [deps] |

## 🛠️ Dev Workflow
1. Setup
2. Coding
3. Testing
4. Deployment

## ⚠️ Notes
- [Legacy areas]
- [Coding style]
- [Critical do's & don'ts]
```

### 6️⃣ Создать AGENTS.md

```markdown
# 🤖 AI Agents Setup

## 📚 Docs
- [Project Navigation](docs/project-navigation.md)
- [Prompt Playbook](/prompt-playbook.md)

## 🚀 Quick Start
1. Изучи `project-navigation.md`
2. Проверь стэк и зависимости
3. Следуй workflow
4. Используй правильные промпты из плейбука

## 🎯 Typical Flows
- **Новая фича** → TRD → Dev
- **Баг** → Quick Fix
- **Легаси** → Feature Audit

## ⚠️ Guidelines
- Что нельзя трогать
- Стандарты кода
- Ограничения для агентов

## ✅ Success Criteria
- ✅ Проект полностью описан и задокументирован
- ✅ Чёткий навигатор и структура
- ✅ AI-инструкция в корне
- ✅ Легаси вопросы закрыты
- ✅ Всё связано ссылками

## 🆘 Fallback
**Если проект слишком сложный или запутанный:**
Создать базовый AGENTS.md с:
- Ссылкой на плейбук
- Пометкой о высокой сложности
- Рекомендацией запустить "Existing Feature Analysis" первым

