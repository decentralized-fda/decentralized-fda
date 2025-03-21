-- Medical Documents
CREATE TABLE medical.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    file_path TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    document_date DATE,
    provider TEXT,
    facility TEXT,
    tags TEXT[],
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES core.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE medical.documents ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own documents"
    ON medical.documents FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own documents"
    ON medical.documents FOR ALL
    USING (auth.uid() = user_id); 