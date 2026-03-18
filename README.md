# Package Builder

WeWeb custom component for managing packages — bundles of rewards with quantities, validity rules, and pricing.

## Overview

An admin interface for creating and configuring packages. A package is a template that defines: a name, description, validity period, optional pricing, and a list of reward items with quantities and mandatory/elective configuration.

### Features

- **List view** — browse all packages with search, filter by status, and sort by creation date
- **Sidebar editor** — create or edit packages with full configuration:
  - Package details (name, description, image)
  - Validity rules (no expiry, days from assignment, or specific date)
  - Pricing (monetary price and/or points cost)
  - Reward items with quantity, mandatory/elective type, elective groups, and reordering
- **Reward picker** — search and select from available rewards to add to a package
- **Save modes** — save as draft (inactive) or save & activate
- **Toast notifications** — success/error feedback with item operation counts

## Development

```bash
npm install
npm run serve --port=8080
```

Then add the custom element in the WeWeb editor developer popup.

## Build

```bash
npm run build --name=package-builder
```

## Data Source

Connects directly to Supabase via RPC and REST endpoints:

| Endpoint | Purpose |
|---|---|
| `bff_admin_get_package_list` | List packages with counts |
| `bff_admin_get_package_detail` | Single package with items and reward details |
| `bff_upsert_package_with_items` | Create/update package and its items |
| `reward_master` (REST) | Available rewards for the picker |

## Configuration

| Property | Description |
|---|---|
| Supabase URL | Base URL of the Supabase project |
| API Key | Supabase anon/public key |
| User Access Token | JWT from authenticated user (bind from auth context) |

## Styling

Built with [polaris-weweb-styles](https://github.com/rangwan-rocket/polaris-weweb-styles) following [Polaris Component Structure Guidelines](https://github.com/Rocket-CRM/polaris-guide).
