#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
#  Google Cloud Scheduler Setup — READY TO RUN
#  Project: wafer-214c9
#  Region:  us-central1
#  Service: https://rukn-al-coupons-27124371790.us-central1.run.app
# ═══════════════════════════════════════════════════════════════════

set -e

PROJECT_ID="wafer-214c9"
REGION="us-central1"
SERVICE_URL="https://rukn-al-coupons-27124371790.us-central1.run.app"
SERVICE_NAME="rukn-al-coupons"
CRON_SECRET="GCPRuknAI2026SecureKey!xK9#mQ7z"
JOB_NAME="ai-heatmap-weekly-recalculate"
GCR_IMAGE="gcr.io/${PROJECT_ID}/rukn-al-coupons"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  GCP Setup — Project: $PROJECT_ID | Region: $REGION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Step 1: Set GCP project
echo ""
echo "[1/4] Setting GCP project..."
gcloud config set project $PROJECT_ID

# Step 2: Enable required APIs
echo ""
echo "[2/4] Enabling Cloud Scheduler API..."
gcloud services enable cloudscheduler.googleapis.com --project=$PROJECT_ID

# Step 3: Set CRON_SECRET as Cloud Run environment variable
echo ""
echo "[3/4] Setting CRON_SECRET on Cloud Run service..."
gcloud run services update $SERVICE_NAME \
    --region=$REGION \
    --update-env-vars="CRON_SECRET=${CRON_SECRET}" \
    --platform=managed

# Step 4: Create Cloud Scheduler job (or update if exists)
echo ""
echo "[4/4] Creating Cloud Scheduler cron job..."

# Delete if already exists (to allow re-running this script)
gcloud scheduler jobs delete $JOB_NAME --location=$REGION --quiet 2>/dev/null || true

gcloud scheduler jobs create http "$JOB_NAME" \
    --location="$REGION" \
    --schedule="0 3 * * 1" \
    --time-zone="UTC" \
    --uri="${SERVICE_URL}/api/heatmap/recalculate" \
    --http-method="POST" \
    --headers="Authorization=Bearer ${CRON_SECRET},Content-Type=application/json" \
    --message-body="{}" \
    --description="Weekly AI heatmap recalculation — every Monday 3AM UTC" \
    --attempt-deadline="300s"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ Setup complete!"
echo ""
echo "  Cron Job:  Every Monday at 3:00 AM UTC"
echo "  Endpoint:  ${SERVICE_URL}/api/heatmap/recalculate"
echo "  Secret:    ${CRON_SECRET}"
echo ""
echo "  Test the job now:"
echo "  gcloud scheduler jobs run ${JOB_NAME} --location=${REGION}"
echo ""
echo "  View logs:"
echo "  gcloud logging read 'resource.type=cloud_run_revision AND resource.labels.service_name=${SERVICE_NAME}' --limit=20 --format=json"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
