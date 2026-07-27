import os
import shutil
import subprocess
import stat

# Directories
REPO_DIR = r"D:\Programming\Major Projects\Portfolio\Test"
FILES_DIR = r"D:\Programming\Major Projects\Portfolio\files"
UPDATES_DIR = r"D:\Programming\Major Projects\Portfolio\Updates\V3"

commits_data = [
    {
        "snapshot": "80",
        "msg": "Done V3.80 - feat(cms): extend navigation backend model and validation\n\n- Add nested navigation support to the singleton model\n- Add link type, order, status, and new-tab fields\n- Validate internal and external URL formats\n- Prevent duplicate routes and invalid nesting\n- Preserve stable ordering during updates",
        "commit_txt": """feat(cms): extend navigation backend model and validation

- Add nested navigation support to the singleton model
- Add link type, order, status, and new-tab fields
- Validate internal and external URL formats
- Prevent duplicate routes and invalid nesting
- Preserve stable ordering during updates

Files

backend/src/models/Navigation.js
backend/src/validators/navigation.validator.js
backend/src/utils/ordering.js
backend/src/utils/constants.js""",
        "files": [
            "backend/src/models/Navigation.js",
            "backend/src/validators/navigation.validator.js",
            "backend/src/utils/ordering.js",
            "backend/src/utils/constants.js"
        ]
    },
    {
        "snapshot": "81",
        "msg": "Done V3.81 - feat(cms): implement navigation backend service updates\n\n- Add nested item normalization in service layer\n- Support create, update, delete, reorder, and status toggle\n- Enforce duplicate-route checks in business logic\n- Keep singleton CRUD behavior intact\n- Prepare navigation data for frontend rendering",
        "commit_txt": """feat(cms): implement navigation backend service updates

- Add nested item normalization in service layer
- Support create, update, delete, reorder, and status toggle
- Enforce duplicate-route checks in business logic
- Keep singleton CRUD behavior intact
- Prepare navigation data for frontend rendering

Files

backend/src/services/navigation.service.js
backend/src/controllers/navigation.controller.js""",
        "files": [
            "backend/src/services/navigation.service.js",
            "backend/src/controllers/navigation.controller.js"
        ]
    },
    {
        "snapshot": "82",
        "msg": "Done V3.82 - feat(cms): extend footer backend schema and service\n\n- Add footer sections and quick links support\n- Add contact, social, newsletter, and copyright fields\n- Support visibility controls for footer blocks\n- Keep singleton architecture and CRUD flow intact\n- Prepare footer data for admin editing",
        "commit_txt": """feat(cms): extend footer backend schema and service

- Add footer sections and quick links support
- Add contact, social, newsletter, and copyright fields
- Support visibility controls for footer blocks
- Keep singleton architecture and CRUD flow intact
- Prepare footer data for admin editing

Files

backend/src/models/Footer.js
backend/src/validators/footer.validator.js
backend/src/services/footer.service.js
backend/src/controllers/footer.controller.js""",
        "files": [
            "backend/src/models/Footer.js",
            "backend/src/validators/footer.validator.js",
            "backend/src/services/footer.service.js",
            "backend/src/controllers/footer.controller.js"
        ]
    },
    {
        "snapshot": "83",
        "msg": "Done V3.83 - feat(cms): extend seo backend and add migration support\n\n- Add global SEO defaults and metadata fields\n- Support OpenGraph and Twitter Card configuration\n- Add robots, verification tags, and canonical URL\n- Store structured data safely with validation\n- Add migration for existing singleton SEO records",
        "commit_txt": """feat(cms): extend seo backend and add migration support

- Add global SEO defaults and metadata fields
- Support OpenGraph and Twitter Card configuration
- Add robots, verification tags, and canonical URL
- Store structured data safely with validation
- Add migration for existing singleton SEO records

Files

backend/src/models/Seo.js
backend/src/validators/seo.validator.js
backend/src/services/seo.service.js
backend/src/controllers/seo.controller.js
backend/src/scripts/migrateNavFooterSeoSchema.js""",
        "files": [
            "backend/src/models/Seo.js",
            "backend/src/validators/seo.validator.js",
            "backend/src/services/seo.service.js",
            "backend/src/controllers/seo.controller.js",
            "backend/src/scripts/migrateNavFooterSeoSchema.js"
        ]
    },
    {
        "snapshot": "84",
        "msg": "Done V3.84 - feat(cms): register navigation footer and seo admin routes\n\n- Add admin route registration for all three modules\n- Wire permissions into secured CMS endpoints\n- Expose CRUD and publish state endpoints cleanly\n- Keep existing authentication middleware intact\n- Prepare APIs for frontend integration",
        "commit_txt": """feat(cms): register navigation footer and seo admin routes

- Add admin route registration for all three modules
- Wire permissions into secured CMS endpoints
- Expose CRUD and publish state endpoints cleanly
- Keep existing authentication middleware intact
- Prepare APIs for frontend integration

Files

backend/src/routes/index.js
backend/src/routes/admin/navigationRoutes.js
backend/src/routes/admin/footerRoutes.js
backend/src/routes/admin/seoRoutes.js
backend/src/config/permissions.js""",
        "files": [
            "backend/src/routes/index.js",
            "backend/src/routes/admin/navigationRoutes.js",
            "backend/src/routes/admin/footerRoutes.js",
            "backend/src/routes/admin/seoRoutes.js",
            "backend/src/config/permissions.js"
        ]
    },
    {
        "snapshot": "85",
        "msg": "Done V3.85 - feat(cms): add frontend API clients for cms modules\n\n- Add Navigation, Footer, and SEO API clients\n- Add Media Library API client for image selection\n- Centralize API endpoint definitions\n- Centralize CMS route constants\n- Prepare frontend data layer for React Query hooks",
        "commit_txt": """feat(cms): add frontend API clients for cms modules

- Add Navigation, Footer, and SEO API clients
- Add Media Library API client for image selection
- Centralize API endpoint definitions
- Centralize CMS route constants
- Prepare frontend data layer for React Query hooks

Files

frontend/src/api/navigationApi.js
frontend/src/api/footerApi.js
frontend/src/api/seoApi.js
frontend/src/api/mediaApi.js
frontend/src/constants/apiEndpoints.js
frontend/src/routes.js""",
        "files": [
            "frontend/src/api/navigationApi.js",
            "frontend/src/api/footerApi.js",
            "frontend/src/api/seoApi.js",
            "frontend/src/api/mediaApi.js",
            "frontend/src/constants/apiEndpoints.js",
            "frontend/src/routes.js"
        ]
    },
    {
        "snapshot": "86",
        "msg": "Done V3.86 - feat(cms): add React Query hooks for cms modules\n\n- Add hooks for Navigation, Footer, and SEO\n- Add hook for Media Library image selection\n- Standardize CMS data fetching and mutations\n- Keep resource logic reusable across admin pages\n- Prepare pages for direct integration",
        "commit_txt": """feat(cms): add React Query hooks for cms modules

- Add hooks for Navigation, Footer, and SEO
- Add hook for Media Library image selection
- Standardize CMS data fetching and mutations
- Keep resource logic reusable across admin pages
- Prepare pages for direct integration

Files

frontend/src/hooks/useNavigation.js
frontend/src/hooks/useFooter.js
frontend/src/hooks/useSeo.js
frontend/src/hooks/useMediaLibrary.js""",
        "files": [
            "frontend/src/hooks/useNavigation.js",
            "frontend/src/hooks/useFooter.js",
            "frontend/src/hooks/useSeo.js",
            "frontend/src/hooks/useMediaLibrary.js"
        ]
    },
    {
        "snapshot": "87",
        "msg": "Done V3.87 - feat(cms): add reusable cms admin components\n\n- Add drag and drop reorder list component\n- Add media picker dialog for image selection\n- Add SEO preview component for metadata review\n- Keep components reusable across CMS pages\n- Support live previews and editor workflows",
        "commit_txt": """feat(cms): add reusable cms admin components

- Add drag and drop reorder list component
- Add media picker dialog for image selection
- Add SEO preview component for metadata review
- Keep components reusable across CMS pages
- Support live previews and editor workflows

Files

frontend/src/components/cms/DragReorderList.jsx
frontend/src/components/cms/MediaPickerDialog.jsx
frontend/src/components/cms/SeoPreview.jsx""",
        "files": [
            "frontend/src/components/cms/DragReorderList.jsx",
            "frontend/src/components/cms/MediaPickerDialog.jsx",
            "frontend/src/components/cms/SeoPreview.jsx"
        ]
    },
    {
        "snapshot": "88",
        "msg": "Done V3.88 - feat(cms): implement navigation management page\n\n- Add nested navigation editor with drag and drop\n- Support create, edit, delete, and status toggle\n- Add link type switching and URL validation\n- Show hierarchy preview and unsaved changes warnings\n- Wire app navigation into the new admin page",
        "commit_txt": """feat(cms): implement navigation management page

- Add nested navigation editor with drag and drop
- Support create, edit, delete, and status toggle
- Add link type switching and URL validation
- Show hierarchy preview and unsaved changes warnings
- Wire app navigation into the new admin page

Files

frontend/src/pages/admin/ManageNavigation.jsx
frontend/src/App.jsx
frontend/src/navigation.js""",
        "files": [
            "frontend/src/pages/admin/ManageNavigation.jsx",
            "frontend/src/App.jsx",
            "frontend/src/navigation.js"
        ]
    },
    {
        "snapshot": "89",
        "msg": "Done V3.89 - feat(cms): implement footer and seo management pages\n\n- Add footer section editor and live preview\n- Support quick links, social links, and contact info\n- Add newsletter and visibility controls\n- Add SEO editor with metadata preview and validation\n- Integrate both pages with the new admin shell",
        "commit_txt": """feat(cms): implement footer and seo management pages

- Add footer section editor and live preview
- Support quick links, social links, and contact info
- Add newsletter and visibility controls
- Add SEO editor with metadata preview and validation
- Integrate both pages with the new admin shell

Files

frontend/src/pages/admin/ManageFooter.jsx
frontend/src/pages/admin/ManageSeo.jsx""",
        "files": [
            "frontend/src/pages/admin/ManageFooter.jsx",
            "frontend/src/pages/admin/ManageSeo.jsx"
        ]
    },
    {
        "snapshot": "90",
        "msg": "Done V3.90 - chore(cms): finalize package and dependency wiring\n\n- Add drag and drop dependencies for CMS ordering\n- Update package lock and build configuration\n- Verify CMS imports and route wiring are aligned\n- Keep the admin CMS stack production ready\n- Prepare for future public-page rendering",
        "commit_txt": """chore(cms): finalize package and dependency wiring

- Add drag and drop dependencies for CMS ordering
- Update package lock and build configuration
- Verify CMS imports and route wiring are aligned
- Keep the admin CMS stack production ready
- Prepare for future public-page rendering

Files

frontend/package.json
frontend/package-lock.json""",
        "files": [
            "frontend/package.json",
            "frontend/package-lock.json"
        ]
    }
]

# Map logical path names to actual filenames in files directory
FILE_MAP = {
    "backend/src/models/Navigation.js": "Navigation.js",
    "backend/src/validators/navigation.validator.js": "navigationValidators.js",
    "backend/src/utils/ordering.js": "ordering.js",
    "backend/src/utils/constants.js": "constants.js",
    "backend/src/services/navigation.service.js": "NavigationService.js",
    "backend/src/models/Footer.js": "Footer.js",
    "backend/src/validators/footer.validator.js": "footerValidators.js",
    "backend/src/services/footer.service.js": "FooterService.js",
    "backend/src/models/Seo.js": "SEO.js",
    "backend/src/validators/seo.validator.js": "seoValidators.js",
    "backend/src/services/seo.service.js": "SEOService.js",
    "backend/src/scripts/migrateNavFooterSeoSchema.js": "migrateNavFooterSeoSchema.js",
    "backend/src/config/permissions.js": "permissions.js",
    "frontend/src/api/navigationApi.js": "navigationApi.js",
    "frontend/src/api/footerApi.js": "footerApi.js",
    "frontend/src/api/seoApi.js": "seoApi.js",
    "frontend/src/api/mediaApi.js": "mediaApi.js",
    "frontend/src/constants/apiEndpoints.js": "apiEndpoints.js",
    "frontend/src/routes.js": "routes.js",
    "frontend/src/hooks/useNavigation.js": "useNavigation.js",
    "frontend/src/hooks/useFooter.js": "useFooter.js",
    "frontend/src/hooks/useSeo.js": "useSeo.js",
    "frontend/src/hooks/useMediaLibrary.js": "useMediaLibrary.js",
    "frontend/src/components/cms/DragReorderList.jsx": "DragReorderList.jsx",
    "frontend/src/components/cms/MediaPickerDialog.jsx": "MediaPickerDialog.jsx",
    "frontend/src/components/cms/SeoPreview.jsx": "SeoPreview.jsx",
    "frontend/src/pages/admin/ManageNavigation.jsx": "ManageNavigation.jsx",
    "frontend/src/App.jsx": "App.jsx",
    "frontend/src/navigation.js": "navigation (2).js",
    "frontend/src/pages/admin/ManageFooter.jsx": "ManageFooter.jsx",
    "frontend/src/pages/admin/ManageSeo.jsx": "ManageSeo.jsx",
    "frontend/package.json": "package.json",
}

def run_cmd(cmd, cwd=REPO_DIR):
    print(f"Running: {cmd} in {cwd}")
    subprocess.run(cmd, cwd=cwd, shell=True, check=True)

# 1. Apply Commits
commit_hashes = []
for commit in commits_data:
    # Copy files
    for file_path in commit["files"]:
        # Get the actual filename from the map if it exists
        mapped_name = FILE_MAP.get(file_path.replace("\\", "/"))
        
        if mapped_name:
            src = os.path.join(FILES_DIR, mapped_name)
        else:
            # Fallback to exact basename matching (case insensitive)
            base_name = os.path.basename(file_path).lower()
            src = None
            if os.path.exists(FILES_DIR):
                for f in os.listdir(FILES_DIR):
                    if f.lower() == base_name:
                        src = os.path.join(FILES_DIR, f)
                        break
        
        if not src or not os.path.exists(src):
            print(f"Warning: Source file not found for {file_path}, skipping copy.")
            continue
            
        # Normalize paths for Windows target
        dst = os.path.join(REPO_DIR, file_path.replace("/", "\\"))
        
        # Ensure dir exists
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        shutil.copy2(src, dst)
        print(f"Copied {src} to {dst}")
        
    # Check if package.json was changed
    package_json_changed = any(f.endswith("package.json") for f in commit["files"])
    if package_json_changed:
        for file_path in commit["files"]:
            if file_path.endswith("package.json"):
                # run npm install in the directory of package.json
                dir_path = os.path.join(REPO_DIR, os.path.dirname(file_path).replace("/", "\\"))
                print(f"Running npm install in {dir_path}")
                subprocess.run("npm install", cwd=dir_path, shell=True, check=True)

    # Stage files
    run_cmd("git add -A")
    
    # Commit
    msg_file = os.path.join(REPO_DIR, "temp_msg.txt")
    with open(msg_file, "w", encoding="utf-8") as f:
        f.write(commit["msg"])
    
    run_cmd(f'git commit -F temp_msg.txt')
    os.remove(msg_file)
    
    # get commit hash
    res = subprocess.run("git rev-parse HEAD", cwd=REPO_DIR, shell=True, capture_output=True, text=True)
    commit_hash = res.stdout.strip()
    commit_hashes.append(commit_hash)
    commit["hash"] = commit_hash

# 2. Iterate and create snapshots
for commit in commits_data:
    run_cmd(f'git checkout {commit["hash"]}')
    
    snapshot_dir = os.path.join(UPDATES_DIR, commit["snapshot"])
    os.makedirs(snapshot_dir, exist_ok=True)
    print(f"Creating snapshot {commit['snapshot']} at {snapshot_dir}")
    
    for root, dirs, files in os.walk(REPO_DIR):
        # Exclude directories
        dirs[:] = [d for d in dirs if d not in ['.git', 'node_modules']]
        
        rel_path = os.path.relpath(root, REPO_DIR)
        
        if rel_path == '.':
            target_dir = snapshot_dir
        else:
            target_dir = os.path.join(snapshot_dir, rel_path)
            os.makedirs(target_dir, exist_ok=True)
            
        for file in files:
            if file == "apply_commits.py":
                continue
            src_file = os.path.join(root, file)
            dst_file = os.path.join(target_dir, file)
            if os.path.exists(dst_file):
                os.chmod(dst_file, stat.S_IWRITE)
            shutil.copy2(src_file, dst_file)
            
    # Write commit.txt
    commit_txt_path = os.path.join(snapshot_dir, "commit.txt")
    with open(commit_txt_path, "w", encoding="utf-8") as f:
        f.write(commit["commit_txt"])
        
# 3. Clean up
run_cmd("git checkout main")
os.remove(os.path.join(REPO_DIR, "apply_commits.py"))
