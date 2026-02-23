#!/bin/bash
# Rollback script for Accessibility Hardening (WCAG 2.1 AA)

echo "Starting rollback of Accessibility Hardening changes..."

# Check if git is available
if ! command -v git &> /dev/null
then
    echo "git could not be found. Please ensure git is installed and you are in a git repository."
    exit 1
fi

# The commit hash or tag before the accessibility changes would typically be used here.
# Assuming the user created a backup branch or the changes haven't been committed,
# we can use git restore to revert uncommitted changes to the following files:

files_to_restore=(
    "src/app/(public)/[country]/blog/page.tsx"
    "src/app/(public)/[country]/blog/[slug]/page.tsx"
    "src/app/(public)/[country]/coupons/page.tsx"
    "src/app/(public)/[country]/page.tsx"
    "src/app/admin/layout.tsx"
    "src/app/admin/page.tsx"
    "src/app/login/page.tsx"
    "src/app/admin/analytics/page.tsx"
    "src/components/CouponCardServer.tsx"
    "src/components/CouponsClient.tsx"
    "src/components/Header.tsx"
    "src/components/HomeClient.tsx"
    "src/components/Sidebar.tsx"
    "src/components/StoresClient.tsx"
    "src/app/layout.tsx"
    "src/app/globals.css"
)

for file in "${files_to_restore[@]}"; do
    if [ -f "$file" ]; then
        echo "Reverting changes in $file..."
        git checkout -- "$file" || echo "Failed to revert $file using git checkout. File might not be version controlled."
    else
        echo "File $file not found. Skipping..."
    fi
done

echo ""
echo "Rollback complete."
echo "If the changes were already committed, please use 'git revert <commit-hash>' instead."
