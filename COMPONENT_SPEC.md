# Earn Studio — Component Specification

## What Is This Component?

Earn Studio is a **visual mapping builder** for configuring how customers earn loyalty currency (points and tickets) from purchases. It provides an admin interface for merchants to define:

1. **Earn Factors** — Rules that determine how much currency a customer earns (e.g. "Spend ฿100 = 1 point" or "3x multiplier on shoes")
2. **Earn Conditions** — Qualifying criteria that gate when a factor applies (e.g. "only for Gold tier members" or "only for Nike products with ≥50 units purchased")
3. **The link between them** — Which earn factors use which condition groups, visualized as connection lines

The component renders as a two-column layout with SVG bezier connection lines between them, following the [Hookdeck connection visualization](https://hookdeck.com/) pattern.

---

## Current Architecture

### Layout Design (Hookdeck-inspired)

```
LEFT (520px)                                    RIGHT (480px)
┌──────────────────────────────┐                ┌────────────────────────────┐
│▌ Points Starter Rules        │  ───bezier───  │● Mock Tier Conditions  3   │
│▌  Standard · Points (Rate)   │                │  3 conditions · 2 linked   │
└──────────────────────────────┘                └────────────────────────────┘
┌──────────────────────────────┐                ┌────────────────────────────┐
│▌ Points Power Boost      3x  │  ───bezier───  │● Product Picks  2          │
│▌  VIP Ultra · Points (Mult)  │                │  2 conditions · 1 linked   │
└──────────────────────────────┘                └────────────────────────────┘

─── UNLINKED ──────────────────

🟥 Untitled Group  + Add earn factor  ✏️
🟦 Earn Factor Group 945f15e9  + Add earn factor
┌──────────────────────────────┐                ┌────────────────────────────┐
│  Points Starter Rules        │                │  awefawef  1               │
│  Points (Base rate)          │                │  1 condition               │
└──────────────────────────────┘                └────────────────────────────┘
```

**Key layout decisions:**

- **Both columns use 60px fixed-height cards** — ensures rows align horizontally for straight connection lines
- **Connected factors sort to the top** — factors with `earn_conditions_group_id` appear first on the left
- **Unlinked groups/factors at the bottom** — separated by a subtle "UNLINKED" divider
- **Group identity is inline** — shown as a colored 4px left accent bar + colored group name in the card subtitle (no container boxes or section headers that would break row alignment)
- **Right column duplicates condition groups** per linked factor (Hookdeck pattern) — if 3 factors link to "Tier Perks", it appears 3 times on the right, one per row
- **SVG overlay** covers the full layout with `position: absolute`, `pointer-events: none` (paths have `pointer-events: stroke` for hover)
- **Connection lines** use bezier curves (`M x1 y1 C cp1 y1, cp2 y2, x2 y2`) for smooth routing

### Data Attribute DOM Query Pattern

Connection lines are drawn by querying the DOM directly — no Vue ref emit chains:

- Factor cards: `data-factor-id="<uuid>"` set directly in the parent template
- Condition cards: `data-cg-key="<condGroupId>__<factorId>"` set on the card div
- `rebuildLines()` uses `root.querySelector('[data-factor-id="..."]')` with fallback to `wwLib.getFrontDocument()` for WeWeb's runtime environment

---

## Current State & Known Issues

### Working

- Data loading: factor groups, factors per group, condition groups, condition details, entity options
- Left column: connected factors at top with colored group accent + inline group name, unlinked groups at bottom
- Right column: condition group cards with duplication rule, condition count, linked count
- Create Earn Factor Group modal (name, stackable, window dates)
- Edit Earn Factor sidebar panel (all fields matching Figma design)
- Edit Earn Condition Group sidebar panel (condition list with entity picker, operator toggle, thresholds)
- Connect popup: "+" button on factor card hover → popup lists condition groups → select to link
- Group ID injection: `bff_get_earn_factors_by_group` response doesn't include `earn_factor_group_id`, so it's injected from the query context when storing factors

### Known Issues (to fix in next iteration)

1. **SVG connection lines may not render in WeWeb editor** — `querySelector` with `data-*` attributes works in standard DOM but may fail in WeWeb's shadow DOM or iframe context. Current fix uses `rootRef` + `wwLib.getFrontDocument()` fallback, but this needs verification in the live editor. The `lines` reactive array populates correctly but SVG paths may not be visible.

2. **Line rebuild timing** — `scheduleLineUpdate` fires at 150ms delay with 300ms/800ms retries after data load. If the DOM hasn't rendered by then (e.g. large dataset), lines won't appear until the next trigger (scroll, resize, panel open). A MutationObserver or IntersectionObserver approach may be more reliable.

3. **Condition group card click to expand** — clicking a condition group card on the right toggles an expanded state (`expandedRight`), but no detail table is rendered inline since the cards are now 60px fixed height and rendered directly in the parent template. The detail expansion was removed during the height-unification refactor.

4. **EarnConditionGroupCard.vue and EarnFactorGroupCard.vue still exist** in `/src/components/` but are **no longer imported by wwElement.vue** — the main template now renders both columns inline. These files are dead code and should be cleaned up or re-integrated.

5. **No delete functionality exposed in UI** — delete API functions exist in `useApi.js` (`deleteEarnFactor`, `deleteEarnFactorGroup`, `deleteConditionGroup`, `deleteCondition`) but no UI buttons or confirmation dialogs call them.

6. **Sidebar "Assign earn condition group" dropdown** doesn't show condition group details (condition count, entity types) — just the name. Could be improved with a richer dropdown or the ConnectPopup pattern.

---

## File Structure

```
earn-studio/
├── package.json                          # deps: polaris-weweb-styles (github), @weweb/cli
├── ww-config.js                          # WeWeb element config: props, actions, triggers
├── COMPONENT_SPEC.md                     # This file
├── README.md                             # Dev setup + gap tracking
│
└── src/
    ├── wwElement.vue                     # Main component (all rendering + state + API orchestration)
    │   - Two-column layout with inline cards (no child card components used)
    │   - SVG absolute overlay for connection lines
    │   - DOM query pattern: data-factor-id, data-cg-key
    │   - Computed: connectedFactors, unconnectedEntries, rightEntries
    │   - 60px unified card height for alignment
    │
    ├── useApi.js                         # Supabase RPC/REST API layer
    │   - getHeaders(): apikey + Bearer token from props
    │   - rpc(): POST /rest/v1/rpc/{fn}
    │   - restGet(): GET /rest/v1/{table}
    │   - Named methods for all 12+ endpoints
    │
    └── components/
        ├── EarnFactorConfig.vue          # Sidebar: edit/create earn factor
        │   - Fields: name, type (rate/multiplier), amount, target currency,
        │     window start/end, expiry days, public/private, condition group dropdown
        │   - Redesigned to match Figma: 24px padding, 13px Inter, clean field spacing
        │   - Save: emits { groupId, factor } → parent upserts via bff_upsert_earn_factor_group
        │
        ├── EarnConditionGroupConfig.vue  # Sidebar: edit/create condition group
        │   - Group name field
        │   - Repeatable condition entries with entity type, entity multi-select,
        │     operator toggle (OR/AND/EACH), threshold type, excess toggle, min/max
        │   - Entity picker modal with search + checkbox selection
        │   - Save: emits payload → parent upserts via bff_upsert_earn_conditions_group
        │
        ├── CreateGroupModal.vue          # Modal: create new earn factor group
        │   - Fields: name, stackable toggle, window start/end
        │
        ├── ConnectPopup.vue              # Popup: link factor → condition group
        │   - Searchable list of all condition groups
        │   - Click to select → parent saves connection via bff_upsert_earn_factor_group
        │
        ├── EarnFactorGroupCard.vue       # ⚠️ DEAD CODE — not imported by wwElement.vue
        │   - Was the left column card component before inline rendering
        │
        └── EarnConditionGroupCard.vue    # ⚠️ DEAD CODE — not imported by wwElement.vue
            - Was the right column card component before inline rendering
```

---

## How The Component Calls APIs

All API calls go directly to Supabase via `fetch()` — no Supabase JS client library. The API layer is in `src/useApi.js`.

### Authentication

Every request includes two headers:

```
apikey: {supabaseAnonKey}          ← public anon key (hardcoded default)
Authorization: Bearer {authToken}   ← admin user JWT (bound from WeWeb auth context)
```

### Base URL

```
https://wkevmsedchftztoolkmi.supabase.co
```

### API Calls Made

| When | Endpoint | Method | Purpose |
|------|----------|--------|---------|
| On mount | `GET /rest/v1/earn_factor_group?select=...&order=created_at.desc` | REST | List all earn factor groups |
| Per group | `POST /rest/v1/rpc/bff_get_earn_factors_by_group` | RPC | Get factors for a group (group ID injected into each factor on frontend) |
| On mount | `POST /rest/v1/rpc/bff_get_all_earn_conditions_groups` | RPC | List all condition groups |
| Per cond group | `POST /rest/v1/rpc/bff_get_earn_conditions_group` | RPC | Get condition details (thresholds, operators) |
| On mount | `POST /rest/v1/rpc/get_all_entity_options` | RPC | All entities for condition dropdowns |
| Create factor group | `POST /rest/v1/rpc/bff_upsert_earn_factor_group` | RPC | Create group with empty factors array |
| Save factor | `POST /rest/v1/rpc/bff_get_earn_factor_group_details` then `bff_upsert_earn_factor_group` | RPC | Fetch-merge-upsert pattern for factor edits |
| Save condition group | `POST /rest/v1/rpc/bff_upsert_earn_conditions_group` | RPC | Create/update conditions atomically |
| Connect factor | `bff_get_earn_factor_group_details` then `bff_upsert_earn_factor_group` | RPC | Update factor's `earn_conditions_group_id` |

**Important implementation detail:** `bff_get_earn_factors_by_group` does NOT return `earn_factor_group_id` in its response. The frontend injects it:
```javascript
m[g.id] = factors.map(f => ({ ...f, earn_factor_group_id: f.earn_factor_group_id || g.id }));
```

---

## Component Properties (WeWeb Config)

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `supabaseUrl` | Text | `https://wkevmsedchftztoolkmi.supabase.co` | Supabase project URL |
| `supabaseAnonKey` | Text | *(hardcoded CRM anon key)* | Public API key |
| `authToken` | Text | *(must bind)* | Admin user JWT |
| `leftColumnWidth` | Length | `580px` | Left column width |
| `rightColumnWidth` | Length | `580px` | Right column width |
| `connectionLineColor` | Color | `#C9CCCF` | Default line color |
| `connectionLineActiveColor` | Color | `#005BD3` | Hovered line color |
| `configPanelWidth` | Length | `400px` | Sidebar panel width |

## Trigger Events

| Event | When | Payload |
|-------|------|---------|
| `data-loaded` | After initial load | `{ factorGroupCount, conditionGroupCount }` |
| `earn-factor-group-saved` | Group created/updated | `{ groupId, groupName, action }` |
| `earn-factor-saved` | Factor created/updated | `{ factorId, factorType, groupId }` |
| `earn-condition-group-saved` | Condition group saved | `{ groupId, groupName, action }` |
| `connection-changed` | Factor linked/unlinked | `{ factorId, conditionGroupId, action }` |
| `error` | Any API failure | `{ message, code }` |

## Actions

| Action | Description |
|--------|-------------|
| `refreshData` | Reload all data from Supabase |
| `closePanel` | Close any open sidebar panel |

---

## Database Tables

| Table | Key Columns |
|-------|-------------|
| `earn_factor_group` | `id`, `name`, `stackable`, `window_start`, `window_end`, `active_status`, `merchant_id` |
| `earn_factor` | `id`, `earn_factor_type` (rate/multiplier), `earn_factor_amount`, `target_currency` (points/ticket), `target_entity_id`, `public`, `window_*`, `earn_factor_group_id` FK, `earn_conditions_group_id` FK |
| `earn_conditions_group` | `id`, `name`, `merchant_id` |
| `earn_conditions` | `id`, `group_id` FK, `entity` (enum), `entity_ids` (uuid[]), `operator`, `threshold_unit`, `min_threshold`, `max_threshold`, `apply_to_excess_only`, `exclude` |

### Enums

- **`earn_factor_type`**: `rate`, `multiplier`
- **`currency`**: `points`, `ticket`
- **`earn_factor_entity_type`**: `product_product`, `product_sku`, `product_brand`, `product_category`, `store`, `store_attribute_set`, `tier`, `persona`, and more

---

## Save Behavior

No page-level save. Each entity saves independently:

| Entity | Trigger | API |
|--------|---------|-----|
| Earn Factor Group | Create modal → Save | `bff_upsert_earn_factor_group` |
| Earn Factor | Sidebar → Save | `bff_upsert_earn_factor_group` (fetch-merge-upsert) |
| Earn Condition Group | Sidebar → Save | `bff_upsert_earn_conditions_group` |
| Factor ↔ Condition link | "+" popup select, or sidebar dropdown | `bff_upsert_earn_factor_group` |

---

## Styling

- Built on `polaris-weweb-styles` v2.2.0 (GitHub: `rangwan-rocket/polaris-weweb-styles`)
- Uses Polaris design tokens: `--p-color-*`, `--p-space-*`, `--p-font-*`, `--p-border-radius-*`, `--p-shadow-*`
- Uses Polaris mixins: `polaris-button-primary`, `polaris-button-plain`, `polaris-input`, `polaris-select`, `polaris-radio`, `polaris-spinner`, `polaris-text-title`, `polaris-text-subtitle`, `polaris-text-description`, `polaris-separator-dot`, `polaris-card-bordered`
- Group colors: 8-color deterministic palette hashed by group ID
- Inter font throughout matching Figma specs
