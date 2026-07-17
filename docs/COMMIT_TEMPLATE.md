# Commit Message Template

  

## Format

  

```

<type>(<scope>): <description>

  

[optional body] only if needed. Max 1-3 bullet points. No paragraphs.

  
  

[optional footer]

```

  

## Commit Types

  

| Type       | Use when                    |

| ---------- | --------------------------- |

| `feat`     | New feature                 |

| `fix`      | Bug fix                     |

| `docs`     | Documentation only          |

| `style`    | Formatting, no logic change |

| `refactor` | Code refactor               |

| `perf`     | Performance improvement     |

| `test`     | Add/fix tests               |

| `build`    | Build system / deps         |

| `ci`       | CI/config CHANGELOG           |

| `chore`    | Maintenance                 |

| `revert`   | Revert commit               |

  

## Rules

  

### One logical change = one commit

  

- **Max 3 files** per commit (Strict)

- **Do NOT** cram many files into one commit

- Group files by concern: `git add auth/*` then commit, `git add ui/*` then commit

- If touching `auth`, `ui`, and `db` — that's 3 commits, not 1

  

### Subject line

  

- Max **100 chars**

- Imperative: `add` not `added`

- No period at end

- Lowercase start

  

### Body — keep it short

  

- Max **1-3 bullet points**

- **No paragraphs** or long sentences

- Only WHAT and WHY. Code shows HOW.

- **The "Split" Rule**: If you need > 3 bullet points, split into multiple atomic commits.

  

### Footer

  

- `BREAKING CHANGE:` for breaking CHANGELOG

- `Closes #123` / `Refs #456` for issues

  

## Examples

  

### Simple (one-line)

  

```

fix(ticket): resolve status badge color mismatch

```

  

### With body

  

```

feat(auth): add email verification

  

- Generate verification token on register

- Send confirmation email via SMTP

- Block login until verified

  

Closes #42

```

  

### Breaking change

  

```

feat!: require email before login

  

BREAKING CHANGE: Unverified accounts blocked at login.

Set `user.emailVerified = true` to migrate.

```

  

## ❌ WHAT TO AVOID

  

**Do NOT** create bloated commits with too many bullet points or unrelated CHANGELOG:

  

```markdown

# ❌ TOO LONG & BLOATED

  

feat(inventory): improve item form with skeleton, IDR format, and mode-aware UI

  

- Add item form skeleton loading component

- Add Suspense wrapper to new item page

- Hide SKU field on create (auto-generated), disable on edit

- Switch form to single-column layout on create

- Add IDR currency prefix and number formatting to price field

- Add supplier column and typed Item to table

- Add record count badge to DataTable component

- Show isActive toggle only in edit mode

```

  

**Instead**, split the above into 3-4 smaller, focused commits.

  

---

  

## ⚠️ MANDATORY: Update CHANGELOG.md

  

Every code commit MUST add entry to `CHANGElOG.md`.

  

Keep `CHANGELOG.md` as a readable summary when major frontend milestones change.

  

## CHANGELOG.md Rules

  

**Newest version ALWAYS at TOP.** Insert new entry after the `---` below the header, before all existing entries. Never append to bottom. Never reorder old entries.

  

Use template in `docs/CHANGELOG_TEMPLATE.MD`.

\_

  

---

  

### [TYPE]

  

#### <TITLE>

  

- **Date:** [YYYY-MM-DD]

- **Commits:** `[SHORT_HASH]`

- [Change description 1]

- [Change description 2]
- 
### 2. Update `knowledge.md` (Conditional)

Evaluate the commit type based on the **Commit Types** table above.

- If the commit is a `feat`, `refactor`, `build` (adding new core libraries), or introduces a `BREAKING CHANGE`, you **MUST** update the `knowledge.md` file (using the `knowledge_template.md` format).
    
- The goal is to ensure AI/Agents always have the latest architectural context and do not break established codebase patterns. Update the following sections as needed:
    
    - **Current State & Active Focus**
        
    - **Architectural Decisions & Patterns** (if there are new patterns)
        
    - **Completed Modules & Features** (if a feature is completed)
