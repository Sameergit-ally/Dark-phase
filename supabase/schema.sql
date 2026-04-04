-- DarkGuard — Supabase Schema
-- Run this in the Supabase SQL Editor to create all tables

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLE: profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    plan TEXT NOT NULL DEFAULT 'free',
    darkguard_points INT NOT NULL DEFAULT 0,
    digest_channel TEXT NOT NULL DEFAULT 'email',
    digest_language TEXT NOT NULL DEFAULT 'en',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TABLE: scans
-- ============================================================
CREATE TABLE IF NOT EXISTS scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    url TEXT NOT NULL,
    domain TEXT NOT NULL,
    patterns_found INT NOT NULL DEFAULT 0,
    scan_duration_ms INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_scans_user_id ON scans(user_id);
CREATE INDEX idx_scans_domain ON scans(domain);
CREATE INDEX idx_scans_created_at ON scans(created_at DESC);

ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scans"
    ON scans FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scans"
    ON scans FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can do anything on scans"
    ON scans FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================
-- TABLE: detections
-- ============================================================
CREATE TABLE IF NOT EXISTS detections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
    pattern_type TEXT NOT NULL,
    confidence_score FLOAT NOT NULL DEFAULT 0.0,
    element_selector TEXT,
    explanation TEXT,
    language TEXT NOT NULL DEFAULT 'en',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_detections_scan_id ON detections(scan_id);
CREATE INDEX idx_detections_pattern_type ON detections(pattern_type);

ALTER TABLE detections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view detections of own scans"
    ON detections FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM scans WHERE scans.id = detections.scan_id AND scans.user_id = auth.uid()
        )
    );

CREATE POLICY "Service role can do anything on detections"
    ON detections FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================
-- TABLE: trust_scores
-- ============================================================
CREATE TABLE IF NOT EXISTS trust_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    domain TEXT NOT NULL UNIQUE,
    grade TEXT NOT NULL DEFAULT 'A',
    total_scans INT NOT NULL DEFAULT 0,
    avg_confidence FLOAT NOT NULL DEFAULT 0.0,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_trust_scores_domain ON trust_scores(domain);
CREATE INDEX idx_trust_scores_grade ON trust_scores(grade);

ALTER TABLE trust_scores ENABLE ROW LEVEL SECURITY;

-- Trust scores are public (read-only for everyone)
CREATE POLICY "Anyone can view trust scores"
    ON trust_scores FOR SELECT
    USING (true);

CREATE POLICY "Service role can manage trust scores"
    ON trust_scores FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================
-- TABLE: complaints
-- ============================================================
CREATE TABLE IF NOT EXISTS complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    scan_id UUID REFERENCES scans(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'DRAFTED',
    pdf_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_complaints_user_id ON complaints(user_id);
CREATE INDEX idx_complaints_status ON complaints(status);

ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own complaints"
    ON complaints FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own complaints"
    ON complaints FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage complaints"
    ON complaints FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================
-- TABLE: community_reports
-- ============================================================
CREATE TABLE IF NOT EXISTS community_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    description TEXT,
    pattern_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    points_awarded INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_community_reports_user_id ON community_reports(user_id);
CREATE INDEX idx_community_reports_status ON community_reports(status);

ALTER TABLE community_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reports"
    ON community_reports FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports"
    ON community_reports FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view approved reports"
    ON community_reports FOR SELECT
    USING (status = 'APPROVED');

CREATE POLICY "Service role can manage community reports"
    ON community_reports FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================
-- TABLE: audit_jobs
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'QUEUED',
    pages_crawled INT NOT NULL DEFAULT 0,
    report_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_jobs_user_id ON audit_jobs(user_id);
CREATE INDEX idx_audit_jobs_status ON audit_jobs(status);

ALTER TABLE audit_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audit jobs"
    ON audit_jobs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own audit jobs"
    ON audit_jobs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage audit jobs"
    ON audit_jobs FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================
-- TABLE: digest_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS digest_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    channel TEXT NOT NULL,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    scans_count INT NOT NULL DEFAULT 0,
    patterns_count INT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'SENT'
);

CREATE INDEX idx_digest_logs_user_id ON digest_logs(user_id);

ALTER TABLE digest_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own digest logs"
    ON digest_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage digest logs"
    ON digest_logs FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');
