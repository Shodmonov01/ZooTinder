**BREEDMATCH**

**PRD / Техническое задание — MVP**

_Приложение для поиска партнёра для вязки животных в формате Tinder_

Версия 1.0 • 16 сентября 2026

# 1\. Резюме продукта

BreedMatch — мобильное приложение для ответственного поиска партнёра для вязки животных. UX строится вокруг карточек, свайпов, взаимного Match и безопасного чата, но продукт не ограничивается «знакомствами»: профиль животного содержит сведения о здоровье, вакцинации, родословной, DNA-тестах и истории вязок.

Основная продуктовая ценность: сократить путь от «ищу подходящего партнёра» до «нашёл владельца, получил достаточно подтверждений и договорился о вязке», не раскрывая лишние персональные данные и не превращая приложение в рынок животных.

На момент подготовки ТЗ существуют близкие по механике решения: Snooot, BREED, Tail Match, PairMyPet и PetsLoveStory. Поэтому дифференциация BreedMatch должна строиться вокруг доверия, структурированных ветеринарных данных, прозрачной верификации и breeding workflow, а не вокруг одного только свайпа.

# 2\. Анализ аналогов

| **Проект**    | **Что заявляет продукт**                                                                                 | **Что берём в ТЗ**                                     | **Источник**             |
| ------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------ |
| Snooot        | Swipe → Match → Chat; подбор собак/кошек; badges за pedigree, vaccination, DNA.                          | Карточки, match, in-app chat, верификация.             | Google Play — Snooot     |
| BREED         | «Tinder» для животных; поиск партнёра, record management, mating history.                                | История вязок и объект «животное».                     | App Store — BREED        |
| Tail Match    | Swipe matchmaking, AI compatibility scoring, discovery рядом, breeding partners, secure messaging.       | Discovery, фильтры, chat, опциональный future scoring. | Google Play — Tail Match |
| PairMyPet     | Dog/cat mate finder; фильтры breed/age/location; health details; secure messaging; responsible breeding. | Health-first matching, фильтры, privacy.               | PairMyPet                |
| PetsLoveStory | Знакомства, друзья, прогулки и вязка; verification и moderation.                                         | Модерация, verification, позже социальные сценарии.    | PetsLoveStory            |

Вывод: механика уже подтверждена рынком, но в MVP нельзя обещать «идеальную генетическую совместимость», если система не имеет валидированных генетических данных и правил. Скоринг должен либо опираться на явно заданные признаки, либо называться рекомендацией, а не медицинским/генетическим заключением.

# 3\. Product Vision

Формула продукта: Tinder UX + профиль животного + verified health/pedigree + безопасное общение + календарь и история вязок.

- Главный объект системы — животное; владелец управляет одним или несколькими животными.
- В первой версии рекомендуется сфокусироваться на собаках, при этом модель данных проектируется с поддержкой других видов.
- Точный домашний адрес не показывается; используется город/район или приблизительный радиус.
- Платежи, продажа щенков/котят и escrow не входят в MVP.
- Платформа не заменяет ветеринара: рядом с медицинскими данными показывается дисклеймер и дата/источник документа.

# 4\. Цели и нецели MVP

## 4.1 Цели

- Дать владельцу возможность создать качественный профиль животного за 5–10 минут.
- Найти релевантных потенциальных партнёров по виду, полу, породе, возрасту, локации и базовым ограничениям.
- Дать безопасный способ выразить интерес, получить Match и общаться внутри платформы.
- Дать возможность загрузить и верифицировать документы, влияющие на доверие.
- Создать breeding request и зафиксировать согласованную встречу/вязку.

## 4.2 Не цели

- Продажа животных или потомства.
- Встроенные платежи и финансовые расчёты.
- Диагностика заболеваний или автоматические ветеринарные заключения.
- Полноценная генетическая лаборатория.
- Полноценная CRM питомника в MVP.
- Социальная сеть общего назначения.

# 5\. Целевая аудитория

| **Персона**               | **Задача**                                | **Ключевые потребности**                             |
| ------------------------- | ----------------------------------------- | ---------------------------------------------------- |
| Владелец одного питомца   | Найти партнёра рядом                      | Простой профиль, фильтры, match, chat, privacy       |
| Заводчик                  | Подобрать пару по более строгим критериям | Pedigree, health records, multiple pets, history     |
| Владелец племенного самца | Предложить stud                           | Публичность профиля, verification, входящие requests |
| Модератор                 | Проверять пользователей и документы       | Очередь verification, reports, ban/block             |
| Администратор             | Управлять справочниками и правилами       | Breeds, policies, moderation, analytics              |

# 6\. Core User Journey

1. Регистрация по номеру телефона и OTP.
2. Создание профиля владельца.
3. Добавление животного.
4. Заполнение базовых данных, фото, целей и локации.
5. Добавление health/pedigree/DNA документов.
6. Настройка предпочтений поиска.
7. Discover: просмотр карточек и свайп.
8. Взаимный Like → Match.
9. Встроенный чат.
10. Breeding Request → согласование даты/места.
11. Отметка события как завершённого.
12. Сохранение события в истории животного.

# 7\. Функциональные требования

# 7.1 Authentication

- Phone OTP; опциональный email.
- Session refresh/revoke.
- Logout from all devices.
- Удаление аккаунта с soft-delete и политикой хранения данных.

# 7.2 Owner Profile

- Имя/отображаемое имя.
- Фото.
- Город.
- Статус верификации.
- Список животных.
- Настройки приватности и уведомлений.

# 7.3 Pet Profile

| **Поле**        | **Обязательность** | **Примечание**                             |
| --------------- | ------------------ | ------------------------------------------ |
| Name            | Да                 | Отображаемое имя                           |
| Species         | Да                 | В MVP — dog                                |
| Breed           | Да для породистых  | Поддержать mixed breed                     |
| Sex             | Да                 | Male/Female                                |
| Birth date      | Да                 | Автоматический возраст                     |
| Weight          | Рекомендуется      | Единица kg/lb                              |
| Height          | Опционально        | Зависит от вида                            |
| Color           | Опционально        | Справочник + free text                     |
| Photos          | Да, min 1          | Рекомендуется 3–6                          |
| Bio/temperament | Рекомендуется      | Структурированные теги + текст             |
| Breeding status | Да                 | Looking / Paused / Not available           |
| Location        | Да                 | Город + geo point с ограниченной точностью |

# 7.4 Health & Documents

- Вакцинация: тип, дата, документ/фото.
- Дегельминтизация: дата.
- Health certificate: файл, дата выдачи, дата окончания, источник.
- DNA test: лаборатория, тест, дата, файл.
- Pedigree: документ, регистр/организация, дата.
- Прочие документы: категория, описание, файл.
- Статусы верификации: Pending / Verified / Rejected / Expired.

# 7.5 Discovery & Filters

- Species.
- Breed / mixed breed.
- Sex.
- Age range.
- Distance radius.
- City/region.
- Weight/size.
- Verified only.
- Health verified.
- Pedigree verified.
- DNA tested.

Hard filters применяются до ранжирования. Например, несовместимый вид, недопустимый пол или выключенный breeding status не должен попадать в выдачу независимо от score.

# 7.6 Matching

MVP-score не должен позиционироваться как медицинская или генетическая рекомендация. Он является ranking score для выдачи профилей. Рекомендуемая модель: сначала hard filters, затем ranking по конфигурируемым признакам.

| **Фактор**                   | **Стартовый вес** | **Тип**        |
| ---------------------------- | ----------------- | -------------- |
| Порода / breed compatibility | 30%               | Hard/soft rule |
| Расстояние                   | 20%               | Soft score     |
| Возраст                      | 10%               | Hard + soft    |
| Размер/вес                   | 5%                | Soft           |
| Pedigree verified            | 10%               | Trust signal   |
| Health verified              | 15%               | Trust signal   |
| DNA tested                   | 10%               | Trust signal   |

Весы должны храниться в конфигурации, а не в коде. В следующих итерациях их можно изменять по данным продукта.

# 7.7 Swipe UX

- Like.
- Pass.
- Undo — ограниченно или premium в будущей версии.
- Tap to open full profile.
- Swipe actions должны быть дополнены обычными кнопками для accessibility.

# 7.8 Match & Chat

- Match создаётся только при взаимном Like.
- Чат открывается только после Match или по отдельному правилу в breeding mode.
- Фото и документы можно прикладывать в чат.
- Телефон/email по умолчанию скрыты.
- Block и Report доступны из чата.
- Message rate limit для защиты от спама.

# 7.9 Breeding Request

| **Статус** | **Описание**                        |
| ---------- | ----------------------------------- |
| Draft      | Пользователь ещё не отправил запрос |
| Sent       | Запрос отправлен                    |
| Accepted   | Второй владелец принял              |
| Declined   | Отклонён                            |
| Scheduled  | Дата/время согласованы              |
| Completed  | Событие отмечено завершённым        |
| Cancelled  | Отменено после согласования         |

# 7.10 Calendar & Breeding History

- Дата предполагаемой вязки.
- Напоминания.
- Ветеринарный осмотр — как пользовательское событие.
- Факт вязки.
- Партнёр.
- Комментарий.
- История событий по каждому животному.

# 8\. Экраны мобильного приложения

| **Экран**        | **Содержание**                          |
| ---------------- | --------------------------------------- |
| Onboarding       | Value proposition, rules, privacy       |
| Login            | Phone + OTP                             |
| Discover         | Cards, filters, swipe                   |
| Pet Details      | Все данные, badges, documents           |
| Match            | Новый match, открыть чат                |
| Matches          | Список взаимных симпатий                |
| Chats            | Список чатов + сообщения                |
| Chat             | Text, photos, documents, report/block   |
| Breeding Request | Форма запроса и статус                  |
| Calendar         | События вязок                           |
| My Pets          | Список животных                         |
| Add/Edit Pet     | Wizard профиля                          |
| Documents        | Список документов и verification status |
| Profile          | Владелец, настройки, privacy            |
| Notifications    | Системные события                       |

# 9\. Admin Panel

| **Модуль**   | **Функции**                                       |
| ------------ | ------------------------------------------------- |
| Dashboard    | Users, pets, matches, reports, verification queue |
| Users        | Search, view, suspend, ban, unblock               |
| Pets         | Search, view, edit status, remove content         |
| Verification | Approve/reject/request resubmission               |
| Reports      | Queue, evidence, action, resolution               |
| Breeds       | Species/breed reference data                      |
| Moderation   | Banned words/media rules/manual review            |
| Analytics    | Activation, profile completion, matches, requests |
| Settings     | Ranking weights, limits, notification templates   |

# 10\. Trust & Safety / Anti-fraud

- Phone verification обязательна для создания активного профиля.
- Rate limits на Likes, messages и requests.
- Уникальность питомца: детекция дубликатов по фото/метаданным/совпадающим документам.
- Защита от fake documents: ручная модерация критичных документов.
- Privacy by design: не показывать точный адрес.
- Block/Report во всех пользовательских точках контакта.
- Логи административных действий.
- Account risk signals: массовые сообщения, одинаковые тексты, частая смена данных, много жалоб.
- Никаких встроенных переводов денег в MVP.
- Дисклеймер: платформа не является ветеринаром и не подтверждает медицинскую пригодность без соответствующего процесса проверки.

# 11\. Privacy & Data Protection

- Хранить минимально необходимый набор персональных данных.
- Разделить публичные данные питомца и private data владельца.
- Шифрование в transit и at rest.
- Signed URLs для документов/фото.
- Audit log для доступа к verification documents.
- Настройки приватности для профиля и истории.
- Удаление аккаунта с описанием сроков удаления/архивации.

# 12\. Data Model

| **Entity**      | **Ключевые поля**                                                                                  |
| --------------- | -------------------------------------------------------------------------------------------------- |
| User            | id, phone, display_name, avatar, city, status, created_at                                          |
| Pet             | id, owner_id, species_id, breed_id, sex, birth_date, weight, color, bio, breeding_status, location |
| PetPhoto        | id, pet_id, url, sort_order, moderation_status                                                     |
| Breed           | id, species_id, name, aliases, active                                                              |
| PetDocument     | id, pet_id, type, file_url, issuer, issued_at, expires_at, status                                  |
| Verification    | id, pet_document_id, reviewer_id, status, reason, reviewed_at                                      |
| HealthRecord    | id, pet_id, type, date, value, notes                                                               |
| DNARecord       | id, pet_id, lab, test_name, result_summary, document_id                                            |
| Pedigree        | id, pet_id, father_id, mother_id, registry, document_id                                            |
| Like            | id, actor_user_id, source_pet_id, target_pet_id, action, created_at                                |
| Match           | id, pet_a_id, pet_b_id, created_at, status                                                         |
| Chat            | id, match_id                                                                                       |
| Message         | id, chat_id, sender_id, text, attachment_url, created_at                                           |
| BreedingRequest | id, match_id, sender_pet_id, receiver_pet_id, proposed_at, status, note                            |
| BreedingEvent   | id, pet_id, partner_pet_id, event_type, scheduled_at, completed_at, notes                          |
| Report          | id, reporter_id, target_type, target_id, reason, status, resolution                                |
| Block           | id, blocker_id, blocked_id, created_at                                                             |
| Notification    | id, user_id, type, payload, read_at                                                                |

# 13\. API Draft

| **Method** | **Endpoint**           | **Назначение**             |
| ---------- | ---------------------- | -------------------------- |
| POST       | /auth/otp/request      | Отправить OTP              |
| POST       | /auth/otp/verify       | Проверить OTP              |
| GET        | /me                    | Текущий пользователь       |
| PATCH      | /me                    | Обновить профиль           |
| GET        | /pets                  | Мои животные               |
| POST       | /pets                  | Создать животное           |
| GET        | /pets/:id              | Карточка животного         |
| PATCH      | /pets/:id              | Обновить животное          |
| POST       | /pets/:id/photos       | Загрузить фото             |
| POST       | /pets/:id/documents    | Загрузить документ         |
| GET        | /discover              | Получить выдачу            |
| POST       | /likes                 | Like/Pass                  |
| GET        | /matches               | Мои match                  |
| GET        | /chats                 | Мои чаты                   |
| GET        | /chats/:id/messages    | Сообщения                  |
| POST       | /chats/:id/messages    | Отправить сообщение        |
| POST       | /breeding-requests     | Создать запрос             |
| PATCH      | /breeding-requests/:id | Изменить статус            |
| GET        | /breeding-events       | История/календарь          |
| POST       | /reports               | Пожаловаться               |
| POST       | /blocks                | Заблокировать пользователя |

# 14\. Non-functional requirements

- API p95 для обычных read endpoints — целевой показатель < 500 ms при нормальной нагрузке.
- Фото и документы загружаются через object storage; API не принимает большие binary payload без необходимости.
- Realtime chat — WebSocket или аналогичный transport.
- Геопоиск — PostGIS или эквивалент.
- Все критичные изменения статуса — idempotent где возможно.
- Ошибки API имеют стабильную схему: code, message, details, request_id.
- Backend должен поддерживать soft-delete для пользователей/питомцев, где это необходимо для аудита.
- Логи без утечки телефонов, токенов и приватных документов.
- Basic observability: request logs, error tracking, metrics.

# 15\. Suggested Tech Stack

| **Layer** | **Рекомендация**                | **Причина**                             |
| --------- | ------------------------------- | --------------------------------------- |
| Mobile    | React Native + Expo или Flutter | Быстрый MVP для iOS/Android             |
| Backend   | NestJS / Fastify                | Модули, validation, WebSocket ecosystem |
| DB        | PostgreSQL + PostGIS            | Реляционные данные + geo queries        |
| Storage   | S3-compatible                   | Фото и документы                        |
| Cache     | Redis                           | Rate limit, sessions, transient state   |
| Realtime  | WebSocket / Socket.IO           | Чат и notifications                     |
| Auth      | OTP provider                    | Простой вход                            |
| Admin     | React + Chakra/Mantine          | Быстрая CRM-панель                      |
| Analytics | PostHog / GA4 + server events   | Product metrics                         |

# 16\. MVP Backlog

| **Epic**     | **Stories**                        | **Priority** |
| ------------ | ---------------------------------- | ------------ |
| Auth         | OTP, session, logout               | P0           |
| Owner        | Profile, privacy, settings         | P0           |
| Pet          | Create/edit, photos, status        | P0           |
| Discovery    | Filters, cards, swipe              | P0           |
| Match        | Mutual like, list                  | P0           |
| Chat         | Messages, media, block/report      | P0           |
| Verification | Document upload, review queue      | P0           |
| Breeding     | Request, accept/decline, schedule  | P1           |
| Calendar     | Events and reminders               | P1           |
| History      | Breeding history                   | P1           |
| Admin        | Users, pets, verification, reports | P0           |
| Analytics    | Activation, matches, reports       | P1           |

# 17\. Acceptance Criteria ключевых сценариев

## AC-01: Создание питомца

- Нельзя опубликовать профиль без species, sex, birth date, location и хотя бы 1 фото.
- После публикации профиль доступен discovery только если breeding_status != Not available.
- Пользователь видит процент заполненности профиля.

## AC-02: Discovery

- Выдача не содержит собственного питомца.
- Не показывает заблокированных пользователей.
- Учитывает hard filters.
- Карточка открывается без перезагрузки.

## AC-03: Match

- После взаимного Like создаётся ровно один match.
- Повторный Like не создаёт дубликат.
- Обе стороны получают notification.

## AC-04: Chat

- Сообщение доставляется получателю.
- Заблокированный пользователь не может писать.
- Report сохраняет контекст сообщения без публичного раскрытия.

## AC-05: Verification

- Документ имеет статус Pending сразу после загрузки.
- Модератор может approve/reject/request resubmission.
- Badge появляется только при Verified.
- Expired документ перестаёт считаться verified.

# 18\. Метрики продукта

| **Метрика**             | **Что показывает**                                           |
| ----------------------- | ------------------------------------------------------------ |
| Activation rate         | Доля пользователей, создавших опубликованный профиль питомца |
| Profile completion      | Средняя полнота профиля                                      |
| Discovery engagement    | Среднее число карточек/сессия                                |
| Like rate               | Доля Like                                                    |
| Match rate              | Like → mutual Match                                          |
| Chat start rate         | Match → первое сообщение                                     |
| Breeding request rate   | Match → request                                              |
| Request acceptance rate | Sent → Accepted                                              |
| Completed breeding rate | Scheduled → Completed                                        |
| Report rate             | Жалобы на 1000 пользователей                                 |
| Verification completion | Pending → Verified                                           |
| D30 retention           | Возврат пользователей через 30 дней                          |

# 19\. Roadmap

| **Этап** | **Функции**                                                                            |
| -------- | -------------------------------------------------------------------------------------- |
| MVP 0.1  | Dogs, profiles, discovery, swipe, match, chat, documents, verification, reports, admin |
| MVP 0.2  | Breeding requests, calendar, history, richer filters                                   |
| Phase 2  | Cats, breeder profiles, multiple pets improvements, premium visibility                 |
| Phase 3  | Genetic integrations, advanced pedigree, breeding analytics                            |
| Phase 4  | Veterinary ecosystem, lab integrations, regional expansion                             |

# 20\. Product risks

| **Риск**                            | **Митигация**                                                 |
| ----------------------------------- | ------------------------------------------------------------- |
| Fake documents                      | Manual verification + source field + audit log                |
| Scam / spam                         | OTP, rate limits, risk signals, reporting, no payments in MVP |
| Unsafe breeding decisions           | Clear disclaimers, health fields, vet involvement prompts     |
| Low liquidity / empty feed          | City-first launch, starter profiles, radius expansion         |
| False trust from badges             | Clearly label what exactly was verified and by whom           |
| Algorithm bias / irrelevant matches | Hard filters + configurable ranking + analytics               |
| Privacy breach                      | Approximate location, private contact data, signed URLs       |

# 21\. Launch Strategy for Uzbekistan

Для локального MVP рационально начать с Ташкента и нескольких самых распространённых пород, собрать первые реальные профили и проверить liquidity. После появления достаточного числа активных животных расширять географию на другие города. Модель «город → порода → пол → радиус» снижает проблему пустой выдачи.

- Локализация RU/UZ; English позже.
- Телефонная авторизация с локальными операторами/OTP provider.
- Справочник пород с локальными вариантами названий.
- Верификация документов с учётом локальных ветеринарных документов и будущих интеграций.
- До выхода в production отдельно проверить местное законодательство и требования к обработке персональных данных и животным.

# 22\. Recommended MVP Definition of Done

- Пользователь может пройти onboarding и создать питомца.
- Питомец появляется в discovery другого релевантного пользователя.
- Like/Pass работают без дубликатов.
- Match создаётся и открывает чат.
- Можно отправлять сообщения и жаловаться.
- Документы можно загружать и проверять через админку.
- Пользователь может отправить breeding request.
- Админ может заблокировать пользователя/животное.
- Есть аналитика activation, matches, reports и verification.
- Есть privacy policy, terms и responsible breeding disclaimer до публичного запуска.

# 23\. Источники и конкурентные примеры

- **Snooot — Google Play —** Описание matching dogs/cats, swipe-match-chat, verification badges. <https://play.google.com/store/apps/details?id=fr.snooot.app>
- **BREED — App Store —** Описание breeding matchmaking, record management, mating history. <https://apps.apple.com/us/app/breed-find-pet-breeders/id1601053689>
- **Tail Match — Google Play —** Swipe matchmaking, AI compatibility scoring, breeding partners, messaging. <https://play.google.com/store/apps/details?id=com.tailmatch.app>
- **PairMyPet —** Mate finder, filters, health details, privacy, secure communication. <https://pairmypet.com/>
- **PairMyPet — How it works —** Пошаговое создание pet profile и discovery. <https://pairmypet.com/how-it-works/>
- **PetsLoveStory —** Русскоязычный pet dating/breeding/social пример, verification и moderation. <https://petslovestory.life/>

# 24\. Итоговая продуктовая формулировка

BreedMatch — verified breeding matchmaking platform для владельцев животных. Пользователь создаёт профиль животного, задаёт критерии поиска, просматривает релевантные карточки в формате свайпа, получает Match, общается без раскрытия личных контактов и переходит к структурированному запросу на вязку. Основная конкурентная ценность — не «Tinder-механика» сама по себе, а доверие: health, pedigree, DNA, moderation, privacy и история событий.