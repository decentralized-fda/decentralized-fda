-- Variable Categories
CREATE TABLE medical_ref.variable_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    parent_category_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add self-reference after table creation
ALTER TABLE medical_ref.variable_categories 
    ADD CONSTRAINT fk_variable_categories_parent 
    FOREIGN KEY (parent_category_id) 
    REFERENCES medical_ref.variable_categories(id) ON DELETE SET NULL; 