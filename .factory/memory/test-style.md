---
topic: Testing conventions
---
Tests import `describe, expect, test` from "vitest" (they use `test`, not `it`) and import the unit under test by relative path (e.g. `./get-current-app`). They are pure unit tests of src/utils helpers with no DOM or chrome mocks. Nested describe blocks; test names follow the pattern "should ...".
