#!/bin/bash
################################################################################
# DNS Auto-Activation System for GalleryPia
# 
# Purpose: Automatically monitor DNS propagation and activate custom domain
# Schedule: Run via cron every 10 minutes
# Notifications: Email/Slack when DNS becomes active
# 
# Usage:
#   1. Add to crontab: */10 * * * * /home/user/webapp/scripts/dns-auto-activate.sh
#   2. Configure environment variables in /home/user/webapp/.env
#   3. Monitor logs at /home/user/webapp/logs/dns-activation.log
################################################################################

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOG_FILE="$PROJECT_ROOT/logs/dns-activation.log"
STATE_FILE="$PROJECT_ROOT/.dns-state"
ENV_FILE="$PROJECT_ROOT/.env"

# Load environment variables
if [ -f "$ENV_FILE" ]; then
    source "$ENV_FILE"
else
    echo "ERROR: .env file not found at $ENV_FILE"
    exit 1
fi

# Required environment variables
: "${CLOUDFLARE_API_TOKEN:?Environment variable CLOUDFLARE_API_TOKEN is required}"
: "${CLOUDFLARE_ZONE_ID:?Environment variable CLOUDFLARE_ZONE_ID is required}"
: "${CLOUDFLARE_ACCOUNT_ID:?Environment variable CLOUDFLARE_ACCOUNT_ID is required}"
: "${PROJECT_NAME:?Environment variable PROJECT_NAME is required}"
: "${CUSTOM_DOMAIN:?Environment variable CUSTOM_DOMAIN is required}"

# Optional: Notification configuration
NOTIFICATION_EMAIL="${NOTIFICATION_EMAIL:-}"
SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"

# Ensure log directory exists
mkdir -p "$(dirname "$LOG_FILE")"

# Logging function
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" | tee -a "$LOG_FILE"
}

# Send email notification
send_email_notification() {
    local subject="$1"
    local body="$2"
    
    if [ -n "$NOTIFICATION_EMAIL" ]; then
        echo "$body" | mail -s "$subject" "$NOTIFICATION_EMAIL" 2>/dev/null || \
            log "WARN" "Failed to send email notification"
    fi
}

# Send Slack notification
send_slack_notification() {
    local message="$1"
    
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST "$SLACK_WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{\"text\":\"$message\"}" \
            2>/dev/null || log "WARN" "Failed to send Slack notification"
    fi
}

# Get current DNS zone status
get_zone_status() {
    curl -s "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" | jq -r '.result.status'
}

# Get current Pages domain status
get_pages_domain_status() {
    curl -s "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects/$PROJECT_NAME/domains" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" | \
        jq -r ".result[] | select(.name==\"$CUSTOM_DOMAIN\") | .status"
}

# Remove old deactivated domains
remove_deactivated_domains() {
    log "INFO" "Checking for deactivated domains to remove..."
    
    local domains=$(curl -s "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects/$PROJECT_NAME/domains" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json")
    
    local domain_ids=$(echo "$domains" | jq -r ".result[] | select(.name==\"$CUSTOM_DOMAIN\" and .status==\"deactivated\") | .id")
    
    if [ -n "$domain_ids" ]; then
        while IFS= read -r domain_id; do
            log "INFO" "Removing deactivated domain: $domain_id"
            curl -s -X DELETE "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects/$PROJECT_NAME/domains/$domain_id" \
                -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" > /dev/null
        done <<< "$domain_ids"
        
        log "INFO" "Deactivated domains removed successfully"
        return 0
    else
        log "INFO" "No deactivated domains found"
        return 1
    fi
}

# Add custom domain to Pages project
add_custom_domain() {
    log "INFO" "Adding custom domain $CUSTOM_DOMAIN to Pages project..."
    
    local result=$(curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects/$PROJECT_NAME/domains" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" \
        --data "{\"name\":\"$CUSTOM_DOMAIN\"}")
    
    local success=$(echo "$result" | jq -r '.success')
    
    if [ "$success" = "true" ]; then
        log "INFO" "✅ Custom domain added successfully"
        return 0
    else
        local error_message=$(echo "$result" | jq -r '.errors[0].message')
        log "ERROR" "❌ Failed to add custom domain: $error_message"
        return 1
    fi
}

# Verify domain accessibility
verify_domain_accessibility() {
    local domain="$1"
    local max_attempts=5
    local attempt=1
    
    log "INFO" "Verifying domain accessibility: https://$domain"
    
    while [ $attempt -le $max_attempts ]; do
        local http_code=$(curl -s -o /dev/null -w "%{http_code}" "https://$domain" 2>/dev/null || echo "000")
        
        if [ "$http_code" = "200" ]; then
            log "INFO" "✅ Domain is accessible (HTTP $http_code)"
            return 0
        else
            log "WARN" "Attempt $attempt/$max_attempts: HTTP $http_code (waiting 30s...)"
            sleep 30
            ((attempt++))
        fi
    done
    
    log "ERROR" "❌ Domain not accessible after $max_attempts attempts"
    return 1
}

# Main activation logic
main() {
    log "INFO" "=========================================="
    log "INFO" "DNS Auto-Activation Check Started"
    log "INFO" "=========================================="
    
    # Check current zone status
    local zone_status=$(get_zone_status)
    log "INFO" "Current zone status: $zone_status"
    
    # Read previous state
    local previous_state=""
    if [ -f "$STATE_FILE" ]; then
        previous_state=$(cat "$STATE_FILE")
    fi
    
    # Save current state
    echo "$zone_status" > "$STATE_FILE"
    
    if [ "$zone_status" = "active" ]; then
        log "INFO" "✅ DNS zone is ACTIVE!"
        
        # Check if this is a state transition
        if [ "$previous_state" != "active" ]; then
            log "INFO" "🎉 DNS just became active! Initiating domain activation..."
            
            # Remove old deactivated domains
            remove_deactivated_domains
            
            # Wait for cleanup to propagate
            sleep 5
            
            # Add custom domain
            if add_custom_domain; then
                log "INFO" "⏳ Waiting for SSL certificate provisioning (5-10 minutes)..."
                
                # Wait for SSL cert (check every 30 seconds for up to 15 minutes)
                local ssl_wait=0
                local ssl_max_wait=900  # 15 minutes
                
                while [ $ssl_wait -lt $ssl_max_wait ]; do
                    local domain_status=$(get_pages_domain_status)
                    log "INFO" "Domain status: $domain_status"
                    
                    if [ "$domain_status" = "active" ]; then
                        log "INFO" "✅ Domain is now ACTIVE!"
                        
                        # Verify accessibility
                        if verify_domain_accessibility "$CUSTOM_DOMAIN"; then
                            # Send success notifications
                            local success_message="🎉 GalleryPia Custom Domain Activated!\n\n✅ Domain: https://$CUSTOM_DOMAIN\n✅ SSL: Active\n✅ Status: Operational\n\nYour NFT platform is now live!"
                            
                            send_email_notification "✅ GalleryPia Domain Activated" "$success_message"
                            send_slack_notification "$success_message"
                            
                            log "INFO" "=========================================="
                            log "INFO" "🎉 ACTIVATION COMPLETE!"
                            log "INFO" "=========================================="
                            log "INFO" "Access your platform at: https://$CUSTOM_DOMAIN"
                            
                            # Update README automatically
                            if [ -f "$PROJECT_ROOT/README.md" ]; then
                                sed -i "s|⏳ DNS 전파 대기|✅ Active|g" "$PROJECT_ROOT/README.md"
                                log "INFO" "✅ README.md updated with active status"
                            fi
                            
                            return 0
                        fi
                    fi
                    
                    sleep 30
                    ((ssl_wait+=30))
                done
                
                log "WARN" "⚠️  SSL certificate not provisioned after 15 minutes (this is normal, may take up to 24 hours)"
            fi
        else
            log "INFO" "Zone already active, checking domain status..."
            local domain_status=$(get_pages_domain_status)
            
            if [ "$domain_status" = "active" ]; then
                log "INFO" "✅ Everything operational: https://$CUSTOM_DOMAIN"
            else
                log "INFO" "Domain status: $domain_status (SSL provisioning may still be in progress)"
            fi
        fi
        
    elif [ "$zone_status" = "moved" ]; then
        log "INFO" "⏳ DNS zone status: MOVED (awaiting nameserver propagation)"
        log "INFO" "📋 User action required:"
        log "INFO" "   1. Login to hosting.kr"
        log "INFO" "   2. Update nameservers to:"
        log "INFO" "      - amalia.ns.cloudflare.com"
        log "INFO" "      - sonny.ns.cloudflare.com"
        log "INFO" "   3. Wait 1-2 hours for propagation"
        
    elif [ "$zone_status" = "pending" ]; then
        log "INFO" "⏳ DNS zone status: PENDING (Cloudflare processing)"
        
    else
        log "ERROR" "⚠️  Unexpected zone status: $zone_status"
        log "ERROR" "Manual intervention may be required"
        log "ERROR" "Check Cloudflare dashboard: https://dash.cloudflare.com/$CLOUDFLARE_ZONE_ID"
    fi
    
    log "INFO" "=========================================="
    log "INFO" "Check complete. Next check in 10 minutes."
    log "INFO" "=========================================="
}

# Execute main function
main

exit 0
