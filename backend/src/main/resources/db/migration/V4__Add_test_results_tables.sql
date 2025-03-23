-- Test sessiooni tulemuste tabel
CREATE TABLE test_session_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    session_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    sequence_percentage DECIMAL(5,2),
    pattern_percentage DECIMAL(5,2),
    analogy_percentage DECIMAL(5,2),
    categorization_percentage DECIMAL(5,2),
    total_questions INTEGER NOT NULL,
    CONSTRAINT percentage_range CHECK (
        sequence_percentage BETWEEN 0 AND 100 AND
        pattern_percentage BETWEEN 0 AND 100 AND
        analogy_percentage BETWEEN 0 AND 100 AND
        categorization_percentage BETWEEN 0 AND 100
    )
);

-- Kategooriate ajaarvestuse tabel
CREATE TABLE category_timing_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES test_session_results(id),
    category VARCHAR(50) NOT NULL,
    average_time_seconds DECIMAL(10,2) NOT NULL,
    question_count INTEGER NOT NULL,
    CONSTRAINT valid_category CHECK (
        category IN ('SEQUENCE', 'PATTERN', 'ANALOGY', 'CATEGORIZATION')
    )
);

-- Indeksid jõudluse parandamiseks
CREATE INDEX idx_test_session_user ON test_session_results(user_id);
CREATE INDEX idx_category_timing_session ON category_timing_results(session_id); 