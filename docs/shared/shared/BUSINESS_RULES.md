# Shared Business Rules

Contract version: `0.2.0-draft`

## TERM-APP-TIPS-001 — Application tips

- Status: `verified`
- Semantic definition: `app_tips` means tips recorded and paid through a delivery platform. It excludes cash tips.
- Affected flows: work, statistics, reports.
- Source fields: Mobile `appTips`; database `tips_uber`, `tips_wolt`, `tips_bolt`, `tips_glovo`, `tips_stuart`, `tips_other`; Web model `appTips`; Web UI label “App tips”.
- Legacy language: “online tips” is a deprecated synonym and must not become a new field.
- Source evidence: `lib/work-platforms.ts`, `app/work/components/PlatformSection.tsx`, `app/work/year/annual-report-calculations.ts`.
- Fixture IDs: `income-all-platforms`, `income-null-and-missing`.
- Introduced in contract: `0.2.0-draft`.

## STAT-BRUTTO-001 — Statistics Brutto

- Status: `partially_verified`.
- Semantic definition: `Brutto = base income + app tips + cash tips + bonuses` across included work records.
- Exclusions: expenses, rental, income-after-expenses, and tax Netto are excluded.
- Completion rule: Statistics is complete without Expenses.
- Affected flows: statistics, reports.
- Source evidence: reported Mobile milestone; `lib/work-platforms.ts`; `app/work/year/annual-report-calculations.ts`.
- Fixture IDs: `income-all-platforms`, `income-zero-values`, `report-six-platform-summary`.
- Introduced in contract: `0.2.0-draft`.

Mobile milestone evidence: implementation commit `3332409f7b549a255235eb30aa182ada3302c519` (“feat: add statistics overview”) and documentation commit `f4126fbb58531be751f67b059ada54c451ececdd` (“docs: record statistics milestone”). An independent Mobile compatibility review at HEAD `4ecfb48d99951539c7f5db73fb748667478ffb85` evaluated snapshot `0.2.0-draft.2` and passed all supplied income/report cases. It confirmed Mobile calculation compatibility for base income, app tips, cash tips, bonuses, all six platforms, Stuart, Other, orders, and a zero denominator.

This promotes the calculation evidence to `partially_verified`, not the complete backend contract. Staging schema, timezone, and shared rounding remain unresolved.

## MONEY-CURRENCY-001 — Currency

- Status: `partially_verified`.
- Semantic definition: monetary values are reported and displayed in PLN.
- Affected flows: work, statistics, reports, expenses, vehicle rental.
- Source evidence: Web UI currency labels and product copy.
- Fixture IDs: `income-decimal-values`.
- Introduced in contract: `0.2.0-draft`.

No verified schema-level currency column or multi-currency mechanism exists. Currency changes are Class C.

## WORK-RECORDED-INCOME-001 — Recorded work income

- Status: `partially_verified`.
- Semantic definition: one work record contains date, distance, hours, and zero or more platform metrics for the six supported platform identifiers. Platform metrics are base income, orders, app tips, cash tips, and bonuses. `other` may have a custom display name.
- Null semantics: Web aggregation converts null or missing numeric platform values to zero. This behavior is verified in local unit tests but not against Staging.
- Affected flows: work, statistics, reports.
- Source evidence: `lib/work-platforms.ts`, `app/work/page.tsx`, `lib/database.types.ts`.
- Fixture IDs: `income-all-platforms`, `income-null-and-missing`, `income-multiple-records`.
- Introduced in contract: `0.2.0-draft`.

The Mobile fixture runner normalized null and missing inputs into the domain's non-negative numeric representation before calculation. This proves calculation behavior after normalization; it does not prove remote row nullability, database defaults, or Staging data shape.

## EXP-INCOME-AFTER-001 — Income after expenses

- Status: `deferred_for_mobile`.
- Semantic definition: `income after expenses = recorded income - fuel - vehicle rental`.
- Explicit distinction: this is not Netto and does not represent taxes.
- Affected flows: expenses, statistics.
- Source evidence: reported requirement only.
- Fixture IDs: none; expense schema is pending.
- Introduced in contract: `0.2.0-draft`.

## EXP-CATEGORY-001 — Expense categories

- Status: `draft_pending_schema_snapshot`.
- Semantic definition: shared expense totals include only fuel and vehicle rental. Charging, Garage, repair, and service are excluded.
- Affected flows: expenses.
- Source evidence: reported requirement; no matching expense tables in repository evidence.
- Fixture IDs: none until schema snapshot and calculation contract are accepted.
- Introduced in contract: `0.2.0-draft`.

The existing Web Garage feature is maintenance tracking and is not canonical Expenses.

## RENTAL-PERIOD-001 — Vehicle rental periods

- Status: `unresolved`.
- Semantic definition: rental is optional and is modeled as a history of periods with weekly price, inclusive start date, and inclusive optional end date. Closing or correcting a period must preserve history rather than rewrite unrelated past periods, and destructive corrections require a warning.
- Unresolved details: proration, precision, rounding, overlap handling, open-period boundaries, timezone, and correction mechanics.
- Affected flows: vehicle rental, expenses.
- Source evidence: reported requirement only; no matching repository schema.
- Fixture IDs: none until the unresolved details are decided.
- Introduced in contract: `0.2.0-draft`.

## REPORT-ANNUAL-001 — Annual report

- Status: `verified` for local calculation behavior and `partially_verified` overall.
- Semantic definition: aggregate all six platforms, including Stuart and Other, cash tips, and orders. When tips and bonuses are included, the total follows STAT-BRUTTO-001. Averages return zero when the denominator is zero.
- Affected flows: reports, statistics.
- Source evidence: `app/work/year/annual-report-calculations.ts` and its unit tests.
- Fixture IDs: `report-six-platform-summary`, `report-zero-denominator`.
- Introduced in contract: `0.2.0-draft`.

Mobile pure arithmetic helpers satisfy the supplied report numeric fixtures. Mobile Annual Report itself is not implemented, and implementation remains blocked by timezone-boundary and shared-rounding policy, as well as unresolved Staging schema/RLS evidence.

## TIME-LOCAL-DATE-001 — Calendar-date semantics

- Status: `reported_pending_snapshot` with a Web mismatch.
- Reported Mobile definition: store dates as local `YYYY-MM-DD`; interpret day and month in device local time; weeks run Monday through Sunday.
- Web evidence: several defaults derive dates with UTC `toISOString()`, and report/display paths parse date-only strings through JavaScript Date. This can move a calendar boundary by timezone.
- Affected flows: work, statistics, reports, garage, vehicle rental.
- Source evidence: reported Mobile behavior; `app/work/page.tsx`, `app/garage/page.tsx`, `app/work/year/page.tsx`.
- Fixture IDs: none until a platform-neutral boundary oracle is approved.
- Introduced in contract: `0.2.0-draft`.

## MONEY-ROUNDING-001 — Precision and rounding

- Status: `unresolved`.
- Semantic definition: no shared persistence or calculation rounding rule is currently proven. Web uses presentation-level fixed-decimal formatting in multiple places, which does not establish a canonical rule.
- Affected flows: statistics, reports, expenses, vehicle rental.
- Source evidence: Web formatting call sites; no schema-level money type policy.
- Fixture IDs: `income-decimal-values` validates arithmetic inputs only, not rounding.
- Introduced in contract: `0.2.0-draft`.
