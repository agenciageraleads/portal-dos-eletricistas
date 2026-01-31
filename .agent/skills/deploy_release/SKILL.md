---
name: deploy_release
description: Automate the release process (version bump, changelog) and deployment steps.
---

# Deploy & Release Skill

Use this skill when the user wants to prepare a new release, bump the version, or deploy to staging/production.

## 1. Release Flow (Versioning)

When asked to "Preparar release" or "Atualizar versão":

1.  **Check Current Version**: Read `apps/web/package.json`.
2.  **Determine Next Version**: Ask user or infer from changes (Major/Minor/Patch).
3.  **Update Files**:
    *   `apps/web/package.json`: Update `"version"`.
    *   `apps/api/package.json`: Update `"version"` (if backend changes existed).
4.  **Update Changelog**:
    *   Read `CHANGELOG.md`.
    *   Add a new header with the new version and today's date (YYYY-MM-DD).
    *   Move "Unreleased" items to this new section or ask user for summary.
    *   Format: `## [X.Y.Z] - YYYY-MM-DD`.

## 2. Git Tag & Push

After files are updated and changelog is ready:

1.  **Commit Changes**:
    ```bash
    git add .
    git commit -m "chore(release): bump version to X.Y.Z"
    ```
2.  **Create Tag**:
    ```bash
    git tag vX.Y.Z
    ```
3.  **Push**:
    ```bash
    git push origin main
    git push origin vX.Y.Z
    ```
    *(Note: Pushing tags usually triggers CI/CD pipelines if configured)*

## 3. GitHub Release (Optional)

If the user requests "Criar release no GitHub":
1.  **Draft Release**: Use the [gh cli](https://cli.github.com/manual/) if available or instruct user.
    ```bash
    gh release create vX.Y.Z --title "vX.Y.Z" --notes-file CHANGELOG_SECTION.md
    ```
2.  **Manual**: Open https://github.com/lucasborgessb/portal_dos_eletricistas/releases/new

## 4. Docker Build & Push

### A. Staging (Beta)
**Target:** `beta.portaleletricos.com.br` | **File:** `docker-compose.staging.yml`

1.  **Build Web**:
    ```bash
    docker buildx build --platform linux/amd64 -t lucasborgessb/portal_dos_eletricistas:web-X.Y.Z apps/web --build-arg NEXT_PUBLIC_API_URL=https://beta-api.portaleletricos.com.br --push
    ```
2.  **Build API**:
    ```bash
    docker buildx build --platform linux/amd64 -t lucasborgessb/portal_dos_eletricistas:api-X.Y.Z apps/api --push
    ```
3.  **Update Compose**: Update `image:` in `docker-compose.staging.yml`.

### B. Production (Live)
**Target:** `app.portaleletricos.com.br` | **File:** `docker-compose.prod.yml`

1.  **Build Web**:
    ```bash
    # Explicit Version + Latest
    docker buildx build --platform linux/amd64 \
      -t lucasborgessb/portal_dos_eletricistas:web-X.Y.Z \
      -t lucasborgessb/portal_dos_eletricistas:web-latest \
      apps/web --build-arg NEXT_PUBLIC_API_URL=https://api.portaleletricos.com.br --push
    ```
2.  **Build API**:
    ```bash
    # Explicit Version + Latest
    docker buildx build --platform linux/amd64 \
      -t lucasborgessb/portal_dos_eletricistas:api-X.Y.Z \
      -t lucasborgessb/portal_dos_eletricistas:api-latest \
      apps/api --push
    ```
3.  **Update Compose**: Update `image:` to use the **explicit version** `X.Y.Z` (Safer than 'latest' for rollback).

## 5. Remote Deployment (Portainer/VPS)

1.  **Staging Deploy**:
    ```bash
    docker stack deploy -c docker-compose.staging.yml portal_staging
    ```

2.  **Production Deploy**:
    ```bash
    docker stack deploy -c docker-compose.prod.yml portal_prod
    ``` *Note: Check exact stack name in Portainer.*

## 6. Checklist for Agent

1. [ ] **Consistency**: Ensure `package.json` version matches `CHANGELOG.md` and Docker tags.
2. [ ] **Changelog**: Follow "Keep a Changelog" standards (Added, Changed, Fixed).
3. [ ] **Safety**: Never auto-push to `main` without explicit confirmation if using git flow.

## 7. Usage Example

**User:** "Lança a versão 1.5.0 e atualiza o changelog."

**Agent Action:**
1. Edit `apps/web/package.json` -> `1.5.0`.
2. Edit `CHANGELOG.md` -> Add header `## [1.5.0] - 202X-XX-XX`.
3. (Optional) Ask "Deseja buildar as imagens Docker agora?".
