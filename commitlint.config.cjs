module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "perf",
        "test",
        "chore",
        "build",
        "ci",
        "revert",
      ],
    ],
    "subject-case": [2, "always", ["lower-case"]],
    "header-max-length": [2, "always", 120],
    "body-max-line-length": [2, "always", 60],
    "scope-empty": [2, "never"],
  },
};
