-- Admin Dashboard Tables and Functions
-- This file contains database objects specifically for admin dashboard functionality

-- Add enrollmentCount and isPublished to courses table (if not exists)
-- These fields are useful for admin dashboard stats

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'courses' AND column_name = 'enrollment_count') THEN
        ALTER TABLE courses ADD COLUMN enrollment_count INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'courses' AND column_name = 'is_published') THEN
        ALTER TABLE courses ADD COLUMN is_published BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Create indexes for admin queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_courses_is_published ON courses(is_published);
CREATE INDEX IF NOT EXISTS idx_course_progress_status ON course_progress(status);

-- Function to get admin dashboard statistics
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
    stats JSON;
BEGIN
    SELECT json_build_object(
        'totalUsers', (SELECT COUNT(*) FROM users WHERE is_active = true),
        'totalCourses', (SELECT COUNT(*) FROM courses WHERE is_active = true),
        'publishedCourses', (SELECT COUNT(*) FROM courses WHERE is_published = true AND is_active = true),
        'totalEnrollments', (SELECT COUNT(*) FROM course_progress),
        'activeEnrollments', (SELECT COUNT(*) FROM course_progress WHERE status = 'in-progress'),
        'completedEnrollments', (SELECT COUNT(*) FROM course_progress WHERE status = 'completed'),
        'adminCount', (SELECT COUNT(*) FROM users WHERE role = 'admin' AND is_active = true),
        'ownerCount', (SELECT COUNT(*) FROM users WHERE role = 'owner' AND is_active = true)
    ) INTO stats;
    
    RETURN stats;
END;
$$ LANGUAGE plpgsql;

-- Function to get user activity summary
CREATE OR REPLACE FUNCTION get_user_activity_summary()
RETURNS TABLE(
    user_id UUID,
    email TEXT,
    display_name TEXT,
    role TEXT,
    sign_in_count INTEGER,
    last_sign_in_at TIMESTAMPTZ,
    enrolled_courses_count BIGINT,
    completed_courses_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.email,
        u.display_name,
        u.role,
        u.sign_in_count,
        u.last_sign_in_at,
        COUNT(cp.id) as enrolled_courses_count,
        COUNT(cp.id) FILTER (WHERE cp.status = 'completed') as completed_courses_count
    FROM users u
    LEFT JOIN course_progress cp ON u.id = cp.user_id
    WHERE u.is_active = true
    GROUP BY u.id, u.email, u.display_name, u.role, u.sign_in_count, u.last_sign_in_at
    ORDER BY u.last_sign_in_at DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql;

-- Function to get course performance metrics
CREATE OR REPLACE FUNCTION get_course_performance_metrics()
RETURNS TABLE(
    course_id UUID,
    title TEXT,
    category TEXT,
    enrollment_count INTEGER,
    is_published BOOLEAN,
    completion_rate NUMERIC,
    avg_progress NUMERIC,
    active_learners BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.title,
        c.category,
        c.enrollment_count,
        c.is_published,
        CASE 
            WHEN COUNT(cp.id) > 0 THEN 
                ROUND((COUNT(cp.id) FILTER (WHERE cp.status = 'completed')::NUMERIC / COUNT(cp.id)::NUMERIC) * 100, 2)
            ELSE 0
        END as completion_rate,
        COALESCE(ROUND(AVG(cp.progress), 2), 0) as avg_progress,
        COUNT(cp.id) FILTER (WHERE cp.status = 'in-progress') as active_learners
    FROM courses c
    LEFT JOIN course_progress cp ON c.id = cp.course_id
    WHERE c.is_active = true
    GROUP BY c.id, c.title, c.category, c.enrollment_count, c.is_published
    ORDER BY c.enrollment_count DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update enrollment_count
CREATE OR REPLACE FUNCTION update_course_enrollment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE courses 
        SET enrollment_count = enrollment_count + 1 
        WHERE id = NEW.course_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE courses 
        SET enrollment_count = GREATEST(enrollment_count - 1, 0)
        WHERE id = OLD.course_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if not exists
DROP TRIGGER IF EXISTS trigger_update_enrollment_count ON course_progress;
CREATE TRIGGER trigger_update_enrollment_count
AFTER INSERT OR DELETE ON course_progress
FOR EACH ROW
EXECUTE FUNCTION update_course_enrollment_count();

-- Comments for documentation
COMMENT ON FUNCTION get_dashboard_stats() IS 'Returns aggregated statistics for admin dashboard';
COMMENT ON FUNCTION get_user_activity_summary() IS 'Returns user activity metrics including enrollment and completion counts';
COMMENT ON FUNCTION get_course_performance_metrics() IS 'Returns course performance metrics including completion rates and active learners';
COMMENT ON COLUMN courses.enrollment_count IS 'Cached count of users enrolled in this course';
COMMENT ON COLUMN courses.is_published IS 'Whether the course is published and visible to users';
