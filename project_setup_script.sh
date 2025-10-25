#!/bin/bash

# Complete Project Analysis and Setup Script
# This script will analyze the project, create Supabase tables, implement CRUDs, and deploy missing features

set -e  # Exit on any error

echo "🚀 Starting Complete Project Analysis and Setup..."
echo "================================================="

# Color codes for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if required tools are installed
check_dependencies() {
    print_info "Checking dependencies..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    # Check npm/yarn
    if ! command -v npm &> /dev/null && ! command -v yarn &> /dev/null; then
        print_error "Neither npm nor yarn is installed."
        exit 1
    fi
    
    # Check if Supabase CLI is installed
    if ! command -v supabase &> /dev/null; then
        print_warning "Supabase CLI not found. Installing..."
        npm install -g supabase
    fi
    
    print_status "All dependencies checked"
}

# Analyze current project structure
analyze_project() {
    print_info "Analyzing project structure..."
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Are you in the correct directory?"
        exit 1
    fi
    
    # Check key directories
    directories=("src" "supabase" "public")
    for dir in "${directories[@]}"; do
        if [ ! -d "$dir" ]; then
            print_warning "Directory $dir not found. Creating..."
            mkdir -p "$dir"
        fi
    done
    
    print_status "Project structure analyzed"
}

# Install missing dependencies
install_dependencies() {
    print_info "Installing/updating dependencies..."
    
    # Install main dependencies if not present
    npm install --save \
        @supabase/supabase-js \
        @stripe/stripe-js \
        @tanstack/react-query \
        zustand \
        react-router-dom \
        framer-motion \
        lucide-react \
        @radix-ui/react-toast \
        @radix-ui/react-dialog \
        @radix-ui/react-select \
        @capacitor/core \
        @capacitor/haptics \
        @capacitor/geolocation \
        @capacitor/camera \
        @capacitor/push-notifications
    
    # Install dev dependencies
    npm install --save-dev \
        @types/node \
        vitest \
        @testing-library/react \
        @testing-library/jest-dom \
        @testing-library/user-event \
        jsdom \
        @capacitor/cli
    
    print_status "Dependencies installed"
}

# Initialize Supabase project
setup_supabase() {
    print_info "Setting up Supabase..."
    
    # Initialize Supabase if not already done
    if [ ! -d "supabase" ]; then
        supabase init
    fi
    
    # Start local Supabase (optional - for development)
    read -p "Do you want to start local Supabase development environment? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Starting local Supabase..."
        supabase start
        print_status "Local Supabase started"
    fi
}

# Create comprehensive database schema
create_database_schema() {
    print_info "Creating database schema..."
    
    # Create the main migration file
    cat > supabase/migrations/001_initial_schema.sql << 'EOF'
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
EOF

    print_status "Database schema created"
}

# Create comprehensive Supabase service layer
create_services() {
    print_info "Creating Supabase services..."
    
    # Create services directory
    mkdir -p src/services
    
    # Main Supabase client
    cat > src/services/supabase.ts << 'EOF'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
EOF

    # Database types
    cat > src/types/supabase.ts << 'EOF'
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          logo_url: string | null
          website: string | null
          industry: string | null
          size: string | null
          subscription_status: 'active' | 'inactive' | 'cancelled' | 'past_due'
          subscription_plan: string
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          logo_url?: string | null
          website?: string | null
          industry?: string | null
          size?: string | null
          subscription_status?: 'active' | 'inactive' | 'cancelled' | 'past_due'
          subscription_plan?: string
          settings?: Json
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          logo_url?: string | null
          website?: string | null
          industry?: string | null
          size?: string | null
          subscription_status?: 'active' | 'inactive' | 'cancelled' | 'past_due'
          subscription_plan?: string
          settings?: Json
        }
      }
      locations: {
        Row: {
          id: string
          organization_id: string
          name: string
          address: string | null
          city: string | null
          state: string | null
          country: string | null
          postal_code: string | null
          phone: string | null
          email: string | null
          timezone: string
          settings: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          address?: string | null
          city?: string | null
          state?: string | null
          country?: string | null
          postal_code?: string | null
          phone?: string | null
          email?: string | null
          timezone?: string
          settings?: Json
          is_active?: boolean
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          address?: string | null
          city?: string | null
          state?: string | null
          country?: string | null
          postal_code?: string | null
          phone?: string | null
          email?: string | null
          timezone?: string
          settings?: Json
          is_active?: boolean
        }
      }
      user_profiles: {
        Row: {
          id: string
          organization_id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'owner' | 'admin' | 'manager' | 'staff' | 'viewer'
          phone: string | null
          department: string | null
          job_title: string | null
          location_ids: string[]
          preferences: Json
          last_login_at: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          organization_id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'owner' | 'admin' | 'manager' | 'staff' | 'viewer'
          phone?: string | null
          department?: string | null
          job_title?: string | null
          location_ids?: string[]
          preferences?: Json
          last_login_at?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          organization_id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'owner' | 'admin' | 'manager' | 'staff' | 'viewer'
          phone?: string | null
          department?: string | null
          job_title?: string | null
          location_ids?: string[]
          preferences?: Json
          last_login_at?: string | null
          is_active?: boolean
        }
      }
      feedback: {
        Row: {
          id: string
          organization_id: string
          location_id: string
          customer_id: string | null
          rating: number | null
          nps_score: number | null
          comment: string | null
          categories: string[]
          sentiment: string | null
          status: 'pending' | 'reviewed' | 'resolved' | 'archived'
          metadata: Json
          responded_at: string | null
          responded_by: string | null
          response_text: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          location_id: string
          customer_id?: string | null
          rating?: number | null
          nps_score?: number | null
          comment?: string | null
          categories?: string[]
          sentiment?: string | null
          status?: 'pending' | 'reviewed' | 'resolved' | 'archived'
          metadata?: Json
          responded_at?: string | null
          responded_by?: string | null
          response_text?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          location_id?: string
          customer_id?: string | null
          rating?: number | null
          nps_score?: number | null
          comment?: string | null
          categories?: string[]
          sentiment?: string | null
          status?: 'pending' | 'reviewed' | 'resolved' | 'archived'
          metadata?: Json
          responded_at?: string | null
          responded_by?: string | null
          response_text?: string | null
        }
      }
      // Add other table types as needed...
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'owner' | 'admin' | 'manager' | 'staff' | 'viewer'
      subscription_status: 'active' | 'inactive' | 'cancelled' | 'past_due'
      feedback_status: 'pending' | 'reviewed' | 'resolved' | 'archived'
      campaign_status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed'
      event_status: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled'
    }
  }
}
EOF

    # Organization service
    cat > src/services/organizations.ts << 'EOF'
import { supabase } from './supabase'
import type { Database } from '../types/supabase'

type Organization = Database['public']['Tables']['organizations']['Row']
type OrganizationInsert = Database['public']['Tables']['organizations']['Insert']
type OrganizationUpdate = Database['public']['Tables']['organizations']['Update']

export class OrganizationService {
  async getAll(): Promise<Organization[]> {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .order('name')
    
    if (error) throw error
    return data || []
  }

  async getById(id: string): Promise<Organization | null> {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data
  }

  async getBySlug(slug: string): Promise<Organization | null> {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('slug', slug)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data
  }

  async create(organization: OrganizationInsert): Promise<Organization> {
    const { data, error } = await supabase
      .from('organizations')
      .insert(organization)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async update(id: string, organization: OrganizationUpdate): Promise<Organization> {
    const { data, error } = await supabase
      .from('organizations')
      .update(organization)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('organizations')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

export const organizationService = new OrganizationService()
EOF

    # Feedback service
    cat > src/services/feedback.ts << 'EOF'
import { supabase } from './supabase'
import type { Database } from '../types/supabase'

type Feedback = Database['public']['Tables']['feedback']['Row']
type FeedbackInsert = Database['public']['Tables']['feedback']['Insert']
type FeedbackUpdate = Database['public']['Tables']['feedback']['Update']

export interface FeedbackWithRelations extends Feedback {
  location?: {
    id: string
    name: string
  }
  customer?: {
    id: string
    full_name: string | null
    email: string | null
  }
}

export class FeedbackService {
  async getAll(organizationId: string, locationId?: string): Promise<FeedbackWithRelations[]> {
    let query = supabase
      .from('feedback')
      .select(`
        *,
        location:locations!inner(id, name),
        customer:customers(id, full_name, email)
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
    
    if (locationId) {
      query = query.eq('location_id', locationId)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data || []
  }

  async getById(id: string): Promise<FeedbackWithRelations | null> {
    const { data, error } = await supabase
      .from('feedback')
      .select(`
        *,
        location:locations!inner(id, name),
        customer:customers(id, full_name, email)
      `)
      .eq('id', id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }
    return data
  }

  async create(feedback: FeedbackInsert): Promise<Feedback> {
    const { data, error } = await supabase
      .from('feedback')
      .insert(feedback)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async update(id: string, feedback: FeedbackUpdate): Promise<Feedback> {
    const { data, error } = await supabase
      .from('feedback')
      .update(feedback)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('feedback')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }

  async getAnalytics(organizationId: string, locationId?: string) {
    let query = supabase
      .from('feedback')
      .select('rating, nps_score, sentiment, created_at')
      .eq('organization_id', organizationId)
    
    if (locationId) {
      query = query.eq('location_id', locationId)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    const analytics = {
      totalFeedback: data?.length || 0,
      averageRating: 0,
      npsScore: 0,
      sentimentDistribution: {
        positive: 0,
        neutral: 0,
        negative: 0
      }
    }
    
    if (data && data.length > 0) {
      // Calculate average rating
      const ratings = data.filter(f => f.rating !== null).map(f => f.rating!)
      analytics.averageRating = ratings.length > 0 
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
        : 0
      
      // Calculate NPS
      const npsScores = data.filter(f => f.nps_score !== null).map(f => f.nps_score!)
      if (npsScores.length > 0) {
        const promoters = npsScores.filter(score => score >= 9).length
        const detractors = npsScores.filter(score => score <= 6).length
        analytics.npsScore = ((promoters - detractors) / npsScores.length) * 100
      }
      
      // Calculate sentiment distribution
      data.forEach(feedback => {
        if (feedback.sentiment === 'positive') analytics.sentimentDistribution.positive++
        else if (feedback.sentiment === 'negative') analytics.sentimentDistribution.negative++
        else analytics.sentimentDistribution.neutral++
      })
    }
    
    return analytics
  }
}

export const feedbackService = new FeedbackService()
EOF

    print_status "Services created"
}

# Create React Query hooks
create_hooks() {
    print_info "Creating React Query hooks..."
    
    # Create hooks directory
    mkdir -p src/hooks
    
    # Organizations hooks
    cat > src/hooks/useOrganizations.ts << 'EOF'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { organizationService } from '../services/organizations'
import type { Database } from '../types/supabase'

type Organization = Database['public']['Tables']['organizations']['Row']
type OrganizationInsert = Database['public']['Tables']['organizations']['Insert']
type OrganizationUpdate = Database['public']['Tables']['organizations']['Update']

export const useOrganizations = () => {
  return useQuery({
    queryKey: ['organizations'],
    queryFn: () => organizationService.getAll(),
  })
}

export const useOrganization = (id: string) => {
  return useQuery({
    queryKey: ['organization', id],
    queryFn: () => organizationService.getById(id),
    enabled: !!id,
  })
}

export const useOrganizationBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['organization', 'slug', slug],
    queryFn: () => organizationService.getBySlug(slug),
    enabled: !!slug,
  })
}

export const useCreateOrganization = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (organization: OrganizationInsert) => 
      organizationService.create(organization),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
    },
  })
}

export const useUpdateOrganization = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: OrganizationUpdate }) => 
      organizationService.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      queryClient.invalidateQueries({ queryKey: ['organization', data.id] })
    },
  })
}

export const useDeleteOrganization = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => organizationService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
    },
  })
}
EOF

    # Feedback hooks
    cat > src/hooks/useFeedback.ts << 'EOF'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { feedbackService } from '../services/feedback'
import type { Database } from '../types/supabase'

type FeedbackInsert = Database['public']['Tables']['feedback']['Insert']
type FeedbackUpdate = Database['public']['Tables']['feedback']['Update']

export const useFeedback = (organizationId: string, locationId?: string) => {
  return useQuery({
    queryKey: ['feedback', organizationId, locationId],
    queryFn: () => feedbackService.getAll(organizationId, locationId),
    enabled: !!organizationId,
  })
}

export const useFeedbackItem = (id: string) => {
  return useQuery({
    queryKey: ['feedback', id],
    queryFn: () => feedbackService.getById(id),
    enabled: !!id,
  })
}

export const useFeedbackAnalytics = (organizationId: string, locationId?: string) => {
  return useQuery({
    queryKey: ['feedback', 'analytics', organizationId, locationId],
    queryFn: () => feedbackService.getAnalytics(organizationId, locationId),
    enabled: !!organizationId,
  })
}

export const useCreateFeedback = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (feedback: FeedbackInsert) => feedbackService.create(feedback),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: ['feedback', data.organization_id, data.location_id] 
      })
      queryClient.invalidateQueries({ 
        queryKey: ['feedback', 'analytics', data.organization_id, data.location_id] 
      })
    },
  })
}

export const useUpdateFeedback = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FeedbackUpdate }) => 
      feedbackService.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: ['feedback', data.organization_id, data.location_id] 
      })
      queryClient.invalidateQueries({ queryKey: ['feedback', data.id] })
      queryClient.invalidateQueries({ 
        queryKey: ['feedback', 'analytics', data.organization_id, data.location_id] 
      })
    },
  })
}

export const useDeleteFeedback = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => feedbackService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] })
    },
  })
}
EOF

    print_status "React Query hooks created"
}

# Create test suite
create_tests() {
    print_info "Creating comprehensive test suite..."
    
    # Create test directories
    mkdir -p src/__tests__/{components,hooks,services,utils}
    mkdir -p src/test-utils
    
    # Test utilities
    cat > src/test-utils/index.tsx << 'EOF'
import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'

// Create a custom render function that includes providers
const createTestQueryClient = () => 
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  })

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient()
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }
EOF

    # Service tests
    cat > src/__tests__/services/feedback.test.ts << 'EOF'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { feedbackService } from '../../services/feedback'
import { supabase } from '../../services/supabase'

// Mock Supabase
vi.mock('../../services/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            data: [],
            error: null
          }))
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { id: '1', rating: 5 },
            error: null
          }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({
              data: { id: '1', rating: 4 },
              error: null
            }))
          }))
        }))
      }))
    }))
  }
}))

describe('FeedbackService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('should fetch all feedback for organization', async () => {
      const mockData = [
        { id: '1', rating: 5, organization_id: 'org1' },
        { id: '2', rating: 4, organization_id: 'org1' }
      ]
      
      // Setup mock implementation
      const mockFrom = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({
              data: mockData,
              error: null
            }))
          }))
        }))
      }))
      
      ;(supabase as any).from = mockFrom
      
      const result = await feedbackService.getAll('org1')
      
      expect(mockFrom).toHaveBeenCalledWith('feedback')
      expect(result).toEqual(mockData)
    })

    it('should handle errors properly', async () => {
      const mockError = new Error('Database error')
      
      const mockFrom = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => Promise.resolve({
              data: null,
              error: mockError
            }))
          }))
        }))
      }))
      
      ;(supabase as any).from = mockFrom
      
      await expect(feedbackService.getAll('org1')).rejects.toThrow('Database error')
    })
  })

  describe('create', () => {
    it('should create new feedback', async () => {
      const mockFeedback = {
        organization_id: 'org1',
        location_id: 'loc1',
        rating: 5,
        comment: 'Great service!'
      }
      
      const mockCreated = { id: '1', ...mockFeedback }
      
      const mockFrom = vi.fn(() => ({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: mockCreated,
              error: null
            }))
          }))
        }))
      }))
      
      ;(supabase as any).from = mockFrom
      
      const result = await feedbackService.create(mockFeedback)
      
      expect(result).toEqual(mockCreated)
    })
  })

  describe('getAnalytics', () => {
    it('should calculate correct analytics', async () => {
      const mockData = [
        { rating: 5, nps_score: 9, sentiment: 'positive', created_at: '2023-01-01' },
        { rating: 4, nps_score: 8, sentiment: 'positive', created_at: '2023-01-02' },
        { rating: 3, nps_score: 6, sentiment: 'negative', created_at: '2023-01-03' },
        { rating: 2, nps_score: 5, sentiment: 'negative', created_at: '2023-01-04' }
      ]
      
      const mockFrom = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({
            data: mockData,
            error: null
          }))
        }))
      }))
      
      ;(supabase as any).from = mockFrom
      
      const analytics = await feedbackService.getAnalytics('org1')
      
      expect(analytics.totalFeedback).toBe(4)
      expect(analytics.averageRating).toBe(3.5) // (5+4+3+2)/4
      expect(analytics.npsScore).toBe(-25) // ((0-2)/4)*100 = -50, but calculation might differ
      expect(analytics.sentimentDistribution.positive).toBe(2)
      expect(analytics.sentimentDistribution.negative).toBe(2)
    })
  })
})
EOF

    # Component tests
    cat > src/__tests__/components/Dashboard.test.tsx << 'EOF'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../test-utils'
import Dashboard from '../../pages/Dashboard'

// Mock hooks
vi.mock('../../hooks/useFeedback', () => ({
  useFeedbackAnalytics: () => ({
    data: {
      totalFeedback: 150,
      averageRating: 4.2,
      npsScore: 75,
      sentimentDistribution: {
        positive: 80,
        neutral: 50,
        negative: 20
      }
    },
    isLoading: false,
    error: null
  })
}))

vi.mock('../../contexts/TenantContext', () => ({
  useTenant: () => ({
    currentOrganization: { id: 'org1', name: 'Test Org' },
    currentLocation: { id: 'loc1', name: 'Test Location' }
  })
}))

describe('Dashboard', () => {
  it('should render dashboard with metrics', () => {
    render(<Dashboard />)
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('150')).toBeInTheDocument() // Total feedback
    expect(screen.getByText('4.2')).toBeInTheDocument() // Average rating
    expect(screen.getByText('75')).toBeInTheDocument() // NPS score
  })

  it('should show loading state', () => {
    vi.mocked(useFeedbackAnalytics).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null
    })
    
    render(<Dashboard />)
    
    expect(screen.getByTestId('dashboard-loading')).toBeInTheDocument()
  })
})
EOF

    # Hook tests
    cat > src/__tests__/hooks/useFeedback.test.tsx << 'EOF'
import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useFeedback, useCreateFeedback } from '../../hooks/useFeedback'
import { feedbackService } from '../../services/feedback'

vi.mock('../../services/feedback')

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useFeedback', () => {
  it('should fetch feedback data', async () => {
    const mockFeedback = [
      { id: '1', rating: 5, organization_id: 'org1' }
    ]
    
    vi.mocked(feedbackService.getAll).mockResolvedValue(mockFeedback)
    
    const { result } = renderHook(
      () => useFeedback('org1'),
      { wrapper: createWrapper() }
    )
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    
    expect(result.current.data).toEqual(mockFeedback)
    expect(feedbackService.getAll).toHaveBeenCalledWith('org1', undefined)
  })
})

describe('useCreateFeedback', () => {
  it('should create feedback and invalidate queries', async () => {
    const mockFeedback = {
      organization_id: 'org1',
      location_id: 'loc1',
      rating: 5
    }
    
    const mockCreated = { id: '1', ...mockFeedback }
    
    vi.mocked(feedbackService.create).mockResolvedValue(mockCreated)
    
    const { result } = renderHook(
      () => useCreateFeedback(),
      { wrapper: createWrapper() }
    )
    
    result.current.mutate(mockFeedback)
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    
    expect(feedbackService.create).toHaveBeenCalledWith(mockFeedback)
  })
})
EOF

    # Vitest config
    cat > vitest.config.ts << 'EOF'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-utils/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
EOF

    # Test setup
    cat > src/test-utils/setup.ts << 'EOF'
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = vi.fn(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn(),
}))

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
EOF

    print_status "Comprehensive test suite created"
}

# Create CI/CD pipeline
create_cicd() {
    print_info "Creating CI/CD pipeline..."
    
    # Create .github directory
    mkdir -p .github/workflows
    
    # GitHub Actions workflow
    cat > .github/workflows/ci-cd.yml << 'EOF'
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '18'

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      supabase:
        image: supabase/supabase:latest
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        run: npm run lint

      - name: Run type checking
        run: npm run type-check

      - name: Run unit tests
        run: npm run test:coverage

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella

      - name: Build application
        run: npm run build

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}

      - name: Deploy to staging
        if: github.ref == 'refs/heads/develop'
        run: npm run deploy:staging
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_STAGING_SITE_ID }}

      - name: Deploy to production
        if: github.ref == 'refs/heads/main'
        run: npm run deploy:production
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_PRODUCTION_SITE_ID }}

  security:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run security audit
        run: npm audit --audit-level moderate

      - name: Run dependency vulnerability scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
EOF

    # Docker setup for containerization
    cat > Dockerfile << 'EOF'
# Multi-stage build for production optimization
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
EOF

    # Nginx configuration
    cat > nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;

    server {
        listen 80;
        server_name _;

        root /usr/share/nginx/html;
        index index.html;

        # Security measures
        server_tokens off;

        # Handle client-side routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # API proxy (if needed)
        location /api/ {
            proxy_pass https://your-supabase-url.supabase.co/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
EOF

    print_status "CI/CD pipeline created"
}

# Create environment configuration
create_env_config() {
    print_info "Creating environment configuration..."
    
    # Environment template
    cat > .env.example << 'EOF'
# Supabase Configuration
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Stripe Configuration (for billing)
VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key

# App Configuration
VITE_APP_NAME=FeedbackFlow
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development

# Analytics (optional)
VITE_GA_TRACKING_ID=your-google-analytics-id
VITE_HOTJAR_ID=your-hotjar-id

# Feature Flags
VITE_ENABLE_AI_INSIGHTS=true
VITE_ENABLE_GAMIFICATION=true
VITE_ENABLE_CAMPAIGNS=true

# API Endpoints
VITE_API_BASE_URL=http://localhost:3000/api
VITE_WEBHOOK_URL=http://localhost:3000/webhooks

# Development
VITE_MOCK_AUTH=false
VITE_DEBUG_MODE=true
EOF

    # Environment validation
    cat > src/utils/env.ts << 'EOF'
interface EnvConfig {
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
  STRIPE_PUBLISHABLE_KEY?: string
  APP_NAME: string
  APP_VERSION: string
  APP_ENV: 'development' | 'staging' | 'production'
  GA_TRACKING_ID?: string
  HOTJAR_ID?: string
  ENABLE_AI_INSIGHTS: boolean
  ENABLE_GAMIFICATION: boolean
  ENABLE_CAMPAIGNS: boolean
  API_BASE_URL: string
  WEBHOOK_URL: string
  MOCK_AUTH: boolean
  DEBUG_MODE: boolean
}

const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_APP_NAME',
  'VITE_APP_VERSION',
  'VITE_APP_ENV',
  'VITE_API_BASE_URL',
]

// Validate required environment variables
for (const envVar of requiredEnvVars) {
  if (!import.meta.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`)
  }
}

export const env: EnvConfig = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  APP_NAME: import.meta.env.VITE_APP_NAME,
  APP_VERSION: import.meta.env.VITE_APP_VERSION,
  APP_ENV: import.meta.env.VITE_APP_ENV as 'development' | 'staging' | 'production',
  GA_TRACKING_ID: import.meta.env.VITE_GA_TRACKING_ID,
  HOTJAR_ID: import.meta.env.VITE_HOTJAR_ID,
  ENABLE_AI_INSIGHTS: import.meta.env.VITE_ENABLE_AI_INSIGHTS === 'true',
  ENABLE_GAMIFICATION: import.meta.env.VITE_ENABLE_GAMIFICATION === 'true',
  ENABLE_CAMPAIGNS: import.meta.env.VITE_ENABLE_CAMPAIGNS === 'true',
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  WEBHOOK_URL: import.meta.env.VITE_WEBHOOK_URL,
  MOCK_AUTH: import.meta.env.VITE_MOCK_AUTH === 'true',
  DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE === 'true',
}

export const isDevelopment = env.APP_ENV === 'development'
export const isProduction = env.APP_ENV === 'production'
export const isStaging = env.APP_ENV === 'staging'
EOF

    print_status "Environment configuration created"
}

# Create deployment scripts
create_deployment() {
    print_info "Creating deployment scripts..."
    
    # Package.json scripts update
    cat > package-scripts.json << 'EOF'
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "type-check": "tsc --noEmit",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "test": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:ui": "vitest --ui",
    "supabase:start": "supabase start",
    "supabase:stop": "supabase stop",
    "supabase:reset": "supabase db reset",
    "supabase:migrate": "supabase db push",
    "supabase:types": "supabase gen types typescript --local > src/types/supabase.ts",
    "deploy:staging": "npm run build && netlify deploy --dir=dist",
    "deploy:production": "npm run build && netlify deploy --dir=dist --prod",
    "docker:build": "docker build -t feedbackflow .",
    "docker:run": "docker run -p 80:80 feedbackflow",
    "mobile:build": "npm run build && npx cap sync",
    "mobile:ios": "npx cap open ios",
    "mobile:android": "npx cap open android",
    "analyze": "npm run build -- --analyze",
    "clean": "rm -rf dist node_modules/.vite",
    "prepare": "husky install"
  }
}
EOF

    # Netlify configuration
    cat > netlify.toml << 'EOF'
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-X