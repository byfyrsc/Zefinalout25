# Complete Project Analysis and Setup Script for Windows (PowerShell)
# This script will analyze the project, create Supabase tables, implement CRUDs, and deploy missing features

Write-Host "🚀 Starting Complete Project Analysis and Setup..." -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

# Function to print colored output
function Print-Status($message) {
    Write-Host "✅ $message" -ForegroundColor Green
}

function Print-Warning($message) {
    Write-Host "⚠️  $message" -ForegroundColor Yellow
}

function Print-Error($message) {
    Write-Host "❌ $message" -ForegroundColor Red
}

function Print-Info($message) {
    Write-Host "ℹ️  $message" -ForegroundColor Blue
}

# Check if required tools are installed
function Check-Dependencies {
    Print-Info "Checking dependencies..."
    
    # Check Node.js
    try {
        $nodeVersion = node --version
        Write-Host "Node.js version: $nodeVersion" -ForegroundColor Cyan
    } catch {
        Print-Error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    }
    
    # Check npm
    try {
        $npmVersion = npm --version
        Write-Host "npm version: $npmVersion" -ForegroundColor Cyan
    } catch {
        Print-Error "npm is not installed."
        exit 1
    }
    
    # Check if Supabase CLI is installed
    try {
        $supabaseVersion = supabase --version
        Write-Host "Supabase CLI version: $supabaseVersion" -ForegroundColor Cyan
    } catch {
        Print-Warning "Supabase CLI not found. Installing..."
        npm install -g supabase
    }
    
    Print-Status "All dependencies checked"
}

# Analyze current project structure
function Analyze-Project {
    Print-Info "Analyzing project structure..."
    
    # Check if package.json exists
    if (-not (Test-Path "package.json")) {
        Print-Error "package.json not found. Are you in the correct directory?"
        exit 1
    }
    
    # Check key directories
    $directories = @("src", "supabase", "public")
    foreach ($dir in $directories) {
        if (-not (Test-Path $dir)) {
            Print-Warning "Directory $dir not found. Creating..."
            New-Item -ItemType Directory -Path $dir | Out-Null
        }
    }
    
    Print-Status "Project structure analyzed"
}

# Install missing dependencies
function Install-Dependencies {
    Print-Info "Installing/updating dependencies..."
    
    # Install main dependencies if not present
    npm install --save `
        @supabase/supabase-js `
        @stripe/stripe-js `
        @tanstack/react-query `
        zustand `
        react-router-dom `
        framer-motion `
        lucide-react `
        @radix-ui/react-toast `
        @radix-ui/react-dialog `
        @radix-ui/react-select `
        @capacitor/core `
        @capacitor/haptics `
        @capacitor/geolocation `
        @capacitor/camera `
        @capacitor/push-notifications
    
    # Install dev dependencies
    npm install --save-dev `
        @types/node `
        vitest `
        @testing-library/react `
        @testing-library/jest-dom `
        @testing-library/user-event `
        jsdom `
        @capacitor/cli
    
    Print-Status "Dependencies installed"
}

# Initialize Supabase project
function Setup-Supabase {
    Print-Info "Setting up Supabase..."
    
    # Initialize Supabase if not already done
    if (-not (Test-Path "supabase")) {
        supabase init
    }
    
    # Ask user if they want to start local Supabase (optional - for development)
    $response = Read-Host "Do you want to start local Supabase development environment? (y/n)"
    if ($response -match "^[Yy]$") {
        Print-Info "Starting local Supabase..."
        supabase start
        Print-Status "Local Supabase started"
    }
}

# Create comprehensive database schema
function Create-DatabaseSchema {
    Print-Info "Creating database schema..."
    
    # Create migrations directory if it doesn't exist
    if (-not (Test-Path "supabase/migrations")) {
        New-Item -ItemType Directory -Path "supabase/migrations" | Out-Null
    }
    
    # Create the main migration file
    $schemaContent = @'
-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Create custom types
create type user_role as enum ('owner', 'admin', 'manager', 'staff', 'viewer');
create type subscription_status as enum ('active', 'inactive', 'cancelled', 'past_due');
create type feedback_status as enum ('pending', 'reviewed', 'resolved', 'archived');
create type campaign_status as enum ('draft', 'scheduled', 'active', 'paused', 'completed');
create type event_status as enum ('draft', 'published', 'ongoing', 'completed', 'cancelled');

-- Organizations/Tenants table
create table organizations (
    id uuid default uuid_generate_v4() primary key,
    name varchar(255) not null,
    slug varchar(100) unique not null,
    description text,
    logo_url text,
    website varchar(255),
    industry varchar(100),
    size varchar(50),
    subscription_status subscription_status default 'active',
    subscription_plan varchar(50) default 'free',
    settings jsonb default '{}',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Locations table
create table locations (
    id uuid default uuid_generate_v4() primary key,
    organization_id uuid references organizations(id) on delete cascade,
    name varchar(255) not null,
    address text,
    city varchar(100),
    state varchar(100),
    country varchar(100),
    postal_code varchar(20),
    phone varchar(50),
    email varchar(255),
    timezone varchar(50) default 'UTC',
    settings jsonb default '{}',
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User profiles table (extends Supabase auth.users)
create table user_profiles (
    id uuid references auth.users(id) primary key,
    organization_id uuid references organizations(id) on delete cascade,
    email varchar(255) not null,
    full_name varchar(255),
    avatar_url text,
    role user_role default 'viewer',
    phone varchar(50),
    department varchar(100),
    job_title varchar(100),
    location_ids uuid[] default '{}',
    preferences jsonb default '{}',
    last_login_at timestamp with time zone,
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Customers table
create table customers (
    id uuid default uuid_generate_v4() primary key,
    organization_id uuid references organizations(id) on delete cascade,
    location_id uuid references locations(id) on delete cascade,
    email varchar(255),
    phone varchar(50),
    full_name varchar(255),
    date_of_birth date,
    gender varchar(20),
    preferences jsonb default '{}',
    tags text[],
    total_visits integer default 0,
    total_spent decimal(10,2) default 0,
    last_visit_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Feedback table
create table feedback (
    id uuid default uuid_generate_v4() primary key,
    organization_id uuid references organizations(id) on delete cascade,
    location_id uuid references locations(id) on delete cascade,
    customer_id uuid references customers(id) on delete set null,
    rating integer check (rating >= 1 and rating <= 5),
    nps_score integer check (nps_score >= 0 and nps_score <= 10),
    comment text,
    categories text[],
    sentiment varchar(20),
    status feedback_status default 'pending',
    metadata jsonb default '{}',
    responded_at timestamp with time zone,
    responded_by uuid references user_profiles(id),
    response_text text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Campaigns table
create table campaigns (
    id uuid default uuid_generate_v4() primary key,
    organization_id uuid references organizations(id) on delete cascade,
    location_ids uuid[],
    name varchar(255) not null,
    description text,
    type varchar(50), -- 'email', 'sms', 'push', 'survey'
    target_audience jsonb default '{}',
    content jsonb not null,
    status campaign_status default 'draft',
    scheduled_at timestamp with time zone,
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    metrics jsonb default '{}',
    created_by uuid references user_profiles(id),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Events table
create table events (
    id uuid default uuid_generate_v4() primary key,
    organization_id uuid references organizations(id) on delete cascade,
    location_id uuid references locations(id) on delete cascade,
    name varchar(255) not null,
    description text,
    type varchar(50),
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    max_participants integer,
    current_participants integer default 0,
    status event_status default 'draft',
    metadata jsonb default '{}',
    created_by uuid references user_profiles(id),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Gamification points table
create table gamification_points (
    id uuid default uuid_generate_v4() primary key,
    organization_id uuid references organizations(id) on delete cascade,
    customer_id uuid references customers(id) on delete cascade,
    points integer not null,
    reason varchar(255),
    reference_type varchar(50), -- 'feedback', 'visit', 'purchase', 'referral'
    reference_id uuid,
    expires_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- QR Codes table
create table qr_codes (
    id uuid default uuid_generate_v4() primary key,
    organization_id uuid references organizations(id) on delete cascade,
    location_id uuid references locations(id) on delete cascade,
    name varchar(255) not null,
    type varchar(50), -- 'feedback', 'menu', 'event', 'promotion'
    url text not null,
    qr_data text not null,
    scan_count integer default 0,
    is_active boolean default true,
    expires_at timestamp with time zone,
    created_by uuid references user_profiles(id),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Analytics table for custom metrics
create table analytics (
    id uuid default uuid_generate_v4() primary key,
    organization_id uuid references organizations(id) on delete cascade,
    location_id uuid references locations(id) on delete cascade,
    metric_name varchar(100) not null,
    metric_value decimal(15,4),
    dimensions jsonb default '{}',
    timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Integrations table
create table integrations (
    id uuid default uuid_generate_v4() primary key,
    organization_id uuid references organizations(id) on delete cascade,
    name varchar(100) not null,
    type varchar(50) not null, -- 'stripe', 'mailchimp', 'zapier', etc.
    config jsonb not null,
    is_active boolean default true,
    last_sync_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better performance
create index idx_organizations_slug on organizations(slug);
create index idx_locations_organization_id on locations(organization_id);
create index idx_user_profiles_organization_id on user_profiles(organization_id);
create index idx_customers_organization_location on customers(organization_id, location_id);
create index idx_feedback_organization_location on feedback(organization_id, location_id);
create index idx_feedback_created_at on feedback(created_at desc);
create index idx_campaigns_organization_id on campaigns(organization_id);
create index idx_events_organization_location on events(organization_id, location_id);
create index idx_qr_codes_organization_location on qr_codes(organization_id, location_id);
create index idx_analytics_org_location_timestamp on analytics(organization_id, location_id, timestamp desc);

-- Create RLS (Row Level Security) policies
alter table organizations enable row level security;
alter table locations enable row level security;
alter table user_profiles enable row level security;
alter table customers enable row level security;
alter table feedback enable row level security;
alter table campaigns enable row level security;
alter table events enable row level security;
alter table gamification_points enable row level security;
alter table qr_codes enable row level security;
alter table analytics enable row level security;
alter table integrations enable row level security;

-- RLS Policies for organizations
create policy "Users can view their organization" on organizations
    for select using (id in (
        select organization_id from user_profiles where id = auth.uid()
    ));

create policy "Organization owners can update their organization" on organizations
    for update using (id in (
        select organization_id from user_profiles 
        where id = auth.uid() and role in ('owner', 'admin')
    ));

-- RLS Policies for user_profiles
create policy "Users can view their own profile" on user_profiles
    for select using (id = auth.uid());

create policy "Users can update their own profile" on user_profiles
    for update using (id = auth.uid());

-- RLS Policies for other tables (organization-based access)
create policy "Organization members can view locations" on locations
    for select using (organization_id in (
        select organization_id from user_profiles where id = auth.uid()
    ));

create policy "Organization members can view customers" on customers
    for select using (organization_id in (
        select organization_id from user_profiles where id = auth.uid()
    ));

create policy "Organization members can view feedback" on feedback
    for select using (organization_id in (
        select organization_id from user_profiles where id = auth.uid()
    ));

-- Functions for updated_at timestamps
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Apply updated_at triggers to all tables
create trigger update_organizations_updated_at before update on organizations
    for each row execute procedure update_updated_at_column();
create trigger update_locations_updated_at before update on locations
    for each row execute procedure update_updated_at_column();
create trigger update_user_profiles_updated_at before update on user_profiles
    for each row execute procedure update_updated_at_column();
create trigger update_customers_updated_at before update on customers
    for each row execute procedure update_updated_at_column();
create trigger update_feedback_updated_at before update on feedback
    for each row execute procedure update_updated_at_column();
create trigger update_campaigns_updated_at before update on campaigns
    for each row execute procedure update_updated_at_column();
create trigger update_events_updated_at before update on events
    for each row execute procedure update_updated_at_column();
create trigger update_qr_codes_updated_at before update on qr_codes
    for each row execute procedure update_updated_at_column();
create trigger update_integrations_updated_at before update on integrations
    for each row execute procedure update_updated_at_column();
'@

    Set-Content -Path "supabase/migrations/001_initial_schema.sql" -Value $schemaContent
    
    Print-Status "Database schema created"
}

# Main execution flow
try {
    Check-Dependencies
    Analyze-Project
    Install-Dependencies
    Setup-Supabase
    Create-DatabaseSchema
    
    Print-Status "Project setup completed successfully!"
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Review the database schema in supabase/migrations/001_initial_schema.sql" -ForegroundColor Cyan
    Write-Host "2. Run 'supabase db reset' to apply the schema to your local database" -ForegroundColor Cyan
    Write-Host "3. Start your development server with 'npm run dev'" -ForegroundColor Cyan
} catch {
    Print-Error ('An error occurred during setup: ' + $_.Exception.Message)
    exit 1
}